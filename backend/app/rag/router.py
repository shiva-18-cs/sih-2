"""
Query Router: FastAPI endpoints for RAG query, high-priority query management, and topic engine.
"""
import time
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User, AuditLog
from app.models.query import QueryLog, SourceReference, HighPriorityQuery
from app.rag.retriever import retrieve_chunks
from app.rag.generator import generate_grounded_answer
from app.rag.indexer import index_all_unembedded
from app.rag.topic_engine import get_topic_summary

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/query", tags=["Query & RAG"])


# ─── Schemas ────────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    query_text: str = Field(..., min_length=3, max_length=1000)
    subsidiary_filter: Optional[str] = None
    year_filter: Optional[int] = None
    doc_type_filter: Optional[str] = None
    is_high_priority: bool = False

class HighPriorityQueryCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    query_text: str = Field(..., min_length=3, max_length=2000)
    assigned_reviewer: Optional[str] = None

class HighPriorityStageUpdate(BaseModel):
    stage: Optional[str] = None
    status: Optional[str] = None
    extracted_data: Optional[dict] = None
    validation_status: Optional[str] = None
    draft_response: Optional[str] = None
    final_response: Optional[str] = None
    reviewed_by: Optional[str] = None


# ─── Standard RAG Query ─────────────────────────────────────────────────────

@router.post("/ask")
def ask_query(
    req: QueryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Source-grounded RAG query endpoint.
    Retrieves relevant document chunks and generates a grounded answer.
    """
    start_ms = time.time()

    # Retrieve top-k chunks
    chunks = retrieve_chunks(
        query=req.query_text,
        db=db,
        subsidiary_filter=req.subsidiary_filter,
        year_filter=req.year_filter,
        doc_type_filter=req.doc_type_filter,
    )

    # Generate grounded answer
    answer, sources, is_insufficient = generate_grounded_answer(req.query_text, chunks)

    latency = int((time.time() - start_ms) * 1000)

    # Persist query log
    qlog = QueryLog(
        user_id=current_user.id,
        username=current_user.username,
        query_text=req.query_text,
        answer_text=answer,
        is_high_priority=req.is_high_priority,
        is_insufficient_evidence=is_insufficient,
        latency_ms=latency,
    )
    db.add(qlog)
    db.flush()

    # Persist source references
    for src in sources:
        sref = SourceReference(
            query_log_id=qlog.id,
            document_name=src["document_name"],
            page_no=src["page_no"],
            snippet_text=src["snippet_text"],
            similarity_score=src["similarity_score"],
            metric_tag=src.get("metric_tag"),
        )
        db.add(sref)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        role=current_user.role,
        action="AI_QUERY_SUBMITTED",
        resource_type="QueryLog",
        resource_id=qlog.id,
        details={"query": req.query_text[:100], "sources_count": len(sources), "latency_ms": latency},
    )
    db.add(audit)
    db.commit()

    return {
        "query_id": qlog.id,
        "query_text": req.query_text,
        "answer": answer,
        "is_insufficient_evidence": is_insufficient,
        "latency_ms": latency,
        "sources": [
            {
                "document_name": s["document_name"],
                "page_no": s["page_no"],
                "snippet": s["snippet_text"][:300],
                "similarity": s["similarity_score"],
                "metric_tag": s.get("metric_tag"),
            }
            for s in sources
        ],
        "retrieved_chunks_count": len(chunks),
    }


# ─── Query History ───────────────────────────────────────────────────────────

@router.get("/history")
def get_query_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return recent query history for the current user."""
    logs = (
        db.query(QueryLog)
        .order_by(QueryLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": q.id,
            "query_text": q.query_text,
            "answer_preview": q.answer_text[:200] if q.answer_text else "",
            "is_insufficient_evidence": q.is_insufficient_evidence,
            "latency_ms": q.latency_ms,
            "created_at": q.created_at.isoformat(),
        }
        for q in logs
    ]


# ─── High-Priority Query Workflow ────────────────────────────────────────────

@router.post("/high-priority")
def create_high_priority_query(
    req: HighPriorityQueryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hpq = HighPriorityQuery(
        title=req.title,
        query_text=req.query_text,
        stage="historical_search",
        status="in_progress",
        assigned_reviewer=req.assigned_reviewer,
        created_by=current_user.username,
    )
    db.add(hpq)

    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        role=current_user.role,
        action="HIGH_PRIORITY_QUERY_CREATED",
        resource_type="HighPriorityQuery",
        resource_id=None,
        details={"title": req.title},
    )
    db.add(audit)
    db.commit()
    db.refresh(hpq)

    return {"id": hpq.id, "title": hpq.title, "stage": hpq.stage, "status": hpq.status}


@router.get("/high-priority")
def list_high_priority_queries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = db.query(HighPriorityQuery).order_by(HighPriorityQuery.created_at.desc()).limit(50).all()
    return [
        {
            "id": q.id,
            "title": q.title,
            "stage": q.stage,
            "status": q.status,
            "validation_status": q.validation_status,
            "created_by": q.created_by,
            "assigned_reviewer": q.assigned_reviewer,
            "created_at": q.created_at.isoformat(),
        }
        for q in items
    ]


@router.patch("/high-priority/{query_id}")
def update_high_priority_query(
    query_id: str,
    update: HighPriorityStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hpq = db.query(HighPriorityQuery).filter(HighPriorityQuery.id == query_id).first()
    if not hpq:
        raise HTTPException(status_code=404, detail="High-priority query not found")

    if update.stage:
        hpq.stage = update.stage
    if update.status:
        hpq.status = update.status
    if update.extracted_data is not None:
        hpq.extracted_data = update.extracted_data
    if update.validation_status:
        hpq.validation_status = update.validation_status
    if update.draft_response:
        hpq.draft_response = update.draft_response
    if update.final_response:
        hpq.final_response = update.final_response
    if update.reviewed_by:
        hpq.reviewed_by = update.reviewed_by

    db.commit()
    return {"id": hpq.id, "stage": hpq.stage, "status": hpq.status}


# ─── Indexing Trigger ────────────────────────────────────────────────────────

@router.post("/index")
def trigger_indexing(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger background embedding indexing for all un-embedded chunks."""
    if current_user.role not in ["Administrator", "Implementation Agency"]:
        raise HTTPException(status_code=403, detail="Only admins and implementation agency can trigger indexing")

    def _index(db_session: Session):
        index_all_unembedded(db_session)

    background_tasks.add_task(index_all_unembedded, db)
    return {"message": "Indexing triggered in background"}


# ─── Topic Engine ────────────────────────────────────────────────────────────

@router.get("/topics")
def get_topics(
    subsidiary: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return topic word frequencies for word cloud visualization."""
    return get_topic_summary(db=db, subsidiary=subsidiary, year=year)
