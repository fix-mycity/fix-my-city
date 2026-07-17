from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from dependencies.auth import get_current_user, UserData
from dependencies.db import get_db
from core.s3 import upload_file_to_s3

from .schema import ComplaintCreate, ComplaintResponse
from .service import (
    create_complaint,
    get_complaint_by_id,
    get_my_complaints,
    get_all_complaints,
    update_complaint_image
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
    """Create a new complaint, upload its image/video to S3, and auto-classify department."""
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

    try:
        file_url = upload_file_to_s3(file.file, folder="complaints", filename=file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"S3 Upload failed: {str(e)}"
        )

    data = ComplaintCreate(
        title=title,
        description=description,
        location_lat=location_lat,
        location_lng=location_lng,
        image_url=file_url
    )
    return create_complaint(db, current_user.id, data)


@router.get("/me", response_model=list[ComplaintResponse])
def read_my_complaints(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all complaints reported by the logged-in user."""
    return get_my_complaints(db, current_user.id)


@router.get("/", response_model=list[ComplaintResponse])
def read_all_complaints(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all complaints (typically admin/dashboard view)."""
    return get_all_complaints(db)


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
