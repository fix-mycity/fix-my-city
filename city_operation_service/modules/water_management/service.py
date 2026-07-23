from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, List, Tuple
from datetime import datetime, date
from .model import WaterComplaint, WaterFieldWorker, WorkerAssignment, WorkerTaskUpdate, AuthorityVerification, WaterSupplySchedule, WaterPipeline, PipelineInspection, PipelineMaintenance, WaterTank, TankRefillHistory, TankMaintenanceHistory, WaterQuality, QualityInspectionSchedule, QualityAlert, MaintenanceRequest, MaintenanceTask, MaintenanceMaterial, MaintenancePhoto, MaintenanceHistory, EmergencyShutdown, EmergencyAffectedArea, EmergencyResponseTeam, EmergencyTimeline, EmergencyNotification, WaterNotification, NotificationRecipient, NotificationTemplate, NotificationHistory
from .schema import (
    ComplaintCreate, ComplaintUpdate, WorkerCreate, WorkerUpdate,
    AssignmentCreate, AssignmentUpdate, WorkerTaskUpdateCreate, VerificationSchema,
    WaterSupplyCreate, WaterSupplyUpdate, WaterSupplyResponse, WaterSupplyFilter, WaterSupplyStatusUpdate,
    PipelineCreate, PipelineUpdate, PipelineResponse, PipelineList, PipelineFilter,
    InspectionCreate, InspectionUpdate, MaintenanceCreate as OldMaintCreate, MaintenanceUpdate as OldMaintUpdate,
    TankCreate, TankUpdate, TankRefillCreate, TankMaintenanceCreate, TankMaintenanceUpdate, WaterLevelUpdate,
    WaterQualityCreate, WaterQualityUpdate, InspectionCreate as QualInspectionCreate, InspectionUpdate as QualInspectionUpdate,
    MaintenanceCreate, MaintenanceUpdate, TaskCreate, TaskUpdateSchema, MaterialCreate, PhotoUpload,
    EmergencyCreate, EmergencyUpdate, ResponseTeamCreate, AffectedAreaCreate,
    NotificationCreate, NotificationUpdate, TemplateCreate, TemplateUpdate
)
from .repository import WaterComplaintRepository, WaterFieldWorkerRepository, WorkerAssignmentRepository, WaterSupplyScheduleRepository, WaterPipelineRepository, WaterTankRepository, WaterQualityRepository, MaintenanceRepository, EmergencyRepository, NotificationRepository, ReportsRepository, CitizenRepository, SettingsRepository
from .constants import (
    ComplaintCategory, 
    ComplaintPriority, 
    ComplaintStatus, 
    VALID_STATUS_TRANSITIONS,
    WorkerAvailability,
    WorkerEmploymentStatus,
    WorkerSkill,
    AssignmentStatus,
    VALID_ASSIGNMENT_TRANSITIONS,
    WaterSupplyType,
    WaterSupplyStatus,
    VALID_SUPPLY_STATUS_TRANSITIONS,
    PipelineType,
    PipelineMaterial,
    PipelineCondition,
    PipelineStatus,
    VALID_PIPELINE_STATUS_TRANSITIONS,
    TankType,
    TankStatus,
    WaterQualitySampleType,
    WaterQualityOverallStatus,
    WaterQualityAlertType,
    WaterQualityAlertSeverity,
    QualityInspectionStatus,
    MaintenanceType,
    MaintenanceSourceType,
    MaintenancePriority,
    MaintenanceStatus,
    MaintenancePhotoType,
    VALID_MAINTENANCE_STATUS_TRANSITIONS,
    EmergencyType,
    EmergencyPriority,
    EmergencyStatus,
    VALID_EMERGENCY_STATUS_TRANSITIONS,
    NotificationType,
    NotificationPriority,
    RecipientType,
    DeliveryChannel,
    NotificationStatus,
    VALID_NOTIFICATION_STATUS_TRANSITIONS
)
from .utils import hash_password

class WaterComplaintService:
    @staticmethod
    def _validate_enums(category: Optional[str], priority: Optional[str]):
        if category and category not in [c.value for c in ComplaintCategory]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category: '{category}'. Allowed: {[c.value for c in ComplaintCategory]}"
            )
        if priority and priority not in [p.value for p in ComplaintPriority]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid priority: '{priority}'. Allowed: {[p.value for p in ComplaintPriority]}"
            )

    @staticmethod
    def create_complaint(db: Session, schema: ComplaintCreate) -> WaterComplaint:
        WaterComplaintService._validate_enums(schema.category, schema.priority)
        complaint = WaterComplaintRepository.create(db, schema)
        try:
            NotificationService.trigger_automatic_notification(db, "COMPLAINT_CREATED", complaint.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")
        return complaint

    @staticmethod
    def get_complaint_by_id(db: Session, complaint_id: int) -> WaterComplaint:
        complaint = WaterComplaintRepository.get_by_id(db, complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Water complaint with ID {complaint_id} not found."
            )
        return complaint

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
        area_filter: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: Optional[str] = "newest"
    ) -> Tuple[List[WaterComplaint], int]:
        # Validate filters if supplied
        WaterComplaintService._validate_enums(category_filter, priority_filter)
        if status_filter and status_filter not in [s.value for s in ComplaintStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status filter: '{status_filter}'"
            )

        return WaterComplaintRepository.list_complaints(
            db, page, page_size, search, status_filter, 
            priority_filter, category_filter, ward_filter, 
            area_filter, start_date, end_date, sort_by
        )

    @staticmethod
    def update_complaint(db: Session, complaint_id: int, schema: ComplaintUpdate) -> WaterComplaint:
        # Validate existence
        db_complaint = WaterComplaintService.get_complaint_by_id(db, complaint_id)
        # Validate enums
        WaterComplaintService._validate_enums(schema.category, schema.priority)
        
        updated = WaterComplaintRepository.update(db, complaint_id, schema)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update water complaint."
            )
        return updated

    @staticmethod
    def delete_complaint(db: Session, complaint_id: int):
        # Validate existence
        WaterComplaintService.get_complaint_by_id(db, complaint_id)
        success = WaterComplaintRepository.delete(db, complaint_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete water complaint."
            )

    @staticmethod
    def update_complaint_status(db: Session, complaint_id: int, target_status: str, notes: Optional[str] = None) -> WaterComplaint:
        db_complaint = WaterComplaintService.get_complaint_by_id(db, complaint_id)
        current_status = db_complaint.status

        # Validate target status
        if target_status not in [s.value for s in ComplaintStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid target status: '{target_status}'"
            )

        # Validate state transition flow
        allowed_transitions = VALID_STATUS_TRANSITIONS.get(current_status, set())
        if target_status not in [s.value for s in allowed_transitions]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition complaint status from '{current_status}' to '{target_status}'."
            )

        updated = WaterComplaintRepository.update_status(db, complaint_id, target_status, notes)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update complaint status."
            )
        return updated

    @staticmethod
    def assign_worker_to_complaint(db: Session, complaint_id: int, worker_id: int, notes: Optional[str] = None) -> WaterComplaint:
        db_complaint = WaterComplaintService.get_complaint_by_id(db, complaint_id)
        current_status = db_complaint.status

        # Transition validation
        target_status = ComplaintStatus.WORKER_ASSIGNED.value
        allowed_transitions = VALID_STATUS_TRANSITIONS.get(current_status, set())
        if target_status not in [s.value for s in allowed_transitions]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot assign worker: transition from '{current_status}' to 'WORKER_ASSIGNED' is not allowed."
            )

        # In a real environment we would check if worker exists in auth_service, but since service boundaries are split, we assign directly
        updated = WaterComplaintRepository.assign_worker(db, complaint_id, worker_id, notes)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to assign worker to complaint."
            )
        return updated

    @staticmethod
    def get_dashboard_summary(db: Session) -> dict:
        return WaterComplaintRepository.get_dashboard_summary(db)

class WaterFieldWorkerService:
    @staticmethod
    def _validate_worker_data(db: Session, schema: WorkerCreate, current_id: Optional[int] = None):
        existing_email = WaterFieldWorkerRepository.get_by_email(db, schema.email)
        if existing_email and (current_id is None or existing_email.id != current_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{schema.email}' is already registered."
            )

        existing_phone = WaterFieldWorkerRepository.get_by_phone(db, schema.phone)
        if existing_phone and (current_id is None or existing_phone.id != current_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Phone number '{schema.phone}' is already registered."
            )

    @staticmethod
    def _validate_enums(availability: Optional[str], status_val: Optional[str], skill: Optional[str]):
        if availability and availability not in [a.value for a in WorkerAvailability]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid availability: '{availability}'"
            )
        if status_val and status_val not in [s.value for s in WorkerEmploymentStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: '{status_val}'"
            )
        if skill and skill not in [s.value for s in WorkerSkill]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid skill: '{skill}'"
            )

    @staticmethod
    def create_worker(db: Session, schema: WorkerCreate) -> WaterFieldWorker:
        WaterFieldWorkerService._validate_worker_data(db, schema)
        WaterFieldWorkerService._validate_enums(schema.availability, schema.employment_status, schema.skill)
        pw_hash = hash_password(schema.password)
        return WaterFieldWorkerRepository.create(db, schema, pw_hash)

    @staticmethod
    def get_worker_by_id(db: Session, worker_id: int) -> WaterFieldWorker:
        worker = WaterFieldWorkerRepository.get_by_id(db, worker_id)
        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Field worker with ID {worker_id} not found."
            )
        return worker

    @staticmethod
    def update_worker(db: Session, worker_id: int, schema: WorkerUpdate) -> WaterFieldWorker:
        db_worker = WaterFieldWorkerService.get_worker_by_id(db, worker_id)

        if schema.email:
            existing_email = WaterFieldWorkerRepository.get_by_email(db, schema.email)
            if existing_email and existing_email.id != worker_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{schema.email}' is already registered."
                )

        if schema.phone:
            existing_phone = WaterFieldWorkerRepository.get_by_phone(db, schema.phone)
            if existing_phone and existing_phone.id != worker_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Phone number '{schema.phone}' is already registered."
                )

        WaterFieldWorkerService._validate_enums(schema.availability, schema.employment_status, schema.skill)

        pw_hash = None
        if schema.password:
            pw_hash = hash_password(schema.password)

        updated = WaterFieldWorkerRepository.update(db, worker_id, schema, pw_hash)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update field worker."
            )
        return updated

    @staticmethod
    def delete_worker(db: Session, worker_id: int):
        WaterFieldWorkerService.get_worker_by_id(db, worker_id)
        success = WaterFieldWorkerRepository.delete(db, worker_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete field worker."
            )

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
        WaterFieldWorkerService._validate_enums(availability, employment_status, skill)
        return WaterFieldWorkerRepository.list_workers(
            db, page, page_size, search, availability, employment_status, skill, place, pin_code
        )

    @staticmethod
    def change_availability(db: Session, worker_id: int, availability: str) -> WaterFieldWorker:
        WaterFieldWorkerService.get_worker_by_id(db, worker_id)
        if availability not in [a.value for a in WorkerAvailability]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid availability state: '{availability}'"
            )

        updated = WaterFieldWorkerRepository.change_availability(db, worker_id, availability)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update worker availability."
            )
        return updated

    @staticmethod
    def change_status(db: Session, worker_id: int, employment_status: str) -> WaterFieldWorker:
        WaterFieldWorkerService.get_worker_by_id(db, worker_id)
        if employment_status not in [s.value for s in WorkerEmploymentStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid employment status: '{employment_status}'"
            )

        updated = WaterFieldWorkerRepository.change_status(db, worker_id, employment_status)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update worker status."
            )
        return updated

