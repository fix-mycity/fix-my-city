from sqlalchemy.orm import Session
from datetime import datetime, timezone
from models.user_model import User
from models.login_history_model import LoginHistory
from schemas.register_schema import RegisterSchema, RegisterWorkerSchema
from schemas.login_schema import LoginSchema
from services.password_service import hash_password, verify_password
from services.role_service import get_default_role
from services.jwt_service import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    revoke_refresh_token
)


def register_user(db: Session, user: RegisterSchema):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        return {
            "success": False,
            "message": "Email already registered."
        }

    if user.password != user.confirm_password:
        return {
            "success": False,
            "message": "Passwords do not match."
        }

    role = get_default_role(db)
    if role is None:
        return {
            "success": False,
            "message": "Default role not found."
        }

    new_user = User(
        username=user.username,
        email=user.email,
        state=user.state,
        district=user.district,
        pincode=user.pincode,
        password=hash_password(user.password),
        role_id=role.id,
        is_verified=False,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "Registration Successful. Please verify your email with the OTP sent.",
        "data": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }

def register_worker(db: Session, worker: RegisterWorkerSchema):
    existing_user = db.query(User).filter(User.email == worker.email).first()
    if existing_user:
        return {"success": False, "message": "Email already registered."}

    if worker.password != worker.confirm_password:
        return {"success": False, "message": "Passwords do not match."}

    from models.role_model import Role
    role = db.query(Role).filter(Role.role_name == "Worker").first()
    if not role:
        return {"success": False, "message": "Worker role not found in database."}

    new_worker = User(
        username=worker.username,
        email=worker.email,
        state=worker.state,
        district=worker.district,
        pincode=worker.pincode,
        password=hash_password(worker.password),
        role_id=role.id,
        manager_id=worker.manager_id,
        is_verified=True, # Workers are created by admin, auto-verify
        is_active=True
    )

    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)

    return {
        "success": True,
        "message": "Worker registered successfully.",
        "data": {
            "id": new_worker.id,
            "username": new_worker.username,
            "email": new_worker.email
        }
    }


def login_user(db: Session, credentials: LoginSchema, ip_address: str, device: str) -> dict:
    # 1. Fetch user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        return {
            "success": False,
            "message": "Invalid email or password."
        }

    # 2. Verify hashed password
    if not verify_password(credentials.password, user.password):
        return {
            "success": False,
            "message": "Invalid email or password."
        }

    # 3. Check if user is active
    if not user.is_active:
        return {
            "success": False,
            "message": "Your account has been deactivated. Please contact support."
        }

    # 4. Check if user email is verified
    if not user.is_verified:
        return {
            "success": False,
            "message": "Please verify your email address before logging in."
        }

    # 5. Generate access & refresh tokens
    role_name = user.role.role_name if user.role else "Citizen"
    permissions = [p.permission_name for p in user.permissions] if user.permissions else []
    access_payload = {
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": role_name,
        "permissions": permissions
    }
    
    access_token = create_access_token(access_payload)
    refresh_token = create_refresh_token(db, user.id)

    # 6. Record login history
    history = LoginHistory(
        user_id=user.id,
        ip_address=ip_address,
        device=device,
        login_time=datetime.now(timezone.utc)
    )
    db.add(history)
    db.commit()

    return {
        "success": True,
        "message": "Login Successful.",
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": role_name,
                "permissions": permissions
            }
        }
    }


def refresh_user_tokens(db: Session, refresh_token: str) -> dict:
    # 1. Verify refresh token
    db_token = verify_refresh_token(db, refresh_token)
    if not db_token:
        return {
            "success": False,
            "message": "Invalid or expired refresh token."
        }
        
    # 2. Get user
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user or not user.is_active:
        return {
            "success": False,
            "message": "User is inactive or does not exist."
        }
        
    # 3. Rotate refresh tokens (Generate new tokens & revoke the old one)
    role_name = user.role.role_name if user.role else "Citizen"
    permissions = [p.permission_name for p in user.permissions] if user.permissions else []
    access_payload = {
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": role_name,
        "permissions": permissions
    }
    new_access_token = create_access_token(access_payload)
    new_refresh_token = create_refresh_token(db, user.id)
    
    # Revoke old token
    db.delete(db_token)
    db.commit()
    
    return {
        "success": True,
        "message": "Tokens refreshed successfully.",
        "data": {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    }


def logout_user(db: Session, refresh_token: str) -> dict:
    revoked = revoke_refresh_token(db, refresh_token)
    if revoked:
        return {
            "success": True,
            "message": "Successfully logged out."
        }
    return {
        "success": False,
        "message": "Token not found or already revoked."
    }