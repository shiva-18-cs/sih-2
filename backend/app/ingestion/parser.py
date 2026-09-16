import os
import csv
import io
import pymupdf as fitz
import pdfplumber
import openpyxl
from docx import Document as DocxDocument
from PIL import Image
from typing import Dict, List, Any, Tuple
from app.ocr.engine import run_ocr_on_image

def classify_file_type(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return "pdf"
    elif ext == ".docx":
        return "docx"
    elif ext in [".xlsx", ".xls"]:
        return "xlsx"
    elif ext == ".csv":
        return "csv"
    elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
        return "image"
    return "unknown"

def parse_pdf(file_path: str) -> Dict[str, Any]:
    """
    Extracts text and tables page-by-page from PDF.
    Classifies whether the PDF has digital text or requires OCR.
    """
    doc = fitz.open(file_path)
    page_count = len(doc)
    pages_text = []
    tables = []
    ocr_engine = "digital_text"
    confidences = []
    
    # Try PyMuPDF text extraction first
    has_digital_text = False
    for page_idx in range(page_count):
        page = doc[page_idx]
        text = page.get_text("text").strip()
        if len(text) > 40:
            has_digital_text = True
            pages_text.append({"page_no": page_idx + 1, "text": text})
            confidences.append(100.0)
        else:
            # If page text is missing or sparse, render page as image and run OCR
            pix = page.get_pixmap(dpi=200)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            ocr_text, conf, eng = run_ocr_on_image(img)
            pages_text.append({"page_no": page_idx + 1, "text": ocr_text})
            confidences.append(conf)
            ocr_engine = eng
            
    doc.close()

    # Extract tables with pdfplumber
    try:
        with pdfplumber.open(file_path) as pdf:
            for p_idx, page in enumerate(pdf.pages):
                extracted_tables = page.extract_tables()
                for t_idx, tbl in enumerate(extracted_tables):
                    if tbl and len(tbl) > 1:
                        headers = [str(c or "").strip() for c in tbl[0]]
                        rows = [[str(c or "").strip() for c in r] for r in tbl[1:]]
                        # Build raw CSV string
                        csv_output = io.StringIO()
                        writer = csv.writer(csv_output)
                        writer.writerow(headers)
                        writer.writerows(rows)
                        
                        tables.append({
                            "page_no": p_idx + 1,
                            "table_name": f"Table {t_idx + 1} (Page {p_idx + 1})",
                            "headers": headers,
                            "rows": rows,
                            "raw_csv": csv_output.getvalue()
                        })
    except Exception as e:
        print(f"Table extraction notice: {e}")

    avg_conf = float(sum(confidences) / len(confidences)) if confidences else 100.0
    file_type = "pdf_digital" if has_digital_text else "pdf_scanned"

    return {
        "file_type": file_type,
        "page_count": page_count,
        "pages": pages_text,
        "tables": tables,
        "ocr_engine": ocr_engine,
        "avg_ocr_confidence": round(avg_conf, 2),
        "has_low_confidence_pages": avg_conf < 75.0
    }

def parse_docx(file_path: str) -> Dict[str, Any]:
    """Parses Word .docx documents preserving paragraphs and tables"""
    doc = DocxDocument(file_path)
    full_text = []
    for p in doc.paragraphs:
        if p.text.strip():
            full_text.append(p.text.strip())

    tables = []
    for t_idx, t in enumerate(doc.tables):
        if len(t.rows) > 1:
            headers = [c.text.strip() for c in t.rows[0].cells]
            rows = [[c.text.strip() for c in r.cells] for r in t.rows[1:]]
            
            csv_output = io.StringIO()
            writer = csv.writer(csv_output)
            writer.writerow(headers)
            writer.writerows(rows)
            
            tables.append({
                "page_no": 1,
                "table_name": f"Table {t_idx + 1}",
                "headers": headers,
                "rows": rows,
                "raw_csv": csv_output.getvalue()
            })

    joined_text = "\n\n".join(full_text)
    return {
        "file_type": "docx",
        "page_count": 1,
        "pages": [{"page_no": 1, "text": joined_text}],
        "tables": tables,
        "ocr_engine": "none",
        "avg_ocr_confidence": 100.0,
        "has_low_confidence_pages": False
    }

def parse_spreadsheet(file_path: str) -> Dict[str, Any]:
    """Parses Excel .xlsx or CSV files into structured table rows"""
    ext = os.path.splitext(file_path)[1].lower()
    tables = []
    full_text_lines = []

    if ext == ".csv":
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            reader = list(csv.reader(f))
            if reader:
                headers = [str(c).strip() for c in reader[0]]
                rows = [[str(c).strip() for c in r] for r in reader[1:]]
                
                csv_output = io.StringIO()
                writer = csv.writer(csv_output)
                writer.writerow(headers)
                writer.writerows(rows)
                
                tables.append({
                    "page_no": 1,
                    "table_name": "CSV Master Sheet",
                    "headers": headers,
                    "rows": rows,
                    "raw_csv": csv_output.getvalue()
                })
                for r in reader:
                    full_text_lines.append(" | ".join(r))
    else: # .xlsx
        wb = openpyxl.load_workbook(file_path, data_only=True)
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            all_rows = list(ws.iter_rows(values_only=True))
            if all_rows:
                headers = [str(c or "").strip() for c in all_rows[0]]
                rows = [[str(c or "").strip() for c in r] for r in all_rows[1:] if any(r)]
                
                csv_output = io.StringIO()
                writer = csv.writer(csv_output)
                writer.writerow(headers)
                writer.writerows(rows)
                
                tables.append({
                    "page_no": 1,
                    "table_name": f"Sheet: {sheet_name}",
                    "headers": headers,
                    "rows": rows,
                    "raw_csv": csv_output.getvalue()
                })
                for r in all_rows:
                    if any(r):
                        full_text_lines.append(" | ".join([str(c or "") for c in r]))

    return {
        "file_type": "spreadsheet",
        "page_count": 1,
        "pages": [{"page_no": 1, "text": "\n".join(full_text_lines)}],
        "tables": tables,
        "ocr_engine": "none",
        "avg_ocr_confidence": 100.0,
        "has_low_confidence_pages": False
    }

def parse_image_file(file_path: str) -> Dict[str, Any]:
    """Parses scanned image files using OpenCV + Tesseract/PaddleOCR"""
    ocr_text, conf, eng = run_ocr_on_image(file_path)
    return {
        "file_type": "image",
        "page_count": 1,
        "pages": [{"page_no": 1, "text": ocr_text}],
        "tables": [],
        "ocr_engine": eng,
        "avg_ocr_confidence": conf,
        "has_low_confidence_pages": conf < 75.0
    }

def chunk_document_text(pages: List[Dict[str, Any]], chunk_size_words: int = 250, overlap_words: int = 40) -> List[Dict[str, Any]]:
    """
    Splits page text into overlapping chunks (~500 tokens / 250 words)
    preserving exact page_no references.
    """
    chunks = []
    chunk_idx = 0
    
    for p in pages:
        page_no = p["page_no"]
        text = p["text"]
        words = text.split()
        
        if not words:
            continue
            
        if len(words) <= chunk_size_words:
            chunks.append({
                "chunk_index": chunk_idx,
                "page_no": page_no,
                "chunk_text": text,
                "token_count": len(words)
            })
            chunk_idx += 1
        else:
            i = 0
            while i < len(words):
                chunk_words = words[i : i + chunk_size_words]
                chunk_str = " ".join(chunk_words)
                chunks.append({
                    "chunk_index": chunk_idx,
                    "page_no": page_no,
                    "chunk_text": chunk_str,
                    "token_count": len(chunk_words)
                })
                chunk_idx += 1
                i += (chunk_size_words - overlap_words)
                
    return chunks
