import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False) # production_summary, geological_summary, compliance_inspection, conflict_analysis
    subsidiary = Column(String(100), nullable=True)
    period_start = Column(Integer, nullable=True)
    period_end = Column(Integer, nullable=True)
    report_year = Column(Integer, nullable=True, index=True)
    parameters = Column(JSON, nullable=True)
    content_json = Column(JSON, nullable=True) # Full structured report content
    file_path = Column(String(512), nullable=True)  # PDF file path
    status = Column(String(50), default="draft", index=True) # draft, pending_approval, approved, rejected
    generated_by = Column(String(100), nullable=True)  # user_id who generated
    created_by = Column(String(100), nullable=True)  # username
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
