from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies.auth import get_current_user, UserData
from dependencies.db import get_db

from .schema import ProfileUpdateSchema, ProfileResponseSchema
from .service import get_or_create_profile, update_profile

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