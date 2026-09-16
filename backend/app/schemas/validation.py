from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ConflictResponse(BaseModel):
    id: str
    conflict_id: Optional[str] = None
    source_a_filename: str
    source_a_page: int
    source_a_value: str
    source_b_filename: str
    source_b_page: int
    source_b_value: str
    metric_name: str
    subsidiary: Optional[str] = None
    mine_name: Optional[str] = None
    year: Optional[int] = None
    conflict_type: str
    status: str
    resolved_value: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConflictResolveRequest(BaseModel):
    resolved_value: str
    resolution_notes: Optional[str] = None
    selected_source: Optional[str] = None # "source_a", "source_b", "manual"
