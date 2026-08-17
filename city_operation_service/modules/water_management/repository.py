import random
from sqlalchemy.orm import Session
from sqlalchemy import case, or_, func, text
from datetime import datetime, date
from typing import Optional, List, Tuple
from .model import WaterComplaint, WaterFieldWorker, WorkerAssignment, WorkerTaskUpdate, AuthorityVerification, WaterSupplySchedule, WaterPipeline, PipelineInspection, PipelineMaintenance, WaterTank, TankRefillHistory, TankMaintenanceHistory, WaterQuality, QualityInspectionSchedule, QualityAlert, MaintenanceRequest, MaintenanceTask, MaintenanceMaterial, MaintenancePhoto, MaintenanceHistory, EmergencyShutdown, EmergencyAffectedArea, EmergencyResponseTeam, EmergencyTimeline, EmergencyNotification, WaterNotification, NotificationRecipient, NotificationTemplate, NotificationHistory, WaterCitizenAccess, WaterDepartmentSettings, DepartmentProfile
from .schema import ComplaintCreate, ComplaintUpdate, WorkerCreate, WorkerUpdate, AssignmentCreate, AssignmentUpdate, WorkerTaskUpdateCreate, VerificationSchema, WaterSupplyCreate, WaterSupplyUpdate, PipelineCreate, PipelineUpdate, InspectionCreate, InspectionUpdate, MaintenanceCreate as OldMaintCreate, MaintenanceUpdate as OldMaintUpdate, TankCreate, TankUpdate, TankRefillCreate, TankMaintenanceCreate, TankMaintenanceUpdate, WaterQualityCreate, WaterQualityUpdate, InspectionCreate as QualInspectionCreate, InspectionUpdate as QualInspectionUpdate, MaintenanceCreate, MaintenanceUpdate, TaskCreate, TaskUpdateSchema, MaterialCreate, PhotoUpload, EmergencyCreate, EmergencyUpdate, ResponseTeamCreate, AffectedAreaCreate, NotificationCreate, NotificationUpdate, TemplateCreate, TemplateUpdate, WaterCitizenAccessCreate, WaterCitizenAccessUpdate, DepartmentSettingsCreate, DepartmentSettingsUpdate, DepartmentProfileUpdate








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
    def sync_to_central_complaint(db: Session, wc: WaterComplaint):
        try:
            from modules.complaints.model import Complaint, ComplaintStatus
            central_c = None
            if hasattr(wc, 'central_complaint_id') and wc.central_complaint_id:
                central_c = db.query(Complaint).filter(Complaint.id == wc.central_complaint_id).first()
            
            if not central_c and wc.complaint_number:
                parts = wc.complaint_number.split('-')
                if len(parts) >= 3 and parts[2].isdigit():
                    cid = int(parts[2])
                    central_c = db.query(Complaint).filter(Complaint.id == cid).first()

            if not central_c:
                central_c = db.query(Complaint).filter(
                    (Complaint.title == wc.title) & (Complaint.reported_by == wc.citizen_id)
                ).first()

            if central_c:
                status_map = {
                    "NEW": ComplaintStatus.PENDING.value,
                    "ACCEPTED": ComplaintStatus.PENDING.value,
                    "WORKER_ASSIGNED": ComplaintStatus.ASSIGNED.value,
                    "IN_PROGRESS": ComplaintStatus.IN_PROGRESS.value,
                    "COMPLETED": ComplaintStatus.RESOLVED.value,
                    "VERIFIED": ComplaintStatus.CLOSED.value,
                    "CLOSED": ComplaintStatus.CLOSED.value,
                    "REJECTED": ComplaintStatus.PENDING.value,
                }
                mapped_status = status_map.get(wc.status, ComplaintStatus.PENDING.value)
                central_c.status = mapped_status
                if wc.assigned_worker_id:
                    central_c.assigned_worker_id = wc.assigned_worker_id
                if wc.resolution_notes or wc.authority_notes:
                    central_c.resolution_report = wc.resolution_notes or wc.authority_notes
                if wc.after_image:
                    central_c.resolution_image = wc.after_image
                if wc.resolved_at:
                    central_c.resolved_at = wc.resolved_at
                db.commit()
        except Exception as _e:
            db.rollback()
            print(f"Notice: sync_to_central_complaint warning: {_e}")

    @staticmethod
    def sync_real_complaints(db: Session):
        try:
            from modules.complaints.model import Complaint
            from modules.users.service import get_or_create_profile
            real_water_complaints = db.query(Complaint).filter(Complaint.department == "water").all()

            # Sync real water complaints from main complaints table
            for main_c in real_water_complaints:
                profile = get_or_create_profile(db, main_c.reported_by)
                citizen_name = profile.full_name if (profile and profile.full_name) else f"Citizen #{main_c.reported_by}"
                phone = profile.phone_number if (profile and profile.phone_number) else None

                exists = db.query(WaterComplaint).filter(
                    (WaterComplaint.title == main_c.title) & (WaterComplaint.citizen_id == main_c.reported_by)
                ).first()

                if not exists:
                    exists = db.query(WaterComplaint).filter(WaterComplaint.title == main_c.title).first()

                if exists:
                    if hasattr(exists, 'central_complaint_id') and not exists.central_complaint_id:
                        exists.central_complaint_id = main_c.id
                    if main_c.image_url and exists.before_image != main_c.image_url:
                        exists.before_image = main_c.image_url
                    if citizen_name and exists.citizen_name != citizen_name:
                        exists.citizen_name = citizen_name
                    if phone and exists.phone != phone:
                        exists.phone = phone
                    if main_c.location_lat:
                        exists.latitude = main_c.location_lat
                    if main_c.location_lng:
                        exists.longitude = main_c.location_lng
                    if main_c.description:
                        exists.description = main_c.description
                    db.commit()
                    WaterComplaintRepository.sync_to_central_complaint(db, exists)
                else:
                    random_num = random.randint(1000, 9999)
                    c_num = f"WC-2026-{main_c.id:04d}-{random_num}"
                    wc = WaterComplaint(
                        complaint_number=c_num,
                        central_complaint_id=main_c.id,
                        citizen_id=main_c.reported_by,
                        citizen_name=citizen_name,
                        phone=phone,
                        latitude=main_c.location_lat,
                        longitude=main_c.location_lng,
                        category="Pipe Leakage",
                        title=main_c.title,
                        description=main_c.description,
                        priority="HIGH",
                        status="NEW" if main_c.status == "PENDING" else main_c.status,
                        before_image=main_c.image_url,
                        created_at=main_c.created_at
                    )
                    db.add(wc)
                    db.commit()
            # Purge unlinked mock complaints when real complaints exist
            real_ids = [main_c.id for main_c in real_water_complaints]
            if real_ids:
                unlinked = db.query(WaterComplaint).filter(
                    or_(
                        WaterComplaint.central_complaint_id.is_(None),
                        ~WaterComplaint.central_complaint_id.in_(real_ids)
                    )
                ).all()
                for mock_c in unlinked:
                    # Clean up dependent assignments to avoid foreign key NOT NULL violations
                    db.query(WorkerAssignment).filter(WorkerAssignment.complaint_id == mock_c.id).delete(synchronize_session=False)
                    db.delete(mock_c)
                db.commit()
        except Exception as _e:
            db.rollback()
            print(f"Sync/Purge warning: {_e}")

    @staticmethod
    def get_by_id(db: Session, complaint_id: int) -> Optional[WaterComplaint]:
        WaterComplaintRepository.sync_real_complaints(db)
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
        WaterComplaintRepository.sync_real_complaints(db)

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

        if status in ["COMPLETED", "CLOSED", "VERIFIED"]:
            db_complaint.resolved_at = datetime.utcnow()

        db.commit()
        db.refresh(db_complaint)

        WaterComplaintRepository.sync_to_central_complaint(db, db_complaint)

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

        # Update worker profile availability if currently AVAILABLE
        from sqlalchemy import text
        try:
            db.execute(text("UPDATE worker_profiles SET availability = 'ASSIGNED', status_updated_at = CURRENT_TIMESTAMP WHERE user_id = :wid AND availability = 'AVAILABLE'"), {"wid": worker_id})
            db.execute(text("UPDATE traffic_worker_profiles SET availability = 'ASSIGNED', status_updated_at = CURRENT_TIMESTAMP WHERE user_id = :wid AND availability = 'AVAILABLE'"), {"wid": worker_id})
        except Exception as e:
            print(f"Error updating worker profile status: {e}")

        db.commit()
        db.refresh(db_complaint)

        WaterComplaintRepository.sync_to_central_complaint(db, db_complaint)

        return db_complaint

    @staticmethod
    def get_dashboard_summary(db: Session) -> dict:
        WaterComplaintRepository.sync_real_complaints(db)
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
            first_name=schema.first_name,
            last_name=schema.last_name,
            email=schema.email,
            phone=schema.phone,
            password_hash=password_hash,
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
        db.add(db_worker)
        db.commit()
        db.refresh(db_worker)
        return db_worker

    @staticmethod
    def get_by_id(db: Session, worker_id: int) -> Optional[WaterFieldWorker]:
        # 1. Try matching directly by water_field_workers.id
        worker = db.query(WaterFieldWorker).filter(WaterFieldWorker.id == worker_id).first()
        if worker:
            return worker

        # 2. Try matching by central User.id
        user_row = db.execute(
            text("""
                SELECT u.id, u.username, u.email, p.first_name, p.last_name, p.phone, p.designation, p.skill, p.experience
                FROM users u
                LEFT JOIN worker_profiles p ON u.id = p.user_id
                WHERE u.id = :uid
            """),
            {"uid": worker_id}
        ).fetchone()

        if user_row:
            u_email = user_row[2]
            if u_email:
                worker_by_email = db.query(WaterFieldWorker).filter(WaterFieldWorker.email == u_email).first()
                if worker_by_email:
                    return worker_by_email

            # 3. Auto-sync worker profile into water_field_workers if not present
            worker_phone = user_row[5] if user_row[5] and user_row[5] != "1234567890" and user_row[5] != "N/A" else f"98460{worker_id:05d}"
            # Ensure unique phone
            existing_phone = db.query(WaterFieldWorker).filter(WaterFieldWorker.phone == worker_phone).first()
            if existing_phone:
                worker_phone = f"98460{worker_id:05d}"

            new_worker = WaterFieldWorker(
                first_name=user_row[3] or user_row[1] or "Field",
                last_name=user_row[4] or "Officer",
                email=u_email or f"worker_{worker_id}@fixmycity.com",
                phone=worker_phone,
                password_hash="",
                designation=user_row[6] or "Water Worker",
                skill=user_row[7] or "Leak Repair",
                experience=user_row[8] or 1,
                availability="AVAILABLE",
                employment_status="ACTIVE"
            )
            db.add(new_worker)
            db.commit()
            db.refresh(new_worker)
            return new_worker

        return None

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
        place: Optional[str] = None,
        pin_code: Optional[str] = None
    ) -> Tuple[List[WaterFieldWorker], int]:
        query = db.query(WaterFieldWorker)

        if availability:
            query = query.filter(WaterFieldWorker.availability == availability)
        if employment_status:
            query = query.filter(WaterFieldWorker.employment_status == employment_status)
        if skill:
            query = query.filter(WaterFieldWorker.skill == skill)
        if place:
            query = query.filter(WaterFieldWorker.place.ilike(f"%{place}%"))
        if pin_code:
            query = query.filter(WaterFieldWorker.pin_code == pin_code)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WaterFieldWorker.first_name.ilike(search_pattern),
                    WaterFieldWorker.last_name.ilike(search_pattern),
                    func.concat(WaterFieldWorker.first_name, ' ', WaterFieldWorker.last_name).ilike(search_pattern),
                    WaterFieldWorker.email.ilike(search_pattern),
                    WaterFieldWorker.phone.ilike(search_pattern),
                    WaterFieldWorker.place.ilike(search_pattern),
                    WaterFieldWorker.pin_code.ilike(search_pattern)
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

def generate_unique_assignment_number(db: Session) -> str:
    while True:
        date_str = datetime.utcnow().strftime("%Y%m%d")
        rand_num = random.randint(1000, 9999)
        assignment_num = f"WA-{date_str}-{rand_num}"
        exists = db.query(WorkerAssignment).filter(WorkerAssignment.assignment_number == assignment_num).first()
        if not exists:
            return assignment_num

