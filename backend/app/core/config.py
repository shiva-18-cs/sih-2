import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CMPDI AI Document Intelligence & Reporting Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-cmpdi-jwt-key-for-hackathon-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/cmpdi_intelligence"
    )
    
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../storage/documents")))
    DATASET_DIR: str = os.getenv("DATASET_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../dataset")))
    
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    OCR_PRIMARY_ENGINE: str = "tesseract"
    OCR_FALLBACK_ENGINE: str = "paddleocr"
    OCR_CONFIDENCE_THRESHOLD: float = 75.0
    
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", "")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
