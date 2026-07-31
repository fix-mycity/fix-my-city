from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Optional, List
from datetime import datetime, date

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
    WorkerAvailabilityUpdate,
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentResponse,
    AssignmentList,
    WorkerTaskUpdateCreate,
    WorkerTaskUpdateResponse,
    VerificationSchema,
    VerificationResponse,
    WaterSupplyCreate,
    WaterSupplyUpdate,
    WaterSupplyResponse,
    WaterSupplyList,
    WaterSupplyFilter,
    WaterSupplyStatusUpdate,
    PipelineCreate,
    PipelineUpdate,
    PipelineResponse,
    PipelineList,
    PipelineFilter,
    InspectionCreate,
    InspectionUpdate,
    InspectionResponse,
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
    TankCreate,
    TankUpdate,
    TankResponse,
    TankList,
    TankFilter,
    TankRefillCreate,
    TankRefillResponse,
    TankMaintenanceCreate,
    TankMaintenanceUpdate,
    TankMaintenanceResponse,
    WaterLevelUpdate,
    WaterQualityCreate,
    WaterQualityUpdate,
    WaterQualityResponse,
    WaterQualityList,
    WaterQualityFilter,
    QualInspectionCreate,
    QualInspectionUpdate,
    InspectionResponse as QualInspectionResponse,
    InspectionList as QualInspectionList,
    AlertResponse,
    AlertList,
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
    MaintenanceList,
    MaintenanceFilter,
    TaskCreate,
    TaskUpdateSchema,
    TaskResponse,
    MaterialCreate,
    MaterialResponse,
    PhotoUpload,
    PhotoResponse,
    HistoryResponse,
    MaintenanceDashboardResponse,
    EmergencyCreate,
    EmergencyUpdate,
    EmergencyResponse,
    EmergencyList,
    EmergencyFilter,
    ResponseTeamCreate,
    ResponseTeamResponse,
    TimelineResponse,
    NotificationCreate,
    NotificationResponse,
    EmergencyDashboardResponse,
    RecipientResponse,
    HistoryResponse,
    NotificationUpdate,
    NotificationList,
    NotificationFilter,
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    NotificationDashboardResponse as SchemaNotificationDashboardResponse,
    CitizenResponse, CitizenListResponse, CitizenDetailResponse, CitizenServiceStatusUpdate,
    DepartmentSettingsCreate, DepartmentSettingsUpdate, DepartmentSettingsResponse,
    DepartmentProfileUpdate, DepartmentProfileResponse
)
from .service import WaterComplaintService, WaterFieldWorkerService, WorkerAssignmentService, WaterSupplyScheduleService, WaterPipelineService, WaterTankService, WaterQualityService, MaintenanceService, EmergencyService, NotificationService, CitizenService, SettingsService
from .repository import MaintenanceRepository, EmergencyRepository, NotificationRepository
from .utils import get_current_water_user, UserData
from .model import WaterFieldWorker

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
    page_size: int = Query(10, ge=1, le=1000),
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
    page_size: int = Query(10, ge=1, le=1000),
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
    page_size: int = Query(10, ge=1, le=1000),
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
    page_size: int = Query(10, ge=1, le=1000),
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

# Assignments Router (Authority)
assignments_router = APIRouter(prefix="/water/assignments", tags=["Water Authority Work Assignments"])

@assignments_router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    schema: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return WorkerAssignmentService.create_assignment(db, schema, current_user.id)

