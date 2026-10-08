from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import (
    EarlyWarningResponse,
    EarlyWarningItem,
    PredictiveEarlyWarningPortfolioResponse,
)
from backend.app.early_warning_engine.engine import early_warning_engine
from backend.app.risk_engine.engine import risk_engine
from backend.app.health_engine.engine import HealthEngine
from backend.app.ml.delay_model import delay_model
from backend.app.ml.cost_model import cost_model
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/warning", tags=["Early Warning & Anomaly Engine"])

@router.get("/portfolio/predictive", response_model=PredictiveEarlyWarningPortfolioResponse)
def get_portfolio_predictive_early_warnings(limit_per_queue: int = 20, db: Session = Depends(get_db)):
    """
    Get national portfolio early warning triage queues (Watch List, High Risk, Critical, Escalation)
    with ML-backed delay & cost probabilities, dominant root causes, and predictive impact telemetry.
    """
    return early_warning_engine.get_portfolio_predictive_warnings(db=db, limit_per_queue=limit_per_queue)

@router.get("/{project_id}", response_model=EarlyWarningResponse)

def get_project_early_warnings(project_id: str, db: Session = Depends(get_db)):
    """
    Evaluate real-time threshold breaches: emerging delays, cost escalations, health drops, and critical risk spikes.
    """
    project = db.query(Project).filter(
        (Project.project_id == project_id) | (Project.id == project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", project_id)

    risk_data = risk_engine.calculate_risk_profile(
        progress_percentage=project.progress_percentage,
        expenditure=project.expenditure,
        current_cost=project.current_cost,
        original_cost=project.original_cost,
        delay_days=project.delay_days
    )
    health_data = HealthEngine.calculate_health_score(
        progress_percentage=project.progress_percentage,
        expenditure=project.expenditure,
        current_cost=project.current_cost,
        original_cost=project.original_cost,
        start_date=project.start_date,
        target_date=project.target_date,
        delay_days=project.delay_days
    )
    delay_pred = delay_model.predict(
        progress_percentage=project.progress_percentage,
        current_delay_days=project.delay_days
    )
    cost_pred = cost_model.predict(
        original_cost=project.original_cost,
        current_cost=project.current_cost,
        expenditure=project.expenditure,
        progress_percentage=project.progress_percentage,
        delay_days=project.delay_days
    )

    warn_data = early_warning_engine.evaluate_project_warnings(
        project=project,
        risk_score=risk_data["risk_score"],
        health_score=health_data["health_score"],
        predicted_delay_days=delay_pred["predicted_delay_days"],
        predicted_cost_overrun_pct=cost_pred["cost_overrun_percentage"]
    )

    active_items = [
        EarlyWarningItem(
            warning_id=w["warning_id"],
            project_id=w["project_id"],
            project_name=w["project_name"],
            warning_level=w["warning_level"],
            trigger_type=w["trigger_type"],
            alert_reason=w["alert_reason"],
            evidence=w["evidence"],
            recommended_action=w["recommended_action"],
            detected_at=w["detected_at"]
        )
        for w in warn_data["active_warnings"]
    ]

    return EarlyWarningResponse(
        project_id=project.project_id,
        warning_level=warn_data["warning_level"],
        alert_reason=warn_data["alert_reason"],
        recommended_action=warn_data["recommended_action"],
        active_warnings=active_items
    )
