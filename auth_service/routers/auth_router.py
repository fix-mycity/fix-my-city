from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from dependencies.database import get_db
from schemas.register_schema import RegisterSchema, RegisterWorkerSchema
from schemas.otp_schema import VerifyOTPSchema
from schemas.login_schema import LoginSchema
from schemas.response_schema import ResponseSchema

from services.auth_service import (
    register_user,
    register_worker,
    login_user,
    logout_user
)
from services.otp_service import verify_otp
from services.jwt_service import decode_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: RegisterSchema, db: Session = Depends(get_db)):
    res = register_user(db=db, user=user)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res


@router.post("/register-worker")
def register_worker_endpoint(worker: RegisterWorkerSchema, db: Session = Depends(get_db)):
    res = register_worker(db=db, worker=worker)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res


@router.post("/verify-otp")
def verify(data: VerifyOTPSchema, db: Session = Depends(get_db)):
    res = verify_otp(db=db, data=data)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res["message"]
        )
    return res


@router.post("/login")
def login(credentials: LoginSchema, request: Request, response: Response, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    res = login_user(db=db, credentials=credentials, ip_address=client_ip, device=user_agent)
    if not res["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=res["message"]
        )

    # Extract tokens from service result
    access_token = res["data"].pop("access_token", None)
    refresh_token = res["data"].pop("refresh_token", None)

    # Set HTTP-Only cookies for browser security
    if access_token:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=False  # Set to True in production with HTTPS
        )

    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            secure=False
        )

    return res


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")
        return {"success": True, "message": "Logged out successfully."}

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
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header.split(" ")[1]

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
                "role": payload.get("role"),
                "permissions": payload.get("permissions") or []
            }
        }
    }
