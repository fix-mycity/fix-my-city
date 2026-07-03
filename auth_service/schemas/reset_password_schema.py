from pydantic import BaseModel


class ResetPasswordSchema(BaseModel):

    email: str

    otp: str

    new_password: str

    confirm_password: str