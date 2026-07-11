from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class IncidentStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"

class TrafficIncident(Base):
    __tablename__ = "traffic_incidents"

    id = Column(Integer, primary_key=True, index=True)
    
    # Core Details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # GPS Location
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    
    # Tracking
    status = Column(String(50), default=IncidentStatus.PENDING.value, nullable=False)
    
    # User Relationships
    reported_by = Column(Integer, nullable=False, index=True) 

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
