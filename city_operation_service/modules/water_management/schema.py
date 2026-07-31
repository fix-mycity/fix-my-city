from pydantic import BaseModel, field_validator
from datetime import datetime, date
from typing import Optional, List
from core.s3 import generate_presigned_url

class ComplaintCreate(BaseModel):
    category: str
    title: str
    description: Optional[str] = None
    citizen_id: Optional[int] = None
    citizen_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority: Optional[str] = "MEDIUM"
    before_image: Optional[str] = None

class ComplaintUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority: Optional[str] = None
    authority_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    before_image: Optional[str] = None
    after_image: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    complaint_number: str
    citizen_id: Optional[int] = None
    citizen_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: str
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    assigned_worker_id: Optional[int] = None
    authority_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    @field_validator("before_image", "after_image", mode="before")
    @classmethod
    def sign_image_urls(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

    class Config:
        from_attributes = True
        orm_mode = True

class ComplaintList(BaseModel):
    items: List[ComplaintResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class ComplaintStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class AssignWorkerSchema(BaseModel):
    assigned_worker_id: int
    notes: Optional[str] = None

import re
from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List

# Keep other imports/classes intact.
# Wait, let's keep the existing top of schema.py. Since we are modifying from line 83 to 175, let's verify line numbers.
# We will replace from class WorkerCreate to the end of the file.
class WorkerCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    password: str
    photo: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    place: Optional[str] = None
    pin_code: Optional[str] = None
    designation: Optional[str] = None
    skill: Optional[str] = None
    experience: Optional[int] = None
    joining_date: Optional[datetime] = None
    availability: Optional[str] = "AVAILABLE"
    employment_status: Optional[str] = "ACTIVE"
    emergency_contact_phone: Optional[str] = None

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name_fields(cls, v: str) -> str:
        if v is not None:
            if any(c.isdigit() for c in v):
                raise ValueError("Name field must contain only words and cannot contain numbers")
            if not re.match(r"^[a-zA-Z\s\-']+$", v):
                raise ValueError("Name field must contain only letters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone_field(cls, v: str) -> str:
        if v is not None:
            if any(c.isalpha() for c in v):
                raise ValueError("Phone number must contain only numbers and cannot contain letters or words")
            if not re.match(r"^\+?[0-9\s\-]+$", v):
                raise ValueError("Phone number must be a valid numeric sequence")
        return v

    @field_validator("pin_code")
    @classmethod
    def validate_pin_code_field(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v != "":
            if any(c.isalpha() for c in v):
                raise ValueError("Pin code must contain only numbers and cannot contain letters or words")
            if not re.match(r"^[0-9]+$", v):
                raise ValueError("Pin code must contain only digits")
        return v

class WorkerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    photo: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    place: Optional[str] = None
    pin_code: Optional[str] = None
    designation: Optional[str] = None
    skill: Optional[str] = None
    experience: Optional[int] = None
    joining_date: Optional[datetime] = None
    availability: Optional[str] = None
    employment_status: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if any(c.isdigit() for c in v):
                raise ValueError("Name field must contain only words and cannot contain numbers")
            if not re.match(r"^[a-zA-Z\s\-']+$", v):
                raise ValueError("Name field must contain only letters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone_field(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if any(c.isalpha() for c in v):
                raise ValueError("Phone number must contain only numbers and cannot contain letters or words")
            if not re.match(r"^\+?[0-9\s\-]+$", v):
                raise ValueError("Phone number must be a valid numeric sequence")
        return v

    @field_validator("pin_code")
    @classmethod
    def validate_pin_code_field(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v != "":
            if any(c.isalpha() for c in v):
                raise ValueError("Pin code must contain only numbers and cannot contain letters or words")
            if not re.match(r"^[0-9]+$", v):
                raise ValueError("Pin code must contain only digits")
        return v

class WorkerResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    photo: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    place: Optional[str] = None
    pin_code: Optional[str] = None
    designation: Optional[str] = None
    skill: Optional[str] = None
    experience: Optional[int] = None
    joining_date: Optional[datetime] = None
    availability: str
    employment_status: str
    emergency_contact_phone: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("photo", mode="before")
    @classmethod
    def sign_photo_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

    class Config:
        from_attributes = True
        orm_mode = True

class WorkerList(BaseModel):
    items: List[WorkerResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class WorkerFilter(BaseModel):
    availability: Optional[str] = None
    employment_status: Optional[str] = None
    skill: Optional[str] = None
    place: Optional[str] = None
    pin_code: Optional[str] = None

class WorkerStatusUpdate(BaseModel):
    employment_status: str

class WorkerAvailabilityUpdate(BaseModel):
    availability: str

class AssignmentCreate(BaseModel):
    complaint_id: int
    worker_id: int
    deadline: datetime
    priority: Optional[str] = "MEDIUM"
    remarks: Optional[str] = None

class AssignmentUpdate(BaseModel):
    worker_id: Optional[int] = None
    deadline: Optional[datetime] = None
    priority: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: int
    assignment_number: str
    complaint_id: int
    worker_id: int
    assigned_by: Optional[int] = None
    assigned_date: datetime
    deadline: datetime
    priority: str
    remarks: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    complaint: Optional[ComplaintResponse] = None
    worker: Optional[WorkerResponse] = None

    class Config:
        from_attributes = True
        orm_mode = True

class AssignmentList(BaseModel):
    items: List[AssignmentResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class WorkerTaskUpdateCreate(BaseModel):
    status: str
    remarks: Optional[str] = None
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    materials_used: Optional[str] = None
    completion_notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class WorkerTaskUpdateResponse(BaseModel):
    id: int
    assignment_id: int
    status: str
    remarks: Optional[str] = None
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    materials_used: Optional[str] = None
    completion_notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    updated_by: Optional[int] = None
    created_at: datetime

    @field_validator("before_image", "after_image", mode="before")
    @classmethod
    def sign_image_urls(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

    class Config:
        from_attributes = True
        orm_mode = True

class VerificationSchema(BaseModel):
    verification_status: str
    remarks: Optional[str] = None

class VerificationResponse(BaseModel):
    id: int
    assignment_id: int
    verified_by: Optional[int] = None
    verification_status: str
    remarks: Optional[str] = None
    verified_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

from datetime import date, time

class WaterSupplyCreate(BaseModel):
    zone: Optional[str] = None
    ward: str
    area: str
    street: Optional[str] = None
    supply_type: str # REGULAR, SPECIAL, EMERGENCY
    supply_date: date
    morning_start_time: Optional[time] = None
    morning_end_time: Optional[time] = None
    evening_start_time: Optional[time] = None
    evening_end_time: Optional[time] = None
    water_source: Optional[str] = None
    tank_name: Optional[str] = None
    pipeline_name: Optional[str] = None
    status: Optional[str] = "SCHEDULED"
    remarks: Optional[str] = None

class WaterSupplyUpdate(BaseModel):
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    street: Optional[str] = None
    supply_type: Optional[str] = None
    supply_date: Optional[date] = None
    morning_start_time: Optional[time] = None
    morning_end_time: Optional[time] = None
    evening_start_time: Optional[time] = None
    evening_end_time: Optional[time] = None
    water_source: Optional[str] = None
    tank_name: Optional[str] = None
    pipeline_name: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class WaterSupplyResponse(BaseModel):
    id: int
    schedule_number: str
    zone: Optional[str] = None
    ward: str
    area: str
    street: Optional[str] = None
    supply_type: str
    supply_date: date
    morning_start_time: Optional[time] = None
    morning_end_time: Optional[time] = None
    evening_start_time: Optional[time] = None
    evening_end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    water_source: Optional[str] = None
    tank_name: Optional[str] = None
    pipeline_name: Optional[str] = None
    status: str
    remarks: Optional[str] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class WaterSupplyList(BaseModel):
    items: List[WaterSupplyResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class WaterSupplyFilter(BaseModel):
    status: Optional[str] = None
    supply_type: Optional[str] = None
    ward: Optional[str] = None
    zone: Optional[str] = None
    supply_date: Optional[date] = None

class WaterSupplyStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

class PipelineCreate(BaseModel):
    pipeline_number: Optional[str] = None
    pipeline_name: Optional[str] = None
    zone: Optional[str] = None
    ward: str
    area: str
    street: Optional[str] = None
    pipeline_type: str # MAIN_LINE, SUB_LINE, SERVICE_LINE, DISTRIBUTION_LINE
    diameter: Optional[float] = None
    length: Optional[float] = None
    material: str # PVC, HDPE, DI, STEEL, CI, OTHER
    installation_date: Optional[date] = None
    expected_life: Optional[int] = None
    water_source: Optional[str] = None
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    condition: Optional[str] = "EXCELLENT"
    pressure_level: Optional[float] = None
    current_status: Optional[str] = "ACTIVE"
    remarks: Optional[str] = None

class PipelineUpdate(BaseModel):
    pipeline_name: Optional[str] = None
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    street: Optional[str] = None
    pipeline_type: Optional[str] = None
    diameter: Optional[float] = None
    length: Optional[float] = None
    material: Optional[str] = None
    installation_date: Optional[date] = None
    expected_life: Optional[int] = None
    water_source: Optional[str] = None
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    condition: Optional[str] = None
    pressure_level: Optional[float] = None
    current_status: Optional[str] = None
    remarks: Optional[str] = None

class PipelineResponse(BaseModel):
    id: int
    pipeline_number: str
    pipeline_name: Optional[str] = None
    zone: Optional[str] = None
    ward: str
    area: str
    street: Optional[str] = None
    pipeline_type: str
    diameter: Optional[float] = None
    length: Optional[float] = None
    material: str
    installation_date: Optional[date] = None
    expected_life: Optional[int] = None
    water_source: Optional[str] = None
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    condition: str
    pressure_level: Optional[float] = None
    current_status: str
    last_inspection: Optional[date] = None
    next_inspection: Optional[date] = None
    remarks: Optional[str] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class PipelineList(BaseModel):
    items: List[PipelineResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class PipelineFilter(BaseModel):
    zone: Optional[str] = None
    ward: Optional[str] = None
    condition: Optional[str] = None
    pipeline_type: Optional[str] = None
    material: Optional[str] = None
    status: Optional[str] = None

class InspectionCreate(BaseModel):
    inspection_date: date
    inspector_name: str
    condition: str
    pressure_level: Optional[float] = None
    leak_detected: Optional[bool] = False
    remarks: Optional[str] = None
    next_inspection: Optional[date] = None

class InspectionUpdate(BaseModel):
    inspection_date: Optional[date] = None
    inspector_name: Optional[str] = None
    condition: Optional[str] = None
    pressure_level: Optional[float] = None
    leak_detected: Optional[bool] = None
    remarks: Optional[str] = None
    next_inspection: Optional[date] = None

class InspectionResponse(BaseModel):
    id: int
    pipeline_id: int
    inspection_date: date
    inspector_name: str
    condition: str
    pressure_level: Optional[float] = None
    leak_detected: bool
    remarks: Optional[str] = None
    next_inspection: Optional[date] = None

    class Config:
        from_attributes = True
        orm_mode = True

class MaintenanceCreate(BaseModel):
    maintenance_type: str
    reason: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    status: Optional[str] = "SCHEDULED"
    assigned_worker: Optional[str] = None
    remarks: Optional[str] = None

class MaintenanceUpdate(BaseModel):
    maintenance_type: Optional[str] = None
    reason: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    assigned_worker: Optional[str] = None
    remarks: Optional[str] = None

class MaintenanceResponse(BaseModel):
    id: int
    pipeline_id: int
    maintenance_type: str
    reason: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    status: str
    assigned_worker: Optional[str] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

class TankCreate(BaseModel):
    tank_number: Optional[str] = None
    tank_name: Optional[str] = None
    tank_type: str # OVERHEAD_TANK, UNDERGROUND_TANK, RESERVOIR, TANKER
    zone: Optional[str] = None
    ward: str
    area: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_liters: float
    current_level_liters: Optional[float] = 0.0
    minimum_level: Optional[float] = None
    maximum_level: Optional[float] = None
    water_source: Optional[str] = None
    pipeline_id: Optional[int] = None
    installation_date: Optional[date] = None
    last_cleaned_date: Optional[date] = None
    next_cleaning_date: Optional[date] = None
    status: Optional[str] = "ACTIVE"
    remarks: Optional[str] = None

class TankUpdate(BaseModel):
    tank_name: Optional[str] = None
    tank_type: Optional[str] = None
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_liters: Optional[float] = None
    current_level_liters: Optional[float] = None
    minimum_level: Optional[float] = None
    maximum_level: Optional[float] = None
    water_source: Optional[str] = None
    pipeline_id: Optional[int] = None
    installation_date: Optional[date] = None
    last_cleaned_date: Optional[date] = None
    next_cleaning_date: Optional[date] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class TankResponse(BaseModel):
    id: int
    tank_number: str
    tank_name: Optional[str] = None
    tank_type: str
    zone: Optional[str] = None
    ward: str
    area: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_liters: float
    current_level_liters: float
    minimum_level: Optional[float] = None
    maximum_level: Optional[float] = None
    water_source: Optional[str] = None
    pipeline_id: Optional[int] = None
    installation_date: Optional[date] = None
    last_cleaned_date: Optional[date] = None
    next_cleaning_date: Optional[date] = None
    status: str
    remarks: Optional[str] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class TankList(BaseModel):
    items: List[TankResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class TankFilter(BaseModel):
    tank_type: Optional[str] = None
    status: Optional[str] = None
    ward: Optional[str] = None
    zone: Optional[str] = None
    water_source: Optional[str] = None

class TankRefillCreate(BaseModel):
    refill_date: date
    refilled_amount: float
    operator_name: Optional[str] = None
    remarks: Optional[str] = None

class TankRefillResponse(BaseModel):
    id: int
    tank_id: int
    refill_date: date
    previous_level: float
    refilled_amount: float
    current_level: float
    water_source: Optional[str] = None
    operator_name: Optional[str] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

class TankMaintenanceCreate(BaseModel):
    maintenance_type: str
    reason: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    assigned_worker: Optional[str] = None
    status: Optional[str] = "SCHEDULED"
    remarks: Optional[str] = None

class TankMaintenanceUpdate(BaseModel):
    maintenance_type: Optional[str] = None
    reason: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    assigned_worker: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class TankMaintenanceResponse(BaseModel):
    id: int
    tank_id: int
    maintenance_type: str
    reason: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    assigned_worker: Optional[str] = None
    status: str
    remarks: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

class WaterLevelUpdate(BaseModel):
    water_level: float

class WaterQualityCreate(BaseModel):
    report_number: Optional[str] = None
    zone: Optional[str] = None
    ward: str
    area: str
    pipeline_id: Optional[int] = None
    tank_id: Optional[int] = None
    sample_location: Optional[str] = None
    sample_type: str # PIPELINE, OVERHEAD_TANK, UNDERGROUND_TANK, PUBLIC_TAP, RESERVOIR
    sample_date: date
    tested_by: Optional[str] = None
    laboratory_name: Optional[str] = None
    ph_level: float
    tds: float
    turbidity: float
    chlorine_level: float
    hardness: Optional[float] = None
    iron: Optional[float] = None
    fluoride: Optional[float] = None
    nitrate: Optional[float] = None
    bacteria_present: Optional[bool] = False
    temperature: Optional[float] = None
    odor: Optional[str] = None
    color: Optional[str] = None
    taste: Optional[str] = None
    remarks: Optional[str] = None
    next_test_date: Optional[date] = None

class WaterQualityUpdate(BaseModel):
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    pipeline_id: Optional[int] = None
    tank_id: Optional[int] = None
    sample_location: Optional[str] = None
    sample_type: Optional[str] = None
    sample_date: Optional[date] = None
    tested_by: Optional[str] = None
    laboratory_name: Optional[str] = None
    ph_level: Optional[float] = None
    tds: Optional[float] = None
    turbidity: Optional[float] = None
    chlorine_level: Optional[float] = None
    hardness: Optional[float] = None
    iron: Optional[float] = None
    fluoride: Optional[float] = None
    nitrate: Optional[float] = None
    bacteria_present: Optional[bool] = None
    temperature: Optional[float] = None
    odor: Optional[str] = None
    color: Optional[str] = None
    taste: Optional[str] = None
    overall_status: Optional[str] = None
    remarks: Optional[str] = None
    next_test_date: Optional[date] = None

class WaterQualityResponse(BaseModel):
    id: int
    report_number: str
    zone: Optional[str] = None
    ward: str
    area: str
    pipeline_id: Optional[int] = None
    tank_id: Optional[int] = None
    sample_location: Optional[str] = None
    sample_type: str
    sample_date: date
    tested_by: Optional[str] = None
    laboratory_name: Optional[str] = None
    ph_level: float
    tds: float
    turbidity: float
    chlorine_level: float
    hardness: Optional[float] = None
    iron: Optional[float] = None
    fluoride: Optional[float] = None
    nitrate: Optional[float] = None
    bacteria_present: bool
    temperature: Optional[float] = None
    odor: Optional[str] = None
    color: Optional[str] = None
    taste: Optional[str] = None
    overall_status: str
    remarks: Optional[str] = None
    next_test_date: Optional[date] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    quality_score: Optional[float] = 100.0

    class Config:
        from_attributes = True
        orm_mode = True

class WaterQualityList(BaseModel):
    items: List[WaterQualityResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class WaterQualityFilter(BaseModel):
    overall_status: Optional[str] = None
    zone: Optional[str] = None
    ward: Optional[str] = None
    sample_type: Optional[str] = None
    sample_date: Optional[date] = None

class InspectionCreate(BaseModel):
    inspection_number: Optional[str] = None
    zone: Optional[str] = None
    ward: str
    area: str
    sample_location: Optional[str] = None
    inspection_date: date
    assigned_inspector: Optional[str] = None
    status: Optional[str] = "SCHEDULED"
    remarks: Optional[str] = None

class InspectionUpdate(BaseModel):
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    sample_location: Optional[str] = None
    inspection_date: Optional[date] = None
    assigned_inspector: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class InspectionResponse(BaseModel):
    id: int
    inspection_number: str
    zone: Optional[str] = None
    ward: str
    area: str
    sample_location: Optional[str] = None
    inspection_date: date
    assigned_inspector: Optional[str] = None
    status: str
    remarks: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

class InspectionList(BaseModel):
    items: List[InspectionResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class AlertResponse(BaseModel):
    id: int
    quality_report_id: int
    alert_type: str
    severity: str
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    report_number: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

class AlertList(BaseModel):
    items: List[AlertResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

# Task schemas
class TaskCreate(BaseModel):
    worker_id: Optional[int] = None
    task_name: str
    task_description: Optional[str] = None
    status: Optional[str] = "PENDING"
    remarks: Optional[str] = None

class TaskUpdateSchema(BaseModel):
    worker_id: Optional[int] = None
    task_name: Optional[str] = None
    task_description: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    maintenance_id: int
    worker_id: Optional[int] = None
    task_name: str
    task_description: Optional[str] = None
    status: str
    assigned_date: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

# Material schemas
class MaterialCreate(BaseModel):
    material_name: str
    quantity: float
    unit: str
    cost: float
    supplier: Optional[str] = None

class MaterialResponse(BaseModel):
    id: int
    maintenance_id: int
    material_name: str
    quantity: float
    unit: str
    cost: float
    supplier: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

# Photo schemas
class PhotoUpload(BaseModel):
    photo_type: str # BEFORE, DURING, AFTER
    image_url: str
    uploaded_by: Optional[int] = None

class PhotoResponse(BaseModel):
    id: int
    maintenance_id: int
    photo_type: str
    image_url: str
    uploaded_by: Optional[int] = None
    uploaded_at: datetime

    @field_validator("image_url", mode="before")
    @classmethod
    def sign_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

    class Config:
        from_attributes = True
        orm_mode = True

# History schemas
class HistoryResponse(BaseModel):
    id: int
    maintenance_id: int
    action: str
    performed_by: str
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

# Maintenance Request schemas
class MaintenanceCreate(BaseModel):
    maintenance_number: Optional[str] = None
    maintenance_type: str
    source_type: str
    source_reference_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    zone: Optional[str] = None
    ward: str
    area: str
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "PENDING"
    scheduled_date: Optional[date] = None
    start_date: Optional[date] = None
    expected_completion: Optional[date] = None
    assigned_supervisor: Optional[str] = None
    assigned_team: Optional[str] = None
    estimated_cost: Optional[float] = 0.0
    actual_cost: Optional[float] = 0.0
    remarks: Optional[str] = None

class MaintenanceUpdate(BaseModel):
    maintenance_type: Optional[str] = None
    source_type: Optional[str] = None
    source_reference_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    scheduled_date: Optional[date] = None
    start_date: Optional[date] = None
    expected_completion: Optional[date] = None
    completed_date: Optional[date] = None
    assigned_supervisor: Optional[str] = None
    assigned_team: Optional[str] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    remarks: Optional[str] = None

class MaintenanceResponse(BaseModel):
    id: int
    maintenance_number: str
    maintenance_type: str
    source_type: str
    source_reference_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    zone: Optional[str] = None
    ward: str
    area: str
    priority: str
    status: str
    scheduled_date: Optional[date] = None
    start_date: Optional[date] = None
    expected_completion: Optional[date] = None
    completed_date: Optional[date] = None
    assigned_supervisor: Optional[str] = None
    assigned_team: Optional[str] = None
    estimated_cost: float
    actual_cost: float
    remarks: Optional[str] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    tasks: List[TaskResponse] = []
    materials: List[MaterialResponse] = []
    photos: List[PhotoResponse] = []
    histories: List[HistoryResponse] = []

    class Config:
        from_attributes = True
        orm_mode = True

class MaintenanceList(BaseModel):
    items: List[MaintenanceResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class MaintenanceFilter(BaseModel):
    priority: Optional[str] = None
    status: Optional[str] = None
    maintenance_type: Optional[str] = None
    ward: Optional[str] = None
    zone: Optional[str] = None
    source_type: Optional[str] = None

class MaintenanceDashboardResponse(BaseModel):
    total_maintenance: int
    pending: int
    scheduled: int
    in_progress: int
    completed: int
    overdue: int
    estimated_cost: float
    actual_cost: float

# Emergency schemas
class ResponseTeamCreate(BaseModel):
    worker_id: int
    role: str
    status: Optional[str] = "ASSIGNED"

class ResponseTeamResponse(BaseModel):
    id: int
    shutdown_id: int
    worker_id: int
    role: str
    status: str
    assigned_at: datetime
    worker_name: Optional[str] = None
    worker_skill: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

class AffectedAreaCreate(BaseModel):
    zone: Optional[str] = None
    ward: str
    area: str
    population: Optional[int] = 0

class AffectedAreaResponse(BaseModel):
    id: int
    shutdown_id: int
    zone: Optional[str] = None
    ward: str
    area: str
    population: int

    class Config:
        from_attributes = True
        orm_mode = True

class TimelineResponse(BaseModel):
    id: int
    shutdown_id: int
    action: str
    performed_by: str
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class NotificationCreate(BaseModel):
    notification_title: str
    notification_message: str

class NotificationResponse(BaseModel):
    id: int
    shutdown_id: int
    notification_title: str
    notification_message: str
    notification_status: str
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        orm_mode = True

class EmergencyCreate(BaseModel):
    shutdown_number: Optional[str] = None
    title: str
    description: Optional[str] = None
    emergency_type: str
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "DECLARED"
    zone: Optional[str] = None
    ward: str
    area: str
    affected_pipeline_id: Optional[int] = None
    affected_tank_id: Optional[int] = None
    affected_schedule_id: Optional[int] = None
    reason: Optional[str] = None
    shutdown_start: datetime
    expected_restore_time: Optional[datetime] = None
    assigned_supervisor: Optional[str] = None
    assigned_team: Optional[str] = None
    remarks: Optional[str] = None
    affected_areas: Optional[List[AffectedAreaCreate]] = []

class EmergencyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    emergency_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    affected_pipeline_id: Optional[int] = None
    affected_tank_id: Optional[int] = None
    affected_schedule_id: Optional[int] = None
    reason: Optional[str] = None
    shutdown_start: Optional[datetime] = None
    expected_restore_time: Optional[datetime] = None
    actual_restore_time: Optional[datetime] = None
    assigned_supervisor: Optional[str] = None
    assigned_team: Optional[str] = None
    citizen_notification_sent: Optional[bool] = None
    remarks: Optional[str] = None

class EmergencyResponse(BaseModel):
    id: int
    shutdown_number: str
    title: str
    description: Optional[str] = None
    emergency_type: str
    priority: str
    status: str
    zone: Optional[str] = None
    ward: str
    area: str
    affected_pipeline_id: Optional[int] = None
    affected_tank_id: Optional[int] = None
    affected_schedule_id: Optional[int] = None
    reason: Optional[str] = None
    shutdown_start: datetime
    expected_restore_time: Optional[datetime] = None
    actual_restore_time: Optional[datetime] = None
    assigned_supervisor: Optional[str] = None
    assigned_team: Optional[str] = None
    citizen_notification_sent: bool
    remarks: Optional[str] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    affected_areas: List[AffectedAreaResponse] = []
    teams: List[ResponseTeamResponse] = []
    timelines: List[TimelineResponse] = []
    notifications: List[NotificationResponse] = []
    
    pipeline_number: Optional[str] = None
    tank_number: Optional[str] = None
    schedule_number: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

class EmergencyList(BaseModel):
    items: List[EmergencyResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class EmergencyFilter(BaseModel):
    priority: Optional[str] = None
    emergency_type: Optional[str] = None
    status: Optional[str] = None
    ward: Optional[str] = None
    zone: Optional[str] = None

class EmergencyDashboardResponse(BaseModel):
    active_emergencies: int
    resolved_emergencies: int
    critical_emergencies: int
    affected_areas_count: int
    affected_citizens: int
    avg_resolution_time_minutes: float

# Notification Schemas
class RecipientResponse(BaseModel):
    id: int
    notification_id: int
    recipient_id: Optional[int] = None
    recipient_name: Optional[str] = None
    delivery_status: str
    read_status: str
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        orm_mode = True

class HistoryResponse(BaseModel):
    id: int
    notification_id: int
    action: str
    performed_by: str
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str
    priority: Optional[str] = "MEDIUM"
    target_type: Optional[str] = None
    target_reference_id: Optional[int] = None
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    recipient_type: str
    delivery_channel: str
    status: Optional[str] = "DRAFT"
    scheduled_time: Optional[datetime] = None

class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    notification_type: Optional[str] = None
    priority: Optional[str] = None
    target_type: Optional[str] = None
    target_reference_id: Optional[int] = None
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    recipient_type: Optional[str] = None
    delivery_channel: Optional[str] = None
    status: Optional[str] = None
    scheduled_time: Optional[datetime] = None

class NotificationResponse(BaseModel):
    id: int
    notification_number: str
    title: str
    message: str
    notification_type: str
    priority: str
    target_type: Optional[str] = None
    target_reference_id: Optional[int] = None
    zone: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    recipient_type: str
    recipient_count: int
    delivery_channel: str
    status: str
    scheduled_time: Optional[datetime] = None
    sent_time: Optional[datetime] = None
    read_count: int
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    recipients: List[RecipientResponse] = []
    histories: List[HistoryResponse] = []

    class Config:
        from_attributes = True
        orm_mode = True

class NotificationList(BaseModel):
    items: List[NotificationResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

class NotificationFilter(BaseModel):
    notification_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    recipient_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class TemplateCreate(BaseModel):
    template_name: str
    template_type: str
    subject: Optional[str] = None
    body: str
    status: Optional[str] = "ACTIVE"

class TemplateUpdate(BaseModel):
    template_name: Optional[str] = None
    template_type: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    status: Optional[str] = None

class TemplateResponse(BaseModel):
    id: int
    template_name: str
    template_type: str
    subject: Optional[str] = None
    body: str
    status: str

    class Config:
        from_attributes = True
        orm_mode = True

class NotificationDashboardResponse(BaseModel):
    total_notifications: int
    scheduled: int
    sent: int
    failed: int
    unread: int
    emergency_notifications: int


# Reports and Analytics Schemas
class ReportsDashboardResponse(BaseModel):
    total_complaints: int
    pending_complaints: int
    resolved_complaints: int
    avg_resolution_time_hours: float
    today_water_supply: str
    upcoming_supply: str
    workers_available: int
    workers_busy: int
    worker_efficiency_pct: float
    total_pipelines: int
    damaged_pipelines: int
    inspections_due: int
    total_tanks: int
    low_water_tanks: int
    tank_capacity_usage_pct: float
    unsafe_water_reports: int
    maintenance_in_progress: int
    emergency_shutdowns: int
    notifications_sent: int
    monthly_complaints_trend: dict
    complaints_by_category: dict
    complaints_by_ward: dict
    complaints_by_status: dict

class ComplaintsReportResponse(BaseModel):
    total_complaints: int
    by_category: dict
    by_ward: dict
    by_status: dict
    avg_resolution_time_hours: float
    recent_complaints: list

class WorkersReportResponse(BaseModel):
    total_workers: int
    available_workers: int
    busy_workers: int
    worker_efficiency: list
    top_performing: list

class SupplyReportResponse(BaseModel):
    total_schedules: int
    total_volume_mgd: float
    by_type: dict
    by_ward: dict
    supply_trends: dict

class PipelinesReportResponse(BaseModel):
    total_pipelines: int
    by_condition: dict
    by_material: dict
    by_type: dict
    damaged_pipelines_count: int
    inspections_due_count: int

class TanksReportResponse(BaseModel):
    total_tanks: int
    low_water_tanks: int
    avg_water_level_pct: float
    total_capacity_liters: float
    current_level_liters: float

class QualityReportResponse(BaseModel):
    total_reports: int
    unsafe_reports_count: int
    warning_reports_count: int
    safe_reports_count: int
    avg_ph_level: float
    avg_tds_level: float

class MaintenanceReportResponse(BaseModel):
    total_requests: int
    in_progress_count: int
    completed_count: int
    total_estimated_cost: float
    total_actual_cost: float
    avg_completion_time_days: float

class EmergencyReportResponse(BaseModel):
    total_emergencies: int
    active_emergencies: int
    resolved_emergencies: int
    avg_response_time_minutes: float
    affected_wards: list

class NotificationsReportResponse(BaseModel):
    total_sent: int
    by_channel: dict
    by_type: dict
    delivery_success_rate: float


# Citizen Management and Settings Schemas
class CitizenResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    ward: Optional[str] = None
    area: Optional[str] = None
    registered_date: str
    service_status: str # ENABLED, DISABLED
    complaint_count: int

    class Config:
        from_attributes = True
        orm_mode = True

class CitizenListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[CitizenResponse]

class CitizenDetailResponse(BaseModel):
    citizen: CitizenResponse
    resolved_complaints: int
    pending_complaints: int
    water_supply_area: Optional[str] = None
    notification_count: int

class CitizenServiceStatusUpdate(BaseModel):
    service_status: str
    ward: Optional[str] = None
    area: Optional[str] = None

class DepartmentSettingsCreate(BaseModel):
    department_name: str
    department_code: str
    office_name: str
    office_email: str
    office_phone: str
    office_address: str
    working_days: str
    working_hours: str
    emergency_contact_name: str
    emergency_contact_phone: str
    default_supply_start: Optional[str] = None
    default_supply_end: Optional[str] = None
    notification_email: Optional[bool] = True
    notification_sms: Optional[bool] = True
    notification_push: Optional[bool] = True
    dashboard_refresh_interval: Optional[int] = 30
    report_default_format: Optional[str] = "PDF"
    timezone: Optional[str] = "UTC"
    language: Optional[str] = "en"

class DepartmentSettingsUpdate(BaseModel):
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    office_name: Optional[str] = None
    office_email: Optional[str] = None
    office_phone: Optional[str] = None
    office_address: Optional[str] = None
    working_days: Optional[str] = None
    working_hours: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    default_supply_start: Optional[str] = None
    default_supply_end: Optional[str] = None
    notification_email: Optional[bool] = None
    notification_sms: Optional[bool] = None
    notification_push: Optional[bool] = None
    dashboard_refresh_interval: Optional[int] = None
    report_default_format: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None

class DepartmentSettingsResponse(BaseModel):
    id: int
    department_name: str
    department_code: str
    office_name: str
    office_email: str
    office_phone: str
    office_address: str
    working_days: str
    working_hours: str
    emergency_contact_name: str
    emergency_contact_phone: str
    default_supply_start: Optional[str] = None
    default_supply_end: Optional[str] = None
    notification_email: bool
    notification_sms: bool
    notification_push: bool
    dashboard_refresh_interval: int
    report_default_format: str
    timezone: str
    language: str

    class Config:
        from_attributes = True
        orm_mode = True

class DepartmentProfileUpdate(BaseModel):
    department_logo: Optional[str] = None
    department_banner: Optional[str] = None
    department_description: Optional[str] = None
    website: Optional[str] = None
    social_links: Optional[str] = None

class DepartmentProfileResponse(BaseModel):
    id: int
    department_logo: Optional[str] = None
    department_banner: Optional[str] = None
    department_description: Optional[str] = None
    website: Optional[str] = None
    social_links: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True

# Inspection & Alert Aliases
class QualInspectionCreate(BaseModel):
    sample_id: Optional[str] = None
    parameter_tested: Optional[str] = None
    value_measured: Optional[str] = None
    units: Optional[str] = None
    standard_limit: Optional[str] = None
    status: Optional[str] = None
    inspection_date: Optional[date] = None

class QualInspectionUpdate(BaseModel):
    sample_id: Optional[str] = None
    parameter_tested: Optional[str] = None
    value_measured: Optional[str] = None
    units: Optional[str] = None
    standard_limit: Optional[str] = None
    status: Optional[str] = None
    inspection_date: Optional[date] = None

class InspectionCreate(BaseModel):
    pipeline_id: Optional[int] = None
    inspector_name: Optional[str] = None
    inspection_date: Optional[date] = None
    result: Optional[str] = None
    notes: Optional[str] = None

class InspectionUpdate(BaseModel):
    pipeline_id: Optional[int] = None
    inspector_name: Optional[str] = None
    inspection_date: Optional[date] = None
    result: Optional[str] = None
    notes: Optional[str] = None

class InspectionResponse(BaseModel):
    id: int
    pipeline_id: Optional[int] = None
    inspector_name: Optional[str] = None
    inspection_date: Optional[date] = None
    result: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class InspectionList(BaseModel):
    items: List[InspectionResponse] = []
    total_items: int = 0

class AlertResponse(BaseModel):
    id: int
    alert_title: Optional[str] = None
    alert_type: Optional[str] = None
    severity: Optional[str] = None
    message: Optional[str] = None

    class Config:
        from_attributes = True

class AlertList(BaseModel):
    items: List[AlertResponse] = []
    total_items: int = 0

class WaterCitizenAccessCreate(BaseModel):
    citizen_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class WaterCitizenAccessUpdate(BaseModel):
    citizen_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None

class DepartmentSettingsCreate(BaseModel):
    setting_key: str
    setting_value: str
    description: Optional[str] = None

class DepartmentSettingsUpdate(BaseModel):
    setting_value: Optional[str] = None
    description: Optional[str] = None

class DepartmentProfileUpdate(BaseModel):
    department_description: Optional[str] = None
    website: Optional[str] = None
    social_links: Optional[str] = None

class CitizenServiceStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None








