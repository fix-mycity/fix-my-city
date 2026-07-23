from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    # Links directly to auth_service `users` table via user_id
    user_id = Column(Integer, primary_key=True, index=True)
    
    # Department identifier (e.g. 'traffic', 'water')
    department = Column(String(50), nullable=False, index=True)
    
    # The Admin ID who manages this worker
    manager_id = Column(Integer, nullable=True, index=True)
    
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


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, index=True, nullable=False)
    department = Column(String(50), nullable=False, index=True)
    manager_id = Column(Integer, nullable=True, index=True)
    
    reason = Column(Text, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(30), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
