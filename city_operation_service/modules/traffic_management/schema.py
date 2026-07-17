from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class WorkerAssignSchema(BaseModel):
    worker_id: int

class ResolutionReportSchema(BaseModel):
    resolution_report: str

class StatusUpdateSchema(BaseModel):
    status: str

class WorkerCreateSchema(BaseModel):
    username: str
    email: str
    state: str
    district: str
    pincode: str
    password: str
    confirm_password: str
    
    # Extended profile fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    place: Optional[str] = None
    designation: Optional[str] = None
    skill: Optional[str] = None
    experience: Optional[int] = None
    joining_date: Optional[datetime] = None
    emergency_contact_phone: Optional[str] = None

class WorkerUpdateSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    place: Optional[str] = None
    designation: Optional[str] = None
    skill: Optional[str] = None
    experience: Optional[int] = None
    joining_date: Optional[datetime] = None
    emergency_contact_phone: Optional[str] = None
    availability: Optional[str] = None
    employment_status: Optional[str] = None

# Complaint Schemas
class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    location_lat: float
    location_lng: float
    department: str
    status: str
    assigned_worker_id: Optional[int]
    resolution_report: Optional[str]
    reported_by: int
    created_at: datetime
    updated_at: datetime
    category: str = "TRAFFIC_INCIDENT" # Mocking category to match UI
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class ComplaintList(BaseModel):
    items: List[ComplaintResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

# Worker Schemas
class WorkerResponse(BaseModel):
    id: int
    is_active: bool = True
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    photo: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    place: Optional[str] = None
    designation: Optional[str] = None
    skill: Optional[str] = None
    experience: Optional[int] = None
    joining_date: Optional[datetime] = None
    emergency_contact_phone: Optional[str] = None
    availability: Optional[str] = "AVAILABLE"
    employment_status: Optional[str] = "ACTIVE"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkerList(BaseModel):
    items: List[WorkerResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int
