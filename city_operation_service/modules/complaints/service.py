from sqlalchemy.orm import Session
from .model import Complaint, ComplaintStatus, ComplaintDepartment
from .schema import ComplaintCreate

def classify_department(title: str, description: str) -> str:
    text = (title + " " + description).lower()
    if any(keyword in text for keyword in ["water", "pipe", "pipeline", "leak", "kwa", "kerala water authority", "overflow", "drainage", "tap", "hydration", "plumbing", "water supply"]):
        return ComplaintDepartment.WATER.value
    if any(keyword in text for keyword in ["garbage", "waste", "trash", "dump", "litter", "recycle", "sewage", "drain"]):
        return ComplaintDepartment.WASTE.value
    if any(keyword in text for keyword in ["traffic", "road", "parking", "signal", "accident", "congestion", "vehicle", "street light"]):
        return ComplaintDepartment.TRAFFIC.value
    return ComplaintDepartment.GENERAL.value

import random
from modules.water_management.model import WaterComplaint
from modules.users.service import get_or_create_profile

def create_complaint(db: Session, user_id: int, data: ComplaintCreate) -> Complaint:
    dept = classify_department(data.title, data.description)
    
    complaint = Complaint(
        title=data.title,
        description=data.description,
        location_lat=data.location_lat,
        location_lng=data.location_lng,
        image_url=data.image_url,
        department=dept,
        status=ComplaintStatus.PENDING.value,
        reported_by=user_id
    )
    
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Sync to Water Management module if department is water
    if dept == ComplaintDepartment.WATER.value:
        try:
            profile = get_or_create_profile(db, user_id)
            random_num = random.randint(1000, 9999)
            complaint_no = f"WC-2026-{complaint.id:04d}-{random_num}"
            
            water_complaint = WaterComplaint(
                complaint_number=complaint_no,
                central_complaint_id=complaint.id,
                citizen_id=user_id,
                citizen_name=profile.full_name if (profile and profile.full_name) else f"Citizen #{user_id}",
                phone=profile.phone_number if profile else None,
                latitude=data.location_lat,
                longitude=data.location_lng,
                category="Pipe Leakage",
                title=data.title,
                description=data.description,
                priority="HIGH",
                status="NEW",
                before_image=data.image_url
            )
            db.add(water_complaint)
            db.commit()
        except Exception as _e:
            print(f"Notice: Failed to auto-sync WaterComplaint: {_e}")

    return complaint

def get_complaint_by_id(db: Session, complaint_id: int) -> Complaint | None:
    return db.query(Complaint).filter(Complaint.id == complaint_id).first()

def get_my_complaints(db: Session, user_id: int) -> list[Complaint]:
    return db.query(Complaint).filter(Complaint.reported_by == user_id).all()

def get_all_complaints(db: Session) -> list[Complaint]:
    return db.query(Complaint).all()

def update_complaint_image(db: Session, complaint_id: int, user_id: int, image_url: str) -> Complaint | None:
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.reported_by == user_id
    ).first()
    
    if not complaint:
        return None
        
    complaint.image_url = image_url
    db.commit()
    db.refresh(complaint)
    return complaint