class WorkerAssignmentService:
    @staticmethod
    def _validate_assignment_creation(db: Session, schema: AssignmentCreate):
        # 1. Validate Complaint
        complaint = WaterComplaintRepository.get_by_id(db, schema.complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint with ID {schema.complaint_id} not found."
            )

        # 2. Validate Worker
        worker = WaterFieldWorkerRepository.get_by_id(db, schema.worker_id)
        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Field worker with ID {schema.worker_id} not found."
            )
        if worker.employment_status != WorkerEmploymentStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Worker {worker.first_name} {worker.last_name} is currently inactive/suspended."
            )

        # 3. Validate Deadline
        # Using tz-naive comparison since datetime.utcnow() is tz-naive
        deadline_naive = schema.deadline.replace(tzinfo=None)
        if deadline_naive <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assignment deadline must be in the future."
            )

    @staticmethod
    def create_assignment(db: Session, schema: AssignmentCreate, assigned_by: int) -> WorkerAssignment:
        WorkerAssignmentService._validate_assignment_creation(db, schema)
        
        # Check if an assignment already exists for this complaint and is not completed/verified
        existing, _ = WorkerAssignmentRepository.list_assignments(db, complaint_id=schema.complaint_id)
        active_assignments = [a for a in existing if a.status not in ["VERIFIED", "REJECTED"]]
        if active_assignments:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An active work assignment already exists for this complaint."
            )

        assignment = WorkerAssignmentRepository.create_assignment(db, schema, assigned_by)
        
        # Sync Complaint Status
        WaterComplaintRepository.update_status(db, schema.complaint_id, "WORKER_ASSIGNED", f"Assigned to worker ID: {schema.worker_id}")
        # Automatically assign worker ID in complaint
        WaterComplaintRepository.assign_worker(db, schema.complaint_id, schema.worker_id, f"Worker assigned automatically via workflow.")
        
        try:
            NotificationService.trigger_automatic_notification(db, "WORKER_ASSIGNED", assignment.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")

        return assignment

    @staticmethod
    def get_assignment_by_id(db: Session, assignment_id: int) -> WorkerAssignment:
        assignment = WorkerAssignmentRepository.get_assignment_by_id(db, assignment_id)
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Work assignment with ID {assignment_id} not found."
            )
        return assignment

    @staticmethod
    def list_assignments(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        status_val: Optional[str] = None,
        priority: Optional[str] = None,
        worker_id: Optional[int] = None,
        complaint_id: Optional[int] = None
    ) -> Tuple[List[WorkerAssignment], int]:
        return WorkerAssignmentRepository.list_assignments(
            db, page, page_size, search, status_val, priority, worker_id, complaint_id
        )

    @staticmethod
    def update_assignment(db: Session, assignment_id: int, schema: AssignmentUpdate) -> WorkerAssignment:
        db_assignment = WorkerAssignmentService.get_assignment_by_id(db, assignment_id)
        
        if schema.worker_id is not None:
            worker = WaterFieldWorkerRepository.get_by_id(db, schema.worker_id)
            if not worker:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Field worker with ID {schema.worker_id} not found."
                )
            if worker.employment_status != WorkerEmploymentStatus.ACTIVE.value:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Field worker is not active."
                )

        if schema.deadline is not None:
            deadline_naive = schema.deadline.replace(tzinfo=None)
            if deadline_naive <= datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Deadline must be in the future."
                )

        updated = WorkerAssignmentRepository.update_assignment(db, assignment_id, schema)
        if schema.worker_id is not None:
            # Sync complaint assigned worker
            WaterComplaintRepository.assign_worker(db, db_assignment.complaint_id, schema.worker_id, "Worker reassigned in assignment.")
            
        return updated

    @staticmethod
    def update_status(db: Session, assignment_id: int, target_status: str, remarks: Optional[str] = None, updated_by_id: Optional[int] = None) -> WorkerAssignment:
        db_assignment = WorkerAssignmentService.get_assignment_by_id(db, assignment_id)
        current_status = db_assignment.status

        if target_status not in [s.value for s in AssignmentStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid target status: '{target_status}'"
            )

        allowed = VALID_ASSIGNMENT_TRANSITIONS.get(current_status, set())
        if target_status not in [s.value for s in allowed]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition assignment status from '{current_status}' to '{target_status}'."
            )

        updated = WorkerAssignmentRepository.update_status(db, assignment_id, target_status, remarks)
        
        # Log update details in history
        update_schema = WorkerTaskUpdateCreate(status=target_status, remarks=remarks)
        WorkerAssignmentRepository.add_task_update(db, assignment_id, update_schema, updated_by_id)

        # Sync Complaint Status based on state flow
        complaint_status_map = {
            "TRAVELLING": "IN_PROGRESS",
            "ARRIVED": "IN_PROGRESS",
            "WORK_STARTED": "IN_PROGRESS",
            "ON_HOLD": "IN_PROGRESS",
            "COMPLETED": "COMPLETED",
            "VERIFIED": "CLOSED",
            "REOPENED": "IN_PROGRESS",
            "REJECTED": "ACCEPTED"
        }
        target_complaint_status = complaint_status_map.get(target_status)
        if target_complaint_status:
            WaterComplaintRepository.update_status(db, db_assignment.complaint_id, target_complaint_status, f"Work assignment status transitioned to {target_status}.")

        try:
            if target_status == "WORK_STARTED":
                NotificationService.trigger_automatic_notification(db, "WORK_STARTED", updated.id)
            elif target_status == "COMPLETED":
                NotificationService.trigger_automatic_notification(db, "WORK_COMPLETED", updated.id)
            elif target_status == "VERIFIED":
                NotificationService.trigger_automatic_notification(db, "COMPLAINT_VERIFIED", updated.id)
                NotificationService.trigger_automatic_notification(db, "COMPLAINT_RESOLVED", updated.complaint_id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")

        return updated

    @staticmethod
    def verify_assignment(db: Session, assignment_id: int, schema: VerificationSchema, verified_by: int) -> WorkerAssignment:
        db_assignment = WorkerAssignmentService.get_assignment_by_id(db, assignment_id)
        
        if db_assignment.status != AssignmentStatus.COMPLETED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification can only be performed on completed assignments."
            )

        # Record Verification Details
        WorkerAssignmentRepository.add_verification(db, assignment_id, schema, verified_by)

        # Approve or Reject Flow transitions
        if schema.verification_status.upper() == "APPROVED":
            target_status = AssignmentStatus.VERIFIED.value
        else:
            target_status = AssignmentStatus.REOPENED.value

        updated = WorkerAssignmentService.update_status(db, assignment_id, target_status, schema.remarks, verified_by)
        return updated

    @staticmethod
    def delete_assignment(db: Session, assignment_id: int):
        assignment = db.query(WorkerAssignment).filter(WorkerAssignment.id == assignment_id).first()
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Work assignment not found."
            )

        # 1. Update Complaint status and clear worker link
        complaint = db.query(WaterComplaint).filter(WaterComplaint.id == assignment.complaint_id).first()
        if complaint:
            complaint.status = "ACCEPTED"
            complaint.assigned_worker_id = None

        # 2. Update Worker availability back to AVAILABLE
        worker = db.query(WaterFieldWorker).filter(WaterFieldWorker.id == assignment.worker_id).first()
        if worker:
            worker.availability = "AVAILABLE"

        # 3. Delete assignment record
        db.delete(assignment)
        db.commit()