class WorkerAssignmentRepository:
    @staticmethod
    def create_assignment(db: Session, schema: AssignmentCreate, assigned_by: int) -> WorkerAssignment:
        assignment_num = generate_unique_assignment_number(db)
        db_assignment = WorkerAssignment(
            assignment_number=assignment_num,
            complaint_id=schema.complaint_id,
            worker_id=schema.worker_id,
            assigned_by=assigned_by,
            deadline=schema.deadline,
            priority=schema.priority or "MEDIUM",
            remarks=schema.remarks,
            status="ASSIGNED"
        )
        db.add(db_assignment)
        db.commit()
        db.refresh(db_assignment)
        return db_assignment

    @staticmethod
    def get_assignment_by_id(db: Session, assignment_id: int) -> Optional[WorkerAssignment]:
        return db.query(WorkerAssignment).filter(WorkerAssignment.id == assignment_id).first()

    @staticmethod
    def list_assignments(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        worker_id: Optional[int] = None,
        complaint_id: Optional[int] = None
    ) -> Tuple[List[WorkerAssignment], int]:
        query = db.query(WorkerAssignment).outerjoin(WorkerAssignment.complaint).outerjoin(WorkerAssignment.worker)

        if status:
            query = query.filter(WorkerAssignment.status == status)
        if priority:
            query = query.filter(WorkerAssignment.priority == priority)
        if worker_id is not None:
            query = query.filter(WorkerAssignment.worker_id == worker_id)
        if complaint_id is not None:
            query = query.filter(WorkerAssignment.complaint_id == complaint_id)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WorkerAssignment.assignment_number.ilike(search_pattern),
                    WaterComplaint.complaint_number.ilike(search_pattern),
                    WaterFieldWorker.first_name.ilike(search_pattern),
                    WaterFieldWorker.last_name.ilike(search_pattern),
                    func.concat(WaterFieldWorker.first_name, ' ', WaterFieldWorker.last_name).ilike(search_pattern)
                )
            )

        query = query.order_by(WorkerAssignment.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total_items

    @staticmethod
    def update_assignment(db: Session, assignment_id: int, schema: AssignmentUpdate) -> Optional[WorkerAssignment]:
        db_assignment = WorkerAssignmentRepository.get_assignment_by_id(db, assignment_id)
        if not db_assignment:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_assignment, key, value)

        db_assignment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_assignment)
        return db_assignment

    @staticmethod
    def update_status(db: Session, assignment_id: int, status: str, remarks: Optional[str] = None) -> Optional[WorkerAssignment]:
        db_assignment = WorkerAssignmentRepository.get_assignment_by_id(db, assignment_id)
        if not db_assignment:
            return None

        db_assignment.status = status
        if remarks:
            db_assignment.remarks = remarks
        db_assignment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_assignment)
        return db_assignment

    @staticmethod
    def add_task_update(db: Session, assignment_id: int, schema: WorkerTaskUpdateCreate, updated_by: int) -> WorkerTaskUpdate:
        db_update = WorkerTaskUpdate(
            assignment_id=assignment_id,
            status=schema.status,
            remarks=schema.remarks,
            before_image=schema.before_image,
            after_image=schema.after_image,
            materials_used=schema.materials_used,
            completion_notes=schema.completion_notes,
            latitude=schema.latitude,
            longitude=schema.longitude,
            updated_by=updated_by
        )
        db.add(db_update)
        db.commit()
        db.refresh(db_update)

        if schema.after_image or schema.completion_notes:
            assignment = db.query(WorkerAssignment).filter(WorkerAssignment.id == assignment_id).first()
            if assignment and assignment.complaint_id:
                wc = db.query(WaterComplaint).filter(WaterComplaint.id == assignment.complaint_id).first()
                if wc:
                    if schema.after_image:
                        wc.after_image = schema.after_image
                    if schema.completion_notes:
                        wc.resolution_notes = schema.completion_notes
                    db.commit()
                    WaterComplaintRepository.sync_to_central_complaint(db, wc)

        return db_update

    @staticmethod
    def add_verification(db: Session, assignment_id: int, schema: VerificationSchema, verified_by: int) -> AuthorityVerification:
        db_verification = AuthorityVerification(
            assignment_id=assignment_id,
            verified_by=verified_by,
            verification_status=schema.verification_status,
            remarks=schema.remarks
        )
        db.add(db_verification)
        db.commit()
        db.refresh(db_verification)
        return db_verification

    @staticmethod
    def delete(db: Session, assignment_id: int) -> bool:
        db_assignment = WorkerAssignmentRepository.get_assignment_by_id(db, assignment_id)
        if not db_assignment:
            return False
        db.delete(db_assignment)
        db.commit()
        return True

def generate_unique_schedule_number(db: Session) -> str:
    while True:
        num = f"WSS-{random.randint(100000, 999999)}"
        exists = db.query(WaterSupplySchedule).filter(WaterSupplySchedule.schedule_number == num).first()
        if not exists:
            return num

class WaterSupplyScheduleRepository:
    @staticmethod
    def calculate_duration(morning_start, morning_end, evening_start, evening_end) -> int:
        duration = 0
        if morning_start and morning_end:
            m_diff = (datetime.combine(datetime.min.date(), morning_end) - datetime.combine(datetime.min.date(), morning_start)).total_seconds() / 60
            if m_diff > 0:
                duration += int(m_diff)
        if evening_start and evening_end:
            e_diff = (datetime.combine(datetime.min.date(), evening_end) - datetime.combine(datetime.min.date(), evening_start)).total_seconds() / 60
            if e_diff > 0:
                duration += int(e_diff)
        return duration

    @staticmethod
    def create(db: Session, schema: WaterSupplyCreate, creator_id: Optional[int] = None) -> WaterSupplySchedule:
        schedule_num = generate_unique_schedule_number(db)
        duration = WaterSupplyScheduleRepository.calculate_duration(
            schema.morning_start_time, schema.morning_end_time,
            schema.evening_start_time, schema.evening_end_time
        )
        db_schedule = WaterSupplySchedule(
            schedule_number=schedule_num,
            zone=schema.zone,
            ward=schema.ward,
            area=schema.area,
            street=schema.street,
            supply_type=schema.supply_type,
            supply_date=schema.supply_date,
            morning_start_time=schema.morning_start_time,
            morning_end_time=schema.morning_end_time,
            evening_start_time=schema.evening_start_time,
            evening_end_time=schema.evening_end_time,
            duration_minutes=duration,
            water_source=schema.water_source,
            tank_name=schema.tank_name,
            pipeline_name=schema.pipeline_name,
            status=schema.status or "SCHEDULED",
            remarks=schema.remarks,
            created_by=creator_id,
            updated_by=creator_id
        )
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        return db_schedule

    @staticmethod
    def get_by_id(db: Session, schedule_id: int) -> Optional[WaterSupplySchedule]:
        return db.query(WaterSupplySchedule).filter(WaterSupplySchedule.id == schedule_id).first()

    @staticmethod
    def get_by_schedule_number(db: Session, schedule_number: str) -> Optional[WaterSupplySchedule]:
        return db.query(WaterSupplySchedule).filter(WaterSupplySchedule.schedule_number == schedule_number).first()

    @staticmethod
    def update(db: Session, schedule_id: int, schema: WaterSupplyUpdate, updater_id: Optional[int] = None) -> Optional[WaterSupplySchedule]:
        db_schedule = WaterSupplyScheduleRepository.get_by_id(db, schedule_id)
        if not db_schedule:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_schedule, key, value)

        # Re-calculate duration
        duration = WaterSupplyScheduleRepository.calculate_duration(
            db_schedule.morning_start_time, db_schedule.morning_end_time,
            db_schedule.evening_start_time, db_schedule.evening_end_time
        )
        db_schedule.duration_minutes = duration
        db_schedule.updated_by = updater_id
        db_schedule.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_schedule)
        return db_schedule

    @staticmethod
    def delete(db: Session, schedule_id: int) -> bool:
        db_schedule = WaterSupplyScheduleRepository.get_by_id(db, schedule_id)
        if not db_schedule:
            return False
        db.delete(db_schedule)
        db.commit()
        return True

    @staticmethod
    def list_schedules(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        supply_type: Optional[str] = None,
        ward: Optional[str] = None,
        zone: Optional[str] = None,
        supply_date: Optional[datetime.date] = None
    ) -> Tuple[List[WaterSupplySchedule], int]:
        query = db.query(WaterSupplySchedule)

        if status:
            query = query.filter(WaterSupplySchedule.status == status)
        if supply_type:
            query = query.filter(WaterSupplySchedule.supply_type == supply_type)
        if ward:
            query = query.filter(WaterSupplySchedule.ward == ward)
        if zone:
            query = query.filter(WaterSupplySchedule.zone == zone)
        if supply_date:
            query = query.filter(WaterSupplySchedule.supply_date == supply_date)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WaterSupplySchedule.schedule_number.ilike(search_pattern),
                    WaterSupplySchedule.ward.ilike(search_pattern),
                    WaterSupplySchedule.area.ilike(search_pattern),
                    WaterSupplySchedule.zone.ilike(search_pattern)
                )
            )

        query = query.order_by(WaterSupplySchedule.supply_date.desc(), WaterSupplySchedule.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total_items

    @staticmethod
    def get_today_schedules(db: Session) -> List[WaterSupplySchedule]:
        from datetime import date
        today = date.today()
        return db.query(WaterSupplySchedule).filter(WaterSupplySchedule.supply_date == today).order_by(WaterSupplySchedule.created_at.desc()).all()

    @staticmethod
    def get_upcoming_schedules(db: Session) -> List[WaterSupplySchedule]:
        from datetime import date
        today = date.today()
        return db.query(WaterSupplySchedule).filter(WaterSupplySchedule.supply_date > today).order_by(WaterSupplySchedule.supply_date.asc(), WaterSupplySchedule.created_at.desc()).all()

    @staticmethod
    def update_status(db: Session, schedule_id: int, status: str, remarks: Optional[str] = None, updater_id: Optional[int] = None) -> Optional[WaterSupplySchedule]:
        db_schedule = WaterSupplyScheduleRepository.get_by_id(db, schedule_id)
        if not db_schedule:
            return None

        db_schedule.status = status
        if remarks:
            db_schedule.remarks = remarks
        db_schedule.updated_by = updater_id
        db_schedule.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_schedule)
        return db_schedule

def generate_unique_pipeline_number(db: Session) -> str:
    while True:
        num = f"WPL-{random.randint(100000, 999999)}"
        exists = db.query(WaterPipeline).filter(WaterPipeline.pipeline_number == num).first()
        if not exists:
            return num

