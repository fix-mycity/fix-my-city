from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Emergency(Base):
    __tablename__ = "emergencies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True) # WATER_BURST, TRAFFIC_PILEUP, GAS_LEAK, FLOODING, HAZARD_SPILL
    severity = Column(String(30), default="HIGH", nullable=False) # CRITICAL, HIGH, MODERATE
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    affected_radius_meters = Column(Integer, default=500)
    
    status = Column(String(30), default="ACTIVE", nullable=False, index=True) # ACTIVE, CONTAINED, RESOLVED
    reported_by = Column(Integer, nullable=True, index=True)
    dispatched_by = Column(Integer, nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    taskforce_members = relationship("EmergencyTaskforce", back_populates="emergency", cascade="all, delete-orphan")


class EmergencyTaskforce(Base):
    __tablename__ = "emergency_taskforce_members"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergencies.id", ondelete="CASCADE"), nullable=False, index=True)
    worker_id = Column(Integer, nullable=False, index=True)
    department = Column(String(50), nullable=False, index=True)
    dispatched_at = Column(DateTime(timezone=True), server_default=func.now())
    arrival_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    emergency = relationship("Emergency", back_populates="taskforce_members")


class EmergencyBroadcast(Base):
    __tablename__ = "emergency_broadcasts"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergencies.id", ondelete="SET NULL"), nullable=True, index=True)
    alert_title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    target_zone = Column(String(100), default="ALL_CITY", nullable=False)
    severity = Column(String(30), default="CRITICAL", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
