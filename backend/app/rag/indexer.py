"""
Indexing service: generates embeddings for existing DocumentChunk records that lack them.
Runs as a background task after ingestion.
"""
import logging
from typing import List
from sqlalchemy.orm import Session
from app.models.document import DocumentChunk
from app.rag.embeddings import embed_texts

logger = logging.getLogger(__name__)

BATCH_SIZE = 50


def index_document_chunks(document_id: str, db: Session) -> int:
    """
    Compute and store embeddings for all chunks of a given document.
    Returns count of chunks indexed.
    """
    chunks: List[DocumentChunk] = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index)
        .all()
    )

    if not chunks:
        return 0

    # Process in batches
    indexed = 0
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c.chunk_text for c in batch]
        vectors = embed_texts(texts)
        for chunk, vec in zip(batch, vectors):
            if vec is not None:
                chunk.embedding = vec
                indexed += 1

    db.commit()
    logger.info(f"Indexed {indexed}/{len(chunks)} chunks for document {document_id}")
    return indexed


def index_all_unembedded(db: Session) -> int:
    """
    Batch-index all chunks across the database that do not yet have embeddings.
    """
    chunks: List[DocumentChunk] = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.embedding == None)  # noqa: E711
        .limit(500)
        .all()
    )

    if not chunks:
        return 0

    texts = [c.chunk_text for c in chunks]
    vectors = embed_texts(texts)
    indexed = 0
    for chunk, vec in zip(chunks, vectors):
        if vec is not None:
            chunk.embedding = vec
            indexed += 1
    db.commit()
    logger.info(f"Bulk indexed {indexed} chunks")
    return indexed
