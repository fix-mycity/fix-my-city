from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List, Tuple
from modules.workers.model import WorkerProfile
from modules.workers.schema import WorkerUpdateSchema

class WorkerRepository:
    @staticmethod
    def list_workers(
        db: Session,
        manager_id: int,
        department: str,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        
        # Base query for counting
        count_query = "SELECT COUNT(*) FROM users WHERE manager_id = :manager_id"
        params = {"manager_id": manager_id, "department": department}
        
        if search:
            count_query += " AND (username ILIKE :search OR email ILIKE :search)"
            params["search"] = f"%{search}%"
            
        total_items = db.execute(text(count_query), params).scalar()
        
        # Query for items using LEFT JOIN with worker_profiles, filtering by department
        data_query = """
            SELECT u.id, u.username, u.email, u.is_active, u.created_at,
                   p.first_name, p.last_name, p.phone, p.photo, p.gender, 
                   p.date_of_birth, p.address, p.place, p.designation, 
                   p.skill, p.experience, p.joining_date, p.emergency_contact_phone,
                   p.availability, p.employment_status, p.department,
                   COALESCE(p.status_updated_at, p.updated_at, u.created_at) as status_updated_at
            FROM users u
            LEFT JOIN worker_profiles p ON u.id = p.user_id
            WHERE u.manager_id = :manager_id AND p.department = :department
        """
        if search:
            data_query += " AND (u.username ILIKE :search OR u.email ILIKE :search)"
            
        data_query += " ORDER BY u.created_at DESC LIMIT :limit OFFSET :offset"
        
        params["limit"] = page_size
        params["offset"] = (page - 1) * page_size
        
        result = db.execute(text(data_query), params).fetchall()
        
        # Map to dict to mimic WorkerResponse schema
        workers = []
        for row in result:
            workers.append({
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "is_active": row[3],
                "created_at": row[4],
                "first_name": row[5] or row[1],
                "last_name": row[6] or "",
                "phone": row[7] or "N/A",
                "photo": row[8] or None,
                "gender": row[9] or None,
                "date_of_birth": row[10] or None,
                "address": row[11] or None,
                "place": row[12] or None,
                "designation": row[13] or None,
                "skill": row[14] or None,
                "experience": row[15] or 0,
                "joining_date": row[16] or None,
                "emergency_contact_phone": row[17] or None,
                "availability": row[18] or ("AVAILABLE" if row[3] else "UNAVAILABLE"),
                "employment_status": row[19] or ("ACTIVE" if row[3] else "INACTIVE"),
                "department": row[20],
                "status_updated_at": row[21]
            })
            
        return workers, total_items

    @staticmethod
    def get_worker_profile(db: Session, worker_id: int) -> Optional[WorkerProfile]:
        return db.query(WorkerProfile).filter(WorkerProfile.user_id == worker_id).first()

    @staticmethod
    def get_worker_full(db: Session, worker_id: int, manager_id: Optional[int] = None, department: Optional[str] = None) -> Optional[dict]:
        data_query = """
            SELECT u.id, u.username, u.email, u.is_active, u.created_at,
                   p.first_name, p.last_name, p.phone, p.photo, p.gender, 
                   p.date_of_birth, p.address, p.place, p.designation, 
                   p.skill, p.experience, p.joining_date, p.emergency_contact_phone,
                   p.availability, p.employment_status, p.department,
                   COALESCE(p.status_updated_at, p.updated_at, u.created_at) as status_updated_at
            FROM users u
            LEFT JOIN worker_profiles p ON u.id = p.user_id
            WHERE u.id = :worker_id
        """
        params = {"worker_id": worker_id}
        
        if manager_id is not None:
            data_query += " AND u.manager_id = :manager_id"
            params["manager_id"] = manager_id
            
        if department is not None:
            data_query += " AND p.department = :department"
            params["department"] = department
            
        row = db.execute(text(data_query), params).fetchone()
        
        if not row:
            return None
            
        return {
            "id": row[0],
            "username": row[1],
            "email": row[2],
            "is_active": row[3],
            "created_at": row[4],
            "first_name": row[5] or row[1],
            "last_name": row[6] or "",
            "phone": row[7] or "N/A",
            "photo": row[8] or None,
            "gender": row[9] or None,
            "date_of_birth": row[10] or None,
            "address": row[11] or None,
            "place": row[12] or None,
            "designation": row[13] or None,
            "skill": row[14] or None,
            "experience": row[15] or 0,
            "joining_date": row[16] or None,
            "emergency_contact_phone": row[17] or None,
            "availability": row[18] or ("AVAILABLE" if row[3] else "UNAVAILABLE"),
            "employment_status": row[19] or ("ACTIVE" if row[3] else "INACTIVE"),
            "department": row[20],
            "status_updated_at": row[21]
        }

    @staticmethod
    def create_or_update_profile(
        db: Session, 
        worker_id: int, 
        manager_id: int, 
        department: str, 
        schema: WorkerUpdateSchema
    ) -> WorkerProfile:
        from fastapi import HTTPException, status
        from sqlalchemy.sql import func
        profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker_id).first()
        
        if not profile:
            profile = WorkerProfile(user_id=worker_id, manager_id=manager_id, department=department)
            db.add(profile)
            
        from core.s3 import clean_s3_url
        data_dict = schema.model_dump(exclude_unset=True)
        if "availability" in data_dict:
            if data_dict["availability"] == "ON_LEAVE":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot change status to ON_LEAVE directly. Please submit a Leave Request for approval."
                )
            if profile.availability != data_dict["availability"]:
                profile.status_updated_at = func.now()

        for key, value in data_dict.items():
            if key == "photo" and value:
                value = clean_s3_url(value)
            setattr(profile, key, value)
            
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def block_worker(db: Session, worker_id: int, manager_id: int) -> bool:
        res = db.execute(
            text("UPDATE users SET is_active = CASE WHEN is_active = true THEN false ELSE true END WHERE id = :worker_id AND manager_id = :manager_id RETURNING id"),
            {"worker_id": worker_id, "manager_id": manager_id}
        ).fetchone()
        db.commit()
        return bool(res)

    @staticmethod
    def delete_worker(db: Session, worker_id: int, manager_id: int) -> bool:
        db.execute(
            text("DELETE FROM worker_profiles WHERE user_id = :worker_id"),
            {"worker_id": worker_id}
        )
        res = db.execute(
            text("DELETE FROM users WHERE id = :worker_id AND manager_id = :manager_id RETURNING id"),
            {"worker_id": worker_id, "manager_id": manager_id}
        ).fetchone()
        db.commit()
        return bool(res)

