from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SourceCitationSchema(BaseModel):
    document_name: str
    document_id: Optional[str] = None
    page_no: int
    snippet_text: str
    similarity_score: Optional[float] = None
    metric_tag: Optional[str] = None

class QueryRequest(BaseModel):
    query: str
    subsidiary: Optional[str] = None
    year: Optional[int] = None
    document_type: Optional[str] = None
    department: Optional[str] = None
    language: Optional[str] = "en" # "en", "hi"
    is_high_priority: Optional[bool] = False

class QueryResponse(BaseModel):
    id: str
    query_text: str
    query_language: str
    answer_text: str
    is_insufficient_evidence: bool
    sources: List[SourceCitationSchema]
    latency_ms: int
    created_at: datetime

    class Config:
        from_attributes = True

class HighPriorityQueryCreate(BaseModel):
    title: str
    query_text: str

class HighPriorityQueryResponse(BaseModel):
    id: str
    title: str
    query_text: str
    stage: str
    status: str
    extracted_data: Optional[Dict[str, Any]] = None
    validation_status: str
    draft_response: Optional[str] = None
    final_response: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = None
    assigned_reviewer: Optional[str] = None
    reviewed_by: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
