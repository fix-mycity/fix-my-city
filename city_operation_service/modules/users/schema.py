from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import Optional
from datetime import datetime


class ProfileUpdateSchema(BaseModel):
    """All fields optional — PATCH style partial update."""
    full_name: Optional[str] = Field(None, max_length=150)
    phone_number: Optional[str] = Field(None, max_length=20, pattern=r"^\d{10}$")
    avatar_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None

    @field_validator("full_name", "bio")
    @classmethod
    def strip_whitespace(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            return v if v else None
        return v

    @field_validator("avatar_url")
    @classmethod
    def validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if v and not (v.startswith("http://") or v.startswith("https://")):
                raise ValueError("avatar_url must start with http:// or https://")
            return v if v else None
        return v


class ProfileResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # allows conversion from SQLAlchemy model

    id: int
    user_id: int
    full_name: Optional[str]
    phone_number: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    is_aadhaar_verified: bool
    aadhaar_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    @field_validator("avatar_url", mode="before")
    @classmethod
    def sign_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        from core.s3 import generate_presigned_url
        if v:
            return generate_presigned_url(v)
        return v


class SavedLocationCreateSchema(BaseModel):
    label: str = Field(..., min_length=2, max_length=50)
    address: str = Field(..., min_length=5, max_length=500)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)

    @field_validator("label", "address")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty or whitespace-only")
        return v

    @model_validator(mode="after")
    def validate_coordinates(self) -> "SavedLocationCreateSchema":
        lat = self.latitude
        lon = self.longitude
        if (lat is None) != (lon is None):
            raise ValueError("Both latitude and longitude must be provided together, or both must be null")
        return self


class SavedLocationUpdateSchema(BaseModel):
    label: Optional[str] = Field(None, min_length=2, max_length=50)
    address: Optional[str] = Field(None, min_length=5, max_length=500)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)

    @field_validator("label", "address")
    @classmethod
    def strip_whitespace(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be empty or whitespace-only")
            return v
        return v


class SavedLocationResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    label: str
    address: str
    latitude: Optional[float]
    longitude: Optional[float]
    created_at: datetime
    updated_at: datetime


class AadhaarOtpRequestSchema(BaseModel):
    aadhaar_number: str = Field(..., pattern=r"^\d{12}$", description="12-digit Aadhaar number")


class AadhaarOtpResponseSchema(BaseModel):
    ref_id: str
    status: str
    message: str


class AadhaarVerifyRequestSchema(BaseModel):
    ref_id: str = Field(..., min_length=1, description="Cashfree reference ID")
    otp: str = Field(..., pattern=r"^\d{6}$", description="6-digit Aadhaar OTP")


class AadhaarVerifyDataSchema(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None
    care_of: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    user_image: Optional[str] = None
    mobile_number_exists: Optional[bool] = None
    email_exists: Optional[bool] = None


class AadhaarVerifyResponseSchema(BaseModel):
    status: str
    message: str
    ref_id: str
    data: Optional[AadhaarVerifyDataSchema] = None


class DigiLockerInitRequestSchema(BaseModel):
    redirect_url: str = Field(..., description="Redirect URL for user consent callback")


class DigiLockerInitResponseSchema(BaseModel):
    verification_id: str
    reference_id: int
    url: str
    status: str
    redirect_url: str


class DigiLockerStatusRequestSchema(BaseModel):
    verification_id: str = Field(..., description="Unique verification ID")


class DigiLockerStatusResponseSchema(BaseModel):
    status: str
    verification_id: str
    reference_id: int
    name: Optional[str] = None
    message: Optional[str] = None
