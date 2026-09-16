"""
Reports Router: FastAPI endpoints for report generation, listing, and approval workflow.
"""
import os
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User, AuditLog
from app.models.report import Report
from app.reports.generator import generate_report

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reports", tags=["Reports"])


class ReportGenerateRequest(BaseModel):
    report_type: str = Field(..., description="production_summary | geological_summary | compliance_inspection | conflict_analysis")
    subsidiary: Optional[str] = None
    year: Optional[int] = None
    title_override: Optional[str] = None


class ReportApprovalUpdate(BaseModel):
    action: str  # "approve" | "reject" | "submit_for_approval"
    reviewer_notes: Optional[str] = None


@router.post("/generate")
def generate_new_report(
    req: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a new structured report from the knowledge base."""
    valid_types = ["production_summary", "geological_summary", "compliance_inspection", "conflict_analysis"]
    if req.report_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid report_type. Must be one of: {valid_types}")

    result = generate_report(
        report_type=req.report_type,
        subsidiary=req.subsidiary,
        year=req.year,
        db=db,
        user_id=current_user.id,
        username=current_user.username,
    )

    # Audit
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        role=current_user.role,
        action="REPORT_GENERATED",
        resource_type="Report",
        resource_id=str(result.get("report_id")),
        details={"type": req.report_type, "subsidiary": req.subsidiary, "year": req.year},
    )
    db.add(audit)
    db.commit()

    return result


@router.get("/")
def list_reports(
    report_type: Optional[str] = None,
    subsidiary: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all generated reports."""
    q = db.query(Report).order_by(Report.created_at.desc())
    if report_type:
        q = q.filter(Report.report_type == report_type)
    if subsidiary:
        q = q.filter(Report.subsidiary == subsidiary)
    if status:
        q = q.filter(Report.status == status)

    reports = q.limit(limit).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "report_type": r.report_type,
            "subsidiary": r.subsidiary,
            "report_year": r.report_year,
            "status": r.status,
            "generated_by": r.generated_by,
            "approved_by": r.approved_by,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.get("/{report_id}")
def get_report_detail(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full report detail including content."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": report.id,
        "title": report.title,
        "report_type": report.report_type,
        "subsidiary": report.subsidiary,
        "report_year": report.report_year,
        "status": report.status,
        "content": report.content_json,
        "file_path": report.file_path,
        "generated_by": report.generated_by,
        "approved_by": report.approved_by,
        "reviewer_notes": report.reviewer_notes,
        "created_at": report.created_at.isoformat(),
    }


@router.patch("/{report_id}/approval")
def update_report_approval(
    report_id: str,
    update: ReportApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve, reject, or submit a report for approval (RBAC-gated)."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # RBAC checks
    if update.action == "approve":
        if current_user.role not in ["Director/Senior Officer", "Administrator"]:
            raise HTTPException(status_code=403, detail="Only Directors or Admins can approve reports")
        report.status = "approved"
        report.approved_by = current_user.username
        report.reviewer_notes = update.reviewer_notes
    elif update.action == "reject":
        if current_user.role not in ["Director/Senior Officer", "Administrator"]:
            raise HTTPException(status_code=403, detail="Only Directors or Admins can reject reports")
        report.status = "rejected"
        report.approved_by = current_user.username
        report.reviewer_notes = update.reviewer_notes
    elif update.action == "submit_for_approval":
        if current_user.role not in ["Project Coordinator", "Administrator"]:
            raise HTTPException(status_code=403, detail="Only Project Coordinators can submit reports for approval")
        report.status = "pending_approval"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be: approve | reject | submit_for_approval")

    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        role=current_user.role,
        action=f"REPORT_{update.action.upper()}",
        resource_type="Report",
        resource_id=report_id,
        details={"notes": update.reviewer_notes},
    )
    db.add(audit)
    db.commit()

    return {"id": report.id, "status": report.status, "approved_by": report.approved_by}


@router.get("/{report_id}/download")
def download_report_pdf(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download the PDF version of a report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report PDF not found on disk")
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=os.path.basename(report.file_path),
    )
