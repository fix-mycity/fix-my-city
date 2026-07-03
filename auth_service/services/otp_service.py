import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from models.otp_model import OTP
from services.email_service import send_otp_email


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def create_otp(db: Session, email: str) -> str:
    otp_code = generate_otp()
    
    # Expiry time is set to 5 minutes from now
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    # Store OTP in the database
    db_otp = OTP(
        email=email,
        otp=otp_code,
        is_used=False,
        expires_at=expires_at
    )
    db.add(db_otp)
    db.commit()
    db.refresh(db_otp)
    
    # Send email containing the OTP
    send_otp_email(email, otp_code)
    
    return otp_code


def verify_otp(db: Session, email: str, otp_code: str) -> bool:
    now = datetime.now(timezone.utc)
    
    # Retrieve the latest active OTP for this email
    db_otp = db.query(OTP).filter(
        OTP.email == email,
        OTP.otp == otp_code,
        OTP.is_used == False,
        OTP.expires_at > now
    ).order_by(OTP.created_at.desc()).first()
    
    if not db_otp:
        return False
        
    # Mark OTP as used
    db_otp.is_used = True
    db.commit()
    return True