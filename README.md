# AI-Powered Geological, Mining & Other Reporting Solution
## SIH Problem Statement 26023 — Ministry of Coal / Coal India Limited (CIL) Prototype

> **Demonstration Environment — Synthetic Data Notice**
> This prototype is preloaded with structured synthetic datasets modeled after Coal India Limited reporting standards (NCSL, EMSL, CCSL). All data, metrics, and ground-truth answer keys are generated for evaluation and validation purposes.

---

## 1. Locked Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Recharts + Modern Glassmorphic CSS
- **Backend**: FastAPI (Python 3.11+) with 10 modular packages matching the PDR
- **Database & Vectors**: PostgreSQL with `pgvector` extension
- **OCR Engine**: Tesseract OCR (Primary) + PaddleOCR (Fallback)
- **Document Processing**: PyMuPDF, pdfplumber, OpenCV, openpyxl, python-docx, reportlab
- **NLP & Embeddings**: spaCy + Sentence-Transformers (`all-MiniLM-L6-v2`)
- **RAG Engine**: Lightweight Source-Grounded RAG with strict verification and anti-hallucination guards
- **Authentication**: JWT + 5-Role RBAC
- **Deployment**: Docker & Docker Compose

---

## 2. Monorepo Architecture

```
/
├── backend/            # FastAPI App (10 modular domain packages)
│   ├── app/
│   │   ├── core/       # Configuration, DB engine, security, demo seed
│   │   ├── models/     # SQLAlchemy models matching PDR entity schema
│   │   ├── schemas/    # Pydantic validation schemas
│   │   ├── ingestion/  # Module 1: Multi-format document parser
│   │   ├── ocr/        # Module 2: Image deskew, Tesseract, PaddleOCR fallback
│   │   ├── validation/ # Module 3: Cross-document & arithmetic consistency
│   │   ├── knowledge_base/ # Module 4: Sentence embeddings & pgvector
│   │   ├── topics/     # Module 5: Dynamic word cloud & topic trends
│   │   ├── query/      # Module 6: Source-grounded RAG & bilingual engine
│   │   ├── reports/    # Module 7: Automated multi-section report generator
│   │   ├── analytics/  # Module 8: Historical analytics & Recharts feeds
│   │   ├── review/     # Module 9: Conflict resolution & report approvals
│   │   ├── auth/       # 5-Role RBAC & JWT middleware
│   │   └── api/        # Aggregated FastAPI router
│   └── alembic/        # Database migrations (pgvector enabled)
├── frontend/           # React + TypeScript (Vite)
├── dataset/            # Reproducible synthetic dataset & ground truth answer key
├── docker-compose.yml  # Multi-container deployment (postgres, backend, frontend)
└── .env.example        # Environment variable definitions
```

---

## 3. Pre-Seeded RBAC Demo Accounts

| Role | Username | Password | Capabilities |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | System configuration, user management, global settings |
| **Project Coordinator** | `coordinator` | `coord123` | Upload documents, trigger OCR, generate reports, query AI |
| **Director / Senior Officer**| `director` | `direct123` | Executive dashboard, review & approve draft reports |
| **Implementation Agency** | `agency` | `agency123` | Technical maintenance, OCR engine monitoring |
| **Auditor** | `auditor` | `audit123` | Read-only access, citation verification, immutable audit log |

---

## 4. Quick Start Guide

### Running via Docker Compose
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend Swagger API Docs: `http://localhost:8000/api/docs`

### Running Locally for Development
1. **Backend**:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
