import os
from typing import List, Optional
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

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
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "infralytix-super-secret-jwt-key-change-in-production-2026")
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
    CORS_ORIGINS: List[str] = ["*"]
    
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
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()

# Ensure directories exist
os.makedirs(settings.DATASETS_DIR, exist_ok=True)
os.makedirs(settings.TRAINED_MODELS_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
