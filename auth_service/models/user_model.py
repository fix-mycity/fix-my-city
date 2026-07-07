from datetime import datetime
from sqlalchemy import (
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    username: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)

    state: Mapped[str] = mapped_column(String(100), nullable=False)

    district: Mapped[str] = mapped_column(String(100), nullable=False)

    pincode: Mapped[str] = mapped_column(String(10), nullable=False)

    password: Mapped[str] = mapped_column(String(255), nullable=False)

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    role_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("roles.id")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    role = relationship("Role")