from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ReportGenerateRequest(BaseModel):
    title: Optional[str] = None
    report_type: str = "Production Performance" # "Production Performance", "Geological Summary", "Safety Review"
    subsidiary: str = "Northern Coalfields Sample Ltd"
    period_start: int = 2021
    period_end: int = 2025
    parameters: Optional[List[str]] = ["production", "overburden", "dispatch", "productivity"]

class ReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    subsidiary: Optional[str] = None
    period_start: Optional[int] = None
    period_end: Optional[int] = None
    parameters: Optional[List[str]] = None
    content_json: Dict[str, Any]
    pdf_path: Optional[str] = None
    status: str
    created_by: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReportApproveRequest(BaseModel):
    action: str = "approve" # "approve", "reject"
    rejection_reason: Optional[str] = None
