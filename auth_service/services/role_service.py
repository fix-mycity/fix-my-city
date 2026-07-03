from sqlalchemy.orm import Session
from models.role_model import Role


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