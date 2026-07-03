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


@router.post("/forgot")
def forgot_password(
    data: ForgotPasswordSchema,
    db: Session = Depends(get_db)
):
    res = request_password_reset(db=db, email=data.email)
    if not res["success"]:
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res