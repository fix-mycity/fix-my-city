from pydantic import BaseModel, EmailStr


class SendOTPSchema(BaseModel):

    email: EmailStr


class VerifyOTPSchema(BaseModel):

    email: EmailStr

    otp: str