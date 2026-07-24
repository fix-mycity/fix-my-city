from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base
import enum

class PostStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"

class PostCategory(str, enum.Enum):
    ANNOUNCEMENT = "Announcement"
    TRAFFIC = "Traffic"
    WATER = "Water"
    WASTE = "Waste"
    EMERGENCY = "Emergency"
    EVENT = "Event"
    GENERAL = "General"

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, nullable=False, index=True)
    author_type = Column(String(50), nullable=False) # "citizen" or "authority"
    author_name = Column(String(150), nullable=False)
    
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    location = Column(String(250), nullable=True)
    
    status = Column(String(50), default=PostStatus.PENDING.value, nullable=False, index=True)
    rejection_reason = Column(Text, nullable=True)
    approved_by = Column(Integer, nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
