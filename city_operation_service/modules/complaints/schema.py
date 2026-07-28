from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
from modules.complaints.model import ComplaintStatus, ComplaintDepartment, ComplaintMediaStatus
from core.s3 import generate_presigned_url

class ComplaintCreate(BaseModel):
    title: str
    description: str
    location_lat: float
    location_lng: float
    image_url: Optional[str] = None

class WorkerAssignSchema(BaseModel):
    worker_id: int

class ResolutionReportSchema(BaseModel):
    resolution_report: str

class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    location_lat: float
    location_lng: float
    image_url: Optional[str] = None
    media_status: Optional[str] = None
    department: ComplaintDepartment
    status: ComplaintStatus
    assigned_worker_id: Optional[int] = None
    resolution_report: Optional[str] = None
    resolution_image: Optional[str] = None
    resolved_at: Optional[datetime] = None
    reported_by: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_url", "resolution_image", mode="before")
    @classmethod
    def sign_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

class PaginatedComplaintResponse(BaseModel):
    items: List[ComplaintResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class ComplaintMediaStatusResponse(BaseModel):
    id: int
    media_status: str
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_url", mode="before")
    @classmethod
    def sign_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

class FeedbackCreate(BaseModel):
    complaint_id: int
    rating: int
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    complaint_id: int
    citizen_id: int
    citizen_name: str
    rating: int
    comment: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

