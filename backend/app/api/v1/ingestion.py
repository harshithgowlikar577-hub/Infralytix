from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from backend.app.database.session import get_db
from backend.app.ingestion.pipeline import IngestionPipeline
from backend.app.models import Dataset
from backend.app.schemas import IngestionUploadResponse, ValidationReportResponse, CleaningResponse
from backend.app.services.auth_service import require_roles
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion & Quality Governance"])

@router.post("/upload", response_model=IngestionUploadResponse)
async def upload_dataset_csv(
    file: UploadFile = File(...),
    dataset_type: str = Query("auto", description="Dataset type: auto, projects, milestones, observations, dependencies"),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin", "MinistryOfficer", "ProjectManager"]))
):
    """
    Upload and ingest CSV dataset with automatic column mapping, validation, cleaning, and ML readiness scoring.
    Auto-detects whether the CSV is projects, milestones, observations, or dependencies if dataset_type='auto'.
    """
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV or TXT dataset files are supported.")

    content = await file.read()
    text_content = content.decode("utf-8", errors="replace")

    pipeline = IngestionPipeline(db)
    result = pipeline.process_csv_content(text_content, file.filename, dataset_type=dataset_type)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    val = result["validation"]
    return IngestionUploadResponse(
        dataset_id=result["dataset_id"],
        file_name=result["file_name"],
        total_records=result["total_records"],
        valid_records=result["ingested_count"],
        error_records=val.get("total_errors", 0),
        completeness_score=val["completeness_score"],
        quality_score=val["quality_score"],
        ml_readiness_score=val["ml_readiness_score"],
        status="Ingested",
        message=f"Successfully processed and ingested {result['ingested_count']} records for {file.filename}."
    )

@router.post("/upload/milestones", response_model=IngestionUploadResponse)
async def upload_milestones_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin", "MinistryOfficer", "ProjectManager"]))
):
    """
    Direct endpoint to upload and ingest Project Milestones CSV dataset.
    """
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV or TXT dataset files are supported.")

    content = await file.read()
    text_content = content.decode("utf-8", errors="replace")

    pipeline = IngestionPipeline(db)
    result = pipeline.process_milestones_csv(text_content, file.filename)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    val = result["validation"]
    return IngestionUploadResponse(
        dataset_id=result["dataset_id"],
        file_name=result["file_name"],
        total_records=result["total_records"],
        valid_records=result["ingested_count"],
        error_records=val.get("total_errors", 0),
        completeness_score=val["completeness_score"],
        quality_score=val["quality_score"],
        ml_readiness_score=val["ml_readiness_score"],
        status="Ingested",
        message=f"Successfully ingested {result['ingested_count']} project milestones."
    )

@router.post("/upload/observations", response_model=IngestionUploadResponse)
async def upload_observations_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin", "MinistryOfficer", "ProjectManager"]))
):
    """
    Direct endpoint to upload and ingest Monthly Progress Observations time-series CSV.
    """
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV or TXT dataset files are supported.")

    content = await file.read()
    text_content = content.decode("utf-8", errors="replace")

    pipeline = IngestionPipeline(db)
    result = pipeline.process_observations_csv(text_content, file.filename)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    val = result["validation"]
    return IngestionUploadResponse(
        dataset_id=result["dataset_id"],
        file_name=result["file_name"],
        total_records=result["total_records"],
        valid_records=result["ingested_count"],
        error_records=val.get("total_errors", 0),
        completeness_score=val["completeness_score"],
        quality_score=val["quality_score"],
        ml_readiness_score=val["ml_readiness_score"],
        status="Ingested",
        message=f"Successfully ingested {result['ingested_count']} monthly progress observation records."
    )

@router.post("/upload/dependencies", response_model=IngestionUploadResponse)
async def upload_dependencies_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin", "MinistryOfficer", "ProjectManager"]))
):
    """
    Direct endpoint to upload and ingest Inter-Project Dependency Graph CSV.
    """
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV or TXT dataset files are supported.")

    content = await file.read()
    text_content = content.decode("utf-8", errors="replace")

    pipeline = IngestionPipeline(db)
    result = pipeline.process_dependencies_csv(text_content, file.filename)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    val = result["validation"]
    return IngestionUploadResponse(
        dataset_id=result["dataset_id"],
        file_name=result["file_name"],
        total_records=result["total_records"],
        valid_records=result["ingested_count"],
        error_records=val.get("total_errors", 0),
        completeness_score=val["completeness_score"],
        quality_score=val["quality_score"],
        ml_readiness_score=val["ml_readiness_score"],
        status="Ingested",
        message=f"Successfully mapped and ingested {result['ingested_count']} inter-project dependencies."
    )

@router.get("/report/{dataset_id}", response_model=ValidationReportResponse)
def get_ingestion_report(dataset_id: str, db: Session = Depends(get_db)):
    """
    Retrieve comprehensive data quality validation audit report for an ingested dataset.
    """
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise EntityNotFoundException("Dataset", dataset_id)

    rep = dataset.validation_report or {}
    return ValidationReportResponse(
        dataset_id=dataset.id,
        is_valid=rep.get("is_valid", True),
        completeness_score=dataset.completeness_score,
        quality_score=dataset.quality_score,
        null_values_count=rep.get("null_values_count", 0),
        duplicate_rows_count=rep.get("duplicate_rows_count", 0),
        type_errors_count=rep.get("type_errors_count", 0),
        integrity_errors_count=rep.get("integrity_errors_count", 0),
        consistency_errors_count=rep.get("consistency_errors_count", 0),
        corrections_applied=rep.get("issues_sample", []),
        validation_status=dataset.ingestion_status
    )
