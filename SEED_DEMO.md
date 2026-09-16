# SIH PS 26023 — 3-Minute Hackathon Demo Script & Judge Walkthrough
### AI-Powered Geological, Mining and Other Reporting Solution for CMPDI/CIL Subsidiaries

---

## Quick Reference: Demo User Credentials

| Role | Username | Password | Key Capability Shown |
|---|---|---|---|
| **Project Coordinator** | `coordinator` | `coord123` | Document Ingestion, OCR Confidence, AI Query, Report Generation |
| **Director / Senior Officer** | `director` | `direct123` | Executive Dashboard, Report Review & Approval Workflow |
| **Auditor** | `auditor` | `audit123` | Immutable Audit Trail, Provenance Verification, Ground-Truth KPI Benchmark |
| **Administrator** | `admin` | `admin123` | Full System & User Configuration |
| **Implementation Agency** | `agency` | `agency123` | OCR Engine Diagnostics, Background Embedding Indexing |

---

## 3-Minute Presentation Walkthrough

### ⏱️ Minute 0:00 – 0:45: Document Ingestion & Multi-Engine OCR
1. **Login**: Open `http://localhost:3000/login` and click **"Project Coordinator"** (one-click login).
2. **Document Hub**: Navigate to `/documents`. Show the 42 ingested multi-modal documents (PDF, DOCX, XLSX, CSV, and degraded scanned images) across Northern Coalfields (NCSL), Eastern Mining (EMSL), and Central Collieries (CCSL).
3. **Scanned Image Inspection**: Click on a degraded image document (e.g. `Scanned_Inspection_Log_NCSL_Mine_A_1998.png`). Point out:
   - OpenCV adaptive thresholding & deskewing pipeline.
   - Primary Tesseract OCR with per-page confidence scoring (e.g. `84.5%`).
   - Digital text fallback with `100.0%` confidence tags.

---

### ⏱️ Minute 0:45 – 1:15: Automated Conflict & Consistency Engine
1. **Conflict Review**: Navigate to `/conflicts`.
2. **Explain Cross-Document Discrepancy Detection**:
   - Highlight **CONF-001**: Discrepancy in Sample Mine-A 2023 Coal Production between `NCSL_Annual_Production_Report_2023.pdf` (9.80 MT) and `NCSL_Mine_A_Monthly_Dispatches_2023.xlsx` (10.20 MT).
   - Highlight **CONF-003**: Arithmetic Sum mismatch where total subsidiary production differs from mine-wise component sums.
3. **Human-in-the-Loop Resolution**:
   - Click **"Adopt Source A (9.80 MT)"**, enter resolution notes: *"Audited Annual Report verified as authoritative."*, and click **Resolve**.
   - Show how the status dynamically changes to **Resolved** and an immutable audit log is generated.

---

### ⏱️ Minute 1:15 – 1:50: Source-Grounded RAG & Bilingual Query Workspace
1. **AI Query**: Navigate to `/query`.
2. **English Query**:
   - Ask: `What was the total coal production of Northern Coalfields Sample Ltd in 2022?`
   - Show instantaneous answer (`22.30 MT`) along with the **Expandable Source Evidence Drawer** showing `NCSL_Annual_Production_Report_2022.pdf (Page 1)`.
3. **Hindi Bilingual Query**:
   - Ask: `वर्ष 2024 में उत्तरी कोयला क्षेत्र नमूना लिमिटेड द्वारा कुल कितना सीएसआर व्यय किया गया था?`
   - Show the Devanagari Hindi grounded response citing `Bilingual_Administrative_Summary_NCSL_2024.pdf`.
4. **Anti-Hallucination Negative Test**:
   - Ask: `What is the uranium enrichment capacity of Western Coalfields in 2024?`
   - Show that the system strictly replies with: **"Insufficient evidence in ingested documents"** without fabricating out-of-domain figures.

---

### ⏱️ Minute 1:50 – 2:25: Automated Report Generation & Director Approval
1. **Report Generation**: Navigate to `/reports`.
2. **Generate Report**:
   - Select Type: **Annual Production Summary**, Subsidiary: **Northern Coalfields Sample Ltd**, Year: **2024**.
   - Click **"Generate Report"**. Show the multi-section structured report, mine-wise tables, and automated percentage change calculations.
   - Click **"Submit for Approval"**.
3. **Director Approval**:
   - Switch user to **Director / Senior Officer** (`director` / `direct123`).
   - Navigate to `/reports/review`.
   - Review the draft report, check source citations, and click **"Approve Report"**.
   - Download the generated PDF export.

---

### ⏱️ Minute 2:25 – 3:00: Auditor Transparency, Live KPIs & Ground Truth
1. **Switch to Auditor**: Log in as **Auditor** (`auditor` / `audit123`).
2. **Audit Trail**: Navigate to `/audit`. Show the immutable chronological log capturing actor, role, timestamp, action (`CONFLICT_RESOLVED`, `REPORT_APPROVED`), and state diffs.
3. **Live Measured KPI Benchmark**: Navigate to `/benchmark` (or show terminal output of `pytest tests/test_benchmark.py`):
   - **Validation Detection Rate**: `100.0%` (3/3 injected conflicts detected).
   - **Query Answer Accuracy**: `100.0%` (18/18 ground-truth QA questions).
   - **Source Traceability Rate**: `100.0%` (16/16 answerable questions with exact PDF page citations).
   - **Negative Anti-Hallucination Rate**: `100.0%` (2/2 out-of-domain questions correctly rejected).
   - **Preparation Time Savings**: `99.92%` (from 4 hours manual preparation down to 12 seconds).
