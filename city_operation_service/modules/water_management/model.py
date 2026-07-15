from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class WaterComplaint(Base):
    __tablename__ = "water_complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # User reference without foreign key constraint (since tables are split across service DB boundaries)
    citizen_id = Column(Integer, nullable=True, index=True)
    citizen_name = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(150), nullable=True)
    
    ward = Column(String(100), nullable=True, index=True)
    area = Column(String(150), nullable=True, index=True)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    category = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(30), default="MEDIUM", nullable=False, index=True)
    status = Column(String(50), default="NEW", nullable=False, index=True)
    
    assigned_worker_id = Column(Integer, nullable=True, index=True)
    authority_notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    before_image = Column(String(500), nullable=True)
    after_image = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

class WaterFieldWorker(Base):
    __tablename__ = "water_field_workers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    photo = Column(Text, nullable=True)
    gender = Column(String(20), nullable=True)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    address = Column(Text, nullable=True)
    place = Column(String(100), nullable=True)
    pin_code = Column(String(20), nullable=True)
    designation = Column(String(100), nullable=True)
    skill = Column(String(100), nullable=True)
    experience = Column(Integer, nullable=True)
    joining_date = Column(DateTime(timezone=True), nullable=True)
    availability = Column(String(30), default="AVAILABLE", nullable=False)
    employment_status = Column(String(30), default="ACTIVE", nullable=False)
    emergency_contact_phone = Column(String(30), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

