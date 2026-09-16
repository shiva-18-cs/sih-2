"""
Automated Report Generator.
Generates structured PDF/DOCX reports from database data.
Supports: Production Summary, Geological Survey Summary, Compliance/Inspection Summary.
"""
import os
import uuid
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.document import Document, TableData
from app.models.entity import Entity, ConflictRecord
from app.models.report import Report

logger = logging.getLogger(__name__)

REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../storage/reports"))
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_report(
    report_type: str,
    subsidiary: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = None,
    user_id: str = None,
    username: str = "system",
) -> Dict[str, Any]:
    """
    Generate a structured report and save it.
    
    report_type options:
        - "production_summary"
        - "geological_summary"
        - "compliance_inspection"
        - "conflict_analysis"
    """
    report_id = str(uuid.uuid4())
    timestamp = datetime.utcnow()

    try:
        if report_type == "production_summary":
            content, title = _build_production_summary(db, subsidiary, year)
        elif report_type == "geological_summary":
            content, title = _build_geological_summary(db, subsidiary, year)
        elif report_type == "compliance_inspection":
            content, title = _build_compliance_summary(db, subsidiary, year)
        elif report_type == "conflict_analysis":
            content, title = _build_conflict_summary(db, subsidiary, year)
        else:
            content = {"error": "Unknown report type"}
            title = "Unknown Report"

        # Save as JSON (structured data)
        filename = f"{report_type}_{subsidiary or 'ALL'}_{year or 'ALL'}_{report_id[:8]}.json"
        filepath = os.path.join(REPORTS_DIR, filename)

        report_data = {
            "report_id": report_id,
            "report_type": report_type,
            "title": title,
            "generated_at": timestamp.isoformat(),
            "generated_by": username,
            "filters": {"subsidiary": subsidiary, "year": year},
            "content": content,
        }

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, default=str)

        # Save PDF version using reportlab
        pdf_filename = filename.replace(".json", ".pdf")
        pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
        _save_pdf(report_data, pdf_path)

        # Persist Report record in database
        if db:
            report_rec = Report(
                title=title,
                report_type=report_type,
                subsidiary=subsidiary,
                report_year=year,
                status="draft",
                content_json=report_data,
                file_path=pdf_path,
                generated_by=user_id,
            )
            db.add(report_rec)
            db.commit()
            db.refresh(report_rec)
            report_id = report_rec.id

        return {
            "report_id": report_id,
            "title": title,
            "report_type": report_type,
            "status": "draft",
            "generated_at": timestamp.isoformat(),
            "json_path": filepath,
            "pdf_path": pdf_path,
            "content": content,
        }

    except Exception as e:
        logger.error(f"Report generation failed: {e}", exc_info=True)
        raise


# ─── Report Builders ─────────────────────────────────────────────────────────

def _build_production_summary(db: Session, subsidiary: Optional[str], year: Optional[int]) -> tuple:
    title = f"Coal Production Summary Report — {subsidiary or 'All Subsidiaries'} {year or 'All Years'}"

    # Fetch entities
    q = db.query(Entity).filter(Entity.entity_type.in_(["metric_coal_production", "metric_overburden"]))
    if subsidiary:
        q = q.filter(Entity.subsidiary == subsidiary)
    if year:
        q = q.filter(Entity.year == str(year))
    entities = q.limit(200).all()

    # Aggregate by subsidiary + year
    data: Dict[str, Dict] = {}
    for e in entities:
        key = f"{e.subsidiary or 'Unknown'}_{e.year or '?'}"
        if key not in data:
            data[key] = {"subsidiary": e.subsidiary, "year": e.year, "metrics": {}}
        data[key]["metrics"][e.entity_type] = e.entity_value

    # Fetch relevant documents
    docs_q = db.query(Document).filter(Document.document_type == "Production")
    if subsidiary:
        docs_q = docs_q.filter(Document.subsidiary == subsidiary)
    if year:
        docs_q = docs_q.filter(Document.report_year == year)
    docs = docs_q.limit(20).all()

    content = {
        "executive_summary": f"This report summarizes coal production and overburden removal data extracted from {len(docs)} ingested Production reports.",
        "data_records": list(data.values()),
        "source_documents": [
            {"filename": d.filename, "year": d.report_year, "subsidiary": d.subsidiary, "status": d.status}
            for d in docs
        ],
        "record_count": len(data),
    }
    return content, title


def _build_geological_summary(db: Session, subsidiary: Optional[str], year: Optional[int]) -> tuple:
    title = f"Geological Survey Summary — {subsidiary or 'All Subsidiaries'} {year or 'All Years'}"

    docs_q = db.query(Document).filter(Document.document_type == "Geological")
    if subsidiary:
        docs_q = docs_q.filter(Document.subsidiary == subsidiary)
    if year:
        docs_q = docs_q.filter(Document.report_year == year)
    docs = docs_q.limit(20).all()

    geo_entities = db.query(Entity).filter(
        Entity.entity_type.in_(["coal_seam", "reserve_estimate", "geological_reserve"])
    ).limit(100).all()

    content = {
        "executive_summary": f"Geological survey summary from {len(docs)} geological reports covering seam data and resource estimates.",
        "seam_data": [
            {"name": e.entity_name, "value": e.entity_value, "subsidiary": e.subsidiary, "year": e.year}
            for e in geo_entities
        ],
        "source_documents": [
            {"filename": d.filename, "year": d.report_year, "subsidiary": d.subsidiary}
            for d in docs
        ],
    }
    return content, title


