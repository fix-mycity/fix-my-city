import re

from pydantic import BaseModel, ValidationInfo, field_validator


class ResetPasswordSchema(BaseModel):

    email: str

    otp: str

    new_password: str

    confirm_password: str

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

    @field_validator("new_password", mode="before")
    @classmethod
    def validate_new_password(cls, value: str):
        value = "" if value is None else str(value)

        if not value:
            raise ValueError("New password is required.")

        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")

        return value

    @field_validator("confirm_password", mode="before")
    @classmethod
    def validate_confirm_password(cls, value: str, info: ValidationInfo):
        value = "" if value is None else str(value)

        if not value:
            raise ValueError("Please confirm your password.")

        if info.data.get("new_password") and value != info.data["new_password"]:
            raise ValueError("Passwords do not match.")

        return value