class WaterSupplyScheduleService:
    @staticmethod
    def _validate_enums(supply_type: Optional[str], status_val: Optional[str]):
        if supply_type and supply_type not in [t.value for t in WaterSupplyType]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid supply type: '{supply_type}'. Allowed: {[t.value for t in WaterSupplyType]}"
            )
        if status_val and status_val not in [s.value for s in WaterSupplyStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: '{status_val}'. Allowed: {[s.value for s in WaterSupplyStatus]}"
            )

    @staticmethod
    def _validate_timings(morning_start, morning_end, evening_start, evening_end):
        if morning_start and morning_end:
            if morning_start >= morning_end:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Morning start time must be strictly before morning end time."
                )
        elif morning_start or morning_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both morning start and end times must be provided, or both left empty."
            )

        if evening_start and evening_end:
            if evening_start >= evening_end:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Evening start time must be strictly before evening end time."
                )
        elif evening_start or evening_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both evening start and end times must be provided, or both left empty."
            )

        if not (morning_start and morning_end) and not (evening_start and evening_end):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must specify at least one supply slot (morning or evening) with valid start and end times."
            )

    @staticmethod
    def _validate_overlap(db: Session, ward: str, area: str, street: Optional[str], supply_date, morning_start, morning_end, evening_start, evening_end, exclude_id: Optional[int] = None):
        query = db.query(WaterSupplySchedule).filter(
            WaterSupplySchedule.ward == ward,
            WaterSupplySchedule.area == area,
            WaterSupplySchedule.supply_date == supply_date,
            WaterSupplySchedule.status.in_([WaterSupplyStatus.SCHEDULED.value, WaterSupplyStatus.ACTIVE.value, WaterSupplyStatus.PAUSED.value])
        )
        if street:
            query = query.filter(WaterSupplySchedule.street == street)
        if exclude_id:
            query = query.filter(WaterSupplySchedule.id != exclude_id)

        existing = query.all()
        for esc in existing:
            # Check morning overlap
            if morning_start and morning_end and esc.morning_start_time and esc.morning_end_time:
                if morning_start < esc.morning_end_time and esc.morning_start_time < morning_end:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Time conflict: Morning slot overlaps with existing schedule '{esc.schedule_number}'."
                    )
            # Check evening overlap
            if evening_start and evening_end and esc.evening_start_time and esc.evening_end_time:
                if evening_start < esc.evening_end_time and esc.evening_start_time < evening_end:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Time conflict: Evening slot overlaps with existing schedule '{esc.schedule_number}'."
                    )

    @staticmethod
    def create_schedule(db: Session, schema: WaterSupplyCreate, creator_id: Optional[int] = None) -> WaterSupplySchedule:
        # Validate inputs
        WaterSupplyScheduleService._validate_enums(schema.supply_type, schema.status)
        WaterSupplyScheduleService._validate_timings(
            schema.morning_start_time, schema.morning_end_time,
            schema.evening_start_time, schema.evening_end_time
        )
        # Validate overlap
        WaterSupplyScheduleService._validate_overlap(
            db, schema.ward, schema.area, schema.street, schema.supply_date,
            schema.morning_start_time, schema.morning_end_time,
            schema.evening_start_time, schema.evening_end_time
        )
        supply = WaterSupplyScheduleRepository.create(db, schema, creator_id)
        try:
            NotificationService.trigger_automatic_notification(db, "WATER_SUPPLY_CREATED", supply.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")
        return supply

    @staticmethod
    def get_schedule_by_id(db: Session, schedule_id: int) -> WaterSupplySchedule:
        schedule = WaterSupplyScheduleRepository.get_by_id(db, schedule_id)
        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Water supply schedule with ID {schedule_id} not found."
            )
        return schedule

    @staticmethod
    def update_schedule(db: Session, schedule_id: int, schema: WaterSupplyUpdate, updater_id: Optional[int] = None) -> WaterSupplySchedule:
        db_schedule = WaterSupplyScheduleService.get_schedule_by_id(db, schedule_id)

        # Merge new changes with existing for validation
        new_ward = schema.ward if schema.ward is not None else db_schedule.ward
        new_area = schema.area if schema.area is not None else db_schedule.area
        new_street = schema.street if schema.street is not None else db_schedule.street
        new_date = schema.supply_date if schema.supply_date is not None else db_schedule.supply_date

        morning_start = schema.morning_start_time if schema.morning_start_time is not None else db_schedule.morning_start_time
        morning_end = schema.morning_end_time if schema.morning_end_time is not None else db_schedule.morning_end_time
        evening_start = schema.evening_start_time if schema.evening_start_time is not None else db_schedule.evening_start_time
        evening_end = schema.evening_end_time if schema.evening_end_time is not None else db_schedule.evening_end_time

        # Validate enums & timings
        WaterSupplyScheduleService._validate_enums(schema.supply_type, schema.status)
        WaterSupplyScheduleService._validate_timings(morning_start, morning_end, evening_start, evening_end)

        # Validate overlap
        WaterSupplyScheduleService._validate_overlap(
            db, new_ward, new_area, new_street, new_date,
            morning_start, morning_end, evening_start, evening_end,
            exclude_id=schedule_id
        )

        updated = WaterSupplyScheduleRepository.update(db, schedule_id, schema, updater_id)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update water supply schedule."
            )
        return updated

    @staticmethod
    def delete_schedule(db: Session, schedule_id: int):
        WaterSupplyScheduleService.get_schedule_by_id(db, schedule_id)
        WaterSupplyScheduleRepository.delete(db, schedule_id)

    @staticmethod
    def update_status(db: Session, schedule_id: int, target_status: str, remarks: Optional[str] = None, updater_id: Optional[int] = None) -> WaterSupplySchedule:
        db_schedule = WaterSupplyScheduleService.get_schedule_by_id(db, schedule_id)
        current_status = db_schedule.status

        # Transition validation
        allowed_transitions = VALID_SUPPLY_STATUS_TRANSITIONS.get(current_status, set())
        if target_status not in [s.value for s in WaterSupplyStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: '{target_status}'"
            )
        if target_status not in allowed_transitions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status transition from '{current_status}' to '{target_status}' is not allowed."
            )

        updated = WaterSupplyScheduleRepository.update_status(db, schedule_id, target_status, remarks, updater_id)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update schedule status."
            )
        try:
            if target_status == "PAUSED":
                NotificationService.trigger_automatic_notification(db, "WATER_SUPPLY_PAUSED", updated.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")
        return updated

    @staticmethod
    def list_schedules(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        type_filter: Optional[str] = None,
        ward_filter: Optional[str] = None,
        zone_filter: Optional[str] = None,
        date_filter = None
    ) -> Tuple[List[WaterSupplySchedule], int]:
        # Validate filter enums if provided
        WaterSupplyScheduleService._validate_enums(type_filter, status_filter)
        return WaterSupplyScheduleRepository.list_schedules(
            db, page, page_size, search, status_filter, type_filter, ward_filter, zone_filter, date_filter
        )


class WaterPipelineService:
    @staticmethod
    def _validate_pipeline_enums(p_type: Optional[str], material: Optional[str], condition: Optional[str], status_val: Optional[str]):
        if p_type and p_type not in [t.value for t in PipelineType]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid pipeline type: '{p_type}'. Allowed: {[t.value for t in PipelineType]}"
            )
        if material and material not in [m.value for m in PipelineMaterial]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid material: '{material}'. Allowed: {[m.value for m in PipelineMaterial]}"
            )
        if condition and condition not in [c.value for c in PipelineCondition]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid condition: '{condition}'. Allowed: {[c.value for c in PipelineCondition]}"
            )
        if status_val and status_val not in [s.value for s in PipelineStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: '{status_val}'. Allowed: {[s.value for s in PipelineStatus]}"
            )

    @staticmethod
    def create_pipeline(db: Session, schema: PipelineCreate, creator_id: Optional[int] = None) -> WaterPipeline:
        # Check duplicate pipeline number if provided
        if schema.pipeline_number:
            existing = WaterPipelineRepository.get_pipeline_by_number(db, schema.pipeline_number)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Pipeline number '{schema.pipeline_number}' already exists."
                )

        WaterPipelineService._validate_pipeline_enums(
            schema.pipeline_type, schema.material, schema.condition, schema.current_status
        )
        return WaterPipelineRepository.create_pipeline(db, schema, creator_id)

    @staticmethod
    def get_pipeline_by_id(db: Session, pipeline_id: int) -> WaterPipeline:
        pipeline = WaterPipelineRepository.get_pipeline_by_id(db, pipeline_id)
        if not pipeline:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Water pipeline with ID {pipeline_id} not found."
            )
        return pipeline

    @staticmethod
    def update_pipeline(db: Session, pipeline_id: int, schema: PipelineUpdate, updater_id: Optional[int] = None) -> WaterPipeline:
        db_pipeline = WaterPipelineService.get_pipeline_by_id(db, pipeline_id)

        # Validate status transitions if status is changing
        if schema.current_status and schema.current_status != db_pipeline.current_status:
            allowed = VALID_PIPELINE_STATUS_TRANSITIONS.get(db_pipeline.current_status, set())
            if schema.current_status not in allowed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status transition from '{db_pipeline.current_status}' to '{schema.current_status}'."
                )

        WaterPipelineService._validate_pipeline_enums(
            schema.pipeline_type, schema.material, schema.condition, schema.current_status
        )

        updated = WaterPipelineRepository.update_pipeline(db, pipeline_id, schema, updater_id)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update water pipeline."
            )
        try:
            if updated.current_status in ["DAMAGED", "OUT_OF_SERVICE"]:
                NotificationService.trigger_automatic_notification(db, "PIPELINE_DAMAGED", updated.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")
        return updated

    @staticmethod
    def delete_pipeline(db: Session, pipeline_id: int):
        WaterPipelineService.get_pipeline_by_id(db, pipeline_id)
        WaterPipelineRepository.delete_pipeline(db, pipeline_id)

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
        status_val: Optional[str] = None
    ) -> Tuple[List[WaterPipeline], int]:
        WaterPipelineService._validate_pipeline_enums(pipeline_type, material, condition, status_val)
        return WaterPipelineRepository.list_pipelines(
            db, page, page_size, search, zone, ward, condition, pipeline_type, material, status_val
        )

    # Inspection validations
    @staticmethod
    def create_inspection(db: Session, pipeline_id: int, schema: InspectionCreate) -> PipelineInspection:
        # Validate next inspection date is after inspection date
        if schema.next_inspection and schema.next_inspection <= schema.inspection_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Next inspection date must be strictly after the inspection date."
            )

        if schema.condition and schema.condition not in [c.value for c in PipelineCondition]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid condition: '{schema.condition}'"
            )

        # Ensure pipeline exists
        WaterPipelineService.get_pipeline_by_id(db, pipeline_id)

        inspection = WaterPipelineRepository.create_inspection(db, pipeline_id, schema)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record pipeline inspection."
            )
        return inspection

    @staticmethod
    def update_inspection(db: Session, inspection_id: int, schema: InspectionUpdate) -> PipelineInspection:
        db_inspection = db.query(PipelineInspection).filter(PipelineInspection.id == inspection_id).first()
        if not db_inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection record with ID {inspection_id} not found."
            )

        new_date = schema.inspection_date if schema.inspection_date is not None else db_inspection.inspection_date
        new_next = schema.next_inspection if schema.next_inspection is not None else db_inspection.next_inspection

        if new_next and new_next <= new_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Next inspection date must be strictly after the inspection date."
            )

        updated = WaterPipelineRepository.update_inspection(db, inspection_id, schema)
        return updated

    @staticmethod
    def delete_inspection(db: Session, inspection_id: int):
        db_inspection = db.query(PipelineInspection).filter(PipelineInspection.id == inspection_id).first()
        if not db_inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection record with ID {inspection_id} not found."
            )
        WaterPipelineRepository.delete_inspection(db, inspection_id)

    # Maintenance validations
    @staticmethod
    def create_maintenance(db: Session, pipeline_id: int, schema: MaintenanceCreate) -> PipelineMaintenance:
        # Validate start date is before or equal to end date if end date is provided
        if schema.end_date and schema.end_date < schema.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maintenance end date cannot be before start date."
            )

        # Ensure pipeline exists
        WaterPipelineService.get_pipeline_by_id(db, pipeline_id)

        maintenance = WaterPipelineRepository.create_maintenance(db, pipeline_id, schema)
        if not maintenance:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record pipeline maintenance schedule."
            )
        return maintenance

    @staticmethod
    def update_maintenance(db: Session, maintenance_id: int, schema: MaintenanceUpdate) -> PipelineMaintenance:
        db_maintenance = db.query(PipelineMaintenance).filter(PipelineMaintenance.id == maintenance_id).first()
        if not db_maintenance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Maintenance record with ID {maintenance_id} not found."
            )

        new_start = schema.start_date if schema.start_date is not None else db_maintenance.start_date
        new_end = schema.end_date if schema.end_date is not None else db_maintenance.end_date

        if new_end and new_end < new_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maintenance end date cannot be before start date."
            )

        updated = WaterPipelineRepository.update_maintenance(db, maintenance_id, schema)
        return updated

    @staticmethod
    def delete_maintenance(db: Session, maintenance_id: int):
        db_maintenance = db.query(PipelineMaintenance).filter(PipelineMaintenance.id == maintenance_id).first()
        if not db_maintenance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Maintenance record with ID {maintenance_id} not found."
            )
        WaterPipelineRepository.delete_maintenance(db, maintenance_id)


