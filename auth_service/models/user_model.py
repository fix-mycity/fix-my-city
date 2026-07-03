from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False)

    state = Column(String(100), nullable=False)

    district = Column(String(100), nullable=False)

    pincode = Column(String(10), nullable=False)

    password = Column(String(255), nullable=False)

    is_verified = Column(Boolean, default=False)

    is_active = Column(Boolean, default=True)

    role_id = Column(
        Integer,
        ForeignKey("roles.id")
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    role = relationship("Role")