import random
from sqlalchemy.orm import Session
from sqlalchemy import case, or_, func
from datetime import datetime
from typing import Optional, List, Tuple
from .model import WaterComplaint, WaterFieldWorker
from .schema import ComplaintCreate, ComplaintUpdate, WorkerCreate, WorkerUpdate

def generate_unique_complaint_number(db: Session) -> str:
    while True:
        complaint_num = f"WAC-{random.randint(100000, 999999)}"
        exists = db.query(WaterComplaint).filter(WaterComplaint.complaint_number == complaint_num).first()
        if not exists:
            return complaint_num

class WaterComplaintRepository:
    @staticmethod
    def create(db: Session, schema: ComplaintCreate) -> WaterComplaint:
        complaint_num = generate_unique_complaint_number(db)
        db_complaint = WaterComplaint(
            complaint_number=complaint_num,
            citizen_id=schema.citizen_id,
            citizen_name=schema.citizen_name,
            phone=schema.phone,
            email=schema.email,
            ward=schema.ward,
            area=schema.area,
            address=schema.address,
            latitude=schema.latitude,
            longitude=schema.longitude,
            category=schema.category,
            title=schema.title,
            description=schema.description,
            priority=schema.priority,
            status="NEW",
            before_image=schema.before_image
        )
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)
        return db_complaint

    @staticmethod
    def get_by_id(db: Session, complaint_id: int) -> Optional[WaterComplaint]:
        return db.query(WaterComplaint).filter(WaterComplaint.id == complaint_id).first()

    @staticmethod
    def list_complaints(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        ward: Optional[str] = None,
        area: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: Optional[str] = "newest"
    ) -> Tuple[List[WaterComplaint], int]:
        query = db.query(WaterComplaint)

        # Filters
        if status:
            query = query.filter(WaterComplaint.status == status)
        if priority:
            query = query.filter(WaterComplaint.priority == priority)
        if category:
            query = query.filter(WaterComplaint.category == category)
        if ward:
            query = query.filter(WaterComplaint.ward == ward)
        if area:
            query = query.filter(WaterComplaint.area == area)
        if start_date:
            query = query.filter(WaterComplaint.created_at >= start_date)
        if end_date:
            query = query.filter(WaterComplaint.created_at <= end_date)

        # Search (complaint_number, citizen_name, phone, area, ward)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WaterComplaint.complaint_number.ilike(search_pattern),
                    WaterComplaint.citizen_name.ilike(search_pattern),
                    WaterComplaint.phone.ilike(search_pattern),
                    WaterComplaint.area.ilike(search_pattern),
                    WaterComplaint.ward.ilike(search_pattern),
                    WaterComplaint.title.ilike(search_pattern)
                )
            )

        # Sorting
        if sort_by == "oldest":
            query = query.order_by(WaterComplaint.created_at.asc())
        elif sort_by == "priority":
            priority_order = case(
                (WaterComplaint.priority == "CRITICAL", 4),
                (WaterComplaint.priority == "HIGH", 3),
                (WaterComplaint.priority == "MEDIUM", 2),
                (WaterComplaint.priority == "LOW", 1),
                else_=0
            ).desc()
            query = query.order_by(priority_order, WaterComplaint.created_at.desc())
        elif sort_by == "status":
            status_order = case(
                (WaterComplaint.status == "NEW", 1),
                (WaterComplaint.status == "ACCEPTED", 2),
                (WaterComplaint.status == "WORKER_ASSIGNED", 3),
                (WaterComplaint.status == "IN_PROGRESS", 4),
                (WaterComplaint.status == "COMPLETED", 5),
                (WaterComplaint.status == "VERIFIED", 6),
                (WaterComplaint.status == "REJECTED", 7),
                (WaterComplaint.status == "CLOSED", 8),
                else_=9
            ).asc()
            query = query.order_by(status_order, WaterComplaint.created_at.desc())
        else: # default to newest
            query = query.order_by(WaterComplaint.created_at.desc())

        total_items = query.count()
        
        # Pagination
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total_items

    @staticmethod
    def update(db: Session, complaint_id: int, schema: ComplaintUpdate) -> Optional[WaterComplaint]:
        db_complaint = WaterComplaintRepository.get_by_id(db, complaint_id)
        if not db_complaint:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_complaint, key, value)

        db.commit()
        db.refresh(db_complaint)
        return db_complaint

    @staticmethod
    def delete(db: Session, complaint_id: int) -> bool:
        db_complaint = WaterComplaintRepository.get_by_id(db, complaint_id)
        if not db_complaint:
            return False
        
        db.delete(db_complaint)
        db.commit()
        return True

    @staticmethod
    def update_status(db: Session, complaint_id: int, status: str, notes: Optional[str] = None) -> Optional[WaterComplaint]:
        db_complaint = WaterComplaintRepository.get_by_id(db, complaint_id)
        if not db_complaint:
            return None

        db_complaint.status = status
        if notes:
            if status in ["COMPLETED", "VERIFIED"]:
                db_complaint.resolution_notes = notes
            else:
                db_complaint.authority_notes = notes

        if status in ["COMPLETED", "CLOSED"]:
            db_complaint.resolved_at = datetime.utcnow()

        db.commit()
        db.refresh(db_complaint)
        return db_complaint

    @staticmethod
    def assign_worker(db: Session, complaint_id: int, worker_id: int, notes: Optional[str] = None) -> Optional[WaterComplaint]:
        db_complaint = WaterComplaintRepository.get_by_id(db, complaint_id)
        if not db_complaint:
            return None

        db_complaint.assigned_worker_id = worker_id
        db_complaint.status = "WORKER_ASSIGNED"
        if notes:
            db_complaint.authority_notes = notes

        db.commit()
        db.refresh(db_complaint)
        return db_complaint

    @staticmethod
    def get_dashboard_summary(db: Session) -> dict:
        # Group status counts
        status_counts = db.query(WaterComplaint.status, func.count(WaterComplaint.id)).group_by(WaterComplaint.status).all()
        # Group priority counts
        priority_counts = db.query(WaterComplaint.priority, func.count(WaterComplaint.id)).group_by(WaterComplaint.priority).all()
        # Group category counts
        category_counts = db.query(WaterComplaint.category, func.count(WaterComplaint.id)).group_by(WaterComplaint.category).all()
        
        return {
            "statuses": {s: count for s, count in status_counts},
            "priorities": {p: count for p, count in priority_counts},
            "categories": {c: count for c, count in category_counts},
            "total_complaints": db.query(WaterComplaint).count()
        }

