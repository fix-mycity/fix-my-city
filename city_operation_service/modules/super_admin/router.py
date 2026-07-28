from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Optional, List
from dependencies.auth import PermissionChecker, UserData
from modules.super_admin import service
from modules.super_admin.schema import ComplaintRerouteSchema

router = APIRouter(prefix="/super-admin", tags=["Super Admin Portal"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

super_admin_guard = PermissionChecker(["admin:all"])

@router.get("/dashboard/summary")
def get_master_summary(
    db: Session = Depends(get_db),
    user: UserData = Depends(super_admin_guard)
):
    """Super Admin: Get city-wide master dashboard analytics"""
    return service.get_master_summary(db)

@router.get("/users")
def list_all_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    role_filter: Optional[str] = Query(None, alias="role"),
    db: Session = Depends(get_db),
    user: UserData = Depends(super_admin_guard)
):
    """Super Admin: Search and filter global user directory with roles & permissions"""
    return service.list_all_users(db, page, page_size, search, role_filter)

@router.post("/complaints/{complaint_id}/reroute")
def reroute_complaint(
    complaint_id: int,
    schema: ComplaintRerouteSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(super_admin_guard)
):
    """Super Admin: Reroute/transfer misclassified complaint to another department"""
    return service.reroute_complaint(db, complaint_id, schema)