class WaterPipelineRepository:
    @staticmethod
    def create_pipeline(db: Session, schema: PipelineCreate, creator_id: Optional[int] = None) -> WaterPipeline:
        pipeline_num = schema.pipeline_number or generate_unique_pipeline_number(db)
        db_pipeline = WaterPipeline(
            pipeline_number=pipeline_num,
            pipeline_name=schema.pipeline_name,
            zone=schema.zone,
            ward=schema.ward,
            area=schema.area,
            street=schema.street,
            pipeline_type=schema.pipeline_type,
            diameter=schema.diameter,
            length=schema.length,
            material=schema.material,
            installation_date=schema.installation_date,
            expected_life=schema.expected_life,
            water_source=schema.water_source,
            start_location=schema.start_location,
            end_location=schema.end_location,
            latitude=schema.latitude,
            longitude=schema.longitude,
            condition=schema.condition or "EXCELLENT",
            pressure_level=schema.pressure_level,
            current_status=schema.current_status or "ACTIVE",
            remarks=schema.remarks,
            created_by=creator_id,
            updated_by=creator_id
        )
        db.add(db_pipeline)
        db.commit()
        db.refresh(db_pipeline)
        return db_pipeline

    @staticmethod
    def get_pipeline_by_id(db: Session, pipeline_id: int) -> Optional[WaterPipeline]:
        return db.query(WaterPipeline).filter(WaterPipeline.id == pipeline_id).first()

    @staticmethod
    def get_pipeline_by_number(db: Session, pipeline_number: str) -> Optional[WaterPipeline]:
        return db.query(WaterPipeline).filter(WaterPipeline.pipeline_number == pipeline_number).first()

    @staticmethod
    def update_pipeline(db: Session, pipeline_id: int, schema: PipelineUpdate, updater_id: Optional[int] = None) -> Optional[WaterPipeline]:
        db_pipeline = WaterPipelineRepository.get_pipeline_by_id(db, pipeline_id)
        if not db_pipeline:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_pipeline, key, value)

        db_pipeline.updated_by = updater_id
        db_pipeline.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_pipeline)
        return db_pipeline

    @staticmethod
    def delete_pipeline(db: Session, pipeline_id: int) -> bool:
        db_pipeline = WaterPipelineRepository.get_pipeline_by_id(db, pipeline_id)
        if not db_pipeline:
            return False
        db.delete(db_pipeline)
        db.commit()
        return True

    @staticmethod
    def list_pipelines(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        zone: Optional[str] = None,
        ward: Optional[str] = None,
        condition: Optional[str] = None,
        pipeline_type: Optional[str] = None,
        material: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[List[WaterPipeline], int]:
        query = db.query(WaterPipeline)

        if zone:
            query = query.filter(WaterPipeline.zone == zone)
        if ward:
            query = query.filter(WaterPipeline.ward == ward)
        if condition:
            query = query.filter(WaterPipeline.condition == condition)
        if pipeline_type:
            query = query.filter(WaterPipeline.pipeline_type == pipeline_type)
        if material:
            query = query.filter(WaterPipeline.material == material)
        if status:
            query = query.filter(WaterPipeline.current_status == status)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WaterPipeline.pipeline_number.ilike(search_pattern),
                    WaterPipeline.pipeline_name.ilike(search_pattern),
                    WaterPipeline.ward.ilike(search_pattern),
                    WaterPipeline.area.ilike(search_pattern),
                    WaterPipeline.material.ilike(search_pattern)
                )
            )

        query = query.order_by(WaterPipeline.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total_items

    # Inspection CRUD
    @staticmethod
    def create_inspection(db: Session, pipeline_id: int, schema: InspectionCreate) -> Optional[PipelineInspection]:
        pipeline = WaterPipelineRepository.get_pipeline_by_id(db, pipeline_id)
        if not pipeline:
            return None

        db_inspection = PipelineInspection(
            pipeline_id=pipeline_id,
            inspection_date=schema.inspection_date,
            inspector_name=schema.inspector_name,
            condition=schema.condition,
            pressure_level=schema.pressure_level,
            leak_detected=schema.leak_detected or False,
            remarks=schema.remarks,
            next_inspection=schema.next_inspection
        )
        db.add(db_inspection)

        # Automatically update pipeline parameters based on inspection
        pipeline.last_inspection = schema.inspection_date
        if schema.next_inspection:
            pipeline.next_inspection = schema.next_inspection
        pipeline.condition = schema.condition
        if schema.pressure_level is not None:
            pipeline.pressure_level = schema.pressure_level

        # If a leak is detected, set pipeline status to DAMAGED
        if schema.leak_detected:
            pipeline.current_status = "DAMAGED"

        db.commit()
        db.refresh(db_inspection)
        return db_inspection

    @staticmethod
    def get_inspections_for_pipeline(db: Session, pipeline_id: int) -> List[PipelineInspection]:
        return db.query(PipelineInspection).filter(PipelineInspection.pipeline_id == pipeline_id).order_by(PipelineInspection.inspection_date.desc()).all()

    @staticmethod
    def get_inspection_by_id(db: Session, inspection_id: int) -> Optional[PipelineInspection]:
        return db.query(PipelineInspection).filter(PipelineInspection.id == inspection_id).first()

    @staticmethod
    def update_inspection(db: Session, inspection_id: int, schema: InspectionUpdate) -> Optional[PipelineInspection]:
        db_inspection = WaterPipelineRepository.get_inspection_by_id(db, inspection_id)
        if not db_inspection:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_inspection, key, value)

        db.commit()
        db.refresh(db_inspection)
        return db_inspection

    @staticmethod
    def delete_inspection(db: Session, inspection_id: int) -> bool:
        db_inspection = WaterPipelineRepository.get_inspection_by_id(db, inspection_id)
        if not db_inspection:
            return False
        db.delete(db_inspection)
        db.commit()
        return True

    # Maintenance CRUD
    @staticmethod
    def create_maintenance(db: Session, pipeline_id: int, schema: MaintenanceCreate) -> Optional[PipelineMaintenance]:
        pipeline = WaterPipelineRepository.get_pipeline_by_id(db, pipeline_id)
        if not pipeline:
            return None

        db_maintenance = PipelineMaintenance(
            pipeline_id=pipeline_id,
            maintenance_type=schema.maintenance_type,
            reason=schema.reason,
            start_date=schema.start_date,
            end_date=schema.end_date,
            status=schema.status or "SCHEDULED",
            assigned_worker=schema.assigned_worker,
            remarks=schema.remarks
        )
        db.add(db_maintenance)

        # Automatically update pipeline status to UNDER_MAINTENANCE when status is active
        if schema.status in ["SCHEDULED", "IN_PROGRESS"]:
            pipeline.current_status = "UNDER_MAINTENANCE"
        elif schema.status == "COMPLETED":
            pipeline.current_status = "ACTIVE"

        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance

    @staticmethod
    def get_maintenances_for_pipeline(db: Session, pipeline_id: int) -> List[PipelineMaintenance]:
        return db.query(PipelineMaintenance).filter(PipelineMaintenance.pipeline_id == pipeline_id).order_by(PipelineMaintenance.start_date.desc()).all()

    @staticmethod
    def get_maintenance_by_id(db: Session, maintenance_id: int) -> Optional[PipelineMaintenance]:
        return db.query(PipelineMaintenance).filter(PipelineMaintenance.id == maintenance_id).first()

    @staticmethod
    def update_maintenance(db: Session, maintenance_id: int, schema: MaintenanceUpdate) -> Optional[PipelineMaintenance]:
        db_maintenance = WaterPipelineRepository.get_maintenance_by_id(db, maintenance_id)
        if not db_maintenance:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_maintenance, key, value)

        # Automatically update pipeline status back to ACTIVE if completed
        if schema.status == "COMPLETED":
            pipeline = WaterPipelineRepository.get_pipeline_by_id(db, db_maintenance.pipeline_id)
            if pipeline:
                pipeline.current_status = "ACTIVE"

        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance

    @staticmethod
    def delete_maintenance(db: Session, maintenance_id: int) -> bool:
        db_maintenance = WaterPipelineRepository.get_maintenance_by_id(db, maintenance_id)
        if not db_maintenance:
            return False
        db.delete(db_maintenance)
        db.commit()
        return True

def generate_unique_tank_number(db: Session) -> str:
    while True:
        num = f"WTK-{random.randint(100000, 999999)}"
        exists = db.query(WaterTank).filter(WaterTank.tank_number == num).first()
        if not exists:
            return num

class WaterTankRepository:
    @staticmethod
    def create_tank(db: Session, schema: TankCreate, creator_id: Optional[int] = None) -> WaterTank:
        tank_num = schema.tank_number or generate_unique_tank_number(db)
        db_tank = WaterTank(
            tank_number=tank_num,
            tank_name=schema.tank_name,
            tank_type=schema.tank_type,
            zone=schema.zone,
            ward=schema.ward,
            area=schema.area,
            address=schema.address,
            latitude=schema.latitude,
            longitude=schema.longitude,
            capacity_liters=schema.capacity_liters,
            current_level_liters=schema.current_level_liters or 0.0,
            minimum_level=schema.minimum_level,
            maximum_level=schema.maximum_level,
            water_source=schema.water_source,
            pipeline_id=schema.pipeline_id,
            installation_date=schema.installation_date,
            last_cleaned_date=schema.last_cleaned_date,
            next_cleaning_date=schema.next_cleaning_date,
            status=schema.status or "ACTIVE",
            remarks=schema.remarks,
            created_by=creator_id,
            updated_by=creator_id
        )
        db.add(db_tank)
        db.commit()
        db.refresh(db_tank)
        return db_tank

    @staticmethod
    def get_tank_by_id(db: Session, tank_id: int) -> Optional[WaterTank]:
        return db.query(WaterTank).filter(WaterTank.id == tank_id).first()

    @staticmethod
    def get_tank_by_number(db: Session, tank_number: str) -> Optional[WaterTank]:
        return db.query(WaterTank).filter(WaterTank.tank_number == tank_number).first()

    @staticmethod
    def update_tank(db: Session, tank_id: int, schema: TankUpdate, updater_id: Optional[int] = None) -> Optional[WaterTank]:
        db_tank = WaterTankRepository.get_tank_by_id(db, tank_id)
        if not db_tank:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tank, key, value)

        # Trigger automatic status recalculation if current level or capacity changed
        if "current_level_liters" in update_data or "capacity_liters" in update_data:
            WaterTankRepository._sync_tank_status(db_tank, db_tank.current_level_liters)

        db_tank.updated_by = updater_id
        db_tank.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_tank)
        return db_tank

    @staticmethod
    def delete_tank(db: Session, tank_id: int) -> bool:
        db_tank = WaterTankRepository.get_tank_by_id(db, tank_id)
        if not db_tank:
            return False
        db.delete(db_tank)
        db.commit()
        return True

    @staticmethod
    def list_tanks(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        tank_type: Optional[str] = None,
        status: Optional[str] = None,
        ward: Optional[str] = None,
        zone: Optional[str] = None,
        water_source: Optional[str] = None
    ) -> Tuple[List[WaterTank], int]:
        query = db.query(WaterTank)

        if tank_type:
            query = query.filter(WaterTank.tank_type == tank_type)
        if status:
            query = query.filter(WaterTank.status == status)
        if ward:
            query = query.filter(WaterTank.ward == ward)
        if zone:
            query = query.filter(WaterTank.zone == zone)
        if water_source:
            query = query.filter(WaterTank.water_source == water_source)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WaterTank.tank_number.ilike(search_pattern),
                    WaterTank.tank_name.ilike(search_pattern),
                    WaterTank.ward.ilike(search_pattern),
                    WaterTank.area.ilike(search_pattern),
                    WaterTank.zone.ilike(search_pattern)
                )
            )

        query = query.order_by(WaterTank.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total_items

    @staticmethod
    def _sync_tank_status(tank: WaterTank, water_level: float):
        if tank.status not in ["UNDER_MAINTENANCE", "INACTIVE"]:
            if water_level <= 0:
                tank.status = "EMPTY"
            elif tank.minimum_level is not None and water_level <= tank.minimum_level:
                tank.status = "LOW_LEVEL"
            elif tank.minimum_level is None and (water_level / tank.capacity_liters) <= 0.2:
                tank.status = "LOW_LEVEL"
            elif tank.maximum_level is not None and water_level >= tank.maximum_level:
                tank.status = "FULL"
            elif water_level >= tank.capacity_liters:
                tank.status = "FULL"
            else:
                tank.status = "ACTIVE"

    @staticmethod
    def update_water_level(db: Session, tank_id: int, water_level: float, updater_id: Optional[int] = None) -> Optional[WaterTank]:
        db_tank = WaterTankRepository.get_tank_by_id(db, tank_id)
        if not db_tank:
            return None

        db_tank.current_level_liters = water_level
        WaterTankRepository._sync_tank_status(db_tank, water_level)

        db_tank.updated_by = updater_id
        db_tank.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_tank)
        return db_tank

    # Refills CRUD
    @staticmethod
    def create_refill(db: Session, tank_id: int, schema: TankRefillCreate) -> Optional[TankRefillHistory]:
        tank = WaterTankRepository.get_tank_by_id(db, tank_id)
        if not tank:
            return None

        prev = tank.current_level_liters
        current = min(prev + schema.refilled_amount, tank.capacity_liters)

        db_refill = TankRefillHistory(
            tank_id=tank_id,
            refill_date=schema.refill_date,
            previous_level=prev,
            refilled_amount=schema.refilled_amount,
            current_level=current,
            water_source=tank.water_source,
            operator_name=schema.operator_name,
            remarks=schema.remarks
        )
        db.add(db_refill)

        # Update water level on tank
        tank.current_level_liters = current
        WaterTankRepository._sync_tank_status(tank, current)

        db.commit()
        db.refresh(db_refill)
        return db_refill

    @staticmethod
    def get_refills_for_tank(db: Session, tank_id: int) -> List[TankRefillHistory]:
        return db.query(TankRefillHistory).filter(TankRefillHistory.tank_id == tank_id).order_by(TankRefillHistory.refill_date.desc()).all()

    # Maintenance CRUD
    @staticmethod
    def create_maintenance(db: Session, tank_id: int, schema: TankMaintenanceCreate) -> Optional[TankMaintenanceHistory]:
        tank = WaterTankRepository.get_tank_by_id(db, tank_id)
        if not tank:
            return None

        db_maintenance = TankMaintenanceHistory(
            tank_id=tank_id,
            maintenance_type=schema.maintenance_type,
            reason=schema.reason,
            start_date=schema.start_date,
            end_date=schema.end_date,
            assigned_worker=schema.assigned_worker,
            status=schema.status or "SCHEDULED",
            remarks=schema.remarks
        )
        db.add(db_maintenance)

        # Update status if in progress
        if schema.status in ["SCHEDULED", "IN_PROGRESS"]:
            tank.status = "UNDER_MAINTENANCE"
        elif schema.status == "COMPLETED":
            # If maintenance type is CLEANING, update last_cleaned_date
            if schema.maintenance_type == "CLEANING":
                tank.last_cleaned_date = schema.start_date
            tank.status = "ACTIVE"

        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance

    @staticmethod
    def get_maintenances_for_tank(db: Session, tank_id: int) -> List[TankMaintenanceHistory]:
        return db.query(TankMaintenanceHistory).filter(TankMaintenanceHistory.tank_id == tank_id).order_by(TankMaintenanceHistory.start_date.desc()).all()

    @staticmethod
    def get_maintenance_by_id(db: Session, maintenance_id: int) -> Optional[TankMaintenanceHistory]:
        return db.query(TankMaintenanceHistory).filter(TankMaintenanceHistory.id == maintenance_id).first()

    @staticmethod
    def update_maintenance(db: Session, maintenance_id: int, schema: TankMaintenanceUpdate) -> Optional[TankMaintenanceHistory]:
        db_maintenance = WaterTankRepository.get_maintenance_by_id(db, maintenance_id)
        if not db_maintenance:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_maintenance, key, value)

        # Restore status to active if completed
        if schema.status == "COMPLETED":
            tank = WaterTankRepository.get_tank_by_id(db, db_maintenance.tank_id)
            if tank:
                if db_maintenance.maintenance_type == "CLEANING":
                    tank.last_cleaned_date = db_maintenance.start_date
                tank.status = "ACTIVE"

        db.commit()
        db.refresh(db_maintenance)
        return db_maintenance

    @staticmethod
    def delete_maintenance(db: Session, maintenance_id: int) -> bool:
        db_maintenance = WaterTankRepository.get_maintenance_by_id(db, maintenance_id)
        if not db_maintenance:
            return False
        db.delete(db_maintenance)
        db.commit()
        return True

    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        from datetime import date
        today = date.today()

        total = db.query(WaterTank).count()
        active = db.query(WaterTank).filter(WaterTank.status == "ACTIVE").count()
        low_level = db.query(WaterTank).filter(WaterTank.status == "LOW_LEVEL").count()
        empty = db.query(WaterTank).filter(WaterTank.status == "EMPTY").count()
        maint = db.query(WaterTank).filter(WaterTank.status == "UNDER_MAINTENANCE").count()
        today_refills = db.query(TankRefillHistory).filter(TankRefillHistory.refill_date == today).count()

        return {
            "total_tanks": total,
            "active_tanks": active,
            "low_level_tanks": low_level,
            "empty_tanks": empty,
            "maintenance_tanks": maint,
            "today_refills": today_refills
        }

