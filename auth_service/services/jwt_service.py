import secrets
import uuid
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from config import settings
from models.refresh_token_model import RefreshToken


def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    # Include an expiration and a unique JWT ID (jti)
    payload.update({
        "exp": expire,
        "jti": uuid.uuid4().hex
    })
    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return token


def create_refresh_token(db: Session, user_id: int) -> str:
    token_str = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    
    # Store token in database
    db_token = RefreshToken(
        user_id=user_id,
        refresh_token=token_str,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    
    return token_str


def verify_refresh_token(db: Session, token: str) -> RefreshToken | None:
    now = datetime.now(timezone.utc)
    
    db_token = db.query(RefreshToken).filter(
        RefreshToken.refresh_token == token,
        RefreshToken.expires_at > now
    ).first()
    
    return db_token


def revoke_refresh_token(db: Session, token: str) -> bool:
    db_token = db.query(RefreshToken).filter(
        RefreshToken.refresh_token == token
    ).first()
    
    if db_token:
        db.delete(db_token)
        db.commit()
        return True
    return False


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None