from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import HealthScoreResponse
from backend.app.health_engine.engine import HealthEngine
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/analytics/health", tags=["Project Health Engine"])

@router.get("/{project_id}", response_model=HealthScoreResponse)
def get_project_health_score(project_id: str, db: Session = Depends(get_db)):
    """
    Generate unified Project Health Score (0-100) using 35% Progress, 25% Budget, 20% Milestone, 20% Delay performance.
    """
    project = db.query(Project).filter(
        (Project.project_id == project_id) | (Project.id == project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", project_id)

    health_data = HealthEngine.calculate_health_score(
        progress_percentage=project.progress_percentage,
        expenditure=project.expenditure,
        current_cost=project.current_cost,
        original_cost=project.original_cost,
        start_date=project.start_date,
        target_date=project.target_date,
        delay_days=project.delay_days
    )

    return HealthScoreResponse(
        project_id=project.project_id,
        health_score=health_data["health_score"],
        health_status=health_data["health_status"],
        formula_breakdown=health_data["formula_breakdown"],
        insights=health_data["insights"]
    )
