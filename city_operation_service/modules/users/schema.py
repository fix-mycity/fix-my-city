from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProfileUpdateSchema(BaseModel):
    """All fields optional — PATCH style partial update."""
    full_name: Optional[str] = Field(None, max_length=150)
    phone_number: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None


class ProfileResponseSchema(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str]
    phone_number: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # allows .from_orm() style conversion from SQLAlchemy model