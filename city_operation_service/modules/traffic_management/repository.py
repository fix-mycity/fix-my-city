from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List, Tuple
from modules.complaints.model import Complaint, ComplaintStatus, ComplaintDepartment
from modules.traffic_management.model import TrafficWorkerProfile
from modules.traffic_management.schema import WorkerUpdateSchema
from datetime import datetime

class TrafficComplaintRepository:
    @staticmethod
    def get_by_id(db: Session, complaint_id: int) -> Optional[Complaint]:
        return db.query(Complaint).filter(
            Complaint.id == complaint_id,
            Complaint.department == ComplaintDepartment.TRAFFIC.value
        ).first()

    @staticmethod
    def list_complaints(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[List[Complaint], int]:
        query = db.query(Complaint).filter(Complaint.department == ComplaintDepartment.TRAFFIC.value)

        if status:
            query = query.filter(Complaint.status == status)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Complaint.title.ilike(search_pattern)) | 
                (Complaint.description.ilike(search_pattern))
            )

        query = query.order_by(Complaint.created_at.desc())
        total_items = query.count()
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total_items

    @staticmethod
    def get_dashboard_summary(db: Session) -> dict:
        from sqlalchemy import func
        status_counts = db.query(Complaint.status, func.count(Complaint.id)).filter(
            Complaint.department == ComplaintDepartment.TRAFFIC.value
        ).group_by(Complaint.status).all()
        
        return {
            "statuses": {s: count for s, count in status_counts},
            "total_complaints": db.query(Complaint).filter(Complaint.department == ComplaintDepartment.TRAFFIC.value).count()
        }

class TrafficWorkerRepository:
    @staticmethod
    def list_workers(
        db: Session,
        manager_id: int,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        
        # Base query for counting
        count_query = "SELECT COUNT(*) FROM users WHERE manager_id = :manager_id"
        params = {"manager_id": manager_id}
        
        if search:
            count_query += " AND (username ILIKE :search OR email ILIKE :search)"
            params["search"] = f"%{search}%"
            
        total_items = db.execute(text(count_query), params).scalar()
        
        # Query for items using LEFT JOIN with traffic_worker_profiles
        data_query = """
            SELECT u.id, u.username, u.email, u.is_active, u.created_at,
                   COALESCE(wp.first_name, p.first_name) as first_name, 
                   COALESCE(wp.last_name, p.last_name) as last_name, 
                   COALESCE(wp.phone, p.phone) as phone, 
                   COALESCE(wp.photo, p.photo) as photo, 
                   COALESCE(wp.gender, p.gender) as gender, 
                   COALESCE(wp.date_of_birth, p.date_of_birth) as date_of_birth, 
                   COALESCE(wp.address, p.address) as address, 
                   COALESCE(wp.place, p.place) as place, 
                   COALESCE(wp.designation, p.designation) as designation, 
                   COALESCE(wp.skill, p.skill) as skill, 
                   COALESCE(wp.experience, p.experience) as experience, 
                   COALESCE(wp.joining_date, p.joining_date) as joining_date, 
                   COALESCE(wp.emergency_contact_phone, p.emergency_contact_phone) as emergency_contact_phone,
                   COALESCE(wp.availability, p.availability) as availability, 
                   COALESCE(wp.employment_status, p.employment_status) as employment_status
            FROM users u
            LEFT JOIN traffic_worker_profiles p ON u.id = p.user_id
            LEFT JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.manager_id = :manager_id
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
                "skill": row[14] or "Traffic Control",
                "experience": row[15] or 0,
                "joining_date": row[16] or None,
                "emergency_contact_phone": row[17] or None,
                "availability": row[18] or ("AVAILABLE" if row[3] else "UNAVAILABLE"),
                "employment_status": row[19] or ("ACTIVE" if row[3] else "INACTIVE")
            })
            
        return workers, total_items

    @staticmethod
    def get_worker_profile(db: Session, worker_id: int) -> Optional[TrafficWorkerProfile]:
        return db.query(TrafficWorkerProfile).filter(TrafficWorkerProfile.user_id == worker_id).first()

    @staticmethod
    def create_or_update_profile(db: Session, worker_id: int, schema: WorkerUpdateSchema) -> TrafficWorkerProfile:
        profile = db.query(TrafficWorkerProfile).filter(TrafficWorkerProfile.user_id == worker_id).first()
        
        if not profile:
            profile = TrafficWorkerProfile(user_id=worker_id)
            db.add(profile)
            
        for key, value in schema.model_dump(exclude_unset=True).items():
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
            text("DELETE FROM traffic_worker_profiles WHERE user_id = :worker_id"),
            {"worker_id": worker_id}
        )
        res = db.execute(
            text("DELETE FROM users WHERE id = :worker_id AND manager_id = :manager_id RETURNING id"),
            {"worker_id": worker_id, "manager_id": manager_id}
        ).fetchone()
        db.commit()
        return bool(res)
