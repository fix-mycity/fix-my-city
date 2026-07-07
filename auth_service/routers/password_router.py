from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies.database import get_db
from schemas.forgot_password_schema import ForgotPasswordSchema
from schemas.reset_password_schema import ResetPasswordSchema
from services.password_service import request_password_reset, reset_password_with_otp

router = APIRouter(
    prefix="/password",
    tags=["Password"]
)


def field_error(field_name: str, message: str):
    return [
        {
            "loc": ["body", field_name],
            "msg": message,
            "type": "value_error",
        }
    ]


@router.post("/forgot")
def forgot_password(
    data: ForgotPasswordSchema,
    db: Session = Depends(get_db)
):
    res = request_password_reset(db=db, email=data.email)
    if not res["success"]:
        if res["message"] == "Email address not found.":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=field_error("email", res["message"])
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res


@router.post("/reset")
def reset_password(
    data: ResetPasswordSchema,
    db: Session = Depends(get_db)
):
    res = reset_password_with_otp(db=db, data=data)
    if not res["success"]:
        field_error_map = {
            "Passwords do not match.": "confirm_password",
            "Invalid or expired OTP.": "otp",
        }
        field_name = field_error_map.get(res["message"])

        if field_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=field_error(field_name, res["message"])
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res
