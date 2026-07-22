from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class ComplaintStatus(str, enum.Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class ComplaintDepartment(str, enum.Enum):
    TRAFFIC = "traffic"
    WASTE = "waste"
    WATER = "water"
    GENERAL = "general"

class ComplaintMediaStatus(str, enum.Enum):
    PENDING = "MEDIA_PENDING"
    READY = "MEDIA_READY"
    FAILED = "MEDIA_FAILED"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    
    # Core Details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # GPS Location
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    
    # Image Upload
    image_url = Column(String(500), nullable=True)
    media_status = Column(String(50), default=ComplaintMediaStatus.PENDING.value, nullable=True, index=True)

    
    # AI Routing & Tracking
    department = Column(String(50), default=ComplaintDepartment.GENERAL.value, nullable=False, index=True)
    status = Column(String(50), default=ComplaintStatus.PENDING.value, nullable=False, index=True)
    
    # Worker Assignment & Resolution
    assigned_worker_id = Column(Integer, nullable=True, index=True)
    resolution_report = Column(Text, nullable=True)

    # User Relationships
    reported_by = Column(Integer, nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
