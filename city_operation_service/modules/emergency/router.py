from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from dependencies.auth import get_current_user, PermissionChecker, UserData
from modules.emergency import service
from modules.emergency.schema import (
    EmergencyCreateSchema, 
    TaskforceDispatchSchema, 
    BroadcastCreateSchema, 
    EmergencyBroadcastResponse
)

router = APIRouter(prefix="/emergency", tags=["Emergency Management Module"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

admin_guard = PermissionChecker(["admin:all", "emergency:write", "emergency:dispatch", "dept:emergency"])

@router.post("/sos")
def trigger_sos_emergency(
    schema: EmergencyCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_user)
):
    """Citizen or Staff: Trigger immediate 1-Click SOS emergency alert"""
    emergency = service.create_emergency(db, current_user.id if current_user else None, schema)
    return {"success": True, "message": "Emergency SOS triggered! Crisis response teams notified.", "emergency": emergency}

@router.get("/active")
def list_active_emergencies(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_user)
):
    """Get all active emergencies and dispatched taskforces"""
    return service.list_active_emergencies(db)

@router.get("/nearby-workers")
def get_nearby_workers(
    lat: float = Query(...),
    lng: float = Query(...),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(admin_guard)
):
    """Admin: Find nearby available field workers across Traffic, Water, Waste"""
    return service.get_nearby_workers(db, lat, lng)

@router.post("/{emergency_id}/dispatch")
def dispatch_taskforce(
    emergency_id: int,
    schema: TaskforceDispatchSchema,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(admin_guard)
):
    """Admin: Dispatch multi-department taskforce to crisis site"""
    success = service.dispatch_taskforce(db, emergency_id, current_user.id, schema)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency incident not found")
    return {"success": True, "message": "Multi-department emergency taskforce dispatched successfully."}

@router.post("/broadcast")
def issue_broadcast(
    schema: BroadcastCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(admin_guard)
):
    """Admin: Issue city-wide or zone-targeted public emergency warning broadcast"""
    broadcast = service.create_broadcast(db, schema)
    return {"success": True, "message": "Public emergency broadcast alert issued.", "broadcast": broadcast}

@router.get("/broadcasts", response_model=List[EmergencyBroadcastResponse])
def get_active_broadcasts(
    db: Session = Depends(get_db)
):
    """Public / Citizen: Retrieve active emergency broadcast warning banners"""
    return service.get_active_broadcasts(db)

@router.put("/{emergency_id}/resolve")
def resolve_emergency(
    emergency_id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(admin_guard)
):
    """Admin: Mark emergency crisis as resolved and release taskforce members"""
    success = service.resolve_emergency(db, emergency_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency incident not found")
    return {"success": True, "message": "Emergency crisis resolved and taskforce released."}
