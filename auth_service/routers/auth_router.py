from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from dependencies.database import get_db
from schemas.register_schema import RegisterSchema
from schemas.login_schema import LoginSchema

from services.auth_service import (
    register_user,
    login_user,
    refresh_user_tokens,
    logout_user
)
from services.otp_service import create_otp

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class RefreshTokenSchema(BaseModel):
    refresh_token: str


@router.post("/register")
def register(
    user: RegisterSchema,
    db: Session = Depends(get_db)
):
    res = register_user(db=db, user=user)
    if res["success"]:
        # Automatically generate and send registration verification OTP
        try:
            create_otp(db, user.email)
        except Exception as e:
            # We don't want registration to fail if mail fails, but log it
            print(f"Failed to auto-send OTP during registration: {e}")
            res["message"] += " (Failed to send verification email)"
    return res


@router.post("/login")
def login(
    user: LoginSchema,
    request: Request,
    db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else "unknown"
    device = request.headers.get("user-agent", "unknown")
    
    res = login_user(
        db=db,
        credentials=user,
        ip_address=ip_address,
        device=device
    )
    
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res


@router.post("/refresh")
def refresh(
    data: RefreshTokenSchema,
    db: Session = Depends(get_db)
):
    res = refresh_user_tokens(db=db, refresh_token=data.refresh_token)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=res["message"]
        )
    return res


@router.post("/logout")
def logout(
    data: RefreshTokenSchema,
    db: Session = Depends(get_db)
):
    res = logout_user(db=db, refresh_token=data.refresh_token)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res