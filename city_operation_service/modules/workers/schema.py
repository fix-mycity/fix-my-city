from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from core.s3 import generate_presigned_url

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

class WorkerResponse(BaseModel):
    id: int
    is_active: bool = True
    department: str
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

    @field_validator("photo", mode="before")
    @classmethod
    def sign_photo_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

class WorkerList(BaseModel):
    items: List[WorkerResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class LeaveRequestCreate(BaseModel):
    reason: str
    start_date: datetime
    end_date: datetime

class LeaveRequestUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: int
    worker_id: int
    department: str
    reason: str
    start_date: datetime
    end_date: datetime
    status: str
    admin_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    worker_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class LeaveRequestList(BaseModel):
    items: List[LeaveRequestResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class WorkerTaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    department: str
    status: str
    priority: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    area: Optional[str] = None
    address: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @field_validator("image_url", mode="before")
    @classmethod
    def sign_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

class WorkerTaskList(BaseModel):
    items: List[WorkerTaskResponse]
    total_items: int

class WorkerTaskResolution(BaseModel):
    resolution_report: str
