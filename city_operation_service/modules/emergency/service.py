from sqlalchemy.orm import Session
from typing import Optional, List
from modules.emergency.repository import EmergencyRepository
from modules.emergency.schema import EmergencyCreateSchema, TaskforceDispatchSchema, BroadcastCreateSchema

def create_emergency(db: Session, reporter_id: Optional[int], schema: EmergencyCreateSchema):
    return EmergencyRepository.create_emergency(db, reporter_id, schema)

def list_active_emergencies(db: Session):
    return EmergencyRepository.list_active_emergencies(db)

def get_nearby_workers(db: Session, lat: float, lng: float):
    return EmergencyRepository.get_nearby_workers(db, lat, lng)

def dispatch_taskforce(db: Session, emergency_id: int, admin_id: int, schema: TaskforceDispatchSchema):
    return EmergencyRepository.dispatch_taskforce(db, emergency_id, admin_id, schema)

def create_broadcast(db: Session, schema: BroadcastCreateSchema):
    return EmergencyRepository.create_broadcast(db, schema)

def get_active_broadcasts(db: Session):
    return EmergencyRepository.get_active_broadcasts(db)

def resolve_emergency(db: Session, emergency_id: int):
    return EmergencyRepository.resolve_emergency(db, emergency_id)