class WaterFieldWorkerRepository:
    @staticmethod
    def create(db: Session, schema: WorkerCreate, password_hash: str) -> WaterFieldWorker:
        db_worker = WaterFieldWorker(
            employee_id=schema.employee_id,
            first_name=schema.first_name,
            last_name=schema.last_name,
            email=schema.email,
            phone=schema.phone,
            password_hash=password_hash,
            photo=schema.photo,
            gender=schema.gender,
            date_of_birth=schema.date_of_birth,
            address=schema.address,
            ward=schema.ward,
            area=schema.area,
            designation=schema.designation,
            skill=schema.skill,
            experience=schema.experience,
            joining_date=schema.joining_date or datetime.utcnow(),
            availability=schema.availability or "AVAILABLE",
            employment_status=schema.employment_status or "ACTIVE",
            emergency_contact_name=schema.emergency_contact_name,
            emergency_contact_phone=schema.emergency_contact_phone
        )
        db.add(db_worker)
        db.commit()
        db.refresh(db_worker)
        return db_worker

    @staticmethod
    def get_by_id(db: Session, worker_id: int) -> Optional[WaterFieldWorker]:
        return db.query(WaterFieldWorker).filter(WaterFieldWorker.id == worker_id).first()

    @staticmethod
    def get_by_employee_id(db: Session, employee_id: str) -> Optional[WaterFieldWorker]:
        return db.query(WaterFieldWorker).filter(WaterFieldWorker.employee_id == employee_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[WaterFieldWorker]:
        return db.query(WaterFieldWorker).filter(WaterFieldWorker.email == email).first()

    @staticmethod
    def get_by_phone(db: Session, phone: str) -> Optional[WaterFieldWorker]:
        return db.query(WaterFieldWorker).filter(WaterFieldWorker.phone == phone).first()

    @staticmethod
    def update(db: Session, worker_id: int, schema: WorkerUpdate, password_hash: Optional[str] = None) -> Optional[WaterFieldWorker]:
        db_worker = WaterFieldWorkerRepository.get_by_id(db, worker_id)
        if not db_worker:
            return None

        update_data = schema.dict(exclude_unset=True)
        if "password" in update_data:
            del update_data["password"]

        for key, value in update_data.items():
            setattr(db_worker, key, value)

        if password_hash:
            db_worker.password_hash = password_hash

        db_worker.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_worker)
        return db_worker

    @staticmethod
    def delete(db: Session, worker_id: int) -> bool:
        db_worker = WaterFieldWorkerRepository.get_by_id(db, worker_id)
        if not db_worker:
            return False
        
        db.delete(db_worker)
        db.commit()
        return True

    @staticmethod
    def list_workers(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        availability: Optional[str] = None,
        employment_status: Optional[str] = None,
        skill: Optional[str] = None,
        ward: Optional[str] = None,
        area: Optional[str] = None
    ) -> Tuple[List[WaterFieldWorker], int]:
        query = db.query(WaterFieldWorker)

        if availability:
            query = query.filter(WaterFieldWorker.availability == availability)
        if employment_status:
            query = query.filter(WaterFieldWorker.employment_status == employment_status)
        if skill:
            query = query.filter(WaterFieldWorker.skill == skill)
        if ward:
            query = query.filter(WaterFieldWorker.ward == ward)
        if area:
            query = query.filter(WaterFieldWorker.area == area)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WaterFieldWorker.employee_id.ilike(search_pattern),
                    WaterFieldWorker.first_name.ilike(search_pattern),
                    WaterFieldWorker.last_name.ilike(search_pattern),
                    func.concat(WaterFieldWorker.first_name, ' ', WaterFieldWorker.last_name).ilike(search_pattern),
                    WaterFieldWorker.email.ilike(search_pattern),
                    WaterFieldWorker.phone.ilike(search_pattern),
                    WaterFieldWorker.ward.ilike(search_pattern),
                    WaterFieldWorker.area.ilike(search_pattern)
                )
            )

        query = query.order_by(WaterFieldWorker.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total_items

    @staticmethod
    def change_availability(db: Session, worker_id: int, availability: str) -> Optional[WaterFieldWorker]:
        db_worker = WaterFieldWorkerRepository.get_by_id(db, worker_id)
        if not db_worker:
            return None
        db_worker.availability = availability
        db_worker.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_worker)
        return db_worker

    @staticmethod
    def change_status(db: Session, worker_id: int, status: str) -> Optional[WaterFieldWorker]:
        db_worker = WaterFieldWorkerRepository.get_by_id(db, worker_id)
        if not db_worker:
            return None
        db_worker.employment_status = status
        db_worker.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_worker)
        return db_worker

