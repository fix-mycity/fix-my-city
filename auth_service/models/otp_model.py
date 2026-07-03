from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean
)

from sqlalchemy.sql import func

from database import Base


class OTP(Base):
    __tablename__ = "otp"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(150), nullable=False)

    otp = Column(String(6), nullable=False)

    is_used = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )