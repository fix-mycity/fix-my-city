from datetime import datetime
from sqlalchemy import (
    Integer,
    String,
    DateTime,
    Boolean
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from database import Base


class OTP(Base):
    __tablename__ = "otp"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    email: Mapped[str] = mapped_column(String(150), nullable=False)

    otp: Mapped[str] = mapped_column(String(6), nullable=False)

    is_used: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )