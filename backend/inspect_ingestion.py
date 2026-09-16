from app.core.database import SessionLocal
from app.models.document import Document, DocumentChunk

with SessionLocal() as db:
    docs = db.query(Document).order_by(Document.file_type, Document.filename).all()
    print(f"Total Ingested Documents in DB: {len(docs)}\n")
    header_fmt = "{:<48} | {:<12} | {:<12} | {:<6} | {:<45}"
    print(header_fmt.format("Filename", "Type", "Engine", "Conf", "Snippet Preview"))
    print("-" * 135)
    for d in docs:
        first_chunk = db.query(DocumentChunk).filter(DocumentChunk.document_id == d.id).first()
        snippet = (first_chunk.chunk_text[:42] + "...") if first_chunk else "N/A"
        snippet = snippet.replace("\n", " ")
        print(header_fmt.format(d.filename[:48], d.file_type, str(d.ocr_engine or "none")[:12], f"{d.avg_ocr_confidence:.1f}", snippet))
