from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies.database import get_db
from schemas.otp_schema import SendOTPSchema, VerifyOTPSchema
from services.otp_service import create_otp, verify_otp
from models.user_model import User

router = APIRouter(
    prefix="/otp",
    tags=["OTP"]
)


@router.post("/send")
def send_otp(
    data: SendOTPSchema,
    db: Session = Depends(get_db)
):
    try:
        create_otp(db, data.email)
        return {
            "success": True,
            "message": f"OTP code sent to {data.email}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {e}"
        )


@router.post("/verify")
def verify(
    data: VerifyOTPSchema,
    db: Session = Depends(get_db)
):
    is_valid = verify_otp(db, data.email, data.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code"
        )
        
    # Mark user as verified in database
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        user.is_verified = True
        db.commit()
        
    return {
        "success": True,
        "message": "OTP verified successfully. Email address is now verified."
    }