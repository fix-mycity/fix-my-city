from fastapi import Request, HTTPException, status
from jose import jwt, JWTError
from config import settings

class UserData:
    def __init__(self, id: int, username: str | None, email: str | None, role: str | None):
        self.id = id
        self.username = username
        self.email = email
        self.role = role

def get_current_water_user(request: Request) -> UserData:
    token = None
    
    # 1. Try reading from Authorization Header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        
    # 2. Fallback to access_token Cookie (useful for web integrations)
    if not token:
        token = request.cookies.get("access_token")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in first."
        )
        
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed: missing user reference."
            )
        return UserData(
            id=int(user_id_str),
            username=payload.get("username"),
            email=payload.get("email"),
            role=payload.get("role")
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired. Please re-authenticate."
        )

import hashlib
import os
import base64

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    db_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    encoded_salt = base64.b64encode(salt).decode('utf-8')
    encoded_hash = base64.b64encode(db_hash).decode('utf-8')
    return f"pbkdf2_sha256$100000${encoded_salt}${encoded_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        parts = hashed_password.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            return False
        iterations = int(parts[1])
        salt = base64.b64decode(parts[2])
        stored_hash = base64.b64decode(parts[3])
        new_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, iterations)
        return new_hash == stored_hash
    except Exception:
        return False

