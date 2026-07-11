from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .model import Profile
from .schema import ProfileUpdateSchema


def get_or_create_profile(db: Session, user_id: int) -> Profile:
    """
    Fetch the profile for this user. If it doesn't exist yet
    (e.g. user registered via auth_service but never opened
    their profile page here), create an empty one on the fly.
    """
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if profile is None:
        try:
            profile = Profile(user_id=user_id)
            db.add(profile)
            db.commit()
            db.refresh(profile)
        except IntegrityError:
            db.rollback()
            # If created concurrently by another request, fetch the existing one
            profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    return profile


def update_profile(db: Session, user_id: int, data: ProfileUpdateSchema) -> Profile:
    profile = get_or_create_profile(db, user_id)

    # only update fields that were actually sent (exclude_unset=True)
    update_data = data.model_dump(exclude_unset=True)

    # whitelist of allowed fields to prevent mass assignment
    allowed_fields = {"full_name", "phone_number", "avatar_url", "bio"}

    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile