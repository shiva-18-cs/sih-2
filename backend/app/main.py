from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import Base, engine, get_db, SessionLocal
from app.core.seed_data import seed_demo_users
from app.auth.router import router as auth_router
from app.ingestion.router import router as ingestion_router
from app.validation.router import router as validation_router
from app.rag.router import router as rag_router
from app.reports.router import router as reports_router
from app.analytics.router import router as analytics_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure demo users exist immediately
try:
    with SessionLocal() as db:
        seed_demo_users(db)
except Exception as e:
    print(f"Warning during seed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    try:
        with SessionLocal() as db:
            seed_demo_users(db)
    except Exception as e:
        print(f"Startup seed warning: {e}")
    yield
    # Shutdown actions

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI-Powered Geological, Mining & Reporting Solution for CMPDI/CIL Subsidiaries",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(ingestion_router, prefix=settings.API_V1_STR)
app.include_router(validation_router, prefix=settings.API_V1_STR)
app.include_router(rag_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "CMPDI Document Intelligence Platform",
        "version": "1.0.0",
        "environment": "Demonstration Environment — Synthetic Data",
        "locked_tech_stack": {
            "backend": "FastAPI (Python 3.11+)",
            "frontend": "React + TypeScript + Vite + Recharts",
            "database": "PostgreSQL + pgvector (SQLite fallback)",
            "ocr": "Tesseract (Primary) + PaddleOCR (Fallback)",
            "rag": "Lightweight Custom Source-Grounded RAG",
            "rbac": "5 Roles (Admin, Coordinator, Director, Agency, Auditor)"
        },
        "modules": {
            "ingestion": "active",
            "ocr": "active",
            "validation": "active",
            "rag_query": "active",
            "topic_engine": "active",
            "report_generator": "active",
            "analytics": "active",
            "rbac": "active",
        }
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "CMPDI/CIL AI-Powered Geological, Mining & Reporting API",
        "health_check": "/api/health",
        "docs": "/api/docs"
    }
