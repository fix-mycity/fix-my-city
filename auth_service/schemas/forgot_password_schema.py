import re

from pydantic import BaseModel, field_validator


class ForgotPasswordSchema(BaseModel):

    email: str

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value: str):
        value = str(value).strip() if value is not None else ""

        if not value:
            raise ValueError("Email is required.")

        if not re.fullmatch(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value):
            raise ValueError("Please enter a valid email address.")

        return value