class WaterTankService:
    @staticmethod
    def _validate_tank_enums(t_type: Optional[str], status_val: Optional[str]):
        if t_type and t_type not in [t.value for t in TankType]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid tank type: '{t_type}'. Allowed: {[t.value for t in TankType]}"
            )
        if status_val and status_val not in [s.value for s in TankStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: '{status_val}'. Allowed: {[s.value for s in TankStatus]}"
            )

    @staticmethod
    def create_tank(db: Session, schema: TankCreate, creator_id: Optional[int] = None) -> WaterTank:
        # Check duplicate tank number
        if schema.tank_number:
            existing = WaterTankRepository.get_tank_by_number(db, schema.tank_number)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tank number '{schema.tank_number}' already exists."
                )

        # Capacity validations
        if schema.capacity_liters <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tank capacity must be a positive number."
            )

        if schema.current_level_liters is not None:
            if schema.current_level_liters < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Water level cannot be negative."
                )
            if schema.current_level_liters > schema.capacity_liters:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Water level cannot exceed tank capacity."
                )

        # Cleaning schedule validation
        if schema.last_cleaned_date and schema.next_cleaning_date:
            if schema.next_cleaning_date <= schema.last_cleaned_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Next cleaning date must be after last cleaned date."
                )

        WaterTankService._validate_tank_enums(schema.order_by_type if hasattr(schema, 'order_by_type') else schema.tank_type, schema.status)
        return WaterTankRepository.create_tank(db, schema, creator_id)

    @staticmethod
    def get_tank_by_id(db: Session, tank_id: int) -> WaterTank:
        tank = WaterTankRepository.get_tank_by_id(db, tank_id)
        if not tank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Water tank with ID {tank_id} not found."
            )
        return tank

    @staticmethod
    def update_tank(db: Session, tank_id: int, schema: TankUpdate, updater_id: Optional[int] = None) -> WaterTank:
        db_tank = WaterTankService.get_tank_by_id(db, tank_id)

        # Validate capacity changes
        new_cap = schema.capacity_liters if schema.capacity_liters is not None else db_tank.capacity_liters
        new_level = schema.current_level_liters if schema.current_level_liters is not None else db_tank.current_level_liters

        if new_cap <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tank capacity must be a positive number."
            )

        if new_level < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Water level cannot be negative."
            )

        if new_level > new_cap:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Water level cannot exceed tank capacity."
            )

        # Cleaning dates
        last_clean = schema.last_cleaned_date if schema.last_cleaned_date is not None else db_tank.last_cleaned_date
        next_clean = schema.next_cleaning_date if schema.next_cleaning_date is not None else db_tank.next_cleaning_date
        if last_clean and next_clean and next_clean <= last_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Next cleaning date must be after last cleaned date."
            )

        WaterTankService._validate_tank_enums(schema.tank_type, schema.status)
        updated = WaterTankRepository.update_tank(db, tank_id, schema, updater_id)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update water tank."
            )
        return updated

    @staticmethod
    def delete_tank(db: Session, tank_id: int):
        WaterTankService.get_tank_by_id(db, tank_id)
        WaterTankRepository.delete_tank(db, tank_id)

    @staticmethod
    def list_tanks(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        tank_type: Optional[str] = None,
        status_val: Optional[str] = None,
        ward: Optional[str] = None,
        zone: Optional[str] = None,
        water_source: Optional[str] = None
    ) -> Tuple[List[WaterTank], int]:
        WaterTankService._validate_tank_enums(tank_type, status_val)
        return WaterTankRepository.list_tanks(
            db, page, page_size, search, tank_type, status_val, ward, zone, water_source
        )

    @staticmethod
    def update_water_level(db: Session, tank_id: int, water_level: float, updater_id: Optional[int] = None) -> WaterTank:
        db_tank = WaterTankService.get_tank_by_id(db, tank_id)

        if water_level < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Water level cannot be negative."
            )

        if water_level > db_tank.capacity_liters:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Water level cannot exceed tank capacity of {db_tank.capacity_liters} liters."
            )

        updated = WaterTankRepository.update_water_level(db, tank_id, water_level, updater_id)
        try:
            if updated.minimum_level is not None and water_level <= updated.minimum_level:
                NotificationService.trigger_automatic_notification(db, "TANK_LOW_LEVEL", updated.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")
        return updated

    # Refills validations
    @staticmethod
    def create_refill(db: Session, tank_id: int, schema: TankRefillCreate) -> TankRefillHistory:
        db_tank = WaterTankService.get_tank_by_id(db, tank_id)

        if schema.refilled_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refilled amount must be a positive number."
            )

        refill = WaterTankRepository.create_refill(db, tank_id, schema)
        if not refill:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record tank refill history."
            )
        return refill

    # Maintenance validations
    @staticmethod
    def create_maintenance(db: Session, tank_id: int, schema: TankMaintenanceCreate) -> TankMaintenanceHistory:
        if schema.end_date and schema.end_date < schema.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maintenance end date cannot be before start date."
            )

        WaterTankService.get_tank_by_id(db, tank_id)
        maintenance = WaterTankRepository.create_maintenance(db, tank_id, schema)
        if not maintenance:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record tank maintenance history."
            )
        return maintenance

    @staticmethod
    def update_maintenance(db: Session, maintenance_id: int, schema: TankMaintenanceUpdate) -> TankMaintenanceHistory:
        db_maintenance = db.query(TankMaintenanceHistory).filter(TankMaintenanceHistory.id == maintenance_id).first()
        if not db_maintenance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Maintenance record with ID {maintenance_id} not found."
            )

        new_start = schema.start_date if schema.start_date is not None else db_maintenance.start_date
        new_end = schema.end_date if schema.end_date is not None else db_maintenance.end_date

        if new_end and new_end < new_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maintenance end date cannot be before start date."
            )

        updated = WaterTankRepository.update_maintenance(db, maintenance_id, schema)
        return updated

    @staticmethod
    def delete_maintenance(db: Session, maintenance_id: int):
        db_maintenance = db.query(TankMaintenanceHistory).filter(TankMaintenanceHistory.id == maintenance_id).first()
        if not db_maintenance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Maintenance record with ID {maintenance_id} not found."
            )
        WaterTankRepository.delete_maintenance(db, maintenance_id)


