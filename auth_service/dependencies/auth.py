from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from dependencies.database import get_db
from models.user_model import User
from services.jwt_service import decode_access_token

def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    access_token = request.cookies.get("access_token")
    if not access_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header.split(" ")[1]

    if not access_token:
        raise credentials_exception

    payload = decode_access_token(access_token)
    if payload is None:
        raise credentials_exception
        
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
        
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address not verified"
        )
    return current_user


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(
        self,
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        user_role = current_user.role.role_name if current_user.role else None
        if user_role in ["Admin", "Super_Admin"] or user_role in self.allowed_roles:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permissions to access this resource"
        )


class PermissionChecker:
    def __init__(self, required_permissions: list[str]):
        self.required_permissions = set(required_permissions)

    def __call__(
        self,
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        user_role = current_user.role.role_name if current_user.role else None
        if user_role in ["Admin", "Super_Admin"]:
            return current_user

        user_permissions = {p.permission_name for p in current_user.permissions} if current_user.permissions else set()
        
        if "admin:all" not in user_permissions and not self.required_permissions.issubset(user_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have the required permissions to access this resource"
            )
        return current_user
