from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from database import SessionLocal
from dependencies.auth import UserData, PermissionChecker
from modules.workers import service
from modules.workers.schema import (
    WorkerCreateSchema,
    WorkerList,
    WorkerResponse,
    WorkerUpdateSchema,
    LeaveRequestCreate,
    LeaveRequestUpdate,
    LeaveRequestResponse,
    LeaveRequestList,
    WorkerTaskList,
    WorkerTaskResolution
)
from typing import Optional
from core.s3 import upload_file_to_s3

router = APIRouter(prefix="/workers", tags=["Worker Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_department_context(user: UserData, department: Optional[str] = None) -> str:
    """
    Determines the department context safely.
    If 'department' parameter is passed (e.g. ?department=water), use it.
    Otherwise, infer from user's permissions or default to 'water'.
    """
    if department:
        return department
        
    dept_permissions = [p for p in user.permissions if p.startswith("dept:")]
    if dept_permissions:
        return dept_permissions[0].split(":")[1]
        
    return "water"

# 1. Base Collection Routes
@router.get("", response_model=WorkerList)
def list_workers(
    department: Optional[str] = Query(None, description="Required if user manages multiple departments"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: List field workers (Context-Aware)"""
    dept_context = get_department_context(user, department)
    items, total_items = service.list_workers(db, user.id, dept_context, page, page_size, search)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.post("")
def create_worker(
    worker_data: WorkerCreateSchema,
    department: Optional[str] = Query(None, description="Required if user manages multiple departments"),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: Create a new field worker"""
    dept_context = get_department_context(user, department)
    res = service.create_worker(db, user.id, dept_context, worker_data)
    if not res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.get("message")
        )
    return res

# 2. Worker Self Operations Routes
@router.get("/me", response_model=WorkerResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Worker: Get own profile"""
    if user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers can access this endpoint")
    return service.get_my_profile(db, user.id)

@router.put("/me")
def update_my_profile(
    schema: WorkerUpdateSchema,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Worker: Update own profile"""
    if user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers can access this endpoint")
    return service.update_my_profile(db, user.id, schema)

@router.get("/me/tasks", response_model=WorkerTaskList)
def get_my_tasks(
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Worker: Get assigned tasks"""
    if user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers can access this endpoint")
    return service.get_my_tasks(db, user.id)

@router.post("/me/tasks/{task_id}/resolve")
def resolve_my_task(
    task_id: int,
    schema: WorkerTaskResolution,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Worker: Resolve an assigned task"""
    if user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers can access this endpoint")
    return service.resolve_my_task(db, user.id, task_id, schema.resolution_report, schema.after_image)

@router.get("/tasks/{task_id}/pdf-report")
def get_task_pdf_report(
    task_id: int,
    user: UserData = Depends(PermissionChecker([]))
):
    """Generate and return Celery-powered PDF Work Completion Report for a task"""
    from tasks.pdf_tasks import generate_complaint_pdf_report
    try:
        res = generate_complaint_pdf_report(task_id)
        if not res.get("success"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res.get("message"))
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(e)}"
        )

# 3. Photo Upload & Leave Requests Routes (MUST be before /{worker_id})
@router.post("/upload-photo")
def upload_worker_photo(
    file: UploadFile = File(...),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: Upload a worker profile photo to S3 and get the URL."""
    try:
        file_url = upload_file_to_s3(file.file, folder="worker-profiles", filename=file.filename)
        return {"success": True, "url": file_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload photo: {str(e)}"
        )

@router.post("/leave-requests", response_model=LeaveRequestResponse)
def submit_leave_request(
    schema: LeaveRequestCreate,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Worker: Submit a leave request"""
    if user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers can access this endpoint")
    return service.create_leave_request(db, user.id, schema)

@router.get("/leave-requests/me", response_model=LeaveRequestList)
def get_my_leave_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Worker: Get own leave requests"""
    if user.role != "Worker":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers can access this endpoint")
    items, total_items = service.list_leave_requests_for_worker(db, user.id, status_filter, page, page_size)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/leave-requests", response_model=LeaveRequestList)
def list_department_leave_requests(
    department: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: List leave requests for their department"""
    dept_context = get_department_context(user, department)
    items, total_items = service.list_leave_requests_for_admin(db, user.id, dept_context, status_filter, page, page_size)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.patch("/leave-requests/{request_id}/status", response_model=LeaveRequestResponse)
def update_leave_request_status(
    request_id: int,
    schema: LeaveRequestUpdate,
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: Approve or Reject a leave request"""
    return service.update_leave_request_status(db, request_id, user.id, schema)

# 4. Parameterized Worker Routes ({worker_id} MUST be last so string paths like /leave-requests don't match it)
@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(
    worker_id: int,
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: Get a specific worker profile"""
    dept_context = get_department_context(user, department)
    return service.get_worker(db, worker_id, user.id, dept_context)

@router.put("/{worker_id}")
def update_worker(
    worker_id: int,
    worker_data: WorkerUpdateSchema,
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: Update a worker's profile"""
    dept_context = get_department_context(user, department)
    return service.update_worker(db, worker_id, user.id, dept_context, worker_data)

@router.delete("/{worker_id}")
def delete_worker(
    worker_id: int,
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: Delete a worker completely"""
    dept_context = get_department_context(user, department)
    return service.delete_worker(db, worker_id, user.id)

@router.patch("/{worker_id}/block")
def block_worker(
    worker_id: int,
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UserData = Depends(PermissionChecker([]))
):
    """Admin: Toggle block status"""
    dept_context = get_department_context(user, department)
    return service.block_worker(db, worker_id, user.id)
