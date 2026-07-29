from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies.database import get_db
from dependencies.auth import PermissionChecker
from models.user_model import User
from models.permission_model import Permission
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/permissions", tags=["Permissions"])
admin_only = PermissionChecker(["admin:all"])

class BatchPermissionsSchema(BaseModel):
    permission_ids: List[int]

class CreatePermissionSchema(BaseModel):
    permission_name: str
    description: Optional[str] = None

@router.get("")
def list_all_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    permissions = db.query(Permission).all()
    return {
        "success": True,
        "data": [
            {
                "id": p.id,
                "permission_name": p.permission_name,
                "description": p.description
            }
            for p in permissions
        ]
    }

@router.post("")
def create_permission(
    payload: CreatePermissionSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    existing = db.query(Permission).filter(Permission.permission_name == payload.permission_name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Permission '{payload.permission_name}' already exists.")

    new_perm = Permission(permission_name=payload.permission_name, description=payload.description)
    db.add(new_perm)
    db.commit()
    db.refresh(new_perm)

    return {
        "success": True,
        "message": f"Permission '{new_perm.permission_name}' created successfully.",
        "data": {
            "id": new_perm.id,
            "permission_name": new_perm.permission_name,
            "description": new_perm.description
        }
    }

@router.delete("/{permission_id}")
def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    perm = db.query(Permission).filter(Permission.id == permission_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found.")

    if perm.permission_name == "admin:all":
        raise HTTPException(status_code=400, detail="Core system permission 'admin:all' cannot be deleted.")

    db.delete(perm)
    db.commit()

    return {
        "success": True,
        "message": f"Permission '{perm.permission_name}' deleted successfully."
    }

@router.get("/users/{user_id}")
def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "success": True,
        "data": [
            {
                "id": p.id,
                "permission_name": p.permission_name,
                "description": p.description
            }
            for p in target_user.permissions
        ]
    }

@router.post("/users/{user_id}/permissions/{permission_id}")
def assign_permission(
    user_id: int, 
    permission_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(admin_only)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
        
    if permission in target_user.permissions:
        return {"success": False, "message": "User already has this permission"}
        
    target_user.permissions.append(permission)
    db.commit()
    
    return {"success": True, "message": f"Permission '{permission.permission_name}' assigned to user {target_user.username}"}

@router.post("/users/{user_id}/batch")
def sync_user_permissions(
    user_id: int,
    payload: BatchPermissionsSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    permissions = db.query(Permission).filter(Permission.id.in_(payload.permission_ids)).all()
    target_user.permissions = permissions
    db.commit()

    return {
        "success": True,
        "message": f"Permissions updated successfully for user {target_user.username}",
        "data": [p.permission_name for p in permissions]
    }

@router.delete("/users/{user_id}/permissions/{permission_id}")
def revoke_permission(
    user_id: int, 
    permission_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(admin_only)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
        
    if permission not in target_user.permissions:
        return {"success": False, "message": "User does not have this permission"}
        
    target_user.permissions.remove(permission)
    db.commit()
    
    return {"success": True, "message": f"Permission '{permission.permission_name}' revoked from user {target_user.username}"}