class WaterQualityService:
    @staticmethod
    def _validate_ranges(ph: float, tds: float, turb: float, chlor: float, fl: Optional[float], nit: Optional[float]):
        if ph < 0.0 or ph > 14.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="pH level must be between 0.0 and 14.0."
            )
        if tds < 0.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="TDS level cannot be negative."
            )
        if turb < 0.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Turbidity cannot be negative."
            )
        if chlor < 0.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chlorine level cannot be negative."
            )
        if fl is not None and fl < 0.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Fluoride level cannot be negative."
            )
        if nit is not None and nit < 0.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nitrate level cannot be negative."
            )

    @staticmethod
    def _evaluate_alerts_and_status(db: Session, report: WaterQuality):
        # Clear existing active alerts for this report
        db.query(QualityAlert).filter(QualityAlert.quality_report_id == report.id).delete()
        db.commit()

        alerts_created = []

        # 1. Bacteria found -> Critical Alert
        if report.bacteria_present:
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.BACTERIA_FOUND.value,
                severity=WaterQualityAlertSeverity.CRITICAL.value,
                title="Bacteria Detected",
                description="Biological contamination found. Instant UNSAFE warning triggered."
            )
            alerts_created.append(a)

        # 2. pH level alerts
        if report.ph_level < 6.5:
            sev = WaterQualityAlertSeverity.HIGH.value if report.ph_level < 6.0 else WaterQualityAlertSeverity.MEDIUM.value
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.LOW_PH.value,
                severity=sev,
                title="Acidic pH level",
                description=f"pH level is acidic at {report.ph_level} (Standard: 6.5 - 8.5)."
            )
            alerts_created.append(a)
        elif report.ph_level > 8.5:
            sev = WaterQualityAlertSeverity.HIGH.value if report.ph_level > 9.0 else WaterQualityAlertSeverity.MEDIUM.value
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.HIGH_PH.value,
                severity=sev,
                title="Alkaline pH level",
                description=f"pH level is alkaline at {report.ph_level} (Standard: 6.5 - 8.5)."
            )
            alerts_created.append(a)

        # 3. TDS alerts
        if report.tds > 500.0:
            sev = WaterQualityAlertSeverity.HIGH.value if report.tds > 1000.0 else WaterQualityAlertSeverity.LOW.value
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.HIGH_TDS.value,
                severity=sev,
                title="Elevated TDS (Total Dissolved Solids)",
                description=f"Total dissolved solids level is elevated at {report.tds} mg/L (Standard: < 500 mg/L)."
            )
            alerts_created.append(a)

        # 4. Turbidity alerts
        if report.turbidity > 1.0:
            sev = WaterQualityAlertSeverity.HIGH.value if report.turbidity > 5.0 else WaterQualityAlertSeverity.LOW.value
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.HIGH_TURBIDITY.value,
                severity=sev,
                title="High Turbidity",
                description=f"Turbidity level is high at {report.turbidity} NTU (Standard: < 1.0 NTU)."
            )
            alerts_created.append(a)

        # 5. Chlorine alerts
        if report.chlorine_level < 0.2:
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.LOW_CHLORINE.value,
                severity=WaterQualityAlertSeverity.MEDIUM.value,
                title="Low Residual Chlorine",
                description=f"Chlorine disinfectant residual is low at {report.chlorine_level} mg/L (Standard: 0.2 - 2.0 mg/L)."
            )
            alerts_created.append(a)
        elif report.chlorine_level > 4.0:
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.CHEMICAL_CONTAMINATION.value,
                severity=WaterQualityAlertSeverity.HIGH.value,
                title="Excessive Chlorine Levels",
                description=f"Chlorine level exceeds maximum limit at {report.chlorine_level} mg/L (Standard: < 4.0 mg/L)."
            )
            alerts_created.append(a)

        # 6. Chemical alerts (Fluoride / Nitrate)
        if report.fluoride is not None and report.fluoride > 1.5:
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.CHEMICAL_CONTAMINATION.value,
                severity=WaterQualityAlertSeverity.HIGH.value,
                title="High Fluoride Concentration",
                description=f"Fluoride level is dangerously high at {report.fluoride} mg/L (Standard: < 1.5 mg/L)."
            )
            alerts_created.append(a)

        if report.nitrate is not None and report.nitrate > 45.0:
            a = WaterQualityRepository.create_alert(
                db, report.id,
                alert_type=WaterQualityAlertType.CHEMICAL_CONTAMINATION.value,
                severity=WaterQualityAlertSeverity.HIGH.value,
                title="High Nitrate Concentration",
                description=f"Nitrate level is high at {report.nitrate} mg/L (Standard: < 45.0 mg/L)."
            )
            alerts_created.append(a)

        # Determine overall status
        if any(alt.severity in [WaterQualityAlertSeverity.CRITICAL.value, WaterQualityAlertSeverity.HIGH.value] for alt in alerts_created):
            report.overall_status = WaterQualityOverallStatus.UNSAFE.value
        elif len(alerts_created) > 0:
            report.overall_status = WaterQualityOverallStatus.WARNING.value
        else:
            report.overall_status = WaterQualityOverallStatus.SAFE.value

        db.commit()

    @staticmethod
    def create_report(db: Session, schema: WaterQualityCreate, creator_id: Optional[int] = None) -> WaterQuality:
        # Check duplicate report number
        if schema.report_number:
            existing = WaterQualityRepository.get_report_by_number(db, schema.report_number)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Quality report number '{schema.report_number}' already exists."
                )

        WaterQualityService._validate_ranges(
            schema.ph_level, schema.tds, schema.turbidity, schema.chlorine_level, schema.fluoride, schema.nitrate
        )

        report = WaterQualityRepository.create_report(db, schema, creator_id)
        
        # Evaluate automatic alerts & set status
        WaterQualityService._evaluate_alerts_and_status(db, report)
        db.refresh(report)

        try:
            if report.overall_status == "UNSAFE":
                NotificationService.trigger_automatic_notification(db, "UNSAFE_WATER_QUALITY", report.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")

        return report

    @staticmethod
    def get_report_by_id(db: Session, report_id: int) -> WaterQuality:
        report = WaterQualityRepository.get_report_by_id(db, report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Water Quality Report with ID {report_id} not found."
            )
        return report

    @staticmethod
    def update_report(db: Session, report_id: int, schema: WaterQualityUpdate, updater_id: Optional[int] = None) -> WaterQuality:
        db_report = WaterQualityService.get_report_by_id(db, report_id)

        # Evaluate range changes
        new_ph = schema.ph_level if schema.ph_level is not None else db_report.ph_level
        new_tds = schema.tds if schema.tds is not None else db_report.tds
        new_turb = schema.turbidity if schema.turbidity is not None else db_report.turbidity
        new_chlor = schema.chlorine_level if schema.chlorine_level is not None else db_report.chlorine_level
        new_fl = schema.fluoride if schema.fluoride is not None else db_report.fluoride
        new_nit = schema.nitrate if schema.nitrate is not None else db_report.nitrate

        WaterQualityService._validate_ranges(new_ph, new_tds, new_turb, new_chlor, new_fl, new_nit)

        updated = WaterQualityRepository.update_report(db, report_id, schema, updater_id)
        WaterQualityService._evaluate_alerts_and_status(db, updated)
        db.refresh(updated)
        return updated

    @staticmethod
    def delete_report(db: Session, report_id: int):
        WaterQualityService.get_report_by_id(db, report_id)
        WaterQualityRepository.delete_report(db, report_id)

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
        return WaterQualityRepository.list_reports(
            db, page, page_size, search, overall_status, zone, ward, sample_type, sample_date
        )

    # Quality Inspections Scheduling logic
    @staticmethod
    def create_inspection(db: Session, schema: QualInspectionCreate) -> QualityInspectionSchedule:
        if schema.inspection_number:
            existing = WaterQualityRepository.get_inspection_by_number(db, schema.inspection_number)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Inspection schedule number '{schema.inspection_number}' already exists."
                )
        return WaterQualityRepository.create_inspection(db, schema)

    @staticmethod
    def get_inspection_by_id(db: Session, inspection_id: int) -> QualityInspectionSchedule:
        insp = WaterQualityRepository.get_inspection_by_id(db, inspection_id)
        if not insp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inspection schedule with ID {inspection_id} not found."
            )
        return insp

    @staticmethod
    def update_inspection(db: Session, inspection_id: int, schema: QualInspectionUpdate) -> QualityInspectionSchedule:
        WaterQualityService.get_inspection_by_id(db, inspection_id)
        updated = WaterQualityRepository.update_inspection(db, inspection_id, schema)
        return updated

    @staticmethod
    def delete_inspection(db: Session, inspection_id: int):
        WaterQualityService.get_inspection_by_id(db, inspection_id)
        WaterQualityRepository.delete_inspection(db, inspection_id)

    @staticmethod
    def resolve_alert(db: Session, alert_id: int) -> QualityAlert:
        alert = db.query(QualityAlert).filter(QualityAlert.id == alert_id).first()
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Active alert with ID {alert_id} not found."
            )
        resolved = WaterQualityRepository.resolve_alert(db, alert_id)
        return resolved


class MaintenanceService:
    @staticmethod
    def _validate_maintenance_data(schema: MaintenanceCreate):
        if schema.estimated_cost is not None and schema.estimated_cost < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estimated cost cannot be negative."
            )
        if schema.actual_cost is not None and schema.actual_cost < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Actual cost cannot be negative."
            )
        if schema.scheduled_date and schema.expected_completion:
            if schema.expected_completion < schema.scheduled_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Expected completion date cannot be before scheduled date."
                )

    @staticmethod
    def create_maintenance(db: Session, schema: MaintenanceCreate, creator_id: Optional[int] = None) -> MaintenanceRequest:
        if schema.maintenance_number:
            existing = MaintenanceRepository.get_maintenance_by_number(db, schema.maintenance_number)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Maintenance request number '{schema.maintenance_number}' already exists."
                )

        # Enforce enum values
        if schema.priority and schema.priority not in [p.value for p in MaintenancePriority]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid priority level.")
        if schema.status and schema.status not in [s.value for s in MaintenanceStatus]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid maintenance status.")
        if schema.maintenance_type not in [t.value for t in MaintenanceType]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid maintenance type.")
        if schema.source_type not in [src.value for src in MaintenanceSourceType]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid maintenance source type.")

        MaintenanceService._validate_maintenance_data(schema)

        maint = MaintenanceRepository.create_maintenance(db, schema, creator_id)
        
        # Log creation history
        MaintenanceRepository.log_history(
            db, maint.id,
            action="CREATED",
            performed_by=f"User #{creator_id or 1}",
            remarks="Maintenance request registered."
        )

        try:
            NotificationService.trigger_automatic_notification(db, "MAINTENANCE_SCHEDULED", maint.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")

        return maint

    @staticmethod
    def get_maintenance_by_id(db: Session, request_id: int) -> MaintenanceRequest:
        maint = MaintenanceRepository.get_maintenance_by_id(db, request_id)
        if not maint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Maintenance request with ID {request_id} not found."
            )
        return maint

    @staticmethod
    def update_maintenance(db: Session, request_id: int, schema: MaintenanceUpdate, updater_id: Optional[int] = None) -> MaintenanceRequest:
        db_maint = MaintenanceService.get_maintenance_by_id(db, request_id)
        
        # Validate cost ranges
        if schema.estimated_cost is not None and schema.estimated_cost < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estimated cost cannot be negative.")
        if schema.actual_cost is not None and schema.actual_cost < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Actual cost cannot be negative.")

        # Check date parameters
        start = schema.start_date or db_maint.start_date
        sched = schema.scheduled_date or db_maint.scheduled_date
        expected = schema.expected_completion or db_maint.expected_completion
        if expected and sched:
            if expected < sched:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Expected completion cannot be before scheduled date.")
        if expected and start:
            if expected < start:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Expected completion cannot be before start date.")

        history_remarks = []

        # Validate status change transitions
        if schema.status and schema.status != db_maint.status:
            if schema.status not in [s.value for s in MaintenanceStatus]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target status.")
            
            allowed = VALID_MAINTENANCE_STATUS_TRANSITIONS.get(MaintenanceStatus(db_maint.status), set())
            if MaintenanceStatus(schema.status) not in allowed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status transition from {db_maint.status} to {schema.status}."
                )
            
            history_remarks.append(f"Status changed from {db_maint.status} to {schema.status}")
            
            # Automatically populate completion date if shifting to COMPLETED/VERIFIED
            if schema.status in ["COMPLETED", "VERIFIED"] and not db_maint.completed_date:
                db_maint.completed_date = date.today()

        if schema.assigned_supervisor and schema.assigned_supervisor != db_maint.assigned_supervisor:
            history_remarks.append(f"Assigned supervisor: {schema.assigned_supervisor}")

        updated = MaintenanceRepository.update_maintenance(db, request_id, schema, updater_id)

        # Log history if changes occurred
        if history_remarks:
            MaintenanceRepository.log_history(
                db, request_id,
                action="UPDATED",
                performed_by=f"User #{updater_id or 1}",
                remarks="; ".join(history_remarks)
            )

        return updated

    @staticmethod
    def delete_maintenance(db: Session, request_id: int):
        MaintenanceService.get_maintenance_by_id(db, request_id)
        MaintenanceRepository.delete_maintenance(db, request_id)

    # Sub-resources methods
    @staticmethod
    def create_task(db: Session, request_id: int, schema: TaskCreate, actor_id: Optional[int] = None) -> MaintenanceTask:
        # Check parent request
        MaintenanceService.get_maintenance_by_id(db, request_id)
        
        task = MaintenanceRepository.create_task(db, request_id, schema)
        
        MaintenanceRepository.log_history(
            db, request_id,
            action="TASK_CREATED",
            performed_by=f"User #{actor_id or 1}",
            remarks=f"Added task '{task.task_name}'."
        )
        return task

    @staticmethod
    def update_task(db: Session, task_id: int, schema: TaskUpdateSchema, actor_id: Optional[int] = None) -> MaintenanceTask:
        db_task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with ID {task_id} not found.")

        old_status = db_task.status
        updated = MaintenanceRepository.update_task(db, task_id, schema)
        
        remarks = f"Task '{updated.task_name}' updated"
        if schema.status and schema.status != old_status:
            remarks += f" status from {old_status} to {schema.status}"

        MaintenanceRepository.log_history(
            db, updated.maintenance_id,
            action="TASK_UPDATED",
            performed_by=f"User #{actor_id or 1}",
            remarks=remarks
        )
        return updated

    @staticmethod
    def add_material(db: Session, request_id: int, schema: MaterialCreate, actor_id: Optional[int] = None) -> MaintenanceMaterial:
        # Validate numbers
        if schema.quantity <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Material quantity must be positive.")
        if schema.cost < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Material cost cannot be negative.")

        MaintenanceService.get_maintenance_by_id(db, request_id)
        material = MaintenanceRepository.add_material(db, request_id, schema)

        MaintenanceRepository.log_history(
            db, request_id,
            action="MATERIAL_ADDED",
            performed_by=f"User #{actor_id or 1}",
            remarks=f"Added material '{material.material_name}' (Qty: {material.quantity} {material.unit})."
        )
        return material

    @staticmethod
    def add_photo(db: Session, request_id: int, schema: PhotoUpload, uploader_id: Optional[int] = None) -> MaintenancePhoto:
        if schema.photo_type not in [p.value for p in MaintenancePhotoType]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid photo type. Must be BEFORE, DURING, or AFTER.")
        
        MaintenanceService.get_maintenance_by_id(db, request_id)
        photo = MaintenanceRepository.add_photo(db, request_id, schema, uploader_id)

        MaintenanceRepository.log_history(
            db, request_id,
            action="PHOTO_UPLOADED",
            performed_by=f"User #{uploader_id or 1}",
            remarks=f"Uploaded '{photo.photo_type}' photo."
        )
        return photo


