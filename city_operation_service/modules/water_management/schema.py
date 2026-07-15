from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

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

