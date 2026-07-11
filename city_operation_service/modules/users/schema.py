from pydantic import BaseModel, Field, field_validator, ConfigDict
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
    created_at: datetime
    updated_at: datetime