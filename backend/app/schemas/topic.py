from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class WordCloudItem(BaseModel):
    text: str
    value: int
    category: Optional[str] = None

class WordCloudResponse(BaseModel):
    words: List[WordCloudItem]
    total_documents: int
    filters_applied: Dict[str, Any]

class TopicTrendItem(BaseModel):
    year: int
    production: int
    overburden: int
    geology: int
    safety: int
    environment: int

class TopicTrendResponse(BaseModel):
    trends: List[TopicTrendItem]
    subsidiary: str

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    username: str
    role: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    previous_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
