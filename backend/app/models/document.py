import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False) # pdf_digital, pdf_scanned, image, xlsx, csv, docx
    document_type = Column(String(50), nullable=True, index=True) # Production, Geological, Mining, Inspection, Administrative, Parliamentary, Project
    subsidiary = Column(String(100), nullable=True, index=True)
    mine_name = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    report_year = Column(Integer, nullable=True, index=True)
    report_period = Column(String(50), nullable=True)
    page_count = Column(Integer, default=1)
    status = Column(String(50), default="ingested") # ingested, processing, validated, flagged
    ocr_engine = Column(String(50), nullable=True) # digital_text, tesseract, paddleocr, none
    avg_ocr_confidence = Column(Float, default=100.0)
    has_low_confidence_pages = Column(Boolean, default=False)
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    tables = relationship("TableData", back_populates="document", cascade="all, delete-orphan")
    entities = relationship("Entity", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_no = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=True)
    embedding = Column(JSON, nullable=True) # Vector representation (384-d list)
    chunk_metadata = Column(JSON, nullable=True) # {subsidiary, year, document_type, department}
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

class TableData(Base):
    __tablename__ = "table_data"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_no = Column(Integer, default=1)
    table_name = Column(String(255), nullable=True)
    headers = Column(JSON, nullable=False) # ["Col1", "Col2"]
    rows = Column(JSON, nullable=False) # [["Val1", "Val2"]]
    raw_csv = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="tables")
