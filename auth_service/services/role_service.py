from sqlalchemy.orm import Session
from models.role_model import Role
from models.permission_model import Permission


def get_default_role(db: Session) -> Role | None:
    role = db.query(Role).filter(
        Role.role_name == "Citizen"
    ).first()
    return role


def seed_roles(db: Session):
    default_roles = [
        {"role_name": "Citizen", "description": "Default role for public citizens to report issues"},
        {"role_name": "Officer", "description": "Municipal officers who resolve city issues"},
        {"role_name": "Admin", "description": "System administrator with full control"}
    ]
    
    for r in default_roles:
        existing_role = db.query(Role).filter(
            Role.role_name == r["role_name"]
        ).first()
        
        if not existing_role:
            db_role = Role(
                role_name=r["role_name"],
                description=r["description"]
            )
            db.add(db_role)
            print(f"Seeded role: {r['role_name']}")
            
    db.commit()


def seed_permissions(db: Session):
    default_permissions = [
        {"permission_name": "traffic:read", "description": "Can view traffic incidents"},
        {"permission_name": "traffic:write", "description": "Can manage traffic incidents"},
        {"permission_name": "waste:read", "description": "Can view waste management issues"},
        {"permission_name": "waste:write", "description": "Can manage waste management issues"},
        {"permission_name": "water:read", "description": "Can view water supply issues"},
        {"permission_name": "water:write", "description": "Can manage water supply issues"},
        {"permission_name": "emergency:read", "description": "Can view emergencies"},
        {"permission_name": "emergency:write", "description": "Can manage emergencies"},
        {"permission_name": "admin:all", "description": "Full administrative access"}
    ]
    
    for p in default_permissions:
        existing_perm = db.query(Permission).filter(
            Permission.permission_name == p["permission_name"]
        ).first()
        
        if not existing_perm:
            db_perm = Permission(
                permission_name=p["permission_name"],
                description=p["description"]
            )
            db.add(db_perm)
            print(f"Seeded permission: {p['permission_name']}")
            
    db.commit()