class LeaveRequestRepository:
    @staticmethod
    def create(db: Session, worker_id: int, department: str, manager_id: int, schema: 'LeaveRequestCreate') -> 'LeaveRequest':
        from modules.workers.model import LeaveRequest
        db_request = LeaveRequest(
            worker_id=worker_id,
            department=department,
            manager_id=manager_id,
            reason=schema.reason,
            start_date=schema.start_date,
            end_date=schema.end_date,
            status="PENDING"
        )
        db.add(db_request)
        db.commit()
        db.refresh(db_request)
        return db_request

    @staticmethod
    def get_by_id(db: Session, request_id: int):
        from modules.workers.model import LeaveRequest
        return db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()

    @staticmethod
    def list_requests(
        db: Session,
        manager_id: Optional[int] = None,
        worker_id: Optional[int] = None,
        department: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ):
        base_query = """
            FROM leave_requests l
            LEFT JOIN users u ON l.worker_id = u.id
            LEFT JOIN worker_profiles p ON l.worker_id = p.user_id
            WHERE 1=1
        """
        params = {}
        if manager_id is not None:
            base_query += " AND l.manager_id = :manager_id"
            params["manager_id"] = manager_id
        if worker_id is not None:
            base_query += " AND l.worker_id = :worker_id"
            params["worker_id"] = worker_id
        if department:
            base_query += " AND l.department = :department"
            params["department"] = department
        if status:
            base_query += " AND l.status = :status"
            params["status"] = status

        count_sql = f"SELECT COUNT(*) {base_query}"
        total_items = db.execute(text(count_sql), params).scalar() or 0

        data_sql = f"""
            SELECT l.id, l.worker_id, l.department, l.reason,
                   l.start_date, l.end_date, l.status, l.admin_notes, l.created_at,
                   u.username, p.first_name, p.last_name
            {base_query}
            ORDER BY l.created_at DESC LIMIT :limit OFFSET :offset
        """
        params["limit"] = page_size
        params["offset"] = (page - 1) * page_size

        rows = db.execute(text(data_sql), params).fetchall()
        items = []
        for r in rows:
            fn = r[10] or ""
            ln = r[11] or ""
            full = f"{fn} {ln}".strip()
            w_name = full if full else (r[9] or f"Worker #{r[1]}")
            items.append({
                "id": r[0],
                "worker_id": r[1],
                "department": r[2],
                "reason": r[3],
                "start_date": r[4],
                "end_date": r[5],
                "status": r[6],
                "admin_notes": r[7],
                "created_at": r[8],
                "worker_name": w_name
            })
        return items, total_items

    @staticmethod
    def update_status(db: Session, request_id: int, status: str, admin_notes: Optional[str] = None):
        from modules.workers.model import LeaveRequest, WorkerProfile
        from sqlalchemy.sql import func
        db_request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
        if not db_request:
            return None
            
        db_request.status = status
        if admin_notes:
            db_request.admin_notes = admin_notes

        if status == "APPROVED":
            profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == db_request.worker_id).first()
            if profile:
                profile.availability = "ON_LEAVE"
                profile.status_updated_at = func.now()
            
        db.commit()
        db.refresh(db_request)
        return db_request

