from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from core.s3 import generate_presigned_url

class PostCreate(BaseModel):
    title: str
    content: str
    category: str
    location: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    author_id: int
    author_type: str
    author_name: str
    title: str
    content: str
    category: str
    image_url: Optional[str]
    location: Optional[str]
    status: str
    rejection_reason: Optional[str]
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    reactions_count: int = 0
    has_reacted: bool = False

    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_url", mode="before")
    @classmethod
    def sign_image_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return generate_presigned_url(v)
        return v

class RejectPostRequest(BaseModel):
    reason: str

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    post_id: int
    author_id: int
    author_name: str
    author_role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PostReactionRequest(BaseModel):
    reaction_type: Optional[str] = "LIKE"

class SuggestionCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "General"

class SuggestionResponse(BaseModel):
    id: int
    citizen_id: int
    title: str
    description: str
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
