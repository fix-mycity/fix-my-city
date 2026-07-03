from pydantic import BaseModel, EmailStr, Field


class RegisterSchema(BaseModel):

    username: str = Field(
        ...,
        min_length=3,
        max_length=50
    )

    email: EmailStr

    state: str

    district: str

    pincode: str = Field(
        ...,
        min_length=6,
        max_length=6
    )

    password: str = Field(
        ...,
        min_length=8
    )

    confirm_password: str