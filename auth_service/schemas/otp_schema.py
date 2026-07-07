import re

from pydantic import BaseModel, field_validator


class SendOTPSchema(BaseModel):

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


class VerifyOTPSchema(BaseModel):

    email: str

    otp: str

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value: str):
        value = str(value).strip() if value is not None else ""

        if not value:
            raise ValueError("Email is required.")

        if not re.fullmatch(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value):
            raise ValueError("Please enter a valid email address.")

        return value

    @field_validator("otp", mode="before")
    @classmethod
    def validate_otp(cls, value: str):
        value = str(value).strip() if value is not None else ""

        if not value:
            raise ValueError("OTP code is required.")

        if not re.fullmatch(r"\d{6}", value):
            raise ValueError("Please enter a valid 6-digit OTP code.")

        return value
