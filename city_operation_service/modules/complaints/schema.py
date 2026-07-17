from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from modules.complaints.model import ComplaintStatus, ComplaintDepartment

class ComplaintCreate(BaseModel):
    title: str
    description: str
    location_lat: float
    location_lng: float

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
    department: ComplaintDepartment
    status: ComplaintStatus
    assigned_worker_id: Optional[int]
    resolution_report: Optional[str]
    image_url: Optional[str]
    reported_by: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