class EmergencyService:
    @staticmethod
    def create_shutdown(db: Session, schema: EmergencyCreate, creator_id: Optional[int] = None) -> EmergencyShutdown:
        # Validate enums
        if schema.emergency_type not in [e.value for e in EmergencyType]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid emergency type.")
        if schema.priority and schema.priority not in [p.value for p in EmergencyPriority]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid priority level.")
        if schema.status and schema.status not in [s.value for s in EmergencyStatus]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status level.")

        # Check dates
        if schema.expected_restore_time and schema.expected_restore_time < schema.shutdown_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expected restore time cannot be before shutdown start time."
            )

        # Validate pipeline
        if schema.affected_pipeline_id:
            pipeline = db.query(WaterPipeline).filter(WaterPipeline.id == schema.affected_pipeline_id).first()
            if not pipeline:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Pipeline with ID {schema.affected_pipeline_id} not found."
                )
            
            # Prevent duplicate active shutdowns for same pipeline
            active_exists = db.query(EmergencyShutdown).filter(
                EmergencyShutdown.affected_pipeline_id == schema.affected_pipeline_id,
                EmergencyShutdown.status.notin_(["RESTORED", "CLOSED"])
            ).first()
            if active_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Pipeline ID {schema.affected_pipeline_id} is already under an active emergency shutdown."
                )

        # Validate tank
        if schema.affected_tank_id:
            tank = db.query(WaterTank).filter(WaterTank.id == schema.affected_tank_id).first()
            if not tank:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Water tank with ID {schema.affected_tank_id} not found."
                )

        # Validate schedule
        if schema.affected_schedule_id:
            sched = db.query(WaterSupplySchedule).filter(WaterSupplySchedule.id == schema.affected_schedule_id).first()
            if not sched:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Water supply schedule with ID {schema.affected_schedule_id} not found."
                )

        # Automatically update pipeline status to OUT_OF_SERVICE
        if schema.affected_pipeline_id:
            pipeline = db.query(WaterPipeline).filter(WaterPipeline.id == schema.affected_pipeline_id).first()
            if pipeline:
                pipeline.current_status = "OUT_OF_SERVICE"

        # Automatically update tank status to UNDER_MAINTENANCE
        if schema.affected_tank_id:
            tank = db.query(WaterTank).filter(WaterTank.id == schema.affected_tank_id).first()
            if tank:
                tank.status = "UNDER_MAINTENANCE"

        # Automatically pause related water supply schedules
        if schema.affected_schedule_id:
            sched = db.query(WaterSupplySchedule).filter(WaterSupplySchedule.id == schema.affected_schedule_id).first()
            if sched:
                sched.status = "PAUSED"
                sched.remarks = f"Automatically paused due to Emergency Shutdown."

        # Additionally, pause any other active/scheduled schedules on the same pipeline/tank
        if schema.affected_pipeline_id:
            pipeline = db.query(WaterPipeline).filter(WaterPipeline.id == schema.affected_pipeline_id).first()
            if pipeline:
                related_scheds = db.query(WaterSupplySchedule).filter(
                    WaterSupplySchedule.pipeline_name == pipeline.pipeline_number,
                    WaterSupplySchedule.status.in_(["SCHEDULED", "ACTIVE"])
                ).all()
                for rs in related_scheds:
                    rs.status = "PAUSED"
                    rs.remarks = f"Paused due to Emergency on Pipeline {pipeline.pipeline_number}."
        if schema.affected_tank_id:
            tank = db.query(WaterTank).filter(WaterTank.id == schema.affected_tank_id).first()
            if tank:
                related_scheds = db.query(WaterSupplySchedule).filter(
                    WaterSupplySchedule.tank_name == tank.tank_number,
                    WaterSupplySchedule.status.in_(["SCHEDULED", "ACTIVE"])
                ).all()
                for rs in related_scheds:
                    rs.status = "PAUSED"
                    rs.remarks = f"Paused due to Emergency on Tank {tank.tank_number}."

        # Create
        shutdown = EmergencyRepository.create_shutdown(db, schema, creator_id)

        # Log timeline
        EmergencyRepository.log_timeline(
            db, shutdown.id,
            action="DECLARED",
            performed_by=f"User #{creator_id or 1}",
            remarks="Emergency Declared. Affected resources flagged out of service."
        )

        try:
            NotificationService.trigger_automatic_notification(db, "EMERGENCY_SHUTDOWN", shutdown.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")

        return shutdown

    @staticmethod
    def get_shutdown_by_id(db: Session, shutdown_id: int) -> EmergencyShutdown:
        m = EmergencyRepository.get_shutdown_by_id(db, shutdown_id)
        if not m:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Emergency shutdown with ID {shutdown_id} not found."
            )
        return m

    @staticmethod
    def update_shutdown(db: Session, shutdown_id: int, schema: EmergencyUpdate, updater_id: Optional[int] = None) -> EmergencyShutdown:
        db_shutdown = EmergencyService.get_shutdown_by_id(db, shutdown_id)

        # Validate start/restore dates consistency
        start = schema.shutdown_start or db_shutdown.shutdown_start
        expected = schema.expected_restore_time or db_shutdown.expected_restore_time
        actual = schema.actual_restore_time or db_shutdown.actual_restore_time

        if expected and start and expected < start:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Expected restore time cannot be before start time.")
        if actual and start and actual < start:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Actual restore time cannot be before start time.")

        timeline_remarks = []

        # Validate status transition
        if schema.status and schema.status != db_shutdown.status:
            if schema.status not in [s.value for s in EmergencyStatus]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target status.")
            
            allowed = VALID_EMERGENCY_STATUS_TRANSITIONS.get(EmergencyStatus(db_shutdown.status), set())
            if EmergencyStatus(schema.status) not in allowed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid transition from {db_shutdown.status} to {schema.status}."
                )

            timeline_remarks.append(f"Status transitioned from {db_shutdown.status} to {schema.status}")

            # Auto restoration side-effects
            if schema.status in ["RESTORED", "CLOSED"]:
                # Revert actual restore date
                if not db_shutdown.actual_restore_time:
                    db_shutdown.actual_restore_time = datetime.utcnow()
                
                # Revert pipeline
                if db_shutdown.affected_pipeline_id:
                    pipeline = db.query(WaterPipeline).filter(WaterPipeline.id == db_shutdown.affected_pipeline_id).first()
                    if pipeline:
                        pipeline.current_status = "ACTIVE"
                # Revert tank
                if db_shutdown.affected_tank_id:
                    tank = db.query(WaterTank).filter(WaterTank.id == db_shutdown.affected_tank_id).first()
                    if tank:
                        tank.status = "ACTIVE"

        updated = EmergencyRepository.update_shutdown(db, shutdown_id, schema, updater_id)

        if timeline_remarks:
            EmergencyRepository.log_timeline(
                db, shutdown_id,
                action=schema.status,
                performed_by=f"User #{updater_id or 1}",
                remarks="; ".join(timeline_remarks)
            )

        try:
            if schema.status in ["RESTORED", "CLOSED"]:
                NotificationService.trigger_automatic_notification(db, "WATER_RESTORED", updated.id)
        except Exception as e:
            print(f"Error triggering automatic notification: {e}")

        return updated

    @staticmethod
    def delete_shutdown(db: Session, shutdown_id: int):
        # Validate existence
        EmergencyService.get_shutdown_by_id(db, shutdown_id)
        EmergencyRepository.delete_shutdown(db, shutdown_id)

    @staticmethod
    def assign_team_member(db: Session, shutdown_id: int, schema: ResponseTeamCreate, actor_id: Optional[int] = None) -> EmergencyResponseTeam:
        # Check shutdown
        EmergencyService.get_shutdown_by_id(db, shutdown_id)

        # Check worker directory
        worker = db.query(WaterFieldWorker).filter(WaterFieldWorker.id == schema.worker_id).first()
        if not worker:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Worker with ID {schema.worker_id} not found."
            )

        team = EmergencyRepository.assign_team_member(db, shutdown_id, schema)

        EmergencyRepository.log_timeline(
            db, shutdown_id,
            action="TEAM_ASSIGNED",
            performed_by=f"User #{actor_id or 1}",
            remarks=f"Assigned {worker.first_name} {worker.last_name} as {schema.role}."
        )

        return team

    @staticmethod
    def notify_citizens(db: Session, shutdown_id: int, schema: NotificationCreate, actor_id: Optional[int] = None) -> EmergencyNotification:
        # Check shutdown
        db_shutdown = EmergencyService.get_shutdown_by_id(db, shutdown_id)

        notif = EmergencyRepository.create_notification(db, shutdown_id, schema.notification_title, schema.notification_message)
        
        # Mark sent
        db_shutdown.citizen_notification_sent = True
        db_shutdown.updated_at = datetime.utcnow()
        db.commit()

        # Log timeline
        EmergencyRepository.log_timeline(
            db, shutdown_id,
            action="CITIZENS_NOTIFIED",
            performed_by=f"User #{actor_id or 1}",
            remarks=f"Dispatched Notification: '{schema.notification_title}'."
        )

        return notif