class WorkerTaskRepository:
    @staticmethod
    def list_assigned_tasks(db: Session, worker_id: int, department: str):
        if department == "water":
            from modules.water_management.model import WaterComplaint
            query = db.query(WaterComplaint).filter(WaterComplaint.assigned_worker_id == worker_id).order_by(WaterComplaint.created_at.desc())
            items = query.all()
            total = query.count()
            
            mapped_items = []
            for item in items:
                mapped_items.append({
                    "id": item.id,
                    "title": item.title,
                    "description": item.description,
                    "category": item.category,
                    "department": "water",
                    "status": item.status,
                    "priority": item.priority,
                    "location_lat": item.latitude,
                    "location_lng": item.longitude,
                    "area": item.area,
                    "address": item.address,
                    "image_url": item.before_image,
                    "created_at": item.created_at,
                    "resolved_at": item.resolved_at
                })
            return mapped_items, total
        else:
            from modules.complaints.model import Complaint
            query = db.query(Complaint).filter(Complaint.assigned_worker_id == worker_id).order_by(Complaint.created_at.desc())
            items = query.all()
            total = query.count()
            
            mapped_items = []
            for item in items:
                mapped_items.append({
                    "id": item.id,
                    "title": item.title,
                    "description": item.description,
                    "category": item.department,
                    "department": item.department,
                    "status": item.status,
                    "priority": "MEDIUM",
                    "location_lat": item.location_lat,
                    "location_lng": item.location_lng,
                    "area": "N/A",
                    "address": "N/A",
                    "before_image": getattr(item, "image_url", None),
                    "after_image": getattr(item, "resolution_image", None),
                    "image_url": getattr(item, "image_url", None),
                    "resolution_report": getattr(item, "resolution_report", None),
                    "created_at": item.created_at,
                    "resolved_at": getattr(item, "resolved_at", None)
                })
            return mapped_items, total

    @staticmethod
    def resolve_task(db: Session, worker_id: int, department: str, task_id: int, resolution_report: str, after_image: Optional[str] = None):
        import datetime
        from core.s3 import clean_s3_url
        clean_after = clean_s3_url(after_image) if after_image else None

        if department == "water":
            from modules.water_management.model import WaterComplaint
            item = db.query(WaterComplaint).filter(WaterComplaint.id == task_id, WaterComplaint.assigned_worker_id == worker_id).first()
            if not item: return None
            
            item.status = "RESOLVED"
            item.resolution_notes = resolution_report
            if hasattr(item, "after_image") and clean_after:
                item.after_image = clean_after
            item.resolved_at = datetime.datetime.utcnow()
            db.commit()
            return True
        else:
            from modules.complaints.model import Complaint, ComplaintStatus
            item = db.query(Complaint).filter(Complaint.id == task_id, Complaint.assigned_worker_id == worker_id).first()
            if not item: return None
            
            item.status = ComplaintStatus.RESOLVED.value
            item.resolution_report = resolution_report
            if clean_after:
                item.resolution_image = clean_after
            item.resolved_at = datetime.datetime.utcnow()
            db.commit()
            return True