def generate_unique_report_number(db: Session) -> str:
    while True:
        num = f"WQR-{random.randint(100000, 999999)}"
        exists = db.query(WaterQuality).filter(WaterQuality.report_number == num).first()
        if not exists:
            return num

def generate_unique_inspection_number(db: Session) -> str:
    while True:
        num = f"QIS-{random.randint(100000, 999999)}"
        exists = db.query(QualityInspectionSchedule).filter(QualityInspectionSchedule.inspection_number == num).first()
        if not exists:
            return num

class WaterQualityRepository:
    @staticmethod
    def calculate_quality_score(report: WaterQuality) -> float:
        if report.bacteria_present:
            return 0.0
        
        score = 100.0
        # pH level: ideal is 7.0. Penalty is abs(ph_level - 7.0) * 15. Max penalty 30.
        ph_penalty = abs(report.ph_level - 7.0) * 15.0
        score -= min(ph_penalty, 30.0)
        
        # TDS: ideal is < 150. Penalty is max(0, (tds - 150) / 10). Max penalty 30.
        if report.tds > 150.0:
            tds_penalty = (report.tds - 150.0) / 10.0
            score -= min(tds_penalty, 30.0)
            
        # Turbidity: ideal is < 0.5 NTU. Penalty is max(0, (turbidity - 0.5) * 10). Max penalty 20.
        if report.turbidity > 0.5:
            turb_penalty = (report.turbidity - 0.5) * 10.0
            score -= min(turb_penalty, 20.0)
            
        # Chlorine: residual ideal is 1.0 mg/L. Penalty is abs(chlorine_level - 1.0) * 10. Max penalty 10.
        chlor_penalty = abs(report.chlorine_level - 1.0) * 10.0
        score -= min(chlor_penalty, 10.0)
        
        # Fluoride: ideal is < 1.0. penalty is max(0, (fluoride - 1.0) * 20). Max penalty 10.
        if report.fluoride is not None and report.fluoride > 1.0:
            fl_penalty = (report.fluoride - 1.0) * 20.0
            score -= min(fl_penalty, 10.0)
            
        return max(0.0, score)

    @staticmethod
    def create_report(db: Session, schema: WaterQualityCreate, creator_id: Optional[int] = None) -> WaterQuality:
        rep_num = schema.report_number or generate_unique_report_number(db)
        db_report = WaterQuality(
            report_number=rep_num,
            zone=schema.zone,
            ward=schema.ward,
            area=schema.area,
            pipeline_id=schema.pipeline_id,
            tank_id=schema.tank_id,
            sample_location=schema.sample_location,
            sample_type=schema.sample_type,
            sample_date=schema.sample_date,
            tested_by=schema.tested_by,
            laboratory_name=schema.laboratory_name,
            ph_level=schema.ph_level,
            tds=schema.tds,
            turbidity=schema.turbidity,
            chlorine_level=schema.chlorine_level,
            hardness=schema.hardness,
            iron=schema.iron,
            fluoride=schema.fluoride,
            nitrate=schema.nitrate,
            bacteria_present=schema.bacteria_present or False,
            temperature=schema.temperature,
            odor=schema.odor,
            color=schema.color,
            taste=schema.taste,
            overall_status="UNDER_REVIEW", # Will be computed in Service
            remarks=schema.remarks,
            next_test_date=schema.next_test_date,
            created_by=creator_id,
            updated_by=creator_id
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        db_report.quality_score = WaterQualityRepository.calculate_quality_score(db_report)
        return db_report

    @staticmethod
    def get_report_by_id(db: Session, report_id: int) -> Optional[WaterQuality]:
        report = db.query(WaterQuality).filter(WaterQuality.id == report_id).first()
        if report:
            report.quality_score = WaterQualityRepository.calculate_quality_score(report)
        return report

    @staticmethod
    def get_report_by_number(db: Session, report_number: str) -> Optional[WaterQuality]:
        report = db.query(WaterQuality).filter(WaterQuality.report_number == report_number).first()
        if report:
            report.quality_score = WaterQualityRepository.calculate_quality_score(report)
        return report

    @staticmethod
    def update_report(db: Session, report_id: int, schema: WaterQualityUpdate, updater_id: Optional[int] = None) -> Optional[WaterQuality]:
        db_report = WaterQualityRepository.get_report_by_id(db, report_id)
        if not db_report:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_report, key, value)

        db_report.updated_by = updater_id
        db_report.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_report)
        db_report.quality_score = WaterQualityRepository.calculate_quality_score(db_report)
        return db_report

    @staticmethod
    def delete_report(db: Session, report_id: int) -> bool:
        db_report = WaterQualityRepository.get_report_by_id(db, report_id)
        if not db_report:
            return False
        db.delete(db_report)
        db.commit()
        return True

    @staticmethod
    def list_reports(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        overall_status: Optional[str] = None,
        zone: Optional[str] = None,
        ward: Optional[str] = None,
        sample_type: Optional[str] = None,
        sample_date: Optional[date] = None
    ) -> Tuple[List[WaterQuality], int]:
        query = db.query(WaterQuality)

        if overall_status:
            query = query.filter(WaterQuality.overall_status == overall_status)
        if zone:
            query = query.filter(WaterQuality.zone == zone)
        if ward:
            query = query.filter(WaterQuality.ward == ward)
        if sample_type:
            query = query.filter(WaterQuality.sample_type == sample_type)
        if sample_date:
            query = query.filter(WaterQuality.sample_date == sample_date)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WaterQuality.report_number.ilike(search_pattern),
                    WaterQuality.ward.ilike(search_pattern),
                    WaterQuality.area.ilike(search_pattern),
                    WaterQuality.tested_by.ilike(search_pattern),
                    WaterQuality.laboratory_name.ilike(search_pattern)
                )
            )

        query = query.order_by(WaterQuality.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        
        for item in items:
            item.quality_score = WaterQualityRepository.calculate_quality_score(item)

        return items, total_items

    # Inspection schedules CRUD
    @staticmethod
    def create_inspection(db: Session, schema: QualInspectionCreate) -> QualityInspectionSchedule:
        insp_num = schema.inspection_number or generate_unique_inspection_number(db)
        db_insp = QualityInspectionSchedule(
            inspection_number=insp_num,
            zone=schema.zone,
            ward=schema.ward,
            area=schema.area,
            sample_location=schema.sample_location,
            inspection_date=schema.inspection_date,
            assigned_inspector=schema.assigned_inspector,
            status=schema.status or "SCHEDULED",
            remarks=schema.remarks
        )
        db.add(db_insp)
        db.commit()
        db.refresh(db_insp)
        return db_insp

    @staticmethod
    def get_inspection_by_id(db: Session, inspection_id: int) -> Optional[QualityInspectionSchedule]:
        return db.query(QualityInspectionSchedule).filter(QualityInspectionSchedule.id == inspection_id).first()

    @staticmethod
    def get_inspection_by_number(db: Session, inspection_number: str) -> Optional[QualityInspectionSchedule]:
        return db.query(QualityInspectionSchedule).filter(QualityInspectionSchedule.inspection_number == inspection_number).first()

    @staticmethod
    def update_inspection(db: Session, inspection_id: int, schema: QualInspectionUpdate) -> Optional[QualityInspectionSchedule]:
        db_insp = WaterQualityRepository.get_inspection_by_id(db, inspection_id)
        if not db_insp:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_insp, key, value)

        db.commit()
        db.refresh(db_insp)
        return db_insp

    @staticmethod
    def delete_inspection(db: Session, inspection_id: int) -> bool:
        db_insp = WaterQualityRepository.get_inspection_by_id(db, inspection_id)
        if not db_insp:
            return False
        db.delete(db_insp)
        db.commit()
        return True

    @staticmethod
    def list_inspections(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None
    ) -> Tuple[List[QualityInspectionSchedule], int]:
        query = db.query(QualityInspectionSchedule)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    QualityInspectionSchedule.inspection_number.ilike(search_pattern),
                    QualityInspectionSchedule.ward.ilike(search_pattern),
                    QualityInspectionSchedule.area.ilike(search_pattern),
                    QualityInspectionSchedule.assigned_inspector.ilike(search_pattern)
                )
            )

        query = query.order_by(QualityInspectionSchedule.inspection_date.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total_items

    # Alert CRUD
    @staticmethod
    def create_alert(db: Session, report_id: int, alert_type: str, severity: str, title: str, description: Optional[str] = None) -> QualityAlert:
        db_alert = QualityAlert(
            quality_report_id=report_id,
            alert_type=alert_type,
            severity=severity,
            title=title,
            description=description,
            status="ACTIVE"
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return db_alert

    @staticmethod
    def resolve_alert(db: Session, alert_id: int) -> Optional[QualityAlert]:
        db_alert = db.query(QualityAlert).filter(QualityAlert.id == alert_id).first()
        if db_alert:
            db_alert.status = "RESOLVED"
            db.commit()
            db.refresh(db_alert)
        return db_alert

    @staticmethod
    def list_alerts(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        status: Optional[str] = None,
        severity: Optional[str] = None
    ) -> Tuple[List[QualityAlert], int]:
        query = db.query(QualityAlert)

        if status:
            query = query.filter(QualityAlert.status == status)
        if severity:
            query = query.filter(QualityAlert.severity == severity)

        query = query.order_by(QualityAlert.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        
        # Populate report number
        for item in items:
            rep = db.query(WaterQuality).filter(WaterQuality.id == item.quality_report_id).first()
            item.report_number = rep.report_number if rep else None

        return items, total_items

    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        from datetime import date
        today = date.today()

        total = db.query(WaterQuality).count()
        safe = db.query(WaterQuality).filter(WaterQuality.overall_status == "SAFE").count()
        warning = db.query(WaterQuality).filter(WaterQuality.overall_status == "WARNING").count()
        unsafe = db.query(WaterQuality).filter(WaterQuality.overall_status == "UNSAFE").count()
        today_tests = db.query(WaterQuality).filter(WaterQuality.sample_date == today).count()
        
        pending_insp = db.query(QualityInspectionSchedule).filter(
            QualityInspectionSchedule.status.in_(["SCHEDULED", "IN_PROGRESS"])
        ).count()

        crit_alerts = db.query(QualityAlert).filter(
            QualityAlert.status == "ACTIVE",
            QualityAlert.severity.in_(["CRITICAL", "HIGH"])
        ).count()

        return {
            "total_reports": total,
            "safe_reports": safe,
            "warning_reports": warning,
            "unsafe_reports": unsafe,
            "today_tests": today_tests,
            "pending_inspections": pending_insp,
            "critical_alerts": crit_alerts
        }

def generate_unique_maintenance_number(db: Session) -> str:
    while True:
        num = f"WMN-{random.randint(100000, 999999)}"
        exists = db.query(MaintenanceRequest).filter(MaintenanceRequest.maintenance_number == num).first()
        if not exists:
            return num

class MaintenanceRepository:
    @staticmethod
    def create_maintenance(db: Session, schema: MaintenanceCreate, creator_id: Optional[int] = None) -> MaintenanceRequest:
        maint_num = schema.maintenance_number or generate_unique_maintenance_number(db)
        db_maint = MaintenanceRequest(
            maintenance_number=maint_num,
            maintenance_type=schema.maintenance_type,
            source_type=schema.source_type,
            source_reference_id=schema.source_reference_id,
            title=schema.title,
            description=schema.description,
            zone=schema.zone,
            ward=schema.ward,
            area=schema.area,
            priority=schema.priority or "MEDIUM",
            status=schema.status or "PENDING",
            scheduled_date=schema.scheduled_date,
            start_date=schema.start_date,
            expected_completion=schema.expected_completion,
            assigned_supervisor=schema.assigned_supervisor,
            assigned_team=schema.assigned_team,
            estimated_cost=schema.estimated_cost or 0.0,
            actual_cost=schema.actual_cost or 0.0,
            remarks=schema.remarks,
            created_by=creator_id,
            updated_by=creator_id
        )
        db.add(db_maint)
        db.commit()
        db.refresh(db_maint)
        return db_maint

    @staticmethod
    def get_maintenance_by_id(db: Session, request_id: int) -> Optional[MaintenanceRequest]:
        return db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()

    @staticmethod
    def get_maintenance_by_number(db: Session, maintenance_number: str) -> Optional[MaintenanceRequest]:
        return db.query(MaintenanceRequest).filter(MaintenanceRequest.maintenance_number == maintenance_number).first()

    @staticmethod
    def update_maintenance(db: Session, request_id: int, schema: MaintenanceUpdate, updater_id: Optional[int] = None) -> Optional[MaintenanceRequest]:
        db_maint = MaintenanceRepository.get_maintenance_by_id(db, request_id)
        if not db_maint:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_maint, key, value)

        db_maint.updated_by = updater_id
        db_maint.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_maint)
        return db_maint

    @staticmethod
    def delete_maintenance(db: Session, request_id: int) -> bool:
        db_maint = MaintenanceRepository.get_maintenance_by_id(db, request_id)
        if not db_maint:
            return False
        db.delete(db_maint)
        db.commit()
        return True

    @staticmethod
    def list_maintenance(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        maintenance_type: Optional[str] = None,
        ward: Optional[str] = None,
        zone: Optional[str] = None,
        source_type: Optional[str] = None
    ) -> Tuple[List[MaintenanceRequest], int]:
        query = db.query(MaintenanceRequest)

        if priority and str(priority).strip():
            query = query.filter(MaintenanceRequest.priority == priority)
        if status and str(status).strip():
            query = query.filter(MaintenanceRequest.status == status)
        if maintenance_type and str(maintenance_type).strip():
            query = query.filter(MaintenanceRequest.maintenance_type == maintenance_type)
        if ward and str(ward).strip():
            query = query.filter(MaintenanceRequest.ward.ilike(f"%{str(ward).strip()}%"))
        if zone and str(zone).strip():
            query = query.filter(MaintenanceRequest.zone.ilike(f"%{str(zone).strip()}%"))
        if source_type and str(source_type).strip():
            query = query.filter(MaintenanceRequest.source_type == source_type)

        if search and str(search).strip():
            search_pattern = f"%{str(search).strip()}%"
            query = query.filter(
                or_(
                    MaintenanceRequest.maintenance_number.ilike(search_pattern),
                    MaintenanceRequest.ward.ilike(search_pattern),
                    MaintenanceRequest.area.ilike(search_pattern),
                    MaintenanceRequest.assigned_supervisor.ilike(search_pattern),
                    MaintenanceRequest.title.ilike(search_pattern)
                )
            )

        query = query.order_by(MaintenanceRequest.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total_items

    # Task operations
    @staticmethod
    def create_task(db: Session, request_id: int, schema: TaskCreate) -> MaintenanceTask:
        db_task = MaintenanceTask(
            maintenance_id=request_id,
            worker_id=schema.worker_id,
            task_name=schema.task_name,
            task_description=schema.task_description,
            status=schema.status or "PENDING",
            remarks=schema.remarks
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[MaintenanceTask]:
        return db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()

    @staticmethod
    def update_task(db: Session, task_id: int, schema: TaskUpdateSchema) -> Optional[MaintenanceTask]:
        db_task = MaintenanceRepository.get_task_by_id(db, task_id)
        if not db_task:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)

        if schema.status == "IN_PROGRESS" and db_task.started_at is None:
            db_task.started_at = datetime.utcnow()
        elif schema.status == "COMPLETED" and db_task.completed_at is None:
            db_task.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def list_tasks(db: Session, request_id: int) -> List[MaintenanceTask]:
        return db.query(MaintenanceTask).filter(MaintenanceTask.maintenance_id == request_id).all()

    # Material operations
    @staticmethod
    def add_material(db: Session, request_id: int, schema: MaterialCreate) -> MaintenanceMaterial:
        db_material = MaintenanceMaterial(
            maintenance_id=request_id,
            material_name=schema.material_name,
            quantity=schema.quantity,
            unit=schema.unit,
            cost=schema.cost,
            supplier=schema.supplier
        )
        db.add(db_material)
        
        # Increment actual cost of parent maintenance job
        db_maint = MaintenanceRepository.get_maintenance_by_id(db, request_id)
        if db_maint:
            db_maint.actual_cost += (schema.cost * schema.quantity)

        db.commit()
        db.refresh(db_material)
        return db_material

    @staticmethod
    def list_materials(db: Session, request_id: int) -> List[MaintenanceMaterial]:
        return db.query(MaintenanceMaterial).filter(MaintenanceMaterial.maintenance_id == request_id).all()

    # Photo operations
    @staticmethod
    def add_photo(db: Session, request_id: int, schema: PhotoUpload, uploader_id: Optional[int] = None) -> MaintenancePhoto:
        db_photo = MaintenancePhoto(
            maintenance_id=request_id,
            photo_type=schema.photo_type,
            image_url=schema.image_url,
            uploaded_by=uploader_id or schema.uploaded_by
        )
        db.add(db_photo)
        db.commit()
        db.refresh(db_photo)
        return db_photo

    @staticmethod
    def list_photos(db: Session, request_id: int) -> List[MaintenancePhoto]:
        return db.query(MaintenancePhoto).filter(MaintenancePhoto.maintenance_id == request_id).all()

    # History operations
    @staticmethod
    def log_history(db: Session, request_id: int, action: str, performed_by: str, remarks: Optional[str] = None) -> MaintenanceHistory:
        db_hist = MaintenanceHistory(
            maintenance_id=request_id,
            action=action,
            performed_by=performed_by,
            remarks=remarks
        )
        db.add(db_hist)
        db.commit()
        db.refresh(db_hist)
        return db_hist

    @staticmethod
    def list_history(db: Session, request_id: int) -> List[MaintenanceHistory]:
        return db.query(MaintenanceHistory).filter(MaintenanceHistory.maintenance_id == request_id).order_by(MaintenanceHistory.created_at.asc()).all()

    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        from datetime import date
        today = date.today()

        total = db.query(MaintenanceRequest).count()
        pending = db.query(MaintenanceRequest).filter(MaintenanceRequest.status == "PENDING").count()
        sched = db.query(MaintenanceRequest).filter(MaintenanceRequest.status == "SCHEDULED").count()
        progress = db.query(MaintenanceRequest).filter(MaintenanceRequest.status == "IN_PROGRESS").count()
        completed = db.query(MaintenanceRequest).filter(MaintenanceRequest.status.in_(["COMPLETED", "VERIFIED"])).count()
        
        overdue = db.query(MaintenanceRequest).filter(
            MaintenanceRequest.status.notin_(["COMPLETED", "VERIFIED", "CANCELLED"]),
            MaintenanceRequest.expected_completion < today
        ).count()

        est_sum = db.query(func.sum(MaintenanceRequest.estimated_cost)).scalar() or 0.0
        act_sum = db.query(func.sum(MaintenanceRequest.actual_cost)).scalar() or 0.0

        return {
            "total_maintenance": total,
            "pending": pending,
            "scheduled": sched,
            "in_progress": progress,
            "completed": completed,
            "overdue": overdue,
            "estimated_cost": float(est_sum),
            "actual_cost": float(act_sum)
        }

def generate_unique_shutdown_number(db: Session) -> str:
    while True:
        num = f"ESD-{random.randint(100000, 999999)}"
        exists = db.query(EmergencyShutdown).filter(EmergencyShutdown.shutdown_number == num).first()
        if not exists:
            return num

class EmergencyRepository:
    @staticmethod
    def create_shutdown(db: Session, schema: EmergencyCreate, creator_id: Optional[int] = None) -> EmergencyShutdown:
        sh_num = schema.shutdown_number or generate_unique_shutdown_number(db)
        db_shutdown = EmergencyShutdown(
            shutdown_number=sh_num,
            title=schema.title,
            description=schema.description,
            emergency_type=schema.emergency_type,
            priority=schema.priority or "MEDIUM",
            status=schema.status or "DECLARED",
            zone=schema.zone,
            ward=schema.ward,
            area=schema.area,
            affected_pipeline_id=schema.affected_pipeline_id,
            affected_tank_id=schema.affected_tank_id,
            affected_schedule_id=schema.affected_schedule_id,
            reason=schema.reason,
            shutdown_start=schema.shutdown_start,
            expected_restore_time=schema.expected_restore_time,
            assigned_supervisor=schema.assigned_supervisor,
            assigned_team=schema.assigned_team,
            remarks=schema.remarks,
            created_by=creator_id,
            updated_by=creator_id
        )
        db.add(db_shutdown)
        db.commit()
        db.refresh(db_shutdown)

        # Add affected areas if supplied
        if schema.affected_areas:
            for area_schema in schema.affected_areas:
                db_area = EmergencyAffectedArea(
                    shutdown_id=db_shutdown.id,
                    zone=area_schema.zone,
                    ward=area_schema.ward,
                    area=area_schema.area,
                    population=area_schema.population or 0
                )
                db.add(db_area)
            db.commit()
            db.refresh(db_shutdown)

        return db_shutdown

    @staticmethod
    def get_shutdown_by_id(db: Session, shutdown_id: int) -> Optional[EmergencyShutdown]:
        m = db.query(EmergencyShutdown).filter(EmergencyShutdown.id == shutdown_id).first()
        if m:
            # Map dynamic schema attributes
            m.pipeline_number = m.pipeline.pipeline_number if m.pipeline else None
            m.tank_number = m.tank.tank_number if m.tank else None
            m.schedule_number = m.schedule.schedule_number if m.schedule else None
            
            for t in m.teams:
                t.worker_name = f"{t.worker.first_name} {t.worker.last_name}" if t.worker else f"Worker #{t.worker_id}"
                t.worker_skill = t.worker.skill if t.worker else "General"
        return m

    @staticmethod
    def get_shutdown_by_number(db: Session, shutdown_number: str) -> Optional[EmergencyShutdown]:
        return db.query(EmergencyShutdown).filter(EmergencyShutdown.shutdown_number == shutdown_number).first()

    @staticmethod
    def update_shutdown(db: Session, shutdown_id: int, schema: EmergencyUpdate, updater_id: Optional[int] = None) -> Optional[EmergencyShutdown]:
        db_shutdown = db.query(EmergencyShutdown).filter(EmergencyShutdown.id == shutdown_id).first()
        if not db_shutdown:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_shutdown, key, value)

        db_shutdown.updated_by = updater_id
        db_shutdown.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_shutdown)
        return EmergencyRepository.get_shutdown_by_id(db, shutdown_id)

    @staticmethod
    def delete_shutdown(db: Session, shutdown_id: int) -> bool:
        db_shutdown = db.query(EmergencyShutdown).filter(EmergencyShutdown.id == shutdown_id).first()
        if not db_shutdown:
            return False
        db.delete(db_shutdown)
        db.commit()
        return True

    @staticmethod
    def list_shutdowns(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        emergency_type: Optional[str] = None,
        ward: Optional[str] = None,
        zone: Optional[str] = None
    ) -> Tuple[List[EmergencyShutdown], int]:
        query = db.query(EmergencyShutdown)

        if priority and str(priority).strip():
            query = query.filter(EmergencyShutdown.priority == priority)
        if status and str(status).strip():
            query = query.filter(EmergencyShutdown.status == status)
        if emergency_type and str(emergency_type).strip():
            query = query.filter(EmergencyShutdown.emergency_type == emergency_type)
        if ward and str(ward).strip():
            query = query.filter(EmergencyShutdown.ward.ilike(f"%{str(ward).strip()}%"))
        if zone and str(zone).strip():
            query = query.filter(EmergencyShutdown.zone.ilike(f"%{str(zone).strip()}%"))

        if search and str(search).strip():
            search_pattern = f"%{str(search).strip()}%"
            query = query.filter(
                or_(
                    EmergencyShutdown.shutdown_number.ilike(search_pattern),
                    EmergencyShutdown.ward.ilike(search_pattern),
                    EmergencyShutdown.area.ilike(search_pattern),
                    EmergencyShutdown.title.ilike(search_pattern)
                )
            )

        query = query.order_by(EmergencyShutdown.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        
        # Populate helpers
        for m in items:
            m.pipeline_number = m.pipeline.pipeline_number if m.pipeline else None
            m.tank_number = m.tank.tank_number if m.tank else None
            m.schedule_number = m.schedule.schedule_number if m.schedule else None
            
            for t in m.teams:
                t.worker_name = f"{t.worker.first_name} {t.worker.last_name}" if t.worker else f"Worker #{t.worker_id}"
                t.worker_skill = t.worker.skill if t.worker else "General"

        return items, total_items

    # Response team operations
    @staticmethod
    def assign_team_member(db: Session, shutdown_id: int, schema: ResponseTeamCreate) -> EmergencyResponseTeam:
        db_team = EmergencyResponseTeam(
            shutdown_id=shutdown_id,
            worker_id=schema.worker_id,
            role=schema.role,
            status=schema.status or "ASSIGNED"
        )
        db.add(db_team)
        db.commit()
        db.refresh(db_team)
        
        # Resolve names
        db_team.worker_name = f"{db_team.worker.first_name} {db_team.worker.last_name}" if db_team.worker else f"Worker #{db_team.worker_id}"
        db_team.worker_skill = db_team.worker.skill if db_team.worker else "General"
        return db_team

    @staticmethod
    def list_team(db: Session, shutdown_id: int) -> List[EmergencyResponseTeam]:
        items = db.query(EmergencyResponseTeam).filter(EmergencyResponseTeam.shutdown_id == shutdown_id).all()
        for t in items:
            t.worker_name = f"{t.worker.first_name} {t.worker.last_name}" if t.worker else f"Worker #{t.worker_id}"
            t.worker_skill = t.worker.skill if t.worker else "General"
        return items

    # Timeline operations
    @staticmethod
    def log_timeline(db: Session, shutdown_id: int, action: str, performed_by: str, remarks: Optional[str] = None) -> EmergencyTimeline:
        db_timeline = EmergencyTimeline(
            shutdown_id=shutdown_id,
            action=action,
            performed_by=performed_by,
            remarks=remarks
        )
        db.add(db_timeline)
        db.commit()
        db.refresh(db_timeline)
        return db_timeline

    @staticmethod
    def list_timeline(db: Session, shutdown_id: int) -> List[EmergencyTimeline]:
        return db.query(EmergencyTimeline).filter(EmergencyTimeline.shutdown_id == shutdown_id).order_by(EmergencyTimeline.created_at.asc()).all()

    # Notification operations
    @staticmethod
    def create_notification(db: Session, shutdown_id: int, notification_title: str, notification_message: str) -> EmergencyNotification:
        db_notif = EmergencyNotification(
            shutdown_id=shutdown_id,
            notification_title=notification_title,
            notification_message=notification_message,
            notification_status="PENDING"
        )
        db.add(db_notif)
        db.commit()
        db.refresh(db_notif)
        return db_notif

    @staticmethod
    def list_notifications(db: Session, shutdown_id: int) -> List[EmergencyNotification]:
        return db.query(EmergencyNotification).filter(EmergencyNotification.shutdown_id == shutdown_id).all()

    # Dashboard metrics calculations
    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        active = db.query(EmergencyShutdown).filter(EmergencyShutdown.status != "CLOSED").count()
        resolved = db.query(EmergencyShutdown).filter(EmergencyShutdown.status.in_(["RESTORED", "CLOSED"])).count()
        critical = db.query(EmergencyShutdown).filter(EmergencyShutdown.priority == "CRITICAL", EmergencyShutdown.status != "CLOSED").count()
        
        affected_areas_count = db.query(EmergencyAffectedArea.ward).distinct().count()
        affected_citizens = db.query(func.sum(EmergencyAffectedArea.population)).scalar() or 0

        # Calculate average duration
        shutdowns_with_restore = db.query(EmergencyShutdown).filter(EmergencyShutdown.actual_restore_time.isnot(None)).all()
        total_minutes = 0.0
        count_restored = len(shutdowns_with_restore)
        
        for sd in shutdowns_with_restore:
            delta = sd.actual_restore_time - sd.shutdown_start
            total_minutes += (delta.total_seconds() / 60.0)

        avg_resolution = (total_minutes / count_restored) if count_restored > 0 else 0.0

        return {
            "active_emergencies": active,
            "resolved_emergencies": resolved,
            "critical_emergencies": critical,
            "affected_areas_count": affected_areas_count,
            "affected_citizens": int(affected_citizens),
            "avg_resolution_time_minutes": float(avg_resolution)
        }

def generate_unique_notification_number(db: Session) -> str:
    while True:
        num = f"NOT-{random.randint(100000, 999999)}"
        exists = db.query(WaterNotification).filter(WaterNotification.notification_number == num).first()
        if not exists:
            return num

class NotificationRepository:
    @staticmethod
    def create_notification(db: Session, schema: NotificationCreate, creator_id: Optional[int] = None) -> WaterNotification:
        not_num = generate_unique_notification_number(db)
        db_notif = WaterNotification(
            notification_number=not_num,
            title=schema.title,
            message=schema.message,
            notification_type=schema.notification_type,
            priority=schema.priority or "MEDIUM",
            target_type=schema.target_type,
            target_reference_id=schema.target_reference_id,
            zone=schema.zone,
            ward=schema.ward,
            area=schema.area,
            recipient_type=schema.recipient_type,
            delivery_channel=schema.delivery_channel,
            status=schema.status or "DRAFT",
            scheduled_time=schema.scheduled_time,
            created_by=creator_id,
            updated_by=creator_id
        )

        # If it's sent immediately (DRAFT is not checked, SENT is selected)
        if db_notif.status == "SENT":
            db_notif.sent_time = datetime.utcnow()

        db.add(db_notif)
        db.commit()
        db.refresh(db_notif)

        # Generate recipients based on type
        recipients_list = []
        if schema.recipient_type == "FIELD_WORKERS":
            workers = db.query(WaterFieldWorker).filter(WaterFieldWorker.employment_status == "ACTIVE").all()
            for w in workers:
                recipients_list.append({
                    "recipient_id": w.id,
                    "recipient_name": f"{w.first_name} {w.last_name}"
                })
        elif schema.recipient_type == "AUTHORITY":
            recipients_list = [
                {"recipient_id": 1, "recipient_name": "Chief Operations Engineer"},
                {"recipient_id": 2, "recipient_name": "Water Superintendent"},
                {"recipient_id": 3, "recipient_name": "Department Administrator"}
            ]
        elif schema.recipient_type == "SPECIFIC_USER":
            recipients_list = [
                {"recipient_id": schema.target_reference_id, "recipient_name": f"User #{schema.target_reference_id}"}
            ]
        elif schema.recipient_type == "SPECIFIC_WARD":
            recipients_list = [
                {"recipient_id": None, "recipient_name": f"Ward {schema.ward} Residents"}
            ]
        elif schema.recipient_type == "SPECIFIC_AREA":
            recipients_list = [
                {"recipient_id": None, "recipient_name": f"Ward {schema.ward} - Area {schema.area} Residents"}
            ]
        else: # ALL_CITIZENS
            recipients_list = [
                {"recipient_id": None, "recipient_name": "All Registered Citizens"}
            ]

        # Save recipients
        db_notif.recipient_count = len(recipients_list)
        for r in recipients_list:
            db_rec = NotificationRecipient(
                notification_id=db_notif.id,
                recipient_id=r["recipient_id"],
                recipient_name=r["recipient_name"],
                delivery_status="DELIVERED" if db_notif.status == "SENT" else "PENDING",
                read_status="UNREAD",
                sent_at=db_notif.sent_time if db_notif.status == "SENT" else None
            )
            db.add(db_rec)

        db.commit()
        db.refresh(db_notif)

        # Log creation history
        NotificationRepository.log_history(
            db, db_notif.id,
            action="CREATED",
            performed_by=f"User #{creator_id or 1}",
            remarks=f"Notification declared as status: {db_notif.status}."
        )

        if db_notif.status == "SENT":
            NotificationRepository.log_history(
                db, db_notif.id,
                action="SENT",
                performed_by=f"User #{creator_id or 1}",
                remarks=f"Dispatched broadcast to {db_notif.recipient_count} recipients via {db_notif.delivery_channel}."
            )

        return db_notif

    @staticmethod
    def get_notification_by_id(db: Session, notification_id: int) -> Optional[WaterNotification]:
        return db.query(WaterNotification).filter(WaterNotification.id == notification_id).first()

    @staticmethod
    def update_notification(db: Session, notification_id: int, schema: NotificationUpdate, updater_id: Optional[int] = None) -> Optional[WaterNotification]:
        db_notif = db.query(WaterNotification).filter(WaterNotification.id == notification_id).first()
        if not db_notif:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_notif, key, value)

        db_notif.updated_by = updater_id
        db_notif.updated_at = datetime.utcnow()

        if schema.status == "SENT" and not db_notif.sent_time:
            db_notif.sent_time = datetime.utcnow()
            # Update recipients status
            for r in db_notif.recipients:
                r.delivery_status = "DELIVERED"
                r.sent_at = db_notif.sent_time

        db.commit()
        db.refresh(db_notif)
        return db_notif

    @staticmethod
    def delete_notification(db: Session, notification_id: int) -> bool:
        db_notif = db.query(WaterNotification).filter(WaterNotification.id == notification_id).first()
        if not db_notif:
            return False
        db.delete(db_notif)
        db.commit()
        return True

    @staticmethod
    def list_notifications(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        type_filter: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        recipient_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Tuple[List[WaterNotification], int]:
        query = db.query(WaterNotification)

        if type_filter:
            query = query.filter(WaterNotification.notification_type == type_filter)
        if priority:
            query = query.filter(WaterNotification.priority == priority)
        if status:
            query = query.filter(WaterNotification.status == status)
        if recipient_type:
            query = query.filter(WaterNotification.recipient_type == recipient_type)
        if start_date:
            query = query.filter(WaterNotification.created_at >= start_date)
        if end_date:
            query = query.filter(WaterNotification.created_at <= end_date)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WaterNotification.notification_number.ilike(search_pattern),
                    WaterNotification.title.ilike(search_pattern),
                    WaterNotification.ward.ilike(search_pattern),
                    WaterNotification.area.ilike(search_pattern)
                )
            )

        query = query.order_by(WaterNotification.created_at.desc())
        total_items = query.count()

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total_items

    # Template CRUD
    @staticmethod
    def create_template(db: Session, schema: TemplateCreate) -> NotificationTemplate:
        db_temp = NotificationTemplate(
            template_name=schema.template_name,
            template_type=schema.template_type,
            subject=schema.subject,
            body=schema.body,
            status=schema.status or "ACTIVE"
        )
        db.add(db_temp)
        db.commit()
        db.refresh(db_temp)
        return db_temp

    @staticmethod
    def update_template(db: Session, template_id: int, schema: TemplateUpdate) -> Optional[NotificationTemplate]:
        db_temp = db.query(NotificationTemplate).filter(NotificationTemplate.id == template_id).first()
        if not db_temp:
            return None

        update_data = schema.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_temp, key, value)

        db.commit()
        db.refresh(db_temp)
        return db_temp

    @staticmethod
    def delete_template(db: Session, template_id: int) -> bool:
        db_temp = db.query(NotificationTemplate).filter(NotificationTemplate.id == template_id).first()
        if not db_temp:
            return False
        db.delete(db_temp)
        db.commit()
        return True

    @staticmethod
    def get_template_by_id(db: Session, template_id: int) -> Optional[NotificationTemplate]:
        return db.query(NotificationTemplate).filter(NotificationTemplate.id == template_id).first()

    @staticmethod
    def list_templates(db: Session) -> List[NotificationTemplate]:
        return db.query(NotificationTemplate).all()

    # History logs
    @staticmethod
    def log_history(db: Session, notification_id: int, action: str, performed_by: str, remarks: Optional[str] = None) -> NotificationHistory:
        db_hist = NotificationHistory(
            notification_id=notification_id,
            action=action,
            performed_by=performed_by,
            remarks=remarks
        )
        db.add(db_hist)
        db.commit()
        db.refresh(db_hist)
        return db_hist

    @staticmethod
    def list_history(db: Session, notification_id: int) -> List[NotificationHistory]:
        return db.query(NotificationHistory).filter(NotificationHistory.notification_id == notification_id).order_by(NotificationHistory.created_at.asc()).all()

    # Dashboard counters
    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        total = db.query(WaterNotification).count()
        sched = db.query(WaterNotification).filter(WaterNotification.status == "SCHEDULED").count()
        sent = db.query(WaterNotification).filter(WaterNotification.status == "SENT").count()
        failed = db.query(WaterNotification).filter(WaterNotification.status == "FAILED").count()
        
        unread = db.query(NotificationRecipient).filter(NotificationRecipient.read_status == "UNREAD").count()
        emerg = db.query(WaterNotification).filter(WaterNotification.notification_type == "EMERGENCY").count()

        return {
            "total_notifications": total,
            "scheduled": sched,
            "sent": sent,
            "failed": failed,
            "unread": unread,
            "emergency_notifications": emerg
        }