class NotificationService:
    @staticmethod
    def _validate_enums(schema):
        if hasattr(schema, "notification_type") and schema.notification_type:
            if schema.notification_type not in [t.value for t in NotificationType]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification type.")
        if hasattr(schema, "priority") and schema.priority:
            if schema.priority not in [p.value for p in NotificationPriority]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid priority level.")
        if hasattr(schema, "recipient_type") and schema.recipient_type:
            if schema.recipient_type not in [r.value for r in RecipientType]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid recipient type.")
        if hasattr(schema, "delivery_channel") and schema.delivery_channel:
            if schema.delivery_channel not in [d.value for d in DeliveryChannel]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid delivery channel.")
        if hasattr(schema, "status") and schema.status:
            if schema.status not in [s.value for s in NotificationStatus]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status level.")

    @staticmethod
    def create_notification(db: Session, schema: NotificationCreate, creator_id: Optional[int] = None) -> WaterNotification:
        NotificationService._validate_enums(schema)

        # Scheduled time check
        if schema.status == "SCHEDULED":
            if not schema.scheduled_time:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Scheduled time must be provided for SCHEDULED notifications.")
            time_naive = schema.scheduled_time.replace(tzinfo=None)
            if time_naive <= datetime.utcnow():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Scheduled time must be in the future.")

        # Duplicate check
        duplicate = db.query(WaterNotification).filter(
            WaterNotification.title == schema.title,
            WaterNotification.message == schema.message,
            WaterNotification.status != "ARCHIVED"
        ).first()
        if duplicate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate active notification detected.")

        return NotificationRepository.create_notification(db, schema, creator_id)

    @staticmethod
    def get_notification_by_id(db: Session, notification_id: int) -> WaterNotification:
        notif = NotificationRepository.get_notification_by_id(db, notification_id)
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification record with ID {notification_id} not found."
            )
        return notif

    @staticmethod
    def update_notification(db: Session, notification_id: int, schema: NotificationUpdate, updater_id: Optional[int] = None) -> WaterNotification:
        db_notif = NotificationService.get_notification_by_id(db, notification_id)
        NotificationService._validate_enums(schema)

        # Status transition check
        if schema.status and schema.status != db_notif.status:
            allowed = VALID_NOTIFICATION_STATUS_TRANSITIONS.get(NotificationStatus(db_notif.status), set())
            if NotificationStatus(schema.status) not in allowed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid transition from {db_notif.status} to {schema.status}."
                )

            # Log history transition
            NotificationRepository.log_history(
                db, notification_id,
                action="STATUS_CHANGED",
                performed_by=f"User #{updater_id or 1}",
                remarks=f"Status changed from {db_notif.status} to {schema.status}."
            )

        updated = NotificationRepository.update_notification(db, notification_id, schema, updater_id)
        return updated

    @staticmethod
    def delete_notification(db: Session, notification_id: int):
        NotificationService.get_notification_by_id(db, notification_id)
        NotificationRepository.delete_notification(db, notification_id)

    # Template actions
    @staticmethod
    def create_template(db: Session, schema: TemplateCreate) -> NotificationTemplate:
        existing = db.query(NotificationTemplate).filter(NotificationTemplate.template_name == schema.template_name).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Template name already exists.")
        return NotificationRepository.create_template(db, schema)

    @staticmethod
    def get_template_by_id(db: Session, template_id: int) -> NotificationTemplate:
        temp = NotificationRepository.get_template_by_id(db, template_id)
        if not temp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template with ID {template_id} not found."
            )
        return temp

    @staticmethod
    def update_template(db: Session, template_id: int, schema: TemplateUpdate) -> NotificationTemplate:
        NotificationService.get_template_by_id(db, template_id)
        
        if schema.template_name:
            existing = db.query(NotificationTemplate).filter(
                NotificationTemplate.template_name == schema.template_name,
                NotificationTemplate.id != template_id
            ).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Template name already exists.")

        updated = NotificationRepository.update_template(db, template_id, schema)
        return updated

    @staticmethod
    def delete_template(db: Session, template_id: int):
        NotificationService.get_template_by_id(db, template_id)
        NotificationRepository.delete_template(db, template_id)

    # Automatic triggers hooks
    @staticmethod
    def trigger_automatic_notification(db: Session, event_name: str, target_id: int) -> Optional[WaterNotification]:
        title = "System Notification"
        message = "A system event has occurred."
        not_type = "GENERAL"
        priority = "MEDIUM"
        recipient_type = "ALL_CITIZENS"
        channel = "IN_APP"
        ward = None
        area = None

        if event_name == "COMPLAINT_CREATED":
            complaint = db.query(WaterComplaint).filter(WaterComplaint.id == target_id).first()
            if complaint:
                title = f"Water Complaint Registered: #{complaint.complaint_number}"
                message = f"Water complaint regarding {complaint.category.replace('_', ' ')} has been registered in {complaint.ward}, {complaint.area}."
                not_type = "COMPLAINT"
                recipient_type = "AUTHORITY"
                ward = complaint.ward
                area = complaint.area

        elif event_name == "WORKER_ASSIGNED":
            assign = db.query(WorkerAssignment).filter(WorkerAssignment.id == target_id).first()
            if assign:
                title = f"Crew Assigned to Assignment #{assign.assignment_number}"
                message = f"Field crew member has been assigned to resolve the water issue. Target completion: {assign.deadline}."
                not_type = "WORK_ASSIGNMENT"
                recipient_type = "FIELD_WORKERS"
                # Pull location details from related complaint
                complaint = db.query(WaterComplaint).filter(WaterComplaint.id == assign.complaint_id).first()
                if complaint:
                    ward = complaint.ward
                    area = complaint.area

        elif event_name == "WORK_STARTED":
            assign = db.query(WorkerAssignment).filter(WorkerAssignment.id == target_id).first()
            if assign:
                title = f"Repair Started: Assignment #{assign.assignment_number}"
                message = f"Field responders have arrived on site and started repairs."
                not_type = "WORK_ASSIGNMENT"
                recipient_type = "ALL_CITIZENS"
                complaint = db.query(WaterComplaint).filter(WaterComplaint.id == assign.complaint_id).first()
                if complaint:
                    ward = complaint.ward
                    area = complaint.area

        elif event_name == "WORK_COMPLETED":
            assign = db.query(WorkerAssignment).filter(WorkerAssignment.id == target_id).first()
            if assign:
                title = f"Repair Completed: Assignment #{assign.assignment_number}"
                message = f"Field responders have resolved the issue. Pending municipal review."
                not_type = "WORK_ASSIGNMENT"
                recipient_type = "ALL_CITIZENS"
                complaint = db.query(WaterComplaint).filter(WaterComplaint.id == assign.complaint_id).first()
                if complaint:
                    ward = complaint.ward
                    area = complaint.area

        elif event_name == "COMPLAINT_VERIFIED":
            assign = db.query(WorkerAssignment).filter(WorkerAssignment.id == target_id).first()
            if assign:
                title = f"Resolution Approved: Assignment #{assign.assignment_number}"
                message = f"Municipal authority has verified and approved the repairs."
                not_type = "COMPLAINT"
                recipient_type = "ALL_CITIZENS"
                complaint = db.query(WaterComplaint).filter(WaterComplaint.id == assign.complaint_id).first()
                if complaint:
                    ward = complaint.ward
                    area = complaint.area

        elif event_name == "COMPLAINT_RESOLVED":
            complaint = db.query(WaterComplaint).filter(WaterComplaint.id == target_id).first()
            if complaint:
                title = f"Complaint Resolved: #{complaint.complaint_number}"
                message = f"Water complaint is officially resolved and closed."
                not_type = "COMPLAINT"
                recipient_type = "ALL_CITIZENS"
                ward = complaint.ward
                area = complaint.area

        elif event_name == "WATER_SUPPLY_CREATED":
            supply = db.query(WaterSupplySchedule).filter(WaterSupplySchedule.id == target_id).first()
            if supply:
                title = f"New Supply Scheduled: #{supply.schedule_number}"
                message = f"Water supply ({supply.supply_type}) is scheduled for {supply.supply_date} in {supply.ward}, {supply.area}."
                not_type = "SUPPLY"
                recipient_type = "SPECIFIC_WARD"
                ward = supply.ward
                area = supply.area

        elif event_name == "WATER_SUPPLY_PAUSED":
            supply = db.query(WaterSupplySchedule).filter(WaterSupplySchedule.id == target_id).first()
            if supply:
                title = f"Water Supply Interrupted: #{supply.schedule_number}"
                message = f"Scheduled water supply has been paused. Please store water."
                not_type = "SUPPLY"
                priority = "HIGH"
                recipient_type = "SPECIFIC_WARD"
                ward = supply.ward
                area = supply.area

        elif event_name == "PIPELINE_DAMAGED":
            pipe = db.query(WaterPipeline).filter(WaterPipeline.id == target_id).first()
            if pipe:
                title = f"Pipeline Damaged: #{pipe.pipeline_number}"
                message = f"Rupture or leak reported on pipeline {pipe.pipeline_name or pipe.pipeline_type} in {pipe.ward}. Standby for shutdown."
                not_type = "PIPELINE"
                priority = "HIGH"
                recipient_type = "SPECIFIC_WARD"
                ward = pipe.ward

        elif event_name == "TANK_LOW_LEVEL":
            tank = db.query(WaterTank).filter(WaterTank.id == target_id).first()
            if tank:
                title = f"Water Tank Level Alert: #{tank.tank_number}"
                message = f"Water tank {tank.tank_name} has fallen below critical level limits. Low pressure expected."
                not_type = "TANK"
                priority = "HIGH"
                recipient_type = "SPECIFIC_WARD"
                ward = tank.ward
                area = tank.area

        elif event_name == "UNSAFE_WATER_QUALITY":
            quality = db.query(WaterQuality).filter(WaterQuality.id == target_id).first()
            if quality:
                title = f"CRITICAL WATER QUALITY WARNING: #{quality.report_number or 'REPORT'}"
                message = f"Recent water quality test indicates UNSAFE parameters in {quality.ward}. Please boil drinking water."
                not_type = "QUALITY"
                priority = "CRITICAL"
                recipient_type = "SPECIFIC_WARD"
                ward = quality.ward

        elif event_name == "MAINTENANCE_SCHEDULED":
            maint = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == target_id).first()
            if maint:
                title = f"Maintenance Scheduled: #{maint.maintenance_number}"
                message = f"Scheduled maintenance '{maint.title}' starts {maint.scheduled_date} in {maint.ward}, {maint.area}."
                not_type = "MAINTENANCE"
                recipient_type = "SPECIFIC_WARD"
                ward = maint.ward
                area = maint.area

        elif event_name == "EMERGENCY_SHUTDOWN":
            sd = db.query(EmergencyShutdown).filter(EmergencyShutdown.id == target_id).first()
            if sd:
                title = f"EMERGENCY SHUTDOWN: #{sd.shutdown_number}"
                message = f"Immediate shutdown declared: {sd.title} in {sd.ward}, {sd.area}."
                not_type = "EMERGENCY"
                priority = "CRITICAL"
                recipient_type = "SPECIFIC_WARD"
                ward = sd.ward
                area = sd.area

        elif event_name == "WATER_RESTORED":
            sd = db.query(EmergencyShutdown).filter(EmergencyShutdown.id == target_id).first()
            if sd:
                title = f"Water Restored: #{sd.shutdown_number}"
                message = f"Emergency repair complete. Water supply restored in {sd.ward}, {sd.area}."
                not_type = "EMERGENCY"
                priority = "HIGH"
                recipient_type = "SPECIFIC_WARD"
                ward = sd.ward
                area = sd.area

        else:
            return None

        # Build create schema
        create_schema = NotificationCreate(
            title=title,
            message=message,
            notification_type=not_type,
            priority=priority,
            recipient_type=recipient_type,
            delivery_channel=channel,
            status="SENT",
            ward=ward,
            area=area,
            target_type=not_type,
            target_reference_id=target_id
        )

        return NotificationRepository.create_notification(db, create_schema, creator_id=1)


class ReportsService:
    @staticmethod
    def get_dashboard_analytics(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_dashboard_analytics(db, filters)

    @staticmethod
    def get_complaints_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_complaints_report(db, filters)

    @staticmethod
    def get_workers_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_workers_report(db, filters)

    @staticmethod
    def get_supply_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_supply_report(db, filters)

    @staticmethod
    def get_pipelines_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_pipelines_report(db, filters)

    @staticmethod
    def get_tanks_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_tanks_report(db, filters)

    @staticmethod
    def get_quality_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_quality_report(db, filters)

    @staticmethod
    def get_maintenance_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_maintenance_report(db, filters)

    @staticmethod
    def get_emergency_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_emergency_report(db, filters)

    @staticmethod
    def get_notifications_report(db: Session, filters: dict) -> dict:
        return ReportsRepository.get_notifications_report(db, filters)

    @staticmethod
    def export_report(db: Session, report_type: str, format_type: str, filters: dict):
        from .utils import generate_csv_report, generate_excel_report, generate_pdf_report
        
        title = f"Water Authority {report_type.capitalize()} Report"
        headers = []
        rows = []
        
        if report_type == "dashboard":
            data = ReportsRepository.get_dashboard_analytics(db, filters)
            headers = ["Metric KPI Key", "Counter Value"]
            rows = [
                ["Total Complaints", data["total_complaints"]],
                ["Pending Complaints", data["pending_complaints"]],
                ["Resolved Complaints", data["resolved_complaints"]],
                ["Average Resolution Time (Hours)", data["avg_resolution_time_hours"]],
                ["Today's Water Supply", data["today_water_supply"]],
                ["Upcoming Supply Slots", data["upcoming_supply"]],
                ["Workers Available", data["workers_available"]],
                ["Workers Busy", data["workers_busy"]],
                ["Worker Efficiency (%)", data["worker_efficiency_pct"]],
                ["Total Pipelines", data["total_pipelines"]],
                ["Damaged Pipelines", data["damaged_pipelines"]],
                ["Inspection Due", data["inspections_due"]],
                ["Total Tanks", data["total_tanks"]],
                ["Low Water Tanks", data["low_water_tanks"]],
                ["Tank Capacity Usage (%)", data["tank_capacity_usage_pct"]],
                ["Unsafe Water Reports", data["unsafe_water_reports"]],
                ["Maintenance In Progress", data["maintenance_in_progress"]],
                ["Emergency Shutdowns Active", data["emergency_shutdowns"]],
                ["Notifications Sent", data["notifications_sent"]]
            ]
            
        elif report_type == "complaints":
            data = ReportsRepository.get_complaints_report(db, filters)
            headers = ["Complaint ID", "Number", "Title", "Category", "Status", "Created At"]
            rows = [
                [c["id"], c["number"], c["title"], c["category"], c["status"], c["created_at"]]
                for c in data["recent_complaints"]
            ]
            
        elif report_type == "workers":
            data = ReportsRepository.get_workers_report(db, filters)
            headers = ["Worker ID", "Name", "Tasks Completed", "Avg Time (Hrs)", "Completion Rate (%)"]
            rows = [
                [w["worker_id"], w["name"], w["tasks_completed"], w["avg_time_hours"], w["completion_rate_pct"]]
                for w in data["worker_efficiency"]
            ]
            
        elif report_type == "supply":
            data = ReportsRepository.get_supply_report(db, filters)
            headers = ["Metric Details", "Aggregated Count"]
            rows = [["Total Supply Schedules Count", data["total_schedules"]],
                    ["Total Estimated Volume (MGD)", data["total_volume_mgd"]]]
            for t, count in data["by_type"].items():
                rows.append([f"Type: {t}", count])
            for w, count in data["by_ward"].items():
                rows.append([f"Ward: {w}", count])
                
        elif report_type == "pipelines":
            data = ReportsRepository.get_pipelines_report(db, filters)
            headers = ["Category Metric", "Count"]
            rows = [["Total Registered Pipelines", data["total_pipelines"]],
                    ["Damaged Pipelines Count", data["damaged_pipelines_count"]],
                    ["Inspections Due Count", data["inspections_due_count"]]]
            for c, count in data["by_condition"].items():
                rows.append([f"Condition: {c}", count])
            for m, count in data["by_material"].items():
                rows.append([f"Material: {m}", count])
                
        elif report_type == "tanks":
            data = ReportsRepository.get_tanks_report(db, filters)
            headers = ["Storage Indicator Key", "Value"]
            rows = [
                ["Total Storage Tanks Count", data["total_tanks"]],
                ["Low Water Level Tanks", data["low_water_tanks"]],
                ["Average Water Level (%)", data["avg_water_level_pct"]],
                ["Total Storage Capacity (Liters)", data["total_capacity_liters"]],
                ["Current Water Level Total (Liters)", data["current_level_liters"]]
            ]
            
        elif report_type == "quality":
            data = ReportsRepository.get_quality_report(db, filters)
            headers = ["Quality Index Indicator", "Value"]
            rows = [
                ["Total Quality Reports Count", data["total_reports"]],
                ["Unsafe Status Reports Count", data["unsafe_reports_count"]],
                ["Warning Status Reports Count", data["warning_reports_count"]],
                ["Safe Status Reports Count", data["safe_reports_count"]],
                ["Average pH Level Measured", data["avg_ph_level"]],
                ["Average TDS (ppm) Level Measured", data["avg_tds_level"]]
            ]
            
        elif report_type == "maintenance":
            data = ReportsRepository.get_maintenance_report(db, filters)
            headers = ["Maintenance Metric", "Value"]
            rows = [
                ["Total Maintenance Requests", data["total_requests"]],
                ["Requests In Progress", data["in_progress_count"]],
                ["Completed Requests Count", data["completed_count"]],
                ["Total Estimated Cost (INR)", data["total_estimated_cost"]],
                ["Total Actual Cost Incurred (INR)", data["total_actual_cost"]],
                ["Average Duration to Complete (Days)", data["avg_completion_time_days"]]
            ]
            
        elif report_type == "emergency":
            data = ReportsRepository.get_emergency_report(db, filters)
            headers = ["Emergency Shutdown Metric", "Value"]
            rows = [
                ["Total Declared Emergencies", data["total_emergencies"]],
                ["Active Shutdowns In Progress", data["active_emergencies"]],
                ["Resolved/Closed Outages Count", data["resolved_emergencies"]],
                ["Average Resolution Time (Minutes)", data["avg_response_time_minutes"]],
                ["Total Wards Affected Listed", len(data["affected_wards"])]
            ]
            
        elif report_type == "notifications":
            data = ReportsRepository.get_notifications_report(db, filters)
            headers = ["Delivery Channel / Type Metric", "Value"]
            rows = [
                ["Total Sent Notifications", data["total_sent"]],
                ["Delivery Verification Success Rate (%)", data["delivery_success_rate"]]
            ]
            for ch, val in data["by_channel"].items():
                rows.append([f"Channel: {ch}", val])
            for ty, val in data["by_type"].items():
                rows.append([f"Type: {ty}", val])
        
        if format_type == "csv":
            return generate_csv_report(headers, rows), "text/csv"
        elif format_type == "excel":
            return generate_excel_report(title, headers, rows), "application/vnd.ms-excel"
        elif format_type == "pdf":
            return generate_pdf_report(title, headers, rows), "application/pdf"
        else:
            raise ValueError(f"Invalid format type: {format_type}")


class CitizenService:
    @staticmethod
    def get_citizens_list(
        db: Session,
        search: Optional[str] = None,
        ward: Optional[str] = None,
        area: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ):
        total, items = CitizenRepository.list_citizens(db, search, ward, area, status, page, page_size)
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items
        }

    @staticmethod
    def get_citizen_detail(db: Session, user_id: int):
        return CitizenRepository.get_citizen_detail(db, user_id)

    @staticmethod
    def get_citizen_complaints(db: Session, user_id: int):
        from .model import WaterComplaint
        return db.query(WaterComplaint).filter(WaterComplaint.citizen_id == user_id).all()

    @staticmethod
    def get_citizen_notifications(db: Session, user_id: int):
        from .model import NotificationRecipient
        recipients = db.query(NotificationRecipient).filter(NotificationRecipient.recipient_id == user_id).all()
        return [r.notification for r in recipients if r.notification]

    @staticmethod
    def update_service_status(db: Session, user_id: int, schema: CitizenServiceStatusUpdate):
        return CitizenRepository.update_service_status(
            db, user_id, schema.service_status, schema.ward, schema.area
        )

    @staticmethod
    def export_citizens_csv(db: Session) -> str:
        from modules.users.model import Profile
        from .model import WaterCitizenAccess
        
        results = db.query(Profile, WaterCitizenAccess).outerjoin(
            WaterCitizenAccess, Profile.user_id == WaterCitizenAccess.user_id
        ).all()
        
        headers = ["Citizen ID", "Name", "Phone Number", "Ward", "Area", "Registered Date", "Service Status"]
        rows = []
        for profile, access in results:
            rows.append([
                profile.id,
                profile.full_name or "Anonymous",
                profile.phone_number or "N/A",
                access.ward if access else "N/A",
                access.area if access else "N/A",
                profile.created_at.strftime("%Y-%m-%d") if profile.created_at else "N/A",
                access.service_status if access else "ENABLED"
            ])
            
        from .utils import generate_csv_report
        return generate_csv_report(headers, rows)


class SettingsService:
    @staticmethod
    def get_settings(db: Session):
        return SettingsRepository.get_settings(db)

    @staticmethod
    def update_settings(db: Session, schema: DepartmentSettingsUpdate):
        # Validation: Working hours format HH:MM - HH:MM
        import re
        if schema.working_hours is not None:
            if not re.match(r"^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$", schema.working_hours):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Working hours must be in the format HH:MM - HH:MM (e.g. 09:00-17:00)."
                )

        # Validation: timezone checks
        if schema.timezone is not None:
            if not schema.timezone.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Timezone cannot be empty."
                )

        # Validation: supply times
        if schema.default_supply_start is not None:
            if not re.match(r"^\d{2}:\d{2}$", schema.default_supply_start):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Supply start time must be in HH:MM format."
                )
        if schema.default_supply_end is not None:
            if not re.match(r"^\d{2}:\d{2}$", schema.default_supply_end):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Supply end time must be in HH:MM format."
                )

        return SettingsRepository.update_settings(db, schema)

    @staticmethod
    def get_profile(db: Session):
        return SettingsRepository.get_profile(db)

    @staticmethod
    def update_profile(db: Session, schema: DepartmentProfileUpdate):
        return SettingsRepository.update_profile(db, schema)











