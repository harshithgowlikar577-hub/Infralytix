import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import InfralytixException, infralytix_exception_handler
from backend.app.database.session import init_db
from backend.app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database tables and ML caches
    logger.info("Starting up INFRALYTIX Backend API Server...")
    init_db()
    if os.getenv("ENVIRONMENT") != "testing":
        try:
            from backend.app.scheduler.jobs import start_scheduler
            start_scheduler()
        except Exception as e:
            logger.warning(f"Could not start background scheduler: {e}")
    yield
    # Shutdown
    logger.info("Shutting down INFRALYTIX Backend API Server...")
    try:
        from backend.app.scheduler.jobs import shutdown_scheduler
        shutdown_scheduler()
    except Exception as e:
        logger.warning(f"Error shutting down scheduler: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Response Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Exception Handlers
app.add_exception_handler(InfralytixException, infralytix_exception_handler)

# Include API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root & System Health"])
def root_status():
    return {
        "system": "INFRALYTIX Infrastructure Intelligence Platform",
        "status": "OPERATIONAL",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health", tags=["Root & System Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "environment": settings.ENVIRONMENT,
        "database": "CONNECTED"
    }

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="INFRALYTIX Infrastructure Analytics & Predictive Intelligence API",
        version="1.0.0",
        description=(
            "Government-grade AI-Powered Infrastructure Project Monitoring, Risk Intelligence, "
            "Predictive Governance, and Prescriptive Decision Support Platform (PAIMANA Inspired)."
        ),
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
