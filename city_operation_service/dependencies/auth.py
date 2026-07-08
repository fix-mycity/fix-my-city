from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from config import settings
from pydantic import BaseModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class UserData(BaseModel):
    id: int
    username: str | None = None
    email: str | None = None
    role: str | None = None

def get_current_user(token: str = Depends(oauth2_scheme)) -> UserData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
            
        return UserData(
            id=int(user_id_str),
            username=payload.get("username"),
            email=payload.get("email"),
            role=payload.get("role")
        )
    except JWTError:
        raise credentials_exception
