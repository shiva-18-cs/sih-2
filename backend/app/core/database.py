import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Engine setup
DATABASE_URL = settings.DATABASE_URL

# For development flexibility: if postgres is not yet up on local port, allow SQLite local fallback
# while keeping postgresql as the primary in docker-compose.
if DATABASE_URL.startswith("postgresql"):
    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test quick connection
        with engine.connect() as conn:
            pass
    except Exception:
        # Fallback to local file db for seamless offline testing if postgres container is not running
        fallback_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../cmpdi_dev.db"))
        DATABASE_URL = f"sqlite:///{fallback_db}"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
