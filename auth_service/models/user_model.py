from datetime import datetime
from sqlalchemy import (
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
    Column,
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


user_permissions = Table(
    "user_permissions",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id"), primary_key=True)
)


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
    permissions = relationship("Permission", secondary=user_permissions)