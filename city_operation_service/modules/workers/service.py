from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime, timezone
from modules.workers.repository import WorkerRepository
from modules.workers.schema import WorkerCreateSchema, WorkerUpdateSchema

def list_workers(db: Session, manager_id: int, department: str, page: int, page_size: int, search: Optional[str] = None):
    return WorkerRepository.list_workers(db, manager_id, department, page, page_size, search)

def create_worker(db: Session, manager_id: int, department: str, schema: WorkerCreateSchema):
    import os, json, urllib.request, urllib.error
    from fastapi.encoders import jsonable_encoder

    # Auto-fill joining_date if missing
    if not schema.joining_date:
        schema.joining_date = datetime.now(timezone.utc)

    # Prepare data for Auth Service
    auth_url = os.getenv("AUTH_SERVICE_URL", "http://auth_service:8001")
    req_url = f"{auth_url}/auth/register-worker"

    payload = jsonable_encoder(schema)
    payload["manager_id"] = manager_id
    payload["department"] = department

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        req_url,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            data_obj = res_data.get("data") or {}
            user_id = data_obj.get("id") or (isinstance(data_obj.get("user"), dict) and data_obj.get("user", {}).get("id"))

            if user_id:
                profile_schema = WorkerUpdateSchema(**schema.model_dump(exclude_unset=True))
                WorkerRepository.create_or_update_profile(db, user_id, manager_id, department, profile_schema)

                if department == "traffic":
                    try:
                        from modules.traffic_management.repository import TrafficWorkerRepository
                        TrafficWorkerRepository.create_or_update_profile(db, user_id, profile_schema)
                    except Exception as e:
                        print(f"Error syncing worker to traffic module: {e}")

            return {"success": True, "message": "Worker created successfully.", "data": res_data}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        try:
            err_json = json.loads(error_body)
            detail = err_json.get("detail", "Error from Auth Service")
        except Exception:
            detail = error_body
        raise HTTPException(status_code=e.code if e.code in [400, 422, 403, 404] else status.HTTP_400_BAD_REQUEST, detail=detail)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to connect to Auth Service: {str(e)}")

def get_worker(db: Session, worker_id: int, manager_id: int, department: str):
    worker = WorkerRepository.get_worker_full(db, worker_id, manager_id, department)
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    return worker

def update_worker(db: Session, worker_id: int, manager_id: int, department: str, schema: WorkerUpdateSchema):
    worker = WorkerRepository.get_worker_full(db, worker_id, manager_id, department)
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
        
    profile = WorkerRepository.create_or_update_profile(db, worker_id, manager_id, department, schema)
    
    # Sync updates to specific department modules if applicable
    if department == "traffic":
        try:
            from modules.traffic_management.repository import TrafficWorkerRepository
            TrafficWorkerRepository.update_worker_profile(
                db, 
                worker_user_id=worker_id, 
                manager_id=manager_id,
                first_name=schema.first_name,
                last_name=schema.last_name,
                phone=schema.phone,
                designation=schema.designation,
                availability=schema.availability,
                employment_status=schema.employment_status,
                zone=schema.place
            )
        except Exception as e:
            print(f"Error syncing update to traffic module: {e}")

    return {"success": True, "message": "Worker updated successfully"}

def delete_worker(db: Session, worker_id: int, manager_id: int):
    success = WorkerRepository.delete_worker(db, worker_id, manager_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found or unauthorized to delete")
    return {"success": True, "message": "Worker deleted successfully"}

def block_worker(db: Session, worker_id: int, manager_id: int):
    success = WorkerRepository.block_worker(db, worker_id, manager_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found or unauthorized to modify")
    return {"success": True, "message": "Worker status updated successfully"}

def get_my_profile(db: Session, user_id: int):
    worker = WorkerRepository.get_worker_full(db, user_id)
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
    return worker

def update_my_profile(db: Session, user_id: int, schema: WorkerUpdateSchema):
    profile = WorkerRepository.get_worker_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
        
    updated = WorkerRepository.create_or_update_profile(db, user_id, profile.manager_id, profile.department, schema)
    
    # Sync duty availability to traffic module if applicable
    if profile.department == "traffic" and schema.availability:
        try:
            from modules.traffic_management.repository import TrafficWorkerRepository
            TrafficWorkerRepository.update_worker_profile(
                db, 
                worker_user_id=user_id, 
                manager_id=profile.manager_id,
                availability=schema.availability
            )
        except Exception as e:
            print(f"Error syncing availability to traffic module: {e}")

    return {"success": True, "message": "Profile updated successfully"}

def create_leave_request(db: Session, worker_id: int, schema: 'LeaveRequestCreate'):
    profile = WorkerRepository.get_worker_profile(db, worker_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
        
    today_date = datetime.now(timezone.utc).date()
    start_date = schema.start_date.date()
    end_date = schema.end_date.date()

    if start_date < today_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leave start date cannot be in the past. Please select today or an upcoming date."
        )

    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leave end date cannot be before the start date."
        )

    from modules.workers.repository import LeaveRequestRepository
    return LeaveRequestRepository.create(db, worker_id, profile.department, profile.manager_id, schema)

def list_leave_requests_for_admin(db: Session, manager_id: int, department: str, status_filter: Optional[str], page: int, page_size: int):
    from modules.workers.repository import LeaveRequestRepository
    return LeaveRequestRepository.list_requests(db, manager_id=manager_id, department=department, status=status_filter, page=page, page_size=page_size)

def list_leave_requests_for_worker(db: Session, worker_id: int, status_filter: Optional[str], page: int, page_size: int):
    from modules.workers.repository import LeaveRequestRepository
    return LeaveRequestRepository.list_requests(db, worker_id=worker_id, status=status_filter, page=page, page_size=page_size)

def update_leave_request_status(db: Session, request_id: int, manager_id: int, schema: 'LeaveRequestUpdate'):
    from modules.workers.repository import LeaveRequestRepository
    leave_req = LeaveRequestRepository.get_by_id(db, request_id)
    
    if not leave_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
        
    if leave_req.manager_id != manager_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to manage this request")
        
    updated_req = LeaveRequestRepository.update_status(db, request_id, schema.status, schema.admin_notes)
    
    if schema.status == "APPROVED":
        # Synchronize ON_LEAVE status across central and department profiles
        worker_profile = WorkerRepository.get_worker_profile(db, leave_req.worker_id)
        if worker_profile:
            worker_profile.availability = "ON_LEAVE"
            db.commit()
            
            # Sync to Traffic department profile if applicable
            if worker_profile.department == "traffic":
                try:
                    from modules.traffic_management.repository import TrafficWorkerRepository
                    traffic_profile = TrafficWorkerRepository.get_worker_profile(db, leave_req.worker_id)
                    if traffic_profile:
                        traffic_profile.availability = "ON_LEAVE"
                        db.commit()
                except Exception as e:
                    print(f"Error syncing to traffic profile: {e}")
                    
    return updated_req

def get_my_tasks(db: Session, user_id: int):
    profile = WorkerRepository.get_worker_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
        
    from modules.workers.repository import WorkerTaskRepository
    items, total = WorkerTaskRepository.list_assigned_tasks(db, user_id, profile.department)
    return {"items": items, "total_items": total}

def resolve_my_task(db: Session, user_id: int, task_id: int, resolution_report: str, after_image: Optional[str] = None):
    profile = WorkerRepository.get_worker_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
        
    from modules.workers.repository import WorkerTaskRepository
    success = WorkerTaskRepository.resolve_task(db, user_id, profile.department, task_id, resolution_report, after_image)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or not assigned to you")
        
    return {"success": True, "message": "Task marked as resolved"}
