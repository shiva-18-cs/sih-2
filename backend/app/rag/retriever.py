"""
Retriever: Hybrid semantic + metadata-filtered retrieval from DocumentChunk store.
Uses cosine similarity on stored JSON vectors (SQLite/Postgres compatible).
"""
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.document import DocumentChunk, Document
from app.rag.embeddings import embed_query, cosine_similarity

logger = logging.getLogger(__name__)

TOP_K = 8
MIN_SIMILARITY = 0.15


def retrieve_chunks(
    query: str,
    db: Session,
    top_k: int = TOP_K,
    subsidiary_filter: Optional[str] = None,
    year_filter: Optional[int] = None,
    doc_type_filter: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieve the most relevant document chunks for a query.
    
    Returns a list of dicts with keys:
        chunk_id, document_id, document_name, page_no, chunk_text,
        similarity, subsidiary, year, document_type
    """
    query_vec = embed_query(query)

    # Fetch candidate chunks (with optional metadata filters)
    q = (
        db.query(DocumentChunk, Document)
        .join(Document, DocumentChunk.document_id == Document.id)
        .filter(DocumentChunk.embedding != None)  # noqa: E711
    )
    if subsidiary_filter:
        q = q.filter(Document.subsidiary == subsidiary_filter)
    if year_filter:
        q = q.filter(Document.report_year == year_filter)
    if doc_type_filter:
        q = q.filter(Document.document_type == doc_type_filter)

    candidates = q.limit(300).all()

    if not candidates:
        # Fallback: keyword-based retrieval (no embeddings)
        return _keyword_fallback(query, db, top_k, subsidiary_filter, year_filter, doc_type_filter)

    scored = []
    for chunk, doc in candidates:
        if query_vec and chunk.embedding:
            vec = chunk.embedding if isinstance(chunk.embedding, list) else json.loads(chunk.embedding)
            sim = cosine_similarity(query_vec, vec)
        else:
            # If no embedding, use basic keyword overlap as score
            keywords = set(query.lower().split())
            chunk_words = set(chunk.chunk_text.lower().split())
            sim = len(keywords & chunk_words) / max(len(keywords), 1) * 0.5

        if sim >= MIN_SIMILARITY:
            scored.append({
                "chunk_id": chunk.id,
                "document_id": doc.id,
                "document_name": doc.filename,
                "page_no": chunk.page_no,
                "chunk_text": chunk.chunk_text,
                "similarity": round(sim, 4),
                "subsidiary": doc.subsidiary,
                "year": doc.report_year,
                "document_type": doc.document_type,
            })

    # Sort by similarity descending
    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:top_k]


def _keyword_fallback(
    query: str,
    db: Session,
    top_k: int,
    subsidiary_filter: Optional[str],
    year_filter: Optional[int],
    doc_type_filter: Optional[str],
) -> List[Dict[str, Any]]:
    """Fallback: simple keyword overlap when no embeddings are available."""
    q = (
        db.query(DocumentChunk, Document)
        .join(Document, DocumentChunk.document_id == Document.id)
    )
    if subsidiary_filter:
        q = q.filter(Document.subsidiary == subsidiary_filter)
    if year_filter:
        q = q.filter(Document.report_year == year_filter)
    if doc_type_filter:
        q = q.filter(Document.document_type == doc_type_filter)

    all_chunks = q.limit(200).all()
    keywords = set(query.lower().split())
    scored = []
    for chunk, doc in all_chunks:
        words = set(chunk.chunk_text.lower().split())
        score = len(keywords & words) / max(len(keywords), 1)
        if score > 0:
            scored.append({
                "chunk_id": chunk.id,
                "document_id": doc.id,
                "document_name": doc.filename,
                "page_no": chunk.page_no,
                "chunk_text": chunk.chunk_text,
                "similarity": round(score * 0.5, 4),
                "subsidiary": doc.subsidiary,
                "year": doc.report_year,
                "document_type": doc.document_type,
            })
    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:top_k]