def _build_compliance_summary(db: Session, subsidiary: Optional[str], year: Optional[int]) -> tuple:
    title = f"Compliance & Safety Inspection Summary — {subsidiary or 'All Subsidiaries'} {year or 'All Years'}"

    docs_q = db.query(Document).filter(Document.document_type == "Inspection")
    if subsidiary:
        docs_q = docs_q.filter(Document.subsidiary == subsidiary)
    docs = docs_q.limit(20).all()

    safety_entities = db.query(Entity).filter(
        Entity.entity_type.in_(["safety_metric", "accident_count", "fatality_count"])
    ).limit(100).all()

    content = {
        "executive_summary": f"Safety and compliance report from {len(docs)} inspection documents.",
        "safety_metrics": [
            {"name": e.entity_name, "value": e.entity_value, "subsidiary": e.subsidiary, "year": e.year}
            for e in safety_entities
        ],
        "source_documents": [
            {"filename": d.filename, "year": d.report_year, "subsidiary": d.subsidiary}
            for d in docs
        ],
    }
    return content, title


def _build_conflict_summary(db: Session, subsidiary: Optional[str], year: Optional[int]) -> tuple:
    title = f"Data Conflict Analysis Report — {subsidiary or 'All Subsidiaries'} {year or 'All Years'}"

    conflicts_q = db.query(ConflictRecord)
    if subsidiary:
        conflicts_q = conflicts_q.filter(ConflictRecord.subsidiary == subsidiary)
    conflicts = conflicts_q.limit(100).all()

    content = {
        "executive_summary": f"Identified {len(conflicts)} data conflicts across ingested documents.",
        "conflicts": [
            {
                "metric_type": c.metric_type,
                "conflicting_values": c.conflicting_values,
                "documents_involved": c.documents_involved,
                "severity": c.severity,
                "status": c.status,
                "subsidiary": c.subsidiary,
                "year": c.year,
            }
            for c in conflicts
        ],
        "summary_by_severity": {
            "critical": sum(1 for c in conflicts if c.severity == "critical"),
            "warning": sum(1 for c in conflicts if c.severity == "warning"),
            "info": sum(1 for c in conflicts if c.severity == "info"),
        },
    }
    return content, title


# ─── PDF Export ──────────────────────────────────────────────────────────────

def _save_pdf(report_data: Dict, output_path: str):
    """Save a basic PDF report using reportlab."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.enums import TA_CENTER

        doc = SimpleDocTemplate(output_path, pagesize=A4,
                                rightMargin=20*mm, leftMargin=20*mm,
                                topMargin=25*mm, bottomMargin=20*mm)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "title", parent=styles["Title"], fontSize=16,
            textColor=colors.HexColor("#1E3A5F"), spaceAfter=8
        )
        subtitle_style = ParagraphStyle(
            "subtitle", parent=styles["Normal"], fontSize=10,
            textColor=colors.HexColor("#64748B"), spaceAfter=4
        )
        section_style = ParagraphStyle(
            "section", parent=styles["Heading2"], fontSize=12,
            textColor=colors.HexColor("#0284C7"), spaceBefore=12, spaceAfter=4
        )
        body_style = ParagraphStyle(
            "body", parent=styles["Normal"], fontSize=9, spaceAfter=4, leading=14
        )

        story = []
        content = report_data.get("content", {})

        # Header
        story.append(Paragraph("CMPDI / CIL Intelligence Platform", subtitle_style))
        story.append(Paragraph(report_data.get("title", "Report"), title_style))
        story.append(Paragraph(
            f"Generated: {report_data.get('generated_at', '')} | By: {report_data.get('generated_by', 'System')}",
            subtitle_style
        ))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1")))
        story.append(Spacer(1, 8))

        # Executive Summary
        if content.get("executive_summary"):
            story.append(Paragraph("Executive Summary", section_style))
            story.append(Paragraph(content["executive_summary"], body_style))
            story.append(Spacer(1, 6))

        # Source Documents Table
        source_docs = content.get("source_documents", [])
        if source_docs:
            story.append(Paragraph("Source Documents", section_style))
            table_data = [["Filename", "Year", "Subsidiary", "Status"]]
            for d in source_docs[:15]:
                table_data.append([
                    str(d.get("filename", ""))[-40:],
                    str(d.get("year", "")),
                    str(d.get("subsidiary", ""))[:30],
                    str(d.get("status", "ingested")),
                ])
            t = Table(table_data, colWidths=[80*mm, 20*mm, 55*mm, 25*mm])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A5F")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F8FAFC"), colors.white]),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(t)
            story.append(Spacer(1, 8))

        # Data Records / Conflicts
        for section_key in ["data_records", "conflicts", "seam_data", "safety_metrics"]:
            records = content.get(section_key, [])
            if records:
                story.append(Paragraph(section_key.replace("_", " ").title(), section_style))
                for r in records[:20]:
                    story.append(Paragraph(str(r)[:200], body_style))

        # Footer note
        story.append(Spacer(1, 12))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1")))
        story.append(Paragraph(
            "DISCLAIMER: This report is generated from synthetic demonstration data for SIH PS 26023. "
            "All data, subsidiaries, and metrics are fictional for evaluation purposes.",
            ParagraphStyle("footer", parent=styles["Normal"], fontSize=7, textColor=colors.HexColor("#94A3B8"))
        ))

        doc.build(story)
        logger.info(f"PDF report saved: {output_path}")

    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        # Write a placeholder file
        with open(output_path, "wb") as f:
            f.write(b"PDF generation failed - reportlab error")
