import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Entity(Base):
    __tablename__ = "entities"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_no = Column(Integer, default=1)
    entity_type = Column(String(100), nullable=False, index=True) # subsidiary, mine, year, metric_coal_production, metric_overburden, coal_seam, grade, keyword, safety_metric
    entity_name = Column(String(255), nullable=False)
    entity_value = Column(String(255), nullable=True)  # Raw string value (e.g., "14.5 MT")
    normalized_value = Column(String(255), nullable=True)
    metric_value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)  # MT, MCu.M, %, kcal/kg, Rs. Crore
    confidence = Column(Float, default=1.0)
    subsidiary = Column(String(100), nullable=True, index=True)
    year = Column(String(10), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="entities")

class ConflictRecord(Base):
    __tablename__ = "conflict_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    conflict_id = Column(String(50), nullable=True)
    source_a_doc_id = Column(String(36), nullable=True)
    source_a_filename = Column(String(255), nullable=False)
    source_a_page = Column(Integer, default=1)
    source_a_value = Column(String(255), nullable=False)
    
    source_b_doc_id = Column(String(36), nullable=True)
    source_b_filename = Column(String(255), nullable=False)
    source_b_page = Column(Integer, default=1)
    source_b_value = Column(String(255), nullable=False)
    
    metric_name = Column(String(100), nullable=False, index=True)
    metric_type = Column(String(100), nullable=True)  # alias for metric_name
    subsidiary = Column(String(100), nullable=True)
    mine_name = Column(String(100), nullable=True)
    year = Column(Integer, nullable=True)
    conflict_type = Column(String(50), default="cross_document_discrepancy")  # cross_document_discrepancy, mathematical_sum_mismatch
    severity = Column(String(20), default="warning")  # critical, warning, info
    conflicting_values = Column(JSON, nullable=True)   # [{doc, value}, {doc, value}]
    documents_involved = Column(JSON, nullable=True)   # [doc_id_a, doc_id_b]
    
    status = Column(String(50), default="open", index=True)  # open, resolved
    resolved_value = Column(String(255), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