class ReportsRepository:
    @staticmethod
    def apply_filters(query, model, filters: dict):
        if not filters:
            return query
        
        # Date range filtering
        if filters.get("start_date"):
            sd = filters["start_date"]
            if hasattr(model, "created_at"):
                query = query.filter(model.created_at >= sd)
            elif hasattr(model, "supply_date"):
                query = query.filter(model.supply_date >= sd)
            elif hasattr(model, "sample_date"):
                query = query.filter(model.sample_date >= sd)
            elif hasattr(model, "start_date"):
                query = query.filter(model.start_date >= sd)
                
        if filters.get("end_date"):
            ed = filters["end_date"]
            if hasattr(model, "created_at"):
                query = query.filter(model.created_at <= ed)
            elif hasattr(model, "supply_date"):
                query = query.filter(model.supply_date <= ed)
            elif hasattr(model, "sample_date"):
                query = query.filter(model.sample_date <= ed)
            elif hasattr(model, "start_date"):
                query = query.filter(model.start_date <= ed)

        # Field filtering
        if filters.get("ward") and hasattr(model, "ward"):
            query = query.filter(model.ward == filters["ward"])
        if filters.get("area") and hasattr(model, "area"):
            query = query.filter(model.area == filters["area"])
        if filters.get("zone") and hasattr(model, "zone"):
            query = query.filter(model.zone == filters["zone"])
        if filters.get("status") and hasattr(model, "status"):
            query = query.filter(model.status == filters["status"])
        if filters.get("priority") and hasattr(model, "priority"):
            query = query.filter(model.priority == filters["priority"])
        if filters.get("category") and hasattr(model, "category"):
            query = query.filter(model.category == filters["category"])
        if filters.get("worker") and hasattr(model, "assigned_worker_id"):
            query = query.filter(model.assigned_worker_id == filters["worker"])
        elif filters.get("worker") and hasattr(model, "worker_id"):
            query = query.filter(model.worker_id == filters["worker"])
        if filters.get("pipeline") and hasattr(model, "pipeline_id"):
            query = query.filter(model.pipeline_id == filters["pipeline"])
        if filters.get("tank") and hasattr(model, "tank_id"):
            query = query.filter(model.tank_id == filters["tank"])

        return query

    @staticmethod
    def get_dashboard_analytics(db: Session, filters: dict) -> dict:
        # Complaints
        cq = db.query(WaterComplaint)
        cq = ReportsRepository.apply_filters(cq, WaterComplaint, filters)
        all_complaints = cq.all()
        
        total_complaints = len(all_complaints)
        pending_complaints = sum(1 for c in all_complaints if c.status in ["NEW", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"])
        resolved_complaints = sum(1 for c in all_complaints if c.status in ["RESOLVED", "VERIFIED"])
        
        # Calculate Avg resolution time
        resolved_cases = [c for c in all_complaints if c.resolved_at and c.created_at]
        if resolved_cases:
            deltas = [(c.resolved_at - c.created_at).total_seconds() / 3600.0 for c in resolved_cases]
            avg_res_time = sum(deltas) / len(deltas)
        else:
            avg_res_time = 0.0

        # Workers
        wq = db.query(WaterFieldWorker)
        all_workers = wq.all()
        workers_available = sum(1 for w in all_workers if w.availability == "AVAILABLE")
        workers_busy = sum(1 for w in all_workers if w.availability == "BUSY")
        
        # Worker efficiency
        total_assignments = db.query(WorkerAssignment).count()
        completed_assignments = db.query(WorkerAssignment).filter(WorkerAssignment.status == "COMPLETED").count()
        if total_assignments > 0:
            worker_eff = (completed_assignments / total_assignments) * 100.0
        else:
            worker_eff = 0.0

        # Pipelines
        pq = db.query(WaterPipeline)
        pq = ReportsRepository.apply_filters(pq, WaterPipeline, filters)
        all_pipelines = pq.all()
        total_pipelines = len(all_pipelines)
        damaged_pipelines = sum(1 for p in all_pipelines if p.current_status == "DAMAGED")
        
        from datetime import date
        inspections_due = db.query(WaterPipeline).filter(WaterPipeline.next_inspection <= date.today()).count()

        # Tanks
        tq = db.query(WaterTank)
        tq = ReportsRepository.apply_filters(tq, WaterTank, filters)
        all_tanks = tq.all()
        total_tanks = len(all_tanks)
        low_water_tanks = sum(1 for t in all_tanks if t.status == "LOW_LEVEL" or (t.minimum_level and t.current_level_liters <= t.minimum_level))
        
        total_capacity = sum(t.capacity_liters for t in all_tanks)
        current_level = sum(t.current_level_liters for t in all_tanks)
        tank_usage = (current_level / total_capacity * 100.0) if total_capacity > 0 else 0.0

        # Quality
        qq = db.query(WaterQuality)
        qq = ReportsRepository.apply_filters(qq, WaterQuality, filters)
        unsafe_water = qq.filter((WaterQuality.ph_level < 6.5) | (WaterQuality.ph_level > 8.5) | (WaterQuality.bacteria_present == True)).count()

        # Maintenance
        mq = db.query(MaintenanceRequest)
        mq = ReportsRepository.apply_filters(mq, MaintenanceRequest, filters)
        maintenance_in_progress = mq.filter(MaintenanceRequest.status == "IN_PROGRESS").count()

        # Emergency
        eq = db.query(EmergencyShutdown)
        eq = ReportsRepository.apply_filters(eq, EmergencyShutdown, filters)
        emergency_shutdowns = eq.filter(EmergencyShutdown.status != "CLOSED").count()

        # Notifications
        nq = db.query(WaterNotification)
        nq = ReportsRepository.apply_filters(nq, WaterNotification, filters)
        notifications_sent = nq.filter(WaterNotification.status == "SENT").count()

        # Monthly trends
        monthly_trend = {}
        for c in all_complaints:
            month_str = c.created_at.strftime("%b")
            monthly_trend[month_str] = monthly_trend.get(month_str, 0) + 1

        # Groups distributions
        cat_dist = {}
        ward_dist = {}
        status_dist = {}
        for c in all_complaints:
            cat_dist[c.category] = cat_dist.get(c.category, 0) + 1
            if c.ward:
                ward_dist[c.ward] = ward_dist.get(c.ward, 0) + 1
            status_dist[c.status] = status_dist.get(c.status, 0) + 1

        # Supply schedules text description
        today_supply = db.query(WaterSupplySchedule).filter(WaterSupplySchedule.supply_date == date.today()).count()
        upcoming_supply = db.query(WaterSupplySchedule).filter(WaterSupplySchedule.supply_date > date.today()).count()

        return {
            "total_complaints": total_complaints,
            "pending_complaints": pending_complaints,
            "resolved_complaints": resolved_complaints,
            "avg_resolution_time_hours": round(avg_res_time, 2),
            "today_water_supply": f"{today_supply} slots scheduled",
            "upcoming_supply": f"{upcoming_supply} upcoming slots",
            "workers_available": workers_available,
            "workers_busy": workers_busy,
            "worker_efficiency_pct": round(worker_eff, 1),
            "total_pipelines": total_pipelines,
            "damaged_pipelines": damaged_pipelines,
            "inspections_due": inspections_due,
            "total_tanks": total_tanks,
            "low_water_tanks": low_water_tanks,
            "tank_capacity_usage_pct": round(tank_usage, 1),
            "unsafe_water_reports": unsafe_water,
            "maintenance_in_progress": maintenance_in_progress,
            "emergency_shutdowns": emergency_shutdowns,
            "notifications_sent": notifications_sent,
            "monthly_complaints_trend": monthly_trend,
            "complaints_by_category": cat_dist,
            "complaints_by_ward": ward_dist,
            "complaints_by_status": status_dist
        }

    @staticmethod
    def get_complaints_report(db: Session, filters: dict) -> dict:
        cq = db.query(WaterComplaint)
        cq = ReportsRepository.apply_filters(cq, WaterComplaint, filters)
        complaints = cq.all()
        
        cat_dist = {}
        ward_dist = {}
        status_dist = {}
        for c in complaints:
            cat_dist[c.category] = cat_dist.get(c.category, 0) + 1
            if c.ward:
                ward_dist[c.ward] = ward_dist.get(c.ward, 0) + 1
            status_dist[c.status] = status_dist.get(c.status, 0) + 1

        resolved_cases = [c for c in complaints if c.resolved_at and c.created_at]
        if resolved_cases:
            deltas = [(c.resolved_at - c.created_at).total_seconds() / 3600.0 for c in resolved_cases]
            avg_res_time = sum(deltas) / len(deltas)
        else:
            avg_res_time = 0.0

        recent = [{
            "id": c.id, "number": c.complaint_number, "title": c.title,
            "category": c.category, "status": c.status, "created_at": c.created_at.isoformat()
        } for c in complaints[:20]]

        return {
            "total_complaints": len(complaints),
            "by_category": cat_dist,
            "by_ward": ward_dist,
            "by_status": status_dist,
            "avg_resolution_time_hours": round(avg_res_time, 2),
            "recent_complaints": recent
        }

    @staticmethod
    def get_workers_report(db: Session, filters: dict) -> dict:
        workers = db.query(WaterFieldWorker).all()
        
        available = sum(1 for w in workers if w.availability == "AVAILABLE")
        busy = sum(1 for w in workers if w.availability == "BUSY")
        
        # Calculate worker efficiency
        efficiency_list = []
        for w in workers:
            total_tasks = db.query(WorkerAssignment).filter(WorkerAssignment.worker_id == w.id).count()
            completed_tasks = db.query(WorkerAssignment).filter(
                WorkerAssignment.worker_id == w.id, 
                WorkerAssignment.status == "COMPLETED"
            ).count()
            
            # Avg completion time
            assignments = db.query(WorkerAssignment).filter(
                WorkerAssignment.worker_id == w.id,
                WorkerAssignment.status == "COMPLETED"
            ).all()
            if assignments:
                # We don't have resolved_at or completed_at directly in worker_assignments, 
                # but we can check assignment updated_at or verify_status to get completion duration.
                # Fallback to 4 hours average if empty, or calculate using updated_at - created_at.
                durations = [(a.updated_at - a.created_at).total_seconds() / 3600.0 for a in assignments]
                avg_time = sum(durations) / len(durations)
            else:
                avg_time = 0.0

            efficiency_list.append({
                "worker_id": w.id,
                "name": f"{w.first_name} {w.last_name}",
                "tasks_completed": completed_tasks,
                "avg_time_hours": round(avg_time, 1),
                "completion_rate_pct": round((completed_tasks / total_tasks * 100.0) if total_tasks > 0 else 0.0, 1)
            })

        # Top performers
        top = sorted(efficiency_list, key=lambda x: x["tasks_completed"], reverse=True)[:5]

        return {
            "total_workers": len(workers),
            "available_workers": available,
            "busy_workers": busy,
            "worker_efficiency": efficiency_list,
            "top_performing": top
        }

    @staticmethod
    def get_supply_report(db: Session, filters: dict) -> dict:
        sq = db.query(WaterSupplySchedule)
        sq = ReportsRepository.apply_filters(sq, WaterSupplySchedule, filters)
        schedules = sq.all()
        
        by_type = {}
        by_ward = {}
        for s in schedules:
            by_type[s.supply_type] = by_type.get(s.supply_type, 0) + 1
            if s.ward:
                by_ward[s.ward] = by_ward.get(s.ward, 0) + 1

        trends = {}
        for s in schedules:
            date_str = s.supply_date.strftime("%Y-%m-%d")
            trends[date_str] = trends.get(date_str, 0) + 1

        return {
            "total_schedules": len(schedules),
            "total_volume_mgd": len(schedules) * 1.5, # Mock conversion volume
            "by_type": by_type,
            "by_ward": by_ward,
            "supply_trends": trends
        }

    @staticmethod
    def get_pipelines_report(db: Session, filters: dict) -> dict:
        pq = db.query(WaterPipeline)
        pq = ReportsRepository.apply_filters(pq, WaterPipeline, filters)
        pipelines = pq.all()
        
        by_condition = {}
        by_material = {}
        by_type = {}
        for p in pipelines:
            by_condition[p.condition] = by_condition.get(p.condition, 0) + 1
            by_material[p.material] = by_material.get(p.material, 0) + 1
            by_type[p.pipeline_type] = by_type.get(p.pipeline_type, 0) + 1

        damaged_count = sum(1 for p in pipelines if p.current_status == "DAMAGED")
        from datetime import date
        due_count = db.query(WaterPipeline).filter(WaterPipeline.next_inspection <= date.today()).count()

        return {
            "total_pipelines": len(pipelines),
            "by_condition": by_condition,
            "by_material": by_material,
            "by_type": by_type,
            "damaged_pipelines_count": damaged_count,
            "inspections_due_count": due_count
        }

    @staticmethod
    def get_tanks_report(db: Session, filters: dict) -> dict:
        tq = db.query(WaterTank)
        tq = ReportsRepository.apply_filters(tq, WaterTank, filters)
        tanks = tq.all()
        
        low_water = sum(1 for t in tanks if t.status == "LOW_LEVEL" or (t.minimum_level and t.current_level_liters <= t.minimum_level))
        
        total_capacity = sum(t.capacity_liters for t in tanks)
        current_level = sum(t.current_level_liters for t in tanks)
        avg_level = (current_level / total_capacity * 100.0) if total_capacity > 0 else 0.0

        return {
            "total_tanks": len(tanks),
            "low_water_tanks": low_water,
            "avg_water_level_pct": round(avg_level, 1),
            "total_capacity_liters": total_capacity,
            "current_level_liters": current_level
        }

    @staticmethod
    def get_quality_report(db: Session, filters: dict) -> dict:
        qq = db.query(WaterQuality)
        qq = ReportsRepository.apply_filters(qq, WaterQuality, filters)
        reports = qq.all()
        
        unsafe = sum(1 for r in reports if r.ph_level < 6.5 or r.ph_level > 8.5 or r.bacteria_present)
        warning = sum(1 for r in reports if (6.5 <= r.ph_level <= 6.9 or 8.1 <= r.ph_level <= 8.5) and not r.bacteria_present)
        safe = sum(1 for r in reports if 7.0 <= r.ph_level <= 8.0 and not r.bacteria_present)
        
        ph_sum = sum(r.ph_level for r in reports)
        tds_sum = sum(r.tds for r in reports)
        count = len(reports)
        
        avg_ph = (ph_sum / count) if count > 0 else 7.0
        avg_tds = (tds_sum / count) if count > 0 else 250.0

        return {
            "total_reports": count,
            "unsafe_reports_count": unsafe,
            "warning_reports_count": warning,
            "safe_reports_count": safe,
            "avg_ph_level": round(avg_ph, 2),
            "avg_tds_level": round(avg_tds, 1)
        }

    @staticmethod
    def get_maintenance_report(db: Session, filters: dict) -> dict:
        mq = db.query(MaintenanceRequest)
        mq = ReportsRepository.apply_filters(mq, MaintenanceRequest, filters)
        requests = mq.all()
        
        in_progress = sum(1 for r in requests if r.status == "IN_PROGRESS")
        completed = sum(1 for r in requests if r.status == "COMPLETED")
        
        est_cost = sum(r.estimated_cost for r in requests if r.estimated_cost)
        act_cost = sum(r.actual_cost for r in requests if r.actual_cost)

        # Avg completion time (days)
        completed_cases = [r for r in requests if r.end_date and r.start_date]
        if completed_cases:
            deltas = [(r.end_date - r.start_date).days for r in completed_cases]
            avg_days = sum(deltas) / len(deltas)
        else:
            avg_days = 0.0

        return {
            "total_requests": len(requests),
            "in_progress_count": in_progress,
            "completed_count": completed,
            "total_estimated_cost": est_cost,
            "total_actual_cost": act_cost,
            "avg_completion_time_days": round(avg_days, 1)
        }

    @staticmethod
    def get_emergency_report(db: Session, filters: dict) -> dict:
        eq = db.query(EmergencyShutdown)
        eq = ReportsRepository.apply_filters(eq, EmergencyShutdown, filters)
        emergencies = eq.all()
        
        active = sum(1 for e in emergencies if e.status in ["DECLARED", "IN_PROGRESS", "SUPPLY_STOPPED", "REPAIRING", "TESTING"])
        resolved = sum(1 for e in emergencies if e.status in ["RESTORED", "CLOSED"])
        
        # Avg response time: duration in minutes from start to restore
        durations = []
        for e in emergencies:
            if e.shutdown_start and e.expected_restore_time: # using expected/actual restore
                durations.append((e.expected_restore_time - e.shutdown_start).total_seconds() / 60.0)
        avg_res = sum(durations) / len(durations) if durations else 0.0

        wards = list(set(e.ward for e in emergencies if e.ward))

        return {
            "total_emergencies": len(emergencies),
            "active_emergencies": active,
            "resolved_emergencies": resolved,
            "avg_response_time_minutes": round(avg_res, 1),
            "affected_wards": wards
        }

    @staticmethod
    def get_notifications_report(db: Session, filters: dict) -> dict:
        nq = db.query(WaterNotification)
        nq = ReportsRepository.apply_filters(nq, WaterNotification, filters)
        notifications = nq.all()
        
        by_channel = {}
        by_type = {}
        for n in notifications:
            by_channel[n.delivery_channel] = by_channel.get(n.delivery_channel, 0) + 1
            by_type[n.notification_type] = by_type.get(n.notification_type, 0) + 1

        sent_count = sum(1 for n in notifications if n.status == "SENT")
        success_rate = (sent_count / len(notifications) * 100.0) if notifications else 100.0

        return {
            "total_sent": sent_count,
            "by_channel": by_channel,
            "by_type": by_type,
            "delivery_success_rate": round(success_rate, 1)
        }


class CitizenRepository:
    @staticmethod
    def list_citizens(
        db: Session,
        search: Optional[str] = None,
        ward: Optional[str] = None,
        area: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ):
        from modules.users.model import Profile
        from .model import WaterCitizenAccess, WaterComplaint

        query = db.query(Profile, WaterCitizenAccess).outerjoin(
            WaterCitizenAccess, Profile.user_id == WaterCitizenAccess.user_id
        )

        if search:
            query = query.filter(
                Profile.full_name.ilike(f"%{search}%") |
                Profile.phone_number.ilike(f"%{search}%")
            )

        if ward:
            query = query.filter(WaterCitizenAccess.ward == ward)
        if area:
            query = query.filter(WaterCitizenAccess.area == area)
        if status:
            if status == "ENABLED":
                query = query.filter((WaterCitizenAccess.service_status == "ENABLED") | (WaterCitizenAccess.service_status == None))
            else:
                query = query.filter(WaterCitizenAccess.service_status == status)

        total = query.count()
        results = query.offset((page - 1) * page_size).limit(page_size).all()

        items = []
        for profile, access in results:
            uid = profile.user_id
            complaints_count = db.query(WaterComplaint).filter(WaterComplaint.citizen_id == uid).count()
            
            items.append({
                "id": profile.id,
                "user_id": uid,
                "full_name": profile.full_name,
                "email": f"citizen_{uid}@city.gov",
                "phone_number": profile.phone_number,
                "ward": access.ward if access else None,
                "area": access.area if access else None,
                "registered_date": profile.created_at.strftime("%Y-%m-%d") if profile.created_at else "",
                "service_status": access.service_status if access else "ENABLED",
                "complaint_count": complaints_count
            })

        return total, items

    @staticmethod
    def get_citizen_detail(db: Session, user_id: int):
        from modules.users.model import Profile
        from .model import WaterCitizenAccess, WaterComplaint, NotificationRecipient

        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Citizen profile not found.")

        access = db.query(WaterCitizenAccess).filter(WaterCitizenAccess.user_id == user_id).first()
        
        all_complaints = db.query(WaterComplaint).filter(WaterComplaint.citizen_id == user_id).all()
        total_complaints = len(all_complaints)
        resolved = sum(1 for c in all_complaints if c.status in ["RESOLVED", "VERIFIED"])
        pending = total_complaints - resolved

        notif_count = db.query(NotificationRecipient).filter(NotificationRecipient.recipient_id == user_id).count()

        citizen_data = {
            "id": profile.id,
            "user_id": user_id,
            "full_name": profile.full_name,
            "email": f"citizen_{user_id}@city.gov",
            "phone_number": profile.phone_number,
            "ward": access.ward if access else None,
            "area": access.area if access else None,
            "registered_date": profile.created_at.strftime("%Y-%m-%d") if profile.created_at else "",
            "service_status": access.service_status if access else "ENABLED",
            "complaint_count": total_complaints
        }

        return {
            "citizen": citizen_data,
            "resolved_complaints": resolved,
            "pending_complaints": pending,
            "water_supply_area": access.area if access else "Not Specified",
            "notification_count": notif_count
        }

    @staticmethod
    def update_service_status(db: Session, user_id: int, status: str, ward: Optional[str] = None, area: Optional[str] = None):
        from .model import WaterCitizenAccess
        
        access = db.query(WaterCitizenAccess).filter(WaterCitizenAccess.user_id == user_id).first()
        if not access:
            access = WaterCitizenAccess(user_id=user_id, service_status=status, ward=ward, area=area)
            db.add(access)
        else:
            access.service_status = status
            if ward is not None:
                access.ward = ward
            if area is not None:
                access.area = area
        db.commit()
        db.refresh(access)
        return access


class SettingsRepository:
    @staticmethod
    def get_settings(db: Session) -> WaterDepartmentSettings:
        from .model import WaterDepartmentSettings
        settings = db.query(WaterDepartmentSettings).first()
        if not settings:
            settings = WaterDepartmentSettings(
                department_name="Water Supply & Sewage Management",
                department_code="WSD-MUM-01",
                office_name="Municipal Water Authority Headquarters",
                office_email="water.support@city.gov",
                office_phone="+91 22 2456 7890",
                office_address="Water Office Building, Fort, Mumbai - 400001",
                working_days="Mon-Sat",
                working_hours="09:00 - 18:00",
                emergency_contact_name="Disaster Management Cell",
                emergency_contact_phone="+91 22 2456 7899",
                default_supply_start="06:00",
                default_supply_end="09:00",
                notification_email=True,
                notification_sms=True,
                notification_push=True,
                dashboard_refresh_interval=30,
                report_default_format="PDF",
                timezone="IST (UTC+5:30)",
                language="en"
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings

    @staticmethod
    def update_settings(db: Session, schema: DepartmentSettingsUpdate) -> WaterDepartmentSettings:
        settings = SettingsRepository.get_settings(db)
        
        update_data = schema.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(settings, key, val)
            
        db.commit()
        db.refresh(settings)
        return settings

    @staticmethod
    def get_profile(db: Session) -> DepartmentProfile:
        from .model import DepartmentProfile
        profile = db.query(DepartmentProfile).first()
        if not profile:
            profile = DepartmentProfile(
                department_logo="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=100&auto=format&fit=crop",
                department_banner="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop",
                department_description="The Water Authority manages municipal water treatment, reservoir storage facilities, pipeline leakage checks, and emergency shutdown notifications.",
                website="https://water.municipal.city.gov",
                social_links="twitter: @CityWater, facebook: CityWaterAuthority"
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    @staticmethod
    def update_profile(db: Session, schema: DepartmentProfileUpdate) -> DepartmentProfile:
        profile = SettingsRepository.get_profile(db)
        
        update_data = schema.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(profile, key, val)
            
        db.commit()
        db.refresh(profile)
        return profile











