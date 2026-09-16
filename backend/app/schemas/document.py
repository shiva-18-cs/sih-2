from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentChunkResponse(BaseModel):
    id: str
    chunk_index: int
    page_no: int
    chunk_text: str
    token_count: Optional[int] = None
    chunk_metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class TableDataResponse(BaseModel):
    id: str
    page_no: int
    table_name: Optional[str] = None
    headers: List[str]
    rows: List[List[Any]]
    raw_csv: Optional[str] = None

    class Config:
        from_attributes = True

class EntityResponse(BaseModel):
    id: str
    page_no: int
    entity_type: str
    entity_name: str
    normalized_value: Optional[str] = None
    metric_value: Optional[float] = None
    unit: Optional[str] = None
    confidence: float

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    document_type: Optional[str] = None
    subsidiary: Optional[str] = None
    mine_name: Optional[str] = None
    department: Optional[str] = None
    report_year: Optional[int] = None
    report_period: Optional[str] = None
    page_count: int
    status: str
    ocr_engine: Optional[str] = None
    avg_ocr_confidence: float
    has_low_confidence_pages: bool
    created_at: datetime
    chunks: Optional[List[DocumentChunkResponse]] = None
    tables: Optional[List[TableDataResponse]] = None
    entities: Optional[List[EntityResponse]] = None

    class Config:
        from_attributes = True
