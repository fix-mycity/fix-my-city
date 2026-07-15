from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Optional, List
from datetime import datetime

from .schema import (
    ComplaintCreate, 
    ComplaintUpdate, 
    ComplaintResponse, 
    ComplaintList, 
    ComplaintStatusUpdate, 
    AssignWorkerSchema,
    WorkerCreate,
    WorkerUpdate,
    WorkerResponse,
    WorkerList,
    WorkerStatusUpdate,
    WorkerAvailabilityUpdate
)
from .service import WaterComplaintService, WaterFieldWorkerService
from .utils import get_current_water_user, UserData

router = APIRouter(prefix="/water/complaints", tags=["Water Authority Complaints"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    schema: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Create a new water supply/infrastructure complaint (Internal/Citizen)."""
    return WaterComplaintService.create_complaint(db, schema)

@router.get("", response_model=ComplaintList)
def get_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    sort_by: Optional[str] = Query("newest"),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Retrieve and list all complaints with support for pagination, search, filters, and sorting."""
    items, total_items = WaterComplaintService.list_complaints(
        db, page, page_size, search, status, priority, 
        category, ward, area, start_date, end_date, sort_by
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/search", response_model=ComplaintList)
def search_complaints(
    q: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Search complaints by text matching complaint number, citizen name, phone, area, or ward."""
    items, total_items = WaterComplaintService.list_complaints(
        db, page=page, page_size=page_size, search=q
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/filter", response_model=ComplaintList)
def filter_complaints(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Filter complaints based on status, priority, category, ward, or area."""
    items, total_items = WaterComplaintService.list_complaints(
        db, page=page, page_size=page_size, status_filter=status, 
        priority_filter=priority, category_filter=category, 
        ward_filter=ward, area_filter=area
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/dashboard-summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Get summarized metric counts of complaints by status, priority, and category."""
    return WaterComplaintService.get_dashboard_summary(db)

@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Fetch details of a single complaint by its ID."""
    return WaterComplaintService.get_complaint_by_id(db, id)

@router.put("/{id}", response_model=ComplaintResponse)
def update_complaint(
    id: int,
    schema: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Update general fields of a water complaint."""
    return WaterComplaintService.update_complaint(db, id, schema)

@router.patch("/{id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    id: int,
    schema: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Transition a complaint status inside the valid state flow machine and append remarks."""
    return WaterComplaintService.update_complaint_status(db, id, schema.status, schema.notes)

@router.patch("/{id}/assign-worker", response_model=ComplaintResponse)
def assign_worker_to_complaint(
    id: int,
    schema: AssignWorkerSchema,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Assign a field worker ID to resolve the complaint and automatically flag status as 'WORKER_ASSIGNED'."""
    return WaterComplaintService.assign_worker_to_complaint(db, id, schema.assigned_worker_id, schema.notes)

@router.delete("/{id}")
def delete_complaint(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Delete a water complaint from the database."""
    WaterComplaintService.delete_complaint(db, id)
    return {"success": True, "message": f"Complaint {id} deleted successfully."}

# Define Worker Router
workers_router = APIRouter(prefix="/water/workers", tags=["Water Authority Field Workers"])

@workers_router.post("", response_model=WorkerResponse, status_code=status.HTTP_201_CREATED)
def create_worker(
    schema: WorkerCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Create a new water field worker."""
    return WaterFieldWorkerService.create_worker(db, schema)

@workers_router.get("", response_model=WorkerList)
def list_workers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    availability: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    place: Optional[str] = Query(None),
    pin_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Retrieve and list all field workers with support for pagination, search, and filtering."""
    items, total_items = WaterFieldWorkerService.list_workers(
        db, page, page_size, search, availability, status, skill, place, pin_code
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@workers_router.get("/search", response_model=WorkerList)
def search_workers(
    q: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Search workers by first_name, last_name, email, phone, place, or pin_code."""
    items, total_items = WaterFieldWorkerService.list_workers(
        db, page=page, page_size=page_size, search=q
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@workers_router.get("/filter", response_model=WorkerList)
def filter_workers(
    availability: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    place: Optional[str] = Query(None),
    pin_code: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Filter workers based on availability, status, skill, place, or pin_code."""
    items, total_items = WaterFieldWorkerService.list_workers(
        db, page=page, page_size=page_size, availability=availability,
        employment_status=status, skill=skill, place=place, pin_code=pin_code
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@workers_router.get("/{id}", response_model=WorkerResponse)
def get_worker_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Fetch details of a single field worker by their database ID."""
    return WaterFieldWorkerService.get_worker_by_id(db, id)

@workers_router.put("/{id}", response_model=WorkerResponse)
def update_worker(
    id: int,
    schema: WorkerUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Update general fields of a field worker (excluding employee ID)."""
    return WaterFieldWorkerService.update_worker(db, id, schema)

@workers_router.patch("/{id}/availability", response_model=WorkerResponse)
def update_worker_availability(
    id: int,
    schema: WorkerAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Patch the availability state of a worker."""
    return WaterFieldWorkerService.change_availability(db, id, schema.availability)

@workers_router.patch("/{id}/status", response_model=WorkerResponse)
def update_worker_status(
    id: int,
    schema: WorkerStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Patch the employment status of a worker."""
    return WaterFieldWorkerService.change_status(db, id, schema.employment_status)

@workers_router.delete("/{id}")
def delete_worker(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    """Delete a field worker from the database."""
    WaterFieldWorkerService.delete_worker(db, id)
    return {"success": True, "message": f"Worker {id} deleted successfully."}

# Re-route complaints and workers under a root router so that main.py works unchanged
complaints_router = router
router = APIRouter()
router.include_router(complaints_router)
router.include_router(workers_router)

