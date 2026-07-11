from sqlalchemy.orm import Session

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
        profile = Profile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


def update_profile(db: Session, user_id: int, data: ProfileUpdateSchema) -> Profile:
    profile = get_or_create_profile(db, user_id)

    # only update fields that were actually sent (exclude_unset=True)
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile