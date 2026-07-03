import bcrypt
from sqlalchemy.orm import Session
from models.user_model import User
from services.otp_service import create_otp, verify_otp
from schemas.reset_password_schema import ResetPasswordSchema


def hash_password(password: str) -> str:
    # Encode password to bytes
    password_bytes = password.encode("utf-8")
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        password_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


def request_password_reset(db: Session, email: str) -> dict:
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {
            "success": False,
            "message": "Email address not found."
        }
        
    # Generate and send reset password OTP
    create_otp(db, email)
    
    return {
        "success": True,
        "message": f"Password reset OTP sent to {email}"
    }


def reset_password_with_otp(db: Session, data: ResetPasswordSchema) -> dict:
    if data.new_password != data.confirm_password:
        return {
            "success": False,
            "message": "Passwords do not match."
        }
        
    # Verify OTP
    otp_valid = verify_otp(db, data.email, data.otp)
    if not otp_valid:
        return {
            "success": False,
            "message": "Invalid or expired OTP."
        }
        
    # Get user and update password
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {
            "success": False,
            "message": "User not found."
        }
        
    user.password = hash_password(data.new_password)
    db.commit()
    
    return {
        "success": True,
        "message": "Password reset successful."
    }