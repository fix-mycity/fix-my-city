import random
import hashlib
import os
import base64
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from modules.complaints.model import Complaint
from modules.users.model import Profile
from .model import GeneralFieldWorker
from .schema import (
    ComplaintCreate, 
    ComplaintUpdate, 
    WorkerCreate, 
    WorkerUpdate
)

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    db_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    encoded_salt = base64.b64encode(salt).decode('utf-8')
    encoded_hash = base64.b64encode(db_hash).decode('utf-8')
    return f"pbkdf2_sha256$100000${encoded_salt}${encoded_hash}"

class GeneralComplaintService:
    @staticmethod
    def _to_schema(db: Session, c: Complaint) -> dict:
        profile = db.query(Profile).filter(Profile.user_id == c.reported_by).first()
        citizen_name = "Citizen"
        phone = None
        email = None
        if profile:
            citizen_name = (profile.full_name or "").strip() or "Citizen"
            phone = profile.phone_number
        
        return {
            "id": c.id,
            "complaint_number": f"GNC-{c.id:06d}",
            "citizen_id": c.reported_by,
            "citizen_name": citizen_name,
            "phone": phone,
            "email": email,
            "ward": None,
            "area": None,
            "address": f"Coordinates: {c.location_lat}, {c.location_lng}",
            "latitude": c.location_lat,
            "longitude": c.location_lng,
            "category": "General",
            "title": c.title,
            "description": c.description,
            "priority": "MEDIUM",
            "status": c.status,
            "assigned_worker_id": c.assigned_worker_id,
            "authority_notes": c.resolution_report,
            "resolution_notes": c.resolution_report,
            "before_image": c.image_url,
            "after_image": c.resolution_image,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "resolved_at": c.resolved_at
        }

    @staticmethod
    def create_complaint(db: Session, schema: ComplaintCreate) -> dict:
        db_complaint = Complaint(
            title=schema.title,
            description=schema.description or "",
            location_lat=schema.latitude or 0.0,
            location_lng=schema.longitude or 0.0,
            image_url=schema.before_image,
            department="general",
            status="NEW",
            reported_by=schema.citizen_id or 1
        )
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)
        return GeneralComplaintService._to_schema(db, db_complaint)

    @staticmethod
    def get_complaint_by_id(db: Session, complaint_id: int) -> dict:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"General complaint with ID {complaint_id} not found."
            )
        return GeneralComplaintService._to_schema(db, complaint)

    @staticmethod
    def list_complaints(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        ward_filter: Optional[str] = None,
        area_filter: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        query = db.query(Complaint).filter(Complaint.department == "general")

        if search:
            query = query.filter(
                or_(
                    Complaint.title.ilike(f"%{search}%"),
                    Complaint.description.ilike(f"%{search}%")
                )
            )

        if status_filter:
            query = query.filter(Complaint.status == status_filter)

        total_items = query.count()
        items = query.order_by(Complaint.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
        
        schema_items = [GeneralComplaintService._to_schema(db, c) for c in items]
        return schema_items, total_items

    @staticmethod
    def update_complaint(db: Session, complaint_id: int, schema: ComplaintUpdate) -> dict:
        db_complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not db_complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        update_data = schema.dict(exclude_unset=True)
        if "before_image" in update_data:
            db_complaint.image_url = update_data["before_image"]
        if "after_image" in update_data:
            db_complaint.resolution_image = update_data["after_image"]
        if "title" in update_data:
            db_complaint.title = update_data["title"]
        if "description" in update_data:
            db_complaint.description = update_data["description"]
            
        db.commit()
        db.refresh(db_complaint)
        return GeneralComplaintService._to_schema(db, db_complaint)

    @staticmethod
    def assign_worker(db: Session, complaint_id: int, worker_id: int, notes: Optional[str] = None) -> dict:
        db_complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not db_complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Verify worker exists
        worker = db.query(GeneralFieldWorker).filter(GeneralFieldWorker.id == worker_id).first()
        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"General field worker with ID {worker_id} not found."
            )
            
        db_complaint.assigned_worker_id = worker_id
        db_complaint.status = "ASSIGNED"
        if notes:
            db_complaint.resolution_report = notes
            
        # Update worker profile availability if currently AVAILABLE
        from sqlalchemy import text
        try:
            db.execute(text("UPDATE worker_profiles SET availability = 'ASSIGNED', status_updated_at = CURRENT_TIMESTAMP WHERE user_id = :wid AND availability = 'AVAILABLE'"), {"wid": worker_id})
            db.execute(text("UPDATE traffic_worker_profiles SET availability = 'ASSIGNED', status_updated_at = CURRENT_TIMESTAMP WHERE user_id = :wid AND availability = 'AVAILABLE'"), {"wid": worker_id})
        except Exception as e:
            print(f"Error updating worker profile status: {e}")

        db.commit()
        db.refresh(db_complaint)
        return GeneralComplaintService._to_schema(db, db_complaint)

    @staticmethod
    def update_complaint_status(db: Session, complaint_id: int, target_status: str, notes: Optional[str] = None) -> dict:
        db_complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not db_complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
            
        db_complaint.status = target_status
        if target_status == "RESOLVED":
            db_complaint.resolved_at = datetime.utcnow()
            if notes:
                db_complaint.resolution_report = notes
        db.commit()
        db.refresh(db_complaint)
        return GeneralComplaintService._to_schema(db, db_complaint)


class GeneralFieldWorkerService:
    @staticmethod
    def create_worker(db: Session, schema: WorkerCreate) -> GeneralFieldWorker:
        exists_email = db.query(GeneralFieldWorker).filter(GeneralFieldWorker.email == schema.email).first()
        if exists_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Worker with this email already registered."
            )
            
        exists_phone = db.query(GeneralFieldWorker).filter(GeneralFieldWorker.phone == schema.phone).first()
        if exists_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Worker with this phone number already registered."
            )

        db_worker = GeneralFieldWorker(
            first_name=schema.first_name,
            last_name=schema.last_name,
            email=schema.email,
            phone=schema.phone,
            password_hash=hash_password(schema.password),
            photo=schema.photo,
            gender=schema.gender,
            date_of_birth=schema.date_of_birth,
            address=schema.address,
            place=schema.place,
            pin_code=schema.pin_code,
            designation=schema.designation,
            skill=schema.skill,
            experience=schema.experience,
            joining_date=schema.joining_date or datetime.utcnow(),
            availability=schema.availability or "AVAILABLE",
            employment_status=schema.employment_status or "ACTIVE",
            emergency_contact_phone=schema.emergency_contact_phone
        )
        db_worker.created_at = datetime.utcnow()
        db_worker.updated_at = datetime.utcnow()
        db.add(db_worker)
        db.commit()
        db.refresh(db_worker)
        return db_worker

    @staticmethod
    def get_worker_by_id(db: Session, worker_id: int) -> GeneralFieldWorker:
        worker = db.query(GeneralFieldWorker).filter(GeneralFieldWorker.id == worker_id).first()
        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"General field worker with ID {worker_id} not found."
            )
        return worker

    @staticmethod
    def list_workers(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        availability: Optional[str] = None,
        employment_status: Optional[str] = None,
        skill: Optional[str] = None,
        place: Optional[str] = None,
        pin_code: Optional[str] = None
    ) -> Tuple[List[GeneralFieldWorker], int]:
        query = db.query(GeneralFieldWorker)

        if availability:
            query = query.filter(GeneralFieldWorker.availability == availability)
        if employment_status:
            query = query.filter(GeneralFieldWorker.employment_status == employment_status)
        if skill:
            query = query.filter(GeneralFieldWorker.skill.ilike(f"%{skill}%"))
        if place:
            query = query.filter(GeneralFieldWorker.place == place)
        if pin_code:
            query = query.filter(GeneralFieldWorker.pin_code == pin_code)

        total_items = query.count()
        items = query.order_by(GeneralFieldWorker.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total_items

    @staticmethod
    def update_worker(db: Session, worker_id: int, schema: WorkerUpdate) -> GeneralFieldWorker:
        db_worker = GeneralFieldWorkerService.get_worker_by_id(db, worker_id)
        
        update_data = schema.dict(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            update_data["password_hash"] = hash_password(update_data["password"])
            del update_data["password"]
            
        for key, value in update_data.items():
            setattr(db_worker, key, value)
            
        db_worker.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_worker)
        return db_worker

    @staticmethod
    def delete_worker(db: Session, worker_id: int) -> bool:
        db_worker = db.query(GeneralFieldWorker).filter(GeneralFieldWorker.id == worker_id).first()
        if not db_worker:
            return False
        db.delete(db_worker)
        db.commit()
        return True
