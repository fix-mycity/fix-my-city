from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies.database import get_db
from dependencies.auth import RoleChecker
from models.role_model import Role

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@router.get("/")
def get_roles(
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(allowed_roles=["Admin"]))
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