from sqlalchemy.orm import Session
from .model import Complaint, ComplaintStatus, ComplaintDepartment
from .schema import ComplaintCreate
from typing import Optional

def classify_department(title: str, description: str) -> str:
    text = (title + " " + description).lower()
    if any(keyword in text for keyword in ["traffic", "road", "parking", "signal", "accident", "congestion", "vehicle", "street light"]):
        return ComplaintDepartment.TRAFFIC.value
    if any(keyword in text for keyword in ["garbage", "waste", "trash", "dump", "litter", "recycle", "sewage", "drain"]):
        return ComplaintDepartment.WASTE.value
    if any(keyword in text for keyword in ["water", "pipe", "leak", "overflow", "drainage", "tap", "hydration"]):
        return ComplaintDepartment.WATER.value
    return ComplaintDepartment.GENERAL.value

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
    return complaint

def get_complaint_by_id(db: Session, complaint_id: int) -> Complaint | None:
    return db.query(Complaint).filter(Complaint.id == complaint_id).first()

def get_my_complaints(db: Session, user_id: int) -> list[Complaint]:
    return db.query(Complaint).filter(Complaint.reported_by == user_id).all()

def get_all_complaints(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    department: Optional[str] = None
) -> dict:
    query = db.query(Complaint)

    if search:
        query = query.filter(
            (Complaint.title.ilike(f"%{search}%")) | (Complaint.description.ilike(f"%{search}%"))
        )

    if status:
        query = query.filter(Complaint.status.ilike(f"%{status}%"))

    if department:
        query = query.filter(Complaint.department.ilike(f"%{department}%"))

    total_items = query.count()
    items = query.order_by(Complaint.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total_items + page_size - 1) // page_size

    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": max(total_pages, 1)
    }

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
