import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class QueryLog(Base):
    __tablename__ = "query_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    username = Column(String(100), nullable=True)
    query_text = Column(Text, nullable=False)
    query_language = Column(String(20), default="en") # en, hi
    answer_text = Column(Text, nullable=False)
    is_high_priority = Column(Boolean, default=False)
    is_insufficient_evidence = Column(Boolean, default=False)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    sources = relationship("SourceReference", back_populates="query_log", cascade="all, delete-orphan")

class SourceReference(Base):
    __tablename__ = "source_references"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    query_log_id = Column(String(36), ForeignKey("query_logs.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), nullable=True)
    document_name = Column(String(255), nullable=False)
    page_no = Column(Integer, default=1)
    snippet_text = Column(Text, nullable=False)
    similarity_score = Column(Float, nullable=True)
    metric_tag = Column(String(100), nullable=True)

    query_log = relationship("QueryLog", back_populates="sources")

class HighPriorityQuery(Base):
    __tablename__ = "high_priority_queries"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    query_text = Column(Text, nullable=False)
    stage = Column(String(50), default="historical_search")
    # Stages: historical_search -> information_extraction -> validation -> response_draft -> human_review -> final_response
    status = Column(String(50), default="in_progress") # in_progress, completed, rejected
    extracted_data = Column(JSON, nullable=True)
    validation_status = Column(String(50), default="pending")
    draft_response = Column(Text, nullable=True)
    final_response = Column(Text, nullable=True)
    sources = Column(JSON, nullable=True)
    assigned_reviewer = Column(String(100), nullable=True)
    reviewed_by = Column(String(100), nullable=True)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
