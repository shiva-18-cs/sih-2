import os
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.document import Document, DocumentChunk, TableData

client = TestClient(app)

def test_ingest_dataset_batch():
    response = client.post("/api/documents/ingest-dataset")
    assert response.status_code == 200
    data = response.json()
    assert "Successfully ingested" in data["message"]
    
    docs_resp = client.get("/api/documents")
    assert docs_resp.status_code == 200
    assert len(docs_resp.json()) >= 20

def test_list_documents():
    response = client.get("/api/documents")
    assert response.status_code == 200
    docs = response.json()
    assert len(docs) >= 20
    
    # Check that diverse document types and engines are recorded
    file_types = {d["file_type"] for d in docs}
    assert "pdf_digital" in file_types or "pdf" in file_types
    assert "spreadsheet" in file_types
    assert "image" in file_types

def test_document_chunks_and_tables_saved():
    with SessionLocal() as db:
        # Check chunks
        chunks = db.query(DocumentChunk).all()
        assert len(chunks) > 0, "Chunks must be created for ingested documents"
        first_chunk = chunks[0]
        assert first_chunk.page_no >= 1
        assert len(first_chunk.chunk_text) > 10
        
        # Check table data
        tables = db.query(TableData).all()
        assert len(tables) > 0, "Table data must be parsed and stored"
        first_tbl = tables[0]
        assert len(first_tbl.headers) > 0
        assert len(first_tbl.rows) > 0

def test_scanned_image_ocr_confidence():
    response_all = client.get("/api/documents")
    assert response_all.status_code == 200
    image_docs = [d for d in response_all.json() if d["file_type"] == "image"]
    assert len(image_docs) >= 4
    for img_doc in image_docs:
        assert img_doc["ocr_engine"] is not None
        assert img_doc["avg_ocr_confidence"] > 0
