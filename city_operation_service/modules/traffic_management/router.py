from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from dependencies.auth import UserData, PermissionChecker, get_current_user
from modules.traffic_management import service
from modules.traffic_management.schema import WorkerAssignSchema, ResolutionReportSchema, WorkerCreateSchema
from fastapi import HTTPException, status

router = APIRouter(prefix="/traffic", tags=["Traffic Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from typing import Optional

@router.get("/dashboard/complaints")
def get_traffic_dashboard_complaints(
    status_filter: Optional[str] = None,
    assigned_worker_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic"]))
):
    """Fetch traffic complaints for the dashboard with optional filtering"""
    return service.get_traffic_dashboard_complaints(db, status_filter, assigned_worker_id, skip, limit)


@router.post("/workers")
def create_worker(
    worker_data: WorkerCreateSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"]))
):
    """Admin creates a new worker for the traffic department (Max 5)"""
    res = service.create_traffic_worker(db, user.id, worker_data)
    if not res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.get("message")
        )
    return res


@router.post("/incidents/{incident_id}/assign")
def assign_worker(
    incident_id: int,
    worker_data: WorkerAssignSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"])) # Dept Admins usually have this
):
    """Admin assigns a worker to a traffic incident"""
    return service.assign_worker(db, incident_id, worker_data, user.id)


@router.post("/incidents/{incident_id}/resolve")
def resolve_incident(
    incident_id: int,
    report_data: ResolutionReportSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic"])) # Workers have this
):
    """Worker submits a resolution report for a traffic incident"""
    return service.resolve_incident(db, incident_id, report_data, user.id)


@router.post("/incidents/{incident_id}/close")
def close_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"]))
):
    """Admin reviews and closes a resolved traffic incident"""
    return service.close_incident(db, incident_id)
