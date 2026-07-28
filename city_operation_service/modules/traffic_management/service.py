from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from modules.complaints.model import Complaint, ComplaintStatus, ComplaintDepartment
from modules.traffic_management.schema import WorkerAssignSchema, ResolutionReportSchema, WorkerCreateSchema, WorkerUpdateSchema
from modules.traffic_management.repository import TrafficComplaintRepository, TrafficWorkerRepository
from modules.workers.repository import WorkerRepository
from sqlalchemy import text
import urllib.request
import json
import os
from typing import Optional
from fastapi.encoders import jsonable_encoder

def get_traffic_dashboard_complaints(db: Session, status_filter: str = None, assigned_worker_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(Complaint).filter(Complaint.department == ComplaintDepartment.TRAFFIC.value)
    
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
        
    if assigned_worker_id is not None:
        query = query.filter(Complaint.assigned_worker_id == assigned_worker_id)
        
    return query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()

def list_traffic_complaints(db: Session, page: int, page_size: int, search: Optional[str] = None, status_filter: Optional[str] = None):
    return TrafficComplaintRepository.list_complaints(db, page, page_size, search, status_filter)

def get_traffic_dashboard_summary(db: Session):
    return TrafficComplaintRepository.get_dashboard_summary(db)

def get_complaint_by_id(db: Session, complaint_id: int):
    complaint = TrafficComplaintRepository.get_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Traffic incident not found")
    return complaint

def create_traffic_worker(db: Session, manager_id: int, worker: WorkerCreateSchema):
    # Enforce MAX 5 Workers rule
    result = db.execute(
        text("SELECT COUNT(*) FROM users WHERE manager_id = :manager_id AND is_active = true"),
        {"manager_id": manager_id}
    ).fetchone()
    
    current_workers = result[0] if result else 0
    if current_workers >= 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maximum limit of 5 workers reached for this Traffic Admin.")

    # Auto-fill joining_date if missing
    if not worker.joining_date:
        from datetime import datetime, timezone
        worker.joining_date = datetime.now(timezone.utc)

    # Prepare data for Auth Service
    auth_url = os.getenv("AUTH_SERVICE_URL", "http://auth_service:8001")
    req_url = f"{auth_url}/auth/register-worker"
    
    payload = jsonable_encoder(worker)
    payload["manager_id"] = manager_id
    payload["department"] = "traffic"
    
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
            
            # Auth service returns {"success": True, "message": "...", "data": {"id": 123, ...}}
            data_obj = res_data.get("data") or {}
            user_id = data_obj.get("id") or (isinstance(data_obj.get("user"), dict) and data_obj.get("user", {}).get("id"))
            
            if user_id:
                # Create profile with extended fields
                profile_schema = WorkerUpdateSchema(**worker.model_dump(exclude_unset=True))
                TrafficWorkerRepository.create_or_update_profile(db, user_id, profile_schema)
                
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

def list_traffic_workers(db: Session, manager_id: int, page: int, page_size: int, search: Optional[str] = None):
    return TrafficWorkerRepository.list_workers(db, manager_id, page, page_size, search)

def get_traffic_worker(db: Session, worker_id: int, manager_id: int):
    # Verify manager owns worker
    query = text("SELECT id FROM users WHERE id = :worker_id AND manager_id = :manager_id")
    result = db.execute(query, {"worker_id": worker_id, "manager_id": manager_id}).fetchone()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found or unauthorized")
    
    # Just list with search on ID to reuse repository logic for getting single worker profile
    workers, _ = TrafficWorkerRepository.list_workers(db, manager_id, 1, 1, str(worker_id)) # Not ideal, but works for prototype
    
    # Actually, a simple profile fetch is better
    profile = TrafficWorkerRepository.get_worker_profile(db, worker_id)
    return profile

def update_traffic_worker(db: Session, worker_id: int, manager_id: int, schema: WorkerUpdateSchema):
    # Verify manager owns worker
    query = text("SELECT id FROM users WHERE id = :worker_id AND manager_id = :manager_id")
    result = db.execute(query, {"worker_id": worker_id, "manager_id": manager_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found or unauthorized")
        
    profile = TrafficWorkerRepository.create_or_update_profile(db, worker_id, schema)
    return {"success": True, "message": "Worker profile updated successfully."}

def delete_traffic_worker(db: Session, worker_id: int, manager_id: int):
    success = TrafficWorkerRepository.delete_worker(db, worker_id, manager_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found or unauthorized")
    return {"success": True, "message": "Worker deleted successfully."}

def block_traffic_worker(db: Session, worker_id: int, manager_id: int):
    success = TrafficWorkerRepository.block_worker(db, worker_id, manager_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found or unauthorized")
    return {"success": True, "message": "Worker status updated successfully."}

def assign_worker(db: Session, incident_id: int, worker_data: WorkerAssignSchema, admin_id: int):
    incident = TrafficComplaintRepository.get_by_id(db, incident_id)
    
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Traffic incident not found")
        
    if incident.status in [ComplaintStatus.CLOSED.value, ComplaintStatus.REJECTED.value]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot assign worker to an incident that is already {incident.status}")

    # Verify that the worker being assigned actually belongs to this admin
    query = text("SELECT id FROM users WHERE id = :worker_id AND manager_id = :admin_id")
    result = db.execute(query, {"worker_id": worker_data.worker_id, "admin_id": admin_id}).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You can only assign workers that you manage."
        )

    # Validate worker availability
    worker_profile = TrafficWorkerRepository.get_worker_profile(db, worker_data.worker_id)
    central_worker_profile = WorkerRepository.get_worker_profile(db, worker_data.worker_id)
    
    # Check central profile first as it's the source of truth for global updates like ON_LEAVE
    central_status = central_worker_profile.availability if central_worker_profile else None
    traffic_status = worker_profile.availability if worker_profile else "UNAVAILABLE"
    
    current_status = central_status if central_status is not None else traffic_status
    
    if current_status != "AVAILABLE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Worker is not available for assignment. Current status: {current_status}"
        )

    # Change worker status to BUSY in both profiles
    if worker_profile:
        worker_profile.availability = "BUSY"
    if central_worker_profile:
        central_worker_profile.availability = "BUSY"

    incident.assigned_worker_id = worker_data.worker_id
    incident.status = ComplaintStatus.ASSIGNED.value
    db.commit()
    db.refresh(incident)
    return incident

def resolve_incident(db: Session, incident_id: int, report_data: ResolutionReportSchema, worker_id: int):
    incident = TrafficComplaintRepository.get_by_id(db, incident_id)
    
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Traffic incident not found")
        
    if incident.assigned_worker_id != worker_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not assigned to this incident")
        
    incident.resolution_report = report_data.resolution_report
    incident.status = ComplaintStatus.RESOLVED.value

    # Revert worker status to AVAILABLE in both profiles
    worker_profile = TrafficWorkerRepository.get_worker_profile(db, worker_id)
    if worker_profile:
        worker_profile.availability = "AVAILABLE"
        
    central_worker_profile = WorkerRepository.get_worker_profile(db, worker_id)
    if central_worker_profile:
        central_worker_profile.availability = "AVAILABLE"

    db.commit()
    db.refresh(incident)
    return incident

def close_incident(db: Session, incident_id: int):
    incident = TrafficComplaintRepository.get_by_id(db, incident_id)
    
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Traffic incident not found")
        
    if incident.status in [ComplaintStatus.CLOSED.value, ComplaintStatus.REJECTED.value]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Incident is already {incident.status}")

    if incident.status != ComplaintStatus.RESOLVED.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incident must be resolved before closing")
        
    incident.status = ComplaintStatus.CLOSED.value
    db.commit()
    db.refresh(incident)
    return incident

def update_incident_status(db: Session, incident_id: int, status_str: str):
    incident = TrafficComplaintRepository.get_by_id(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Traffic incident not found")
    
    if incident.status in [ComplaintStatus.CLOSED.value, ComplaintStatus.REJECTED.value]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot change status of an incident that is already {incident.status}")

    valid_statuses = [s.value for s in ComplaintStatus]
    if status_str not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
        
    # If rejecting and a worker is currently assigned, free the worker back to AVAILABLE
    if status_str == ComplaintStatus.REJECTED.value and incident.assigned_worker_id:
        worker_profile = TrafficWorkerRepository.get_worker_profile(db, incident.assigned_worker_id)
        if worker_profile:
            worker_profile.availability = "AVAILABLE"
        central_worker_profile = WorkerRepository.get_worker_profile(db, incident.assigned_worker_id)
        if central_worker_profile:
            central_worker_profile.availability = "AVAILABLE"

    incident.status = status_str
    db.commit()
    db.refresh(incident)
    return incident
