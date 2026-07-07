import re

from pydantic import BaseModel, field_validator


class LoginSchema(BaseModel):

    email: str

    password: str

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_required(cls, value: str):
        value = str(value).strip() if value is not None else ""

        if not value:
            raise ValueError("Email is required.")

        if not re.fullmatch(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value):
            raise ValueError("Please enter a valid email address.")

        return value

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, value: str):
        value = "" if value is None else str(value)

        if not value:
            raise ValueError("Password is required.")

        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")

        return value
