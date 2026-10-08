from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from backend.app.scheduler.jobs import (
    get_scheduler_status,
    recalculate_all_project_risks,
    recalculate_all_health_scores,
    scan_for_early_warnings
)
from backend.app.services.auth_service import require_roles

router = APIRouter(prefix="/scheduler", tags=["System Job Scheduler"])

@router.get("/status")
def scheduler_status(current_user = Depends(require_roles(["SuperAdmin", "MinistryOfficer"]))):
    """
    Get current running status and list of scheduled intelligence jobs.
    """
    return get_scheduler_status()

@router.post("/trigger/{job_id}")
def trigger_job(job_id: str, current_user = Depends(require_roles(["SuperAdmin"]))):
    """
    Manually trigger an automated intelligence job on demand (SuperAdmin only).
    Supported job_ids: 'recalculate_risks', 'recalculate_health', 'early_warnings'
    """
    if job_id in ("job_recalculate_risks", "recalculate_risks"):
        count = recalculate_all_project_risks()
        return {"status": "SUCCESS", "job_id": job_id, "projects_updated": count, "message": f"Successfully recalculated risk profiles for {count} projects."}
    elif job_id in ("job_recalculate_health", "recalculate_health"):
        count = recalculate_all_health_scores()
        return {"status": "SUCCESS", "job_id": job_id, "projects_updated": count, "message": f"Successfully recalculated health scores for {count} projects."}
    elif job_id in ("job_early_warnings", "early_warnings"):
        alerts = scan_for_early_warnings()
        return {"status": "SUCCESS", "job_id": job_id, "alerts_broadcasted": alerts, "message": f"Successfully scanned all projects and generated {alerts} alerts."}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown job_id '{job_id}'. Valid jobs: recalculate_risks, recalculate_health, early_warnings"
        )
