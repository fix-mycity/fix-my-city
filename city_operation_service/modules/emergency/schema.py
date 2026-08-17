from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class EmergencyCreateSchema(BaseModel):
    title: str
    description: str
    category: str
    severity: Optional[str] = "HIGH"
    latitude: float
    longitude: float
    affected_radius_meters: Optional[int] = 500

class TaskforceDispatchSchema(BaseModel):
    worker_ids: List[int]
    department: str
    notes: Optional[str] = None

class BroadcastCreateSchema(BaseModel):
    emergency_id: Optional[int] = None
    alert_title: str
    message: str
    target_zone: Optional[str] = "ALL_CITY"
    severity: Optional[str] = "CRITICAL"

class EmergencyTaskforceResponse(BaseModel):
    id: int
    worker_id: int
    department: str
    worker_name: Optional[str] = None
    phone: Optional[str] = None
    dispatched_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmergencyResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    severity: str
    latitude: float
    longitude: float
    affected_radius_meters: int
    status: str
    reported_by: Optional[int] = None
    dispatched_by: Optional[int] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    taskforce: List[EmergencyTaskforceResponse] = []

    model_config = ConfigDict(from_attributes=True)

class EmergencyBroadcastResponse(BaseModel):
    id: int
    emergency_id: Optional[int] = None
    alert_title: str
    message: str
    target_zone: str
    severity: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
