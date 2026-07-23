from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from dependencies.auth import get_current_user, UserData
from dependencies.db import get_db
from core.s3 import upload_file_to_s3

from .schema import (
    ProfileUpdateSchema,
    ProfileResponseSchema,
    SavedLocationCreateSchema,
    SavedLocationUpdateSchema,
    SavedLocationResponseSchema,
    AadhaarOtpRequestSchema,
    AadhaarOtpResponseSchema,
    AadhaarVerifyRequestSchema,
    AadhaarVerifyResponseSchema,
    DigiLockerInitRequestSchema,
    DigiLockerInitResponseSchema,
    DigiLockerStatusRequestSchema,
    DigiLockerStatusResponseSchema
)
from .service import (
    get_or_create_profile,
    update_profile,
    create_saved_location,
    get_saved_locations,
    update_saved_location,
    delete_saved_location,
    update_avatar_url,
    generate_aadhaar_otp_service,
    verify_aadhaar_otp_service,
    init_digilocker_service,
    check_digilocker_status_service
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me/profile", response_model=ProfileResponseSchema)
def read_my_profile(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the logged-in user's own profile. Auto-creates an empty one if missing."""
    return get_or_create_profile(db, current_user.id)


@router.patch("/me/profile", response_model=ProfileResponseSchema)
def edit_my_profile(
    data: ProfileUpdateSchema,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Partially update the logged-in user's own profile."""
    return update_profile(db, current_user.id, data)


@router.post("/me/profile/avatar", response_model=ProfileResponseSchema)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload an avatar image to S3 and update the profile's avatar_url."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Enforce 10MB file size limit
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the limit of 10MB"
        )
    
    try:
        file_url = upload_file_to_s3(file.file, folder="avatars", filename=file.filename)
        return update_avatar_url(db, current_user.id, file_url)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"S3 Upload failed: {str(e)}"
        )


@router.post("/me/locations", response_model=SavedLocationResponseSchema, status_code=status.HTTP_201_CREATED)
def add_location(
    data: SavedLocationCreateSchema,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new saved location for the logged-in user."""
    try:
        return create_saved_location(db, current_user.id, data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/me/locations", response_model=list[SavedLocationResponseSchema])
def read_locations(
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all saved locations for the logged-in user."""
    return get_saved_locations(db, current_user.id)


@router.patch("/me/locations/{location_id}", response_model=SavedLocationResponseSchema)
def edit_location(
    location_id: int,
    data: SavedLocationUpdateSchema,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Partially update a saved location belonging to the logged-in user."""
    try:
        location = update_saved_location(db, current_user.id, location_id, data)
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Saved location not found"
            )
        return location
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/me/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_location(
    location_id: int,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a saved location belonging to the logged-in user."""
    success = delete_saved_location(db, current_user.id, location_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved location not found"
        )
    return


@router.post("/me/aadhaar/digilocker/init", response_model=DigiLockerInitResponseSchema)
async def initiate_digilocker(
    data: DigiLockerInitRequestSchema,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiate a DigiLocker session for Aadhaar verification.
    """
    try:
        res = await init_digilocker_service(db, current_user.id, data.redirect_url)
        return res
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/me/aadhaar/digilocker/status", response_model=DigiLockerStatusResponseSchema)
async def get_digilocker_status(
    data: DigiLockerStatusRequestSchema,
    current_user: UserData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check the status of a DigiLocker session and retrieve Aadhaar details if verified.
    """
    try:
        res = await check_digilocker_status_service(db, current_user.id, data.verification_id)
        return res
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )