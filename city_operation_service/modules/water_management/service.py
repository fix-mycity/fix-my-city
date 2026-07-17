from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, List, Tuple
from datetime import datetime
from .model import WaterComplaint, WaterFieldWorker
from .schema import ComplaintCreate, ComplaintUpdate, WorkerCreate, WorkerUpdate
from .repository import WaterComplaintRepository, WaterFieldWorkerRepository
from .constants import (
    ComplaintCategory, 
    ComplaintPriority, 
    ComplaintStatus, 
    VALID_STATUS_TRANSITIONS,
    WorkerAvailability,
    WorkerEmploymentStatus,
    WorkerSkill
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
        return WaterComplaintRepository.create(db, schema)

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

