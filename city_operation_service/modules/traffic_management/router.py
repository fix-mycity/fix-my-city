from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from dependencies.auth import UserData, PermissionChecker, get_current_user
from modules.traffic_management import service
from modules.traffic_management.schema import (
    WorkerAssignSchema, 
    ResolutionReportSchema, 
    WorkerCreateSchema,
    ComplaintList,
    ComplaintResponse,
    WorkerList,
    WorkerResponse,
    StatusUpdateSchema,
    WorkerUpdateSchema
)
from typing import Optional, List

router = APIRouter(prefix="/traffic", tags=["Traffic Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------
# INCIDENTS / COMPLAINTS
# -----------------

@router.get("/dashboard/summary")
def get_traffic_dashboard_summary(
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic"]))
):
    """Fetch aggregated summary stats for the traffic dashboard"""
    return service.get_traffic_dashboard_summary(db)

@router.get("/dashboard/complaints", response_model=List[ComplaintResponse])
def get_traffic_dashboard_complaints(
    status_filter: Optional[str] = None,
    assigned_worker_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic"]))
):
    """Legacy Endpoint: Fetch traffic complaints for the dashboard"""
    return service.get_traffic_dashboard_complaints(db, status_filter, assigned_worker_id, skip, limit)

@router.get("/incidents", response_model=ComplaintList)
def list_traffic_incidents(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic"]))
):
    """List traffic incidents with pagination, search, and filtering"""
    items, total_items = service.list_traffic_complaints(db, page, page_size, search, status_filter)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/incidents/{incident_id}", response_model=ComplaintResponse)
def get_incident_by_id(
    incident_id: int,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic"]))
):
    """Fetch details of a single traffic incident"""
    return service.get_complaint_by_id(db, incident_id)

@router.post("/incidents/{incident_id}/assign", response_model=ComplaintResponse)
def assign_worker(
    incident_id: int,
    worker_data: WorkerAssignSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"]))
):
    """Admin assigns a worker to a traffic incident"""
    return service.assign_worker(db, incident_id, worker_data, user.id)

@router.post("/incidents/{incident_id}/resolve", response_model=ComplaintResponse)
def resolve_incident(
    incident_id: int,
    report_data: ResolutionReportSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic"]))
):
    """Worker submits a resolution report for a traffic incident"""
    return service.resolve_incident(db, incident_id, report_data, user.id)

@router.post("/incidents/{incident_id}/close", response_model=ComplaintResponse)
def close_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"]))
):
    """Admin reviews and closes a resolved traffic incident"""
    return service.close_incident(db, incident_id)

@router.patch("/incidents/{incident_id}/status", response_model=ComplaintResponse)
def update_incident_status(
    incident_id: int,
    status_data: StatusUpdateSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic"]))
):
    """Admin manually updates the status of an incident"""
    return service.update_incident_status(db, incident_id, status_data.status)

# -----------------
# WORKERS
# -----------------

@router.get("/workers", response_model=WorkerList)
def list_workers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"]))
):
    """List traffic field workers with pagination and search"""
    items, total_items = service.list_traffic_workers(db, user.id, page, page_size, search)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

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

@router.put("/workers/{worker_id}")
def update_worker(
    worker_id: int,
    worker_data: WorkerUpdateSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"]))
):
    """Admin updates a traffic worker's profile"""
    return service.update_traffic_worker(db, worker_id, user.id, worker_data)

@router.delete("/workers/{worker_id}")
def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"]))
):
    """Admin deletes a traffic worker completely"""
    return service.delete_traffic_worker(db, worker_id, user.id)

@router.patch("/workers/{worker_id}/block")
def block_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker(["dept:traffic", "worker:create"]))
):
    """Admin toggles block (active/inactive) status of a traffic worker"""
    return service.block_traffic_worker(db, worker_id, user.id)
