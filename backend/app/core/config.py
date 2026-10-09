import os
import secrets
from typing import List, Optional, Any
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Generate a secure random key if not provided via environment variable
_DEFAULT_SECRET = os.getenv("SECRET_KEY") or secrets.token_urlsafe(64)

class Settings(BaseSettings):
    PROJECT_NAME: str = "INFRALYTIX"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DESCRIPTION: str = (
        "AI-Powered Infrastructure Project Monitoring, Risk Intelligence, "
        "Predictive Governance, and Decision Support Platform (PAIMANA Inspired)"
    )
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    
    # Security & Auth — Secret key is generated at startup if not set via SECRET_KEY env var
    SECRET_KEY: str = _DEFAULT_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./infralytix.db"  # Defaults to SQLite for immediate execution, supports PostgreSQL
    )
    
    # Redis Cache
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CACHE_ENABLED: bool = os.getenv("CACHE_ENABLED", "False").lower() in ("true", "1", "t")
    CACHE_TTL_SECONDS: int = 300
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, set, tuple)):
            return list(v)
        return [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ]
    
    # Storage Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    REPO_DIR: str = os.path.dirname(BASE_DIR)
    DATASETS_DIR: str = (
        os.path.join(REPO_DIR, "datasets") 
        if os.path.exists(os.path.join(REPO_DIR, "datasets")) 
        else os.path.join(BASE_DIR, "datasets")
    )
    TRAINED_MODELS_DIR: str = os.path.join(BASE_DIR, "trained_models")
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    
    # Gemini AI Configuration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    GEMINI_ENABLED: bool = os.getenv("GEMINI_ENABLED", "True").lower() in ("true", "1", "t")
    GEMINI_TIMEOUT_SECONDS: int = int(os.getenv("GEMINI_TIMEOUT_SECONDS", "15"))


    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
            ".env"
        ),
        extra="ignore"
    )

settings = Settings()


# Ensure directories exist
os.makedirs(settings.DATASETS_DIR, exist_ok=True)
os.makedirs(settings.TRAINED_MODELS_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
