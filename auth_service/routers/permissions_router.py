from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies.database import get_db
from dependencies.auth import PermissionChecker
from models.user_model import User
from models.permission_model import Permission

router = APIRouter(prefix="/permissions", tags=["Permissions"])
admin_only = PermissionChecker(["admin:all"])

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
