from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import uuid
import os

from dependencies.auth import get_current_user, UserData
from dependencies.db import get_db
from core.s3 import upload_file_to_s3

from modules.complaints.tasks import upload_complaint_media_task
from .schema import (
    ComplaintCreate, ComplaintResponse, ComplaintMediaStatusResponse,
    FeedbackCreate, FeedbackResponse
)

from .service import (
    create_complaint,
    get_complaint_by_id,
    get_my_complaints,
    get_all_complaints,
    update_complaint_image,
    create_feedback,
    get_feedback_by_citizen,
    get_feedback_by_complaint,
    get_all_feedback
)

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_new_complaint(
    title: str = Form(...),
    description: str = Form(...),
    location_lat: float = Form(...),
    location_lng: float = Form(...),
    file: UploadFile = File(...),
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new complaint, save its media locally, trigger async S3 upload, and auto-classify department."""
    is_image = file.content_type.startswith("image/")
    is_video = file.content_type.startswith("video/")
    if not is_image and not is_video:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image or a video"
        )

    # Enforce 50MB file size limit
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the limit of 50MB"
        )

    # Save upload to a local temporary folder shared with celery worker
    TEMP_DIR = os.path.join(os.getcwd(), "temp_uploads")
    os.makedirs(TEMP_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_file_path = os.path.join(TEMP_DIR, unique_filename)

    try:
        with open(temp_file_path, "wb") as f_out:
            shutil.copyfileobj(file.file, f_out)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Local temporary file write failed: {str(e)}"
        )

    from modules.users.service import get_or_create_profile
    profile = get_or_create_profile(db, current_user.id)
    if not profile or not profile.phone_number or not profile.phone_number.strip():
        # Clean up the temporary file if validation fails
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number is required to report complaints. Please update your profile."
        )

    data = ComplaintCreate(
        title=title,
        description=description,
        location_lat=location_lat,
        location_lng=location_lng,
        image_url=None
    )
    complaint = create_complaint(db, current_user.id, data)
    
    # Trigger Celery background task for S3 upload
    upload_complaint_media_task.delay(complaint.id, temp_file_path, file.filename)
    
    return complaint




@router.get("/me", response_model=list[ComplaintResponse])
def read_my_complaints(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all complaints reported by the logged-in user."""
    return get_my_complaints(db, current_user.id)


from modules.complaints.schema import PaginatedComplaintResponse

@router.get("", response_model=PaginatedComplaintResponse)
@router.get("/", response_model=PaginatedComplaintResponse)
def read_all_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all complaints with search, department/status filters, and pagination."""
    return get_all_complaints(db, page, page_size, search, status, department)


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def read_complaint(
    complaint_id: int,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details of a specific complaint by its ID."""
    complaint = get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    return complaint


@router.post("/{complaint_id}/image", response_model=ComplaintResponse)
def upload_complaint_image(
    complaint_id: int,
    file: UploadFile = File(...),
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload an image or video file to S3 and associate it with the specified complaint."""
    is_image = file.content_type.startswith("image/")
    is_video = file.content_type.startswith("video/")
    if not is_image and not is_video:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image or a video"
        )

    # Enforce 50MB file size limit
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the limit of 50MB"
        )

    # First check if complaint exists and belongs to the user
    complaint = get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    if complaint.reported_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this complaint's image"
        )

    try:
        file_url = upload_file_to_s3(file.file, folder="complaints", filename=file.filename)
        updated = update_complaint_image(db, complaint_id, current_user.id, file_url)
        return updated
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"S3 Upload failed: {str(e)}"
        )


@router.get("/{complaint_id}/media-status", response_model=ComplaintMediaStatusResponse)
def read_complaint_media_status(
    complaint_id: int,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the media upload status and S3 image URL (if ready) of a specific complaint."""
    complaint = get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    return complaint
# =====================================================================
# Feedback Endpoints
# =====================================================================

@router.post("/feedback/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_new_feedback(
    data: FeedbackCreate,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = get_complaint_by_id(db, data.complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found."
        )
    if complaint.reported_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to give feedback on this complaint."
        )
    if complaint.status not in ["RESOLVED", "CLOSED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback can only be submitted for resolved or closed complaints."
        )

    citizen_name = current_user.username or "Citizen"
    return create_feedback(db=db, citizen_id=current_user.id, citizen_name=citizen_name, data=data)

@router.get("/feedback/me", response_model=list[FeedbackResponse])
def read_my_feedback(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_feedback_by_citizen(db=db, citizen_id=current_user.id)

@router.get("/feedback/complaint/{complaint_id}", response_model=Optional[FeedbackResponse])
def read_feedback_by_complaint(
    complaint_id: int,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_feedback_by_complaint(db=db, complaint_id=complaint_id)

@router.get("/feedback/", response_model=list[FeedbackResponse])
def read_all_feedback(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Department_Admin", "Super_Admin", "Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators/authorities can retrieve all feedback."
        )
    return get_all_feedback(db=db)

