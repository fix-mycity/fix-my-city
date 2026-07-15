import re

from pydantic import BaseModel, EmailStr, ValidationInfo, field_validator


class RegisterSchema(BaseModel):

    username: str

    email: EmailStr

    state: str

    district: str

    pincode: str

    password: str

    confirm_password: str

    @field_validator("username", "state", "district", mode="before")
    @classmethod
    def validate_required_text(cls, value: str, info):
        value = str(value).strip() if value is not None else ""
        field_labels = {
            "username": "Username",
            "state": "State",
            "district": "District",
        }

        if not value:
            raise ValueError(f"{field_labels[info.field_name]} is required.")

        if info.field_name == "username" and len(value) < 3:
            raise ValueError("Username must be at least 3 characters.")

        if info.field_name == "username" and len(value) > 50:
            raise ValueError("Username must be 50 characters or less.")

        return value

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_required(cls, value: str):
        value = str(value).strip() if value is not None else ""

        if not value:
            raise ValueError("Email is required.")

        return value

    @field_validator("pincode", mode="before")
    @classmethod
    def validate_pincode(cls, value: str):
        value = str(value).strip() if value is not None else ""

        if not value:
            raise ValueError("Pincode is required.")

        if not re.fullmatch(r"\d{6}", value):
            raise ValueError("Please enter a valid 6-digit pincode.")

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

    @field_validator("confirm_password", mode="before")
    @classmethod
    def validate_confirm_password(cls, value: str, info: ValidationInfo):
        value = "" if value is None else str(value)

        if not value:
            raise ValueError("Please confirm your password.")

        if info.data.get("password") and value != info.data["password"]:
            raise ValueError("Passwords do not match.")

        return value

class RegisterWorkerSchema(RegisterSchema):
    manager_id: int
    department: str
