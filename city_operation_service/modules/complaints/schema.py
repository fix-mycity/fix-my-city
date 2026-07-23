from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
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
    image_url: Optional[str]
    media_status: Optional[str] = None
    department: ComplaintDepartment
    status: ComplaintStatus
    assigned_worker_id: Optional[int]
    resolution_report: Optional[str]
    image_url: Optional[str]
    reported_by: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_url", mode="before")
    @classmethod
    def sign_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

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

