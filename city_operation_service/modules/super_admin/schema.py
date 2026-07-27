from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SuperAdminSummarySchema(BaseModel):
    total_complaints: int
    resolved_complaints: int
    closed_complaints: int
    pending_complaints: int
    total_users: int
    total_workers: int
    total_admins: int

class ComplaintRerouteSchema(BaseModel):
    target_department: str
    admin_notes: Optional[str] = None
