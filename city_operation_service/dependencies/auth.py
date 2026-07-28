from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from config import settings
from pydantic import BaseModel

bearer_scheme = HTTPBearer(auto_error=False)


class UserData(BaseModel):
    id: int
    username: str | None = None
    email: str | None = None
    role: str | None = None
    permissions: list[str] = []

def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)
) -> UserData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    token = None
    if credentials:
        token = credentials.credentials
    else:
        token = request.cookies.get("access_token")

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception

        return UserData(
            id=int(user_id_str),
            username=payload.get("username"),
            email=payload.get("email"),
            role=payload.get("role"),
            permissions=payload.get("permissions") or []
        )
    except JWTError:
        raise credentials_exception

class PermissionChecker:
    def __init__(self, required_permissions: list[str]):
        self.required_permissions = required_permissions

    def __call__(self, current_user: UserData = Depends(get_current_user)) -> UserData:
        if "admin:all" in current_user.permissions or current_user.role in ["Admin", "Super_Admin"]:
            return current_user

        for permission in self.required_permissions:
            if permission not in current_user.permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Forbidden: You do not have the required permissions"
                )
        return current_user