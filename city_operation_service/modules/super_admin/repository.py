from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List, Tuple
from modules.complaints.model import Complaint, ComplaintStatus

class SuperAdminRepository:
    @staticmethod
    def get_master_summary(db: Session) -> dict:
        total_complaints = db.query(Complaint).count()
        
        resolved_complaints = db.execute(text("SELECT COUNT(*) FROM complaints WHERE status ILIKE '%RESOLVED%'")).scalar() or 0
        closed_complaints = db.execute(text("SELECT COUNT(*) FROM complaints WHERE status ILIKE '%CLOSED%'")).scalar() or 0
        pending_complaints = db.execute(text("SELECT COUNT(*) FROM complaints WHERE status ILIKE '%PENDING%' OR status ILIKE '%NEW%'")).scalar() or 0
        active_complaints = db.execute(text("SELECT COUNT(*) FROM complaints WHERE status ILIKE '%ASSIGN%' OR status ILIKE '%IN_PROGRESS%'")).scalar() or 0

        total_users = db.execute(text("SELECT COUNT(*) FROM users")).scalar() or 0
        
        total_workers = db.execute(text("""
            SELECT COUNT(DISTINCT id) FROM (
                SELECT user_id as id FROM worker_profiles
                UNION
                SELECT user_id as id FROM traffic_worker_profiles
                UNION
                SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'Worker'
            ) AS all_workers
        """)).scalar() or 0

        total_admins = db.execute(text("""
            SELECT COUNT(*) FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE r.role_name IN ('Department_Admin', 'Admin', 'Super_Admin')
        """)).scalar() or 0

        # Breakdown by department
        dept_counts = db.execute(text("SELECT department, COUNT(*) FROM complaints GROUP BY department")).fetchall()
        departments_summary = {r[0]: r[1] for r in dept_counts if r[0]}

        return {
            "total_complaints": total_complaints,
            "resolved_complaints": resolved_complaints,
            "closed_complaints": closed_complaints,
            "pending_complaints": pending_complaints,
            "active_complaints": active_complaints,
            "total_users": total_users,
            "total_workers": total_workers,
            "total_admins": total_admins,
            "departments_summary": departments_summary
        }

    @staticmethod
    def list_all_users(
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        role_filter: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        base_where = "WHERE 1=1"
        params = {}

        if search:
            base_where += " AND (u.username ILIKE :search OR u.email ILIKE :search)"
            params["search"] = f"%{search}%"

        if role_filter:
            base_where += " AND r.role_name = :role_filter"
            params["role_filter"] = role_filter

        count_sql = f"""
            SELECT COUNT(*)
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            {base_where}
        """
        total_items = db.execute(text(count_sql), params).scalar() or 0

        data_sql = f"""
            SELECT u.id, u.username, u.email, u.is_active, u.is_verified, u.created_at,
                   r.id as role_id, r.role_name,
                   COALESCE(wp.first_name, tp.first_name, u.username) as first_name,
                   COALESCE(wp.last_name, tp.last_name, '') as last_name,
                   COALESCE(wp.phone, tp.phone, 'N/A') as phone,
                   COALESCE(wp.department, CASE WHEN tp.user_id IS NOT NULL THEN 'traffic' ELSE 'N/A' END) as department
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN worker_profiles wp ON u.id = wp.user_id
            LEFT JOIN traffic_worker_profiles tp ON u.id = tp.user_id
            {base_where}
            ORDER BY u.created_at DESC
            LIMIT :limit OFFSET :offset
        """
        params["limit"] = page_size
        params["offset"] = (page - 1) * page_size

        rows = db.execute(text(data_sql), params).fetchall()
        items = []
        for r in rows:
            # Fetch user permissions
            perm_rows = db.execute(
                text("""
                    SELECT p.id, p.permission_name, p.description 
                    FROM user_permissions up 
                    JOIN permissions p ON up.permission_id = p.id 
                    WHERE up.user_id = :uid
                """),
                {"uid": r[0]}
            ).fetchall()
            user_perms = [{"id": pr[0], "permission_name": pr[1], "description": pr[2]} for pr in perm_rows]

            items.append({
                "id": r[0],
                "username": r[1],
                "email": r[2],
                "is_active": r[3],
                "is_verified": r[4],
                "created_at": r[5],
                "role_id": r[6],
                "role_name": r[7] or "Citizen",
                "first_name": r[8],
                "last_name": r[9],
                "phone": r[10],
                "department": r[11],
                "permissions": user_perms
            })

        return items, total_items

    @staticmethod
    def reroute_complaint(db: Session, complaint_id: int, new_department: str) -> Optional[Complaint]:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            return None
        complaint.department = new_department
        complaint.assigned_worker_id = None # Reset worker on department transfer
        complaint.status = ComplaintStatus.PENDING.value
        db.commit()
        db.refresh(complaint)
        return complaint
