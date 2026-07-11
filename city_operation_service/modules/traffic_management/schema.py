from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from modules.traffic_management.model import IncidentStatus

class TrafficIncidentCreate(BaseModel):
    title: str
    description: str
    location_lat: float
    location_lng: float

class TrafficIncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None

class TrafficIncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    location_lat: float
    location_lng: float
    status: IncidentStatus
    reported_by: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
