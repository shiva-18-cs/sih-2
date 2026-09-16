from sqlalchemy.orm import Session
from app.models.user import User, AuditLog
from app.core.security import get_password_hash

DEMO_USERS = [
    {
        "username": "admin",
        "email": "admin@cmpdi.co.in",
        "password": "admin123",
        "role": "Administrator",
        "full_name": "Chief System Administrator (HQ)"
    },
    {
        "username": "coordinator",
        "email": "coordinator@cmpdi.co.in",
        "password": "coord123",
        "role": "Project Coordinator",
        "full_name": "Dr. A. Verma (Project Coordinator)"
    },
    {
        "username": "director",
        "email": "director@cmpdi.co.in",
        "password": "direct123",
        "role": "Director/Senior Officer",
        "full_name": "Shri R. K. Sharma (Director Technical)"
    },
    {
        "username": "agency",
        "email": "agency@cmpdi.co.in",
        "password": "agency123",
        "role": "Implementation Agency",
        "full_name": "Technical Ops Support Team"
    },
    {
        "username": "auditor",
        "email": "auditor@coalindia.in",
        "password": "audit123",
        "role": "Auditor",
        "full_name": "Smt. P. Sengupta (Chief Vigilance & Statutory Auditor)"
    }
]

def seed_demo_users(db: Session):
    for u in DEMO_USERS:
        existing = db.query(User).filter(User.username == u["username"]).first()
        if not existing:
            user = User(
                username=u["username"],
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"],
                full_name=u["full_name"],
                is_active=True
            )
            db.add(user)
    db.commit()
    print("Pre-seeded 5 RBAC demo users successfully.")