@assignments_router.get("", response_model=AssignmentList)
def list_assignments(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: Optional[str] = Query(None),
    status_val: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    worker_id: Optional[int] = Query(None),
    complaint_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    items, total_items = WorkerAssignmentService.list_assignments(
        db, page, page_size, search, status_val, priority, worker_id, complaint_id
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@assignments_router.get("/{id}", response_model=AssignmentResponse)
def get_assignment(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return WorkerAssignmentService.get_assignment_by_id(db, id)

@assignments_router.put("/{id}", response_model=AssignmentResponse)
def update_assignment(
    id: int,
    schema: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return WorkerAssignmentService.update_assignment(db, id, schema)

@assignments_router.patch("/{id}/status", response_model=AssignmentResponse)
def update_assignment_status(
    id: int,
    schema: WorkerTaskUpdateCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return WorkerAssignmentService.update_status(db, id, schema.status, schema.remarks, current_user.id)

@assignments_router.patch("/{id}/verify", response_model=AssignmentResponse)
def verify_assignment(
    id: int,
    schema: VerificationSchema,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return WorkerAssignmentService.verify_assignment(db, id, schema, current_user.id)

@assignments_router.delete("/{id}")
def delete_assignment(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    WorkerAssignmentService.delete_assignment(db, id)
    return {"success": True, "message": f"Assignment {id} deleted successfully."}


# Worker Tasks Router
worker_tasks_router = APIRouter(prefix="/water/worker/tasks", tags=["Water Authority Field Worker Tasks"])

def get_db_worker(db: Session, email: str) -> WaterFieldWorker:
    worker = db.query(WaterFieldWorker).filter(WaterFieldWorker.email == email).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is not registered as a field worker in the system."
        )
    return worker

@worker_tasks_router.get("", response_model=AssignmentList)
def list_worker_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_val: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Workers only.")
    worker = get_db_worker(db, current_user.email)
    items, total_items = WorkerAssignmentService.list_assignments(
        db, page, page_size, search, status_val, priority, worker_id=worker.id
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@worker_tasks_router.get("/{id}", response_model=AssignmentResponse)
def get_worker_task(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Workers only.")
    worker = get_db_worker(db, current_user.email)
    assignment = WorkerAssignmentService.get_assignment_by_id(db, id)
    if assignment.worker_id != worker.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Not assigned to you.")
    return assignment

@worker_tasks_router.patch("/{id}/accept", response_model=AssignmentResponse)
def accept_task(
    id: int,
    remarks: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    worker = get_db_worker(db, current_user.email)
    assignment = WorkerAssignmentService.get_assignment_by_id(db, id)
    if assignment.worker_id != worker.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return WorkerAssignmentService.update_status(db, id, "ACCEPTED", remarks, current_user.id)

@worker_tasks_router.patch("/{id}/reject", response_model=AssignmentResponse)
def reject_task(
    id: int,
    remarks: str = Query(...),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    worker = get_db_worker(db, current_user.email)
    assignment = WorkerAssignmentService.get_assignment_by_id(db, id)
    if assignment.worker_id != worker.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return WorkerAssignmentService.update_status(db, id, "REJECTED", remarks, current_user.id)

@worker_tasks_router.patch("/{id}/start", response_model=AssignmentResponse)
def start_task(
    id: int,
    remarks: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    worker = get_db_worker(db, current_user.email)
    assignment = WorkerAssignmentService.get_assignment_by_id(db, id)
    if assignment.worker_id != worker.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    WaterFieldWorkerService.change_availability(db, worker.id, "BUSY")
    return WorkerAssignmentService.update_status(db, id, "WORK_STARTED", remarks, current_user.id)

@worker_tasks_router.patch("/{id}/progress", response_model=AssignmentResponse)
def update_task_progress(
    id: int,
    schema: WorkerTaskUpdateCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    worker = get_db_worker(db, current_user.email)
    assignment = WorkerAssignmentService.get_assignment_by_id(db, id)
    if assignment.worker_id != worker.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    updated = WorkerAssignmentService.update_status(db, id, schema.status, schema.remarks, current_user.id)
    return updated

@worker_tasks_router.patch("/{id}/complete", response_model=AssignmentResponse)
def complete_task(
    id: int,
    schema: WorkerTaskUpdateCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    worker = get_db_worker(db, current_user.email)
    assignment = WorkerAssignmentService.get_assignment_by_id(db, id)
    if assignment.worker_id != worker.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    schema.status = "COMPLETED"
    updated = WorkerAssignmentService.update_status(db, id, "COMPLETED", schema.completion_notes, current_user.id)
    WorkerAssignmentRepository.add_task_update(db, id, schema, current_user.id)
    WaterFieldWorkerService.change_availability(db, worker.id, "AVAILABLE")
    return updated

supply_router = APIRouter(prefix="/water/supply", tags=["Water Supply Schedules"])

@supply_router.post("", response_model=WaterSupplyResponse, status_code=status.HTTP_201_CREATED)
def create_supply_schedule(
    schema: WaterSupplyCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterSupplyScheduleService.create_schedule(db, schema, creator_id=current_user.id)

@supply_router.get("", response_model=WaterSupplyList)
def get_supply_schedules(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    supply_type: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    supply_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterSupplyScheduleService.list_schedules(
        db, page, page_size, search, status, supply_type, ward, zone, supply_date
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@supply_router.get("/today", response_model=List[WaterSupplyResponse])
def get_today_supply_schedules(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterSupplyScheduleRepository.get_today_schedules(db)

@supply_router.get("/upcoming", response_model=List[WaterSupplyResponse])
def get_upcoming_supply_schedules(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterSupplyScheduleRepository.get_upcoming_schedules(db)

@supply_router.get("/search", response_model=WaterSupplyList)
def search_supply_schedules(
    q: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterSupplyScheduleService.list_schedules(
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

@supply_router.get("/filter", response_model=WaterSupplyList)
def filter_supply_schedules(
    status: Optional[str] = Query(None),
    supply_type: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    supply_date: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterSupplyScheduleService.list_schedules(
        db, page=page, page_size=page_size, status_filter=status,
        type_filter=supply_type, ward_filter=ward, zone_filter=zone, date_filter=supply_date
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@supply_router.get("/{id}", response_model=WaterSupplyResponse)
def get_supply_schedule_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterSupplyScheduleService.get_schedule_by_id(db, id)

@supply_router.put("/{id}", response_model=WaterSupplyResponse)
def update_supply_schedule(
    id: int,
    schema: WaterSupplyUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterSupplyScheduleService.update_schedule(db, id, schema, updater_id=current_user.id)

@supply_router.patch("/{id}/pause", response_model=WaterSupplyResponse)
def pause_supply_schedule(
    id: int,
    schema: WaterSupplyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterSupplyScheduleService.update_status(db, id, "PAUSED", schema.remarks, updater_id=current_user.id)

@supply_router.patch("/{id}/resume", response_model=WaterSupplyResponse)
def resume_supply_schedule(
    id: int,
    schema: WaterSupplyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterSupplyScheduleService.update_status(db, id, "ACTIVE", schema.remarks, updater_id=current_user.id)

@supply_router.delete("/{id}")
def delete_supply_schedule(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterSupplyScheduleService.delete_schedule(db, id)
    return {"success": True, "message": f"Water supply schedule {id} deleted successfully."}

pipeline_router = APIRouter(prefix="/water/pipelines", tags=["Water Pipeline Management"])

# Inspections update/delete (placed before pipeline GET /{id} to avoid matching issues)
@pipeline_router.put("/inspection/{id}", response_model=InspectionResponse)
def update_pipeline_inspection(
    id: int,
    schema: InspectionUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.update_inspection(db, id, schema)

@pipeline_router.delete("/inspection/{id}")
def delete_pipeline_inspection(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterPipelineService.delete_inspection(db, id)
    return {"success": True, "message": "Inspection record deleted successfully."}

# Maintenance update/delete
@pipeline_router.put("/maintenance/{id}", response_model=MaintenanceResponse)
def update_pipeline_maintenance(
    id: int,
    schema: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.update_maintenance(db, id, schema)

@pipeline_router.delete("/maintenance/{id}")
def delete_pipeline_maintenance(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterPipelineService.delete_maintenance(db, id)
    return {"success": True, "message": "Maintenance record deleted successfully."}

# Pipeline collection routes
@pipeline_router.post("", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline(
    schema: PipelineCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.create_pipeline(db, schema, creator_id=current_user.id)

@pipeline_router.get("", response_model=PipelineList)
def get_pipelines(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    pipeline_type: Optional[str] = Query(None),
    material: Optional[str] = Query(None),
    status_val: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterPipelineService.list_pipelines(
        db, page, page_size, search, zone, ward, condition, pipeline_type, material, status_val
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

# Inspections on Pipeline
@pipeline_router.post("/{id}/inspection", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline_inspection(
    id: int,
    schema: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.create_inspection(db, id, schema)

@pipeline_router.get("/{id}/inspection", response_model=List[InspectionResponse])
def get_pipeline_inspections(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterPipelineRepository.get_inspections_for_pipeline(db, id)

# Maintenances on Pipeline
@pipeline_router.post("/{id}/maintenance", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline_maintenance(
    id: int,
    schema: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.create_maintenance(db, id, schema)

@pipeline_router.get("/{id}/maintenance", response_model=List[MaintenanceResponse])
def get_pipeline_maintenances(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterPipelineRepository.get_maintenances_for_pipeline(db, id)

# Pipeline resource routes
@pipeline_router.get("/{id}", response_model=PipelineResponse)
def get_pipeline_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterPipelineService.get_pipeline_by_id(db, id)

@pipeline_router.put("/{id}", response_model=PipelineResponse)
def update_pipeline(
    id: int,
    schema: PipelineUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.update_pipeline(db, id, schema, updater_id=current_user.id)

@pipeline_router.delete("/{id}")
def delete_pipeline(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterPipelineService.delete_pipeline(db, id)
    return {"success": True, "message": f"Pipeline {id} deleted successfully."}

pipeline_router = APIRouter(prefix="/water/pipelines", tags=["Water Pipeline Management"])

# Inspections update/delete (placed before pipeline GET /{id} to avoid matching issues)
@pipeline_router.put("/inspection/{id}", response_model=InspectionResponse)
def update_pipeline_inspection(
    id: int,
    schema: InspectionUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.update_inspection(db, id, schema)

@pipeline_router.delete("/inspection/{id}")
def delete_pipeline_inspection(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterPipelineService.delete_inspection(db, id)
    return {"success": True, "message": "Inspection record deleted successfully."}

# Maintenance update/delete
@pipeline_router.put("/maintenance/{id}", response_model=MaintenanceResponse)
def update_pipeline_maintenance(
    id: int,
    schema: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.update_maintenance(db, id, schema)

@pipeline_router.delete("/maintenance/{id}")
def delete_pipeline_maintenance(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterPipelineService.delete_maintenance(db, id)
    return {"success": True, "message": "Maintenance record deleted successfully."}

# Pipeline collection routes
@pipeline_router.post("", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline(
    schema: PipelineCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.create_pipeline(db, schema, creator_id=current_user.id)

@pipeline_router.get("", response_model=PipelineList)
def get_pipelines(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    pipeline_type: Optional[str] = Query(None),
    material: Optional[str] = Query(None),
    status_val: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterPipelineService.list_pipelines(
        db, page, page_size, search, zone, ward, condition, pipeline_type, material, status_val
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

# Inspections on Pipeline
@pipeline_router.post("/{id}/inspection", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline_inspection(
    id: int,
    schema: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.create_pipeline_inspection(db, id, schema)

@pipeline_router.get("/{id}/inspection", response_model=List[InspectionResponse])
def get_pipeline_inspections(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterPipelineRepository.get_inspections_for_pipeline(db, id)

# Maintenances on Pipeline
@pipeline_router.post("/{id}/maintenance", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline_maintenance(
    id: int,
    schema: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.create_pipeline_maintenance(db, id, schema)

@pipeline_router.get("/{id}/maintenance", response_model=List[MaintenanceResponse])
def get_pipeline_maintenances(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterPipelineRepository.get_maintenances_for_pipeline(db, id)

# Pipeline resource routes
@pipeline_router.get("/{id}", response_model=PipelineResponse)
def get_pipeline_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterPipelineService.get_pipeline_by_id(db, id)

@pipeline_router.put("/{id}", response_model=PipelineResponse)
def update_pipeline(
    id: int,
    schema: PipelineUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterPipelineService.update_pipeline(db, id, schema, updater_id=current_user.id)

@pipeline_router.delete("/{id}")
def delete_pipeline(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterPipelineService.delete_pipeline(db, id)
    return {"success": True, "message": f"Pipeline {id} deleted successfully."}


tank_router = APIRouter(prefix="/water/tanks", tags=["Water Tank Management"])

# Dashboard API (placed before parameter routes)
@tank_router.get("/dashboard")
def get_tank_dashboard(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterTankRepository.get_dashboard_stats(db)

# Maintenance update/delete
@tank_router.put("/maintenance/{id}", response_model=TankMaintenanceResponse)
def update_tank_maintenance(
    id: int,
    schema: TankMaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterTankService.update_maintenance(db, id, schema)

@tank_router.delete("/maintenance/{id}")
def delete_tank_maintenance(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterTankService.delete_maintenance(db, id)
    return {"success": True, "message": "Maintenance record deleted successfully."}

# Tank Collection CRUD
@tank_router.post("", response_model=TankResponse, status_code=status.HTTP_201_CREATED)
def create_tank(
    schema: TankCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterTankService.create_tank(db, schema, creator_id=current_user.id)

@tank_router.get("", response_model=TankList)
def get_tanks(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    tank_type: Optional[str] = Query(None),
    status_val: Optional[str] = Query(None, alias="status"),
    ward: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    water_source: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterTankService.list_tanks(
        db, page, page_size, search, tank_type, status_val, ward, zone, water_source
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

# Refill Endpoints
@tank_router.post("/{id}/refill", response_model=TankRefillResponse, status_code=status.HTTP_201_CREATED)
def record_tank_refill(
    id: int,
    schema: TankRefillCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterTankService.create_refill(db, id, schema)

@tank_router.get("/{id}/refill-history", response_model=List[TankRefillResponse])
def get_tank_refill_history(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterTankRepository.get_refills_for_tank(db, id)

# Maintenance Endpoints on Tank
@tank_router.post("/{id}/maintenance", response_model=TankMaintenanceResponse, status_code=status.HTTP_201_CREATED)
def record_tank_maintenance(
    id: int,
    schema: TankMaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterTankService.create_maintenance(db, id, schema)

@tank_router.get("/{id}/maintenance", response_model=List[TankMaintenanceResponse])
def get_tank_maintenances(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterTankRepository.get_maintenances_for_tank(db, id)

# Tank Resource CRUD
@tank_router.get("/{id}", response_model=TankResponse)
def get_tank_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterTankService.get_tank_by_id(db, id)

@tank_router.put("/{id}", response_model=TankResponse)
def update_tank(
    id: int,
    schema: TankUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterTankService.update_tank(db, id, schema, updater_id=current_user.id)

@tank_router.delete("/{id}")
def delete_tank(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterTankService.delete_tank(db, id)
    return {"success": True, "message": f"Water tank {id} deleted successfully."}

@tank_router.patch("/{id}/water-level", response_model=TankResponse)
def update_water_level(
    id: int,
    schema: WaterLevelUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterTankService.update_water_level(db, id, schema.water_level, updater_id=current_user.id)


quality_router = APIRouter(prefix="/water/quality", tags=["Water Quality Monitoring"])

# Dashboard API (placed before parameter routes)
@quality_router.get("/dashboard")
def get_quality_dashboard(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterQualityRepository.get_dashboard_stats(db)

# Alerts API (placed before parameter routes)
@quality_router.get("/alerts", response_model=AlertList)
def get_quality_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterQualityRepository.list_alerts(db, page, page_size, status, severity)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@quality_router.patch("/alerts/resolve/{alert_id}", response_model=AlertResponse)
def resolve_quality_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterQualityService.resolve_alert(db, alert_id)

# Inspection collection (placed before parameter routes)
@quality_router.get("/inspection", response_model=QualInspectionList)
def get_quality_inspections(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterQualityRepository.list_inspections(db, page, page_size, search)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@quality_router.post("/inspection", response_model=QualInspectionResponse, status_code=status.HTTP_201_CREATED)
def create_quality_inspection(
    schema: QualInspectionCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterQualityService.create_inspection(db, schema)

# Inspection resource operations
@quality_router.put("/inspection/{id}", response_model=QualInspectionResponse)
def update_quality_inspection(
    id: int,
    schema: QualInspectionUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterQualityService.update_inspection(db, id, schema)

@quality_router.delete("/inspection/{id}")
def delete_quality_inspection(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterQualityService.delete_inspection(db, id)
    return {"success": True, "message": "Inspection schedule deleted successfully."}

# Reports CRUD Collection
@quality_router.post("", response_model=WaterQualityResponse, status_code=status.HTTP_201_CREATED)
def create_quality_report(
    schema: WaterQualityCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterQualityService.create_report(db, schema, creator_id=current_user.id)

@quality_router.get("", response_model=WaterQualityList)
def get_quality_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    overall_status: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    sample_type: Optional[str] = Query(None),
    sample_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = WaterQualityService.list_reports(
        db, page, page_size, search, overall_status, zone, ward, sample_type, sample_date
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

# Reports CRUD Resource
@quality_router.get("/{id}", response_model=WaterQualityResponse)
def get_quality_report_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return WaterQualityService.get_report_by_id(db, id)

@quality_router.put("/{id}", response_model=WaterQualityResponse)
def update_quality_report(
    id: int,
    schema: WaterQualityUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return WaterQualityService.update_report(db, id, schema, updater_id=current_user.id)

@quality_router.delete("/{id}")
def delete_quality_report(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    WaterQualityService.delete_report(db, id)
    return {"success": True, "message": f"Quality report {id} deleted successfully."}


maintenance_router = APIRouter(prefix="/water/maintenance", tags=["Water Maintenance Management"])

@maintenance_router.get("/dashboard", response_model=MaintenanceDashboardResponse)
def get_maintenance_dashboard(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return MaintenanceRepository.get_dashboard_stats(db)

@maintenance_router.post("", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    schema: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return MaintenanceService.create_maintenance(db, schema, creator_id=current_user.id)

@maintenance_router.get("", response_model=MaintenanceList)
def get_maintenances(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    maintenance_type: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    source_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = MaintenanceRepository.list_maintenance(
        db, page, page_size, search, priority, status_filter,
        maintenance_type, ward, zone, source_type
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@maintenance_router.get("/{id}", response_model=MaintenanceResponse)
def get_maintenance(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return MaintenanceService.get_maintenance_by_id(db, id)

@maintenance_router.put("/{id}", response_model=MaintenanceResponse)
def update_maintenance(
    id: int,
    schema: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return MaintenanceService.update_maintenance(db, id, schema, updater_id=current_user.id)

@maintenance_router.delete("/{id}")
def delete_maintenance(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    MaintenanceService.delete_maintenance(db, id)
    return {"success": True, "message": f"Maintenance request {id} deleted successfully."}

@maintenance_router.post("/{id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_task(
    id: int,
    schema: TaskCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return MaintenanceService.create_task(db, id, schema, actor_id=current_user.id)

@maintenance_router.get("/{id}/tasks", response_model=List[TaskResponse])
def get_maintenance_tasks(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return MaintenanceRepository.list_tasks(db, id)

@maintenance_router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_maintenance_task(
    task_id: int,
    schema: TaskUpdateSchema,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return MaintenanceService.update_task(db, task_id, schema, actor_id=current_user.id)

@maintenance_router.post("/{id}/materials", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def add_maintenance_material(
    id: int,
    schema: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return MaintenanceService.add_material(db, id, schema, actor_id=current_user.id)

@maintenance_router.get("/{id}/materials", response_model=List[MaterialResponse])
def get_maintenance_materials(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return MaintenanceRepository.list_materials(db, id)

@maintenance_router.post("/{id}/photos", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED)
def upload_maintenance_photo(
    id: int,
    schema: PhotoUpload,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return MaintenanceService.add_photo(db, id, schema, uploader_id=current_user.id)

@maintenance_router.get("/{id}/photos", response_model=List[PhotoResponse])
def get_maintenance_photos(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return MaintenanceRepository.list_photos(db, id)

@maintenance_router.get("/{id}/history", response_model=List[HistoryResponse])
def get_maintenance_history(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return MaintenanceRepository.list_history(db, id)


emergency_router = APIRouter(prefix="/water/emergency", tags=["Water Emergency Shutdown Management"])

@emergency_router.get("/dashboard", response_model=EmergencyDashboardResponse)
def get_emergency_dashboard(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return EmergencyRepository.get_dashboard_stats(db)

@emergency_router.post("", response_model=EmergencyResponse, status_code=status.HTTP_201_CREATED)
def create_emergency(
    schema: EmergencyCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return EmergencyService.create_shutdown(db, schema, creator_id=current_user.id)

@emergency_router.get("", response_model=EmergencyList)
def get_emergencies(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=1000),
    search: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    emergency_type: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total_items = EmergencyRepository.list_shutdowns(
        db, page, page_size, search, priority, status_filter,
        emergency_type, ward, zone
    )
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@emergency_router.get("/{id}", response_model=EmergencyResponse)
def get_emergency(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return EmergencyService.get_shutdown_by_id(db, id)

@emergency_router.put("/{id}", response_model=EmergencyResponse)
def update_emergency(
    id: int,
    schema: EmergencyUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return EmergencyService.update_shutdown(db, id, schema, updater_id=current_user.id)

@emergency_router.delete("/{id}")
def delete_emergency(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    EmergencyService.delete_shutdown(db, id)
    return {"success": True, "message": f"Emergency shutdown {id} deleted successfully."}

@emergency_router.patch("/{id}/status", response_model=EmergencyResponse)
def update_emergency_status(
    id: int,
    status_val: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return EmergencyService.update_shutdown(db, id, EmergencyUpdate(status=status_val), updater_id=current_user.id)

@emergency_router.post("/{id}/team", response_model=ResponseTeamResponse, status_code=status.HTTP_201_CREATED)
def assign_emergency_team(
    id: int,
    schema: ResponseTeamCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return EmergencyService.assign_team_member(db, id, schema, actor_id=current_user.id)

@emergency_router.get("/{id}/team", response_model=List[ResponseTeamResponse])
def get_emergency_team(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return EmergencyRepository.list_team(db, id)

@emergency_router.get("/{id}/timeline", response_model=List[TimelineResponse])
def get_emergency_timeline(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return EmergencyRepository.list_timeline(db, id)

@emergency_router.post("/{id}/notify", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_emergency_notification(
    id: int,
    schema: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Admins only.")
    return EmergencyService.notify_citizens(db, id, schema, actor_id=current_user.id)


notifications_router = APIRouter(prefix="/water/notifications", tags=["Water Authority Notifications"])

@notifications_router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    schema: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return NotificationService.create_notification(db, schema, creator_id=current_user.id)

@notifications_router.get("", response_model=NotificationList)
def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    type_filter: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    recipient_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    items, total = NotificationRepository.list_notifications(
        db, page, page_size, search, type_filter, priority, status_filter, recipient_type, start_date, end_date
    )
    total_pages = (total + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@notifications_router.get("/dashboard", response_model=SchemaNotificationDashboardResponse)
def get_notification_dashboard(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return NotificationRepository.get_dashboard_stats(db)

@notifications_router.get("/templates", response_model=List[TemplateResponse])
def list_templates(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return NotificationRepository.list_templates(db)

@notifications_router.post("/templates", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    schema: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return NotificationService.create_template(db, schema)

@notifications_router.put("/templates/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: int,
    schema: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return NotificationService.update_template(db, template_id, schema)

@notifications_router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    NotificationService.delete_template(db, template_id)
    return None

@notifications_router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return NotificationService.get_notification_by_id(db, notification_id)

@notifications_router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(
    notification_id: int,
    schema: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return NotificationService.update_notification(db, notification_id, schema, updater_id=current_user.id)

@notifications_router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    NotificationService.delete_notification(db, notification_id)
    return None

@notifications_router.get("/{notification_id}/history", response_model=List[HistoryResponse])
def get_notification_history(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    return NotificationRepository.list_history(db, notification_id)


# Reports & Analytics Router
from fastapi import Response
from .schema import (
    ReportsDashboardResponse, ComplaintsReportResponse, WorkersReportResponse,
    SupplyReportResponse, PipelinesReportResponse, TanksReportResponse,
    QualityReportResponse, MaintenanceReportResponse, EmergencyReportResponse,
    NotificationsReportResponse
)
from .service import ReportsService

reports_router = APIRouter(prefix="/water/reports", tags=["Water Reports & Analytics"])

def parse_report_filters(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    ward: Optional[str] = None,
    area: Optional[str] = None,
    zone: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    worker: Optional[int] = None,
    pipeline: Optional[int] = None,
    tank: Optional[int] = None
):
    filters = {}
    if start_date:
        try:
            filters["start_date"] = datetime.fromisoformat(start_date)
        except ValueError:
            try:
                filters["start_date"] = date.fromisoformat(start_date)
            except ValueError:
                pass
    if end_date:
        try:
            filters["end_date"] = datetime.fromisoformat(end_date)
        except ValueError:
            try:
                filters["end_date"] = date.fromisoformat(end_date)
            except ValueError:
                pass
    if ward:
        filters["ward"] = ward
    if area:
        filters["area"] = area
    if zone:
        filters["zone"] = zone
    if status:
        filters["status"] = status
    if priority:
        filters["priority"] = priority
    if category:
        filters["category"] = category
    if worker:
        filters["worker"] = worker
    if pipeline:
        filters["pipeline"] = pipeline
    if tank:
        filters["tank"] = tank
    return filters


@reports_router.get("/dashboard", response_model=ReportsDashboardResponse)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_dashboard_analytics(db, filters)


@reports_router.get("/complaints", response_model=ComplaintsReportResponse)
def get_complaints_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_complaints_report(db, filters)


@reports_router.get("/workers", response_model=WorkersReportResponse)
def get_workers_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_workers_report(db, filters)


@reports_router.get("/supply", response_model=SupplyReportResponse)
def get_supply_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_supply_report(db, filters)


@reports_router.get("/pipelines", response_model=PipelinesReportResponse)
def get_pipelines_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_pipelines_report(db, filters)


@reports_router.get("/tanks", response_model=TanksReportResponse)
def get_tanks_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_tanks_report(db, filters)


@reports_router.get("/quality", response_model=QualityReportResponse)
def get_quality_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_quality_report(db, filters)


@reports_router.get("/maintenance", response_model=MaintenanceReportResponse)
def get_maintenance_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_maintenance_report(db, filters)


@reports_router.get("/emergency", response_model=EmergencyReportResponse)
def get_emergency_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_emergency_report(db, filters)


@reports_router.get("/notifications", response_model=NotificationsReportResponse)
def get_notifications_report(
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    return ReportsService.get_notifications_report(db, filters)


@reports_router.get("/export/pdf")
def export_pdf(
    report_type: str = Query("dashboard"),
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    content, media_type = ReportsService.export_report(db, report_type, "pdf", filters)
    headers = {"Content-Disposition": f"attachment; filename={report_type}_report.pdf"}
    return Response(content=content, media_type=media_type, headers=headers)


@reports_router.get("/export/excel")
def export_excel(
    report_type: str = Query("dashboard"),
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    content, media_type = ReportsService.export_report(db, report_type, "excel", filters)
    headers = {"Content-Disposition": f"attachment; filename={report_type}_report.xls"}
    return Response(content=content, media_type=media_type, headers=headers)


@reports_router.get("/export/csv")
def export_csv(
    report_type: str = Query("dashboard"),
    db: Session = Depends(get_db),
    filters: dict = Depends(parse_report_filters),
    current_user: UserData = Depends(get_current_water_user)
):
    content, media_type = ReportsService.export_report(db, report_type, "csv", filters)
    headers = {"Content-Disposition": f"attachment; filename={report_type}_report.csv"}
    return Response(content=content, media_type=media_type, headers=headers)


# Citizen Management API Router
citizens_router = APIRouter(prefix="/water/citizens", tags=["Water Citizens"])

@citizens_router.get("", response_model=CitizenListResponse)
def get_citizens(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Department Admins only.")
    return CitizenService.get_citizens_list(db, search, ward, area, status, page, page_size)

@citizens_router.get("/export")
def export_citizens(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    from fastapi import Response
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Department Admins only.")
    csv_data = CitizenService.export_citizens_csv(db)
    headers = {"Content-Disposition": "attachment; filename=citizens_export.csv"}
    return Response(content=csv_data, media_type="text/csv", headers=headers)

@citizens_router.get("/{id}", response_model=CitizenDetailResponse)
def get_citizen_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return CitizenService.get_citizen_detail(db, id)

@citizens_router.get("/{id}/complaints")
def get_citizen_complaints(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return CitizenService.get_citizen_complaints(db, id)

@citizens_router.get("/{id}/notifications")
def get_citizen_notifications(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return CitizenService.get_citizen_notifications(db, id)

@citizens_router.patch("/{id}/service-status")
def update_citizen_service_status(
    id: int,
    schema: CitizenServiceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return CitizenService.update_service_status(db, id, schema)


# Water Department Settings API Router
settings_router = APIRouter(prefix="/water/settings", tags=["Water Settings"])

@settings_router.get("", response_model=DepartmentSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return SettingsService.get_settings(db)

@settings_router.put("", response_model=DepartmentSettingsResponse)
def update_settings(
    schema: DepartmentSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return SettingsService.update_settings(db, schema)

@settings_router.get("/profile", response_model=DepartmentProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return SettingsService.get_profile(db)

@settings_router.put("/profile", response_model=DepartmentProfileResponse)
def update_profile(
    schema: DepartmentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: UserData = Depends(get_current_water_user)
):
    if current_user.role not in ["Department_Admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return SettingsService.update_profile(db, schema)


router.include_router(reports_router)
router.include_router(assignments_router)
router.include_router(worker_tasks_router)
router.include_router(supply_router)
router.include_router(pipeline_router)
router.include_router(tank_router)
router.include_router(quality_router)
router.include_router(maintenance_router)
router.include_router(emergency_router)
router.include_router(notifications_router)
router.include_router(citizens_router)
router.include_router(settings_router)







