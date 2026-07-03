from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func

from database import Base


class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    ip_address = Column(
        String(100),
        nullable=True
    )

    device = Column(
        String(255),
        nullable=True
    )

    login_time = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    logout_time = Column(
        DateTime(timezone=True),
        nullable=True
    )