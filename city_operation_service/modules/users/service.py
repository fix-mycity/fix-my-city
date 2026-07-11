from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .model import Profile, SavedLocation
from .schema import ProfileUpdateSchema, SavedLocationCreateSchema, SavedLocationUpdateSchema


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


def create_saved_location(db: Session, user_id: int, data: SavedLocationCreateSchema) -> SavedLocation:
    # check for duplicate label for this user (case-insensitive)
    existing = db.query(SavedLocation).filter(
        SavedLocation.user_id == user_id,
        func.lower(SavedLocation.label) == data.label.lower()
    ).first()
    if existing:
        raise ValueError("A location with this label already exists")

    location = SavedLocation(
        user_id=user_id,
        label=data.label,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


def get_saved_locations(db: Session, user_id: int) -> list[SavedLocation]:
    return db.query(SavedLocation).filter(SavedLocation.user_id == user_id).all()


def update_saved_location(
    db: Session,
    user_id: int,
    location_id: int,
    data: SavedLocationUpdateSchema
) -> SavedLocation | None:
    location = db.query(SavedLocation).filter(
        SavedLocation.id == location_id,
        SavedLocation.user_id == user_id
    ).first()

    if not location:
        return None

    # check for duplicate label if updating the label
    if data.label is not None:
        existing = db.query(SavedLocation).filter(
            SavedLocation.user_id == user_id,
            SavedLocation.id != location_id,
            func.lower(SavedLocation.label) == data.label.lower()
        ).first()
        if existing:
            raise ValueError("A location with this label already exists")

    # check coordinate co-dependence on resulting values
    update_data = data.model_dump(exclude_unset=True)
    new_lat = update_data["latitude"] if "latitude" in update_data else location.latitude
    new_lon = update_data["longitude"] if "longitude" in update_data else location.longitude
    if (new_lat is None) != (new_lon is None):
        raise ValueError("Both latitude and longitude must be provided together, or both must be null")

    # whitelist of allowed fields to prevent mass assignment
    allowed_fields = {"label", "address", "latitude", "longitude"}

    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(location, field, value)

    db.commit()
    db.refresh(location)

    return location


def delete_saved_location(db: Session, user_id: int, location_id: int) -> bool:
    location = db.query(SavedLocation).filter(
        SavedLocation.id == location_id,
        SavedLocation.user_id == user_id
    ).first()

    if not location:
        return False

    db.delete(location)
    db.commit()
    return True