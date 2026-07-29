from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies.database import get_db
from dependencies.auth import RoleChecker, PermissionChecker
from models.role_model import Role
from models.user_model import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)

class AssignRoleSchema(BaseModel):
    user_id: int
    role_id: int

class CreateRoleSchema(BaseModel):
    role_name: str
    description: Optional[str] = None

@router.get("")
def get_roles(
    db: Session = Depends(get_db),
    current_user=Depends(PermissionChecker(["admin:all"]))
):
    roles = db.query(Role).all()
    return {
        "success": True,
        "data": [
            {
                "id": r.id,
                "role_name": r.role_name,
                "description": r.description
            }
            for r in roles
        ]
    }

@router.post("")
def create_role(
    payload: CreateRoleSchema,
    db: Session = Depends(get_db),
    current_user=Depends(PermissionChecker(["admin:all"]))
):
    existing = db.query(Role).filter(Role.role_name == payload.role_name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Role '{payload.role_name}' already exists.")

    new_role = Role(role_name=payload.role_name, description=payload.description)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return {
        "success": True,
        "message": f"Role '{new_role.role_name}' created successfully.",
        "data": {
            "id": new_role.id,
            "role_name": new_role.role_name,
            "description": new_role.description
        }
    }

@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(PermissionChecker(["admin:all"]))
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")

    if role.role_name in ["Admin", "Super_Admin", "Citizen"]:
        raise HTTPException(status_code=400, detail=f"System role '{role.role_name}' cannot be deleted.")

    db.delete(role)
    db.commit()

    return {
        "success": True,
        "message": f"Role '{role.role_name}' deleted successfully."
    }

@router.post("/assign-role")
def assign_role(
    payload: AssignRoleSchema,
    db: Session = Depends(get_db),
    current_user=Depends(PermissionChecker(["admin:all"]))
):
    target_user = db.query(User).filter(User.id == payload.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_role = db.query(Role).filter(Role.id == payload.role_id).first()
    if not target_role:
        raise HTTPException(status_code=404, detail="Role not found")

    target_user.role_id = target_role.id
    db.commit()

    return {
        "success": True,
        "message": f"Role '{target_role.role_name}' assigned to user {target_user.username}"
    }