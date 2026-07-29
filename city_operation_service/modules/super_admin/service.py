from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, List
from modules.super_admin.repository import SuperAdminRepository
from modules.super_admin.schema import ComplaintRerouteSchema

def get_master_summary(db: Session):
    return SuperAdminRepository.get_master_summary(db)

def list_all_users(db: Session, page: int, page_size: int, search: Optional[str] = None, role_filter: Optional[str] = None):
    items, total_items = SuperAdminRepository.list_all_users(db, page, page_size, search, role_filter)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "total_items": total_items,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

def reroute_complaint(db: Session, complaint_id: int, schema: ComplaintRerouteSchema):
    complaint = SuperAdminRepository.reroute_complaint(db, complaint_id, schema.target_department)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    return {"success": True, "message": f"Complaint #{complaint_id} rerouted to {schema.target_department} department.", "complaint": complaint}
