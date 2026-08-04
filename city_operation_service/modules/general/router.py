from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Optional, List

from dependencies.auth import PermissionChecker, UserData
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
from .service import GeneralComplaintService, GeneralFieldWorkerService

from dependencies.db import get_db

router = APIRouter(prefix="/general/complaints", tags=["General Department Complaints"])

# Complaints Endpoints

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    schema: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Create a new general complaint."""
    return GeneralComplaintService.create_complaint(db, schema)

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
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Retrieve and list all general complaints with pagination, search, and filters."""
    items, total_items = GeneralComplaintService.list_complaints(
        db, page, page_size, search, status, priority, category, ward, area
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Fetch details of a single general complaint by database ID."""
    return GeneralComplaintService.get_complaint_by_id(db, id)

@router.put("/{id}", response_model=ComplaintResponse)
def update_complaint(
    id: int,
    schema: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Update general fields of a complaint."""
    return GeneralComplaintService.update_complaint(db, id, schema)

@router.patch("/{id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    id: int,
    schema: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Transition a complaint's status and append remarks."""
    return GeneralComplaintService.update_complaint_status(db, id, schema.status, schema.notes)

@router.patch("/{id}/assign-worker", response_model=ComplaintResponse)
def assign_worker_to_complaint(
    id: int,
    schema: AssignWorkerSchema,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Assign a field worker ID to resolve the complaint."""
    return GeneralComplaintService.assign_worker(db, id, schema.assigned_worker_id, schema.notes)


# Workers Endpoints

workers_router = APIRouter(prefix="/general/workers", tags=["General Department Field Workers"])

@workers_router.post("", response_model=WorkerResponse, status_code=status.HTTP_201_CREATED)
def create_worker(
    schema: WorkerCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Create a new general field worker."""
    return GeneralFieldWorkerService.create_worker(db, schema)

@workers_router.get("", response_model=WorkerList)
def list_workers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    availability: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    place: Optional[str] = Query(None),
    pin_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """List general field workers with pagination and filters."""
    items, total_items = GeneralFieldWorkerService.list_workers(
        db, page, page_size, availability, status, skill, place, pin_code
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
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Fetch details of a single general worker by ID."""
    return GeneralFieldWorkerService.get_worker_by_id(db, id)

@workers_router.put("/{id}", response_model=WorkerResponse)
def update_worker(
    id: int,
    schema: WorkerUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Update fields of a general field worker."""
    return GeneralFieldWorkerService.update_worker(db, id, schema)

@workers_router.patch("/{id}/availability", response_model=WorkerResponse)
def update_worker_availability(
    id: int,
    schema: WorkerAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Patch the availability state of a general worker."""
    return GeneralFieldWorkerService.update_worker(
        db, id, WorkerUpdate(availability=schema.availability)
    )

@workers_router.patch("/{id}/status", response_model=WorkerResponse)
def update_worker_status(
    id: int,
    schema: WorkerStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Patch the employment status of a general worker."""
    return GeneralFieldWorkerService.update_worker(
        db, id, WorkerUpdate(employment_status=schema.employment_status)
    )

@workers_router.delete("/{id}")
def delete_worker(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(PermissionChecker(["dept:general"]))
):
    """Delete a general field worker."""
    success = GeneralFieldWorkerService.delete_worker(db, id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"General field worker with ID {id} not found."
        )
    return {"success": True, "message": f"Worker {id} deleted successfully."}

# Include both routers in root router
root_router = APIRouter()
root_router.include_router(router)
root_router.include_router(workers_router)
