from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class TrafficWorkerProfile(Base):
    __tablename__ = "traffic_worker_profiles"

    # Links directly to auth_service `users` table via user_id
    user_id = Column(Integer, primary_key=True, index=True)
    
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    photo = Column(Text, nullable=True)
    gender = Column(String(20), nullable=True)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    address = Column(Text, nullable=True)
    place = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    skill = Column(String(100), nullable=True)
    experience = Column(Integer, nullable=True)
    joining_date = Column(DateTime(timezone=True), nullable=True)
    emergency_contact_phone = Column(String(30), nullable=True)
    
    availability = Column(String(30), default="AVAILABLE", nullable=False)
    employment_status = Column(String(30), default="ACTIVE", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
