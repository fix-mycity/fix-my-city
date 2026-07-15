import os
from fastapi import APIRouter, Depends, Request, HTTPException, status, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from dependencies.database import get_db
from schemas.register_schema import RegisterSchema, RegisterWorkerSchema
from schemas.login_schema import LoginSchema
from config import settings
from services.jwt_service import decode_access_token

from services.auth_service import (
    register_user,
    register_worker,
    login_user,
    refresh_user_tokens,
    logout_user
)
from services.otp_service import create_otp

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

COOKIE_SECURE = settings.ENV == "production"
ACCESS_TOKEN_MAX_AGE = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
REFRESH_TOKEN_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


class RefreshTokenSchema(BaseModel):
    refresh_token: str


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_MAX_AGE,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=REFRESH_TOKEN_MAX_AGE,
        path="/"
    )


@router.post("/register")
def register(
    user: RegisterSchema,
    db: Session = Depends(get_db)
):
    res = register_user(db=db, user=user)
    if not res["success"]:
        field_error_map = {
            "Email already registered.": "email",
            "Passwords do not match.": "confirm_password",
        }
        field_name = field_error_map.get(res["message"])

        if field_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=[
                    {
                        "loc": ["body", field_name],
                        "msg": res["message"],
                        "type": "value_error",
                    }
                ],
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"],
        )

    if res["success"]:
        try:
            create_otp(db, user.email)
        except Exception as e:
            print(f"Failed to auto-send OTP during registration: {e}")
    return res


@router.post("/register-worker")
def register_worker_endpoint(
    worker: RegisterWorkerSchema,
    db: Session = Depends(get_db)
):
    # Called by City Operation Service (internally)
    res = register_worker(db=db, worker=worker)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"],
        )
    return res


@router.post("/login")
def login(
    user: LoginSchema,
    request: Request,
    response: Response,
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

    access_token = res["data"].pop("access_token")
    refresh_token = res["data"].pop("refresh_token")

    set_auth_cookies(response, access_token, refresh_token)

    return res


@router.post("/refresh")
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing."
        )

    res = refresh_user_tokens(db=db, refresh_token=refresh_token)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=res["message"]
        )

    new_access_token = res["data"].pop("access_token")
    new_refresh_token = res["data"].pop("refresh_token")

    set_auth_cookies(response, new_access_token, new_refresh_token)

    return res


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token missing."
        )

    res = logout_user(db=db, refresh_token=refresh_token)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return res

@router.get("/me")
def get_current_user(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated."
        )

    payload = decode_access_token(access_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )

    return {
        "success": True,
        "message": "User fetched successfully.",
        "data": {
            "user": {
                "id": payload.get("sub"),
                "username": payload.get("username"),
                "email": payload.get("email"),
                "role": payload.get("role")
            }
        }
    }
