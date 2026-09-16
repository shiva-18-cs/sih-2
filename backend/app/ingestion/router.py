import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document
from app.models.user import User, AuditLog
from app.schemas.document import DocumentResponse
from app.auth.dependencies import get_current_user, require_roles
from app.ingestion.service import ingest_file

router = APIRouter(prefix="/documents", tags=["Document Ingestion & Management"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["Administrator", "Project Coordinator", "Implementation Agency"])),
    db: Session = Depends(get_db)
):
    temp_path = os.path.join(settings.STORAGE_DIR, f"temp_{file.filename}")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        doc = ingest_file(
            file_path=temp_path,
            original_filename=file.filename,
            db=db,
            user_id=current_user.id,
            username=current_user.username
        )
        return doc
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    subsidiary: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    document_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    has_low_confidence: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if subsidiary:
        query = query.filter(Document.subsidiary.ilike(f"%{subsidiary}%"))
    if year:
        query = query.filter(Document.report_year == year)
    if document_type:
        query = query.filter(Document.document_type == document_type)
    if status_filter:
        query = query.filter(Document.status == status_filter)
    if has_low_confidence is not None:
        query = query.filter(Document.has_low_confidence_pages == has_low_confidence)
        
    return query.order_by(Document.created_at.desc()).all()

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{document_id}/file")
def get_document_file(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on disk")
    return FileResponse(doc.file_path, filename=doc.filename)

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: User = Depends(require_roles(["Administrator", "Project Coordinator"])),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    filename = doc.filename
    file_path = doc.file_path
    
    db.delete(doc)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        role=current_user.role,
        action="DOCUMENT_DELETED",
        resource_type="Document",
        resource_id=document_id,
        details={"filename": filename}
    )
    db.add(audit)
    db.commit()
    
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass
            
    return {"message": f"Document '{filename}' deleted successfully"}

@router.post("/ingest-dataset", response_model=dict)
def ingest_full_dataset(
    db: Session = Depends(get_db)
):
    """Batch ingests all synthetic raw documents from dataset/raw_docs/"""
    raw_docs_dir = os.path.join(settings.DATASET_DIR, "raw_docs")
    if not os.path.exists(raw_docs_dir):
        raise HTTPException(status_code=400, detail="dataset/raw_docs folder not found")
        
    ingested_count = 0
    results = []
    
    for root, _, files in os.walk(raw_docs_dir):
        for f in files:
            # Ingest all multi-modal documents (.pdf, .xlsx, .csv, .png, .docx)
            ext = os.path.splitext(f)[1].lower()
            if ext in [".pdf", ".xlsx", ".csv", ".png", ".docx"]:
                # Avoid duplicate ingestion of identical filename
                existing = db.query(Document).filter(Document.filename == f).first()
                if not existing:
                    full_path = os.path.join(root, f)
                    doc = ingest_file(
                        file_path=full_path,
                        original_filename=f,
                        db=db,
                        username="system_auto_ingest"
                    )
                    ingested_count += 1
                    results.append({
                        "filename": doc.filename,
                        "file_type": doc.file_type,
                        "ocr_engine": doc.ocr_engine,
                        "avg_confidence": doc.avg_ocr_confidence,
                        "status": doc.status
                    })
                    
    return {
        "message": f"Successfully ingested {ingested_count} dataset documents",
        "total_ingested": ingested_count,
        "documents": results
    }
