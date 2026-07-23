from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Float,
    Boolean
)
from sqlalchemy.sql import func

from database import Base



class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)

    # References auth_service.users.id, but NOT a real SQLAlchemy ForeignKey.
    # Reason: this service's Base.metadata doesn't know about the "users"
    # table (it belongs to auth_service's own Base), so create_all() would
    # crash trying to resolve the FK constraint. We trust user_id from the
    # JWT token instead — no DB-level constraint needed.
    user_id = Column(
        Integer,
        unique=True,
        nullable=False,
        index=True
    )

    full_name = Column(String(150), nullable=True)

    phone_number = Column(String(20), nullable=True)

    avatar_url = Column(String(500), nullable=True)

    bio = Column(Text, nullable=True)

    is_aadhaar_verified = Column(Boolean, default=False, nullable=False)
    aadhaar_name = Column(String(150), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )



class SavedLocation(Base):
    __tablename__ = "saved_locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    label = Column(String(100), nullable=False)  # e.g., "Home", "Office"
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


class AadhaarVerification(Base):
    __tablename__ = "aadhaar_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    ref_id = Column(String(100), unique=True, nullable=False, index=True)
    aadhaar_number_hash = Column(String(64), nullable=True, index=True)
    status = Column(String(50), default="PENDING", nullable=False)
    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )