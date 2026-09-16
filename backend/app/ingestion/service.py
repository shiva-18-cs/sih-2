import os
import shutil
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.document import Document, DocumentChunk, TableData
from app.models.user import AuditLog
from app.ingestion.parser import (
    classify_file_type, parse_pdf, parse_docx, parse_spreadsheet, 
    parse_image_file, chunk_document_text
)

def ingest_file(
    file_path: str,
    original_filename: str,
    db: Session,
    user_id: str = None,
    username: str = "system"
) -> Document:
    """
    Core ingestion service:
    1. Determines file type and parses text + tables
    2. Runs OCR if necessary with confidence tracking
    3. Chunks text with page preservation
    4. Saves Document, DocumentChunk, and TableData to database
    5. Writes to AuditLog
    """
    ext = os.path.splitext(original_filename)[1].lower()
    file_cat = classify_file_type(original_filename)
    
    # Store copy in storage dir
    dest_path = os.path.join(settings.STORAGE_DIR, f"{uuid.uuid4()}_{original_filename}")
    if os.path.abspath(file_path) != os.path.abspath(dest_path):
        shutil.copy2(file_path, dest_path)

    # Parse content based on type
    if file_cat == "pdf":
        parsed = parse_pdf(dest_path)
    elif file_cat == "docx":
        parsed = parse_docx(dest_path)
    elif file_cat in ["xlsx", "csv"]:
        parsed = parse_spreadsheet(dest_path)
    elif file_cat == "image":
        parsed = parse_image_file(dest_path)
    else:
        # Fallback text
        with open(dest_path, "r", encoding="utf-8", errors="replace") as f:
            t = f.read()
        parsed = {
            "file_type": "text",
            "page_count": 1,
            "pages": [{"page_no": 1, "text": t}],
            "tables": [],
            "ocr_engine": "none",
            "avg_ocr_confidence": 100.0,
            "has_low_confidence_pages": False
        }

    # Initial classification heuristics (will be refined in Module 3)
    fn_lower = original_filename.lower()
    doc_type = "Production"
    if "geo" in fn_lower or "drill" in fn_lower or "reserve" in fn_lower or "seam" in fn_lower:
        doc_type = "Geological"
    elif "safety" in fn_lower or "dgms" in fn_lower or "audit" in fn_lower or "inspection" in fn_lower or "ventilation" in fn_lower:
        doc_type = "Inspection"
    elif "parliamentary" in fn_lower or "query" in fn_lower:
        doc_type = "Parliamentary"
    elif "admin" in fn_lower or "csr" in fn_lower:
        doc_type = "Administrative"

    subsidiary = None
    if "ncsl" in fn_lower or "northern" in fn_lower:
        subsidiary = "Northern Coalfields Sample Ltd"
    elif "emsl" in fn_lower or "eastern" in fn_lower:
        subsidiary = "Eastern Mining Sample Ltd"
    elif "ccsl" in fn_lower or "central" in fn_lower:
        subsidiary = "Central Collieries Sample Ltd"
    elif "cil" in fn_lower:
        subsidiary = "Coal India Limited (Sample Multi-Subsidiary)"

    year = None
    for y in [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2005, 1998]:
        if str(y) in fn_lower:
            year = y
            break

    # Create Document record
    doc_record = Document(
        filename=original_filename,
        file_path=dest_path,
        file_type=parsed["file_type"],
        document_type=doc_type,
        subsidiary=subsidiary,
        report_year=year,
        report_period=f"FY {year}" if year else None,
        page_count=parsed["page_count"],
        status="flagged" if parsed["has_low_confidence_pages"] else "ingested",
        ocr_engine=parsed["ocr_engine"],
        avg_ocr_confidence=parsed["avg_ocr_confidence"],
        has_low_confidence_pages=parsed["has_low_confidence_pages"],
        created_by=user_id
    )
    db.add(doc_record)
    db.flush() # Populate doc_record.id

    # Create Document Chunks
    chunks = chunk_document_text(parsed["pages"])
    for ch in chunks:
        chunk_rec = DocumentChunk(
            document_id=doc_record.id,
            chunk_index=ch["chunk_index"],
            page_no=ch["page_no"],
            chunk_text=ch["chunk_text"],
            token_count=ch["token_count"],
            chunk_metadata={
                "subsidiary": subsidiary,
                "year": year,
                "document_type": doc_type,
                "filename": original_filename
            }
        )
        db.add(chunk_rec)

    # Create Table Data records
    for tbl in parsed["tables"]:
        tbl_rec = TableData(
            document_id=doc_record.id,
            page_no=tbl["page_no"],
            table_name=tbl["table_name"],
            headers=tbl["headers"],
            rows=tbl["rows"],
            raw_csv=tbl["raw_csv"]
        )
        db.add(tbl_rec)

    # Create Audit Log entry
    audit = AuditLog(
        user_id=user_id,
        username=username,
        role="Project Coordinator" if username == "coordinator" else "System",
        action="DOCUMENT_UPLOADED",
        resource_type="Document",
        resource_id=doc_record.id,
        details={
            "filename": original_filename,
            "file_type": parsed["file_type"],
            "ocr_engine": parsed["ocr_engine"],
            "avg_ocr_confidence": parsed["avg_ocr_confidence"],
            "chunks_count": len(chunks),
            "tables_count": len(parsed["tables"])
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(doc_record)
    
    return doc_record
