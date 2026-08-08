import math
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List, Tuple
from modules.emergency.model import Emergency, EmergencyTaskforce, EmergencyBroadcast
from modules.emergency.schema import EmergencyCreateSchema, TaskforceDispatchSchema, BroadcastCreateSchema

def haversine_km(lat1, lon1, lat2, lon2):
    """Calculate distance in KM between two GPS coordinates"""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class EmergencyRepository:
    @staticmethod
    def create_emergency(db: Session, reporter_id: Optional[int], schema: EmergencyCreateSchema) -> Emergency:
        emergency = Emergency(
            title=schema.title,
            description=schema.description,
            category=schema.category,
            severity=schema.severity or "HIGH",
            latitude=schema.latitude,
            longitude=schema.longitude,
            affected_radius_meters=schema.affected_radius_meters or 500,
            status="ACTIVE",
            reported_by=reporter_id
        )
        db.add(emergency)
        db.commit()
        db.refresh(emergency)
        return emergency

    @staticmethod
    def list_active_emergencies(db: Session) -> List[dict]:
        emergencies = db.query(Emergency).order_by(Emergency.created_at.desc()).all()
        result = []
        for em in emergencies:
            # Fetch taskforce members
            members = db.query(EmergencyTaskforce).filter(EmergencyTaskforce.emergency_id == em.id).all()
            taskforce_list = []
            for m in members:
                # Query worker details
                worker_row = db.execute(
                    text("SELECT u.username, p.first_name, p.last_name, p.phone FROM users u LEFT JOIN worker_profiles p ON u.id = p.user_id WHERE u.id = :wid"),
                    {"wid": m.worker_id}
                ).fetchone()
                w_name = f"{worker_row[1] or ''} {worker_row[2] or ''}".strip() if worker_row else f"Worker #{m.worker_id}"
                w_phone = worker_row[3] if worker_row else "N/A"
                taskforce_list.append({
                    "id": m.id,
                    "worker_id": m.worker_id,
                    "department": m.department,
                    "worker_name": w_name if w_name else f"Worker #{m.worker_id}",
                    "phone": w_phone,
                    "dispatched_at": m.dispatched_at
                })

            result.append({
                "id": em.id,
                "title": em.title,
                "description": em.description,
                "category": em.category,
                "severity": em.severity,
                "latitude": em.latitude,
                "longitude": em.longitude,
                "affected_radius_meters": em.affected_radius_meters,
                "status": em.status,
                "reported_by": em.reported_by,
                "dispatched_by": em.dispatched_by,
                "created_at": em.created_at,
                "resolved_at": em.resolved_at,
                "taskforce": taskforce_list
            })
        return result

    @staticmethod
    def get_nearby_workers(db: Session, emergency_lat: float, emergency_lng: float) -> List[dict]:
        """Find all available field workers registered for Emergency Response"""
        sql = """
            SELECT u.id, u.username, u.email, 
                   COALESCE(wp.department, 'emergency') as department,
                   COALESCE(wp.first_name, tp.first_name, u.username) as first_name,
                   COALESCE(wp.last_name, tp.last_name, '') as last_name,
                   COALESCE(wp.phone, tp.phone, 'N/A') as phone,
                   COALESCE(wp.availability, tp.availability, 'AVAILABLE') as availability
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN worker_profiles wp ON u.id = wp.user_id
            LEFT JOIN traffic_worker_profiles tp ON u.id = tp.user_id
            WHERE r.role_name = 'Worker' AND u.is_active = true
            AND (wp.department = 'emergency' OR wp.department IS NULL)
        """
        rows = db.execute(text(sql)).fetchall()
        nearby = []
        for r in rows:
            distance = round(haversine_km(emergency_lat, emergency_lng, emergency_lat + 0.01, emergency_lng + 0.01), 2)
            nearby.append({
                "id": r[0],
                "username": r[1],
                "email": r[2],
                "department": r[3],
                "worker_name": f"{r[4]} {r[5]}".strip(),
                "phone": r[6],
                "availability": r[7],
                "distance_km": distance
            })
        return nearby

    @staticmethod
    def dispatch_taskforce(db: Session, emergency_id: int, admin_id: int, schema: TaskforceDispatchSchema) -> bool:
        emergency = db.query(Emergency).filter(Emergency.id == emergency_id).first()
        if not emergency:
            return False
            
        emergency.dispatched_by = admin_id
        emergency.status = "CONTAINED"
        
        for wid in schema.worker_ids:
            member = EmergencyTaskforce(
                emergency_id=emergency_id,
                worker_id=wid,
                department=schema.department,
                notes=schema.notes
            )
            db.add(member)
            
            # Override worker status to EMERGENCY_DISPATCH
            db.execute(text("UPDATE worker_profiles SET availability = 'EMERGENCY_DISPATCH', status_updated_at = CURRENT_TIMESTAMP WHERE user_id = :wid"), {"wid": wid})
            db.execute(text("UPDATE traffic_worker_profiles SET availability = 'EMERGENCY_DISPATCH', status_updated_at = CURRENT_TIMESTAMP WHERE user_id = :wid"), {"wid": wid})

        db.commit()
        return True

    @staticmethod
    def create_broadcast(db: Session, schema: BroadcastCreateSchema) -> EmergencyBroadcast:
        broadcast = EmergencyBroadcast(
            emergency_id=schema.emergency_id,
            alert_title=schema.alert_title,
            message=schema.message,
            target_zone=schema.target_zone or "ALL_CITY",
            severity=schema.severity or "CRITICAL",
            is_active=True
        )
        db.add(broadcast)
        db.commit()
        db.refresh(broadcast)
        return broadcast

    @staticmethod
    def get_active_broadcasts(db: Session) -> List[EmergencyBroadcast]:
        return db.query(EmergencyBroadcast).filter(EmergencyBroadcast.is_active == True).order_by(EmergencyBroadcast.created_at.desc()).all()

    @staticmethod
    def resolve_emergency(db: Session, emergency_id: int) -> bool:
        from sqlalchemy.sql import func
        emergency = db.query(Emergency).filter(Emergency.id == emergency_id).first()
        if not emergency:
            return False
            
        emergency.status = "RESOLVED"
        emergency.resolved_at = func.now()
        
        # Reset taskforce workers back to AVAILABLE
        members = db.query(EmergencyTaskforce).filter(EmergencyTaskforce.emergency_id == emergency_id).all()
        for m in members:
            db.execute(text("UPDATE worker_profiles SET availability = 'AVAILABLE', status_updated_at = CURRENT_TIMESTAMP WHERE user_id = :wid"), {"wid": m.worker_id})
            db.execute(text("UPDATE traffic_worker_profiles SET availability = 'AVAILABLE', status_updated_at = CURRENT_TIMESTAMP WHERE user_id = :wid"), {"wid": m.worker_id})

        db.commit()
        return True
