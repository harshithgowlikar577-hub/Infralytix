from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models import Project, Intervention
from backend.app.schemas import InterventionResponse, RecommendationItem, InterventionCreate
from backend.app.intervention_engine.engine import intervention_engine
from backend.app.risk_engine.engine import risk_engine
from backend.app.health_engine.engine import HealthEngine
from backend.app.services.auth_service import get_current_user, require_roles
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/intervention", tags=["Intervention & Decision Support Engine"])

@router.get("/{project_id}", response_model=InterventionResponse)
def get_intervention_recommendations(project_id: str, db: Session = Depends(get_db)):
    """
    Generate prioritized, actionable intervention directives and estimated recovery impact.
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

    interv_data = intervention_engine.generate_recommendations(
        project=project,
        risk_score=risk_data["risk_score"],
        health_score=health_data["health_score"],
        predicted_delay_days=project.delay_days,
        predicted_cost_overrun_pct=risk_data["cost_risk_subscore"]
    )

    recs = [
        RecommendationItem(
            id=r["id"],
            priority=r["priority"],
            title=r["title"],
            action_directive=r["action_directive"],
            expected_delay_reduction_days=r["expected_delay_reduction_days"],
            expected_cost_avoidance_cr=r["expected_cost_avoidance_cr"],
            target_authority=r["target_authority"]
        )
        for r in interv_data["recommendations"]
    ]

    return InterventionResponse(
        project_id=project.project_id,
        priority=interv_data["priority"],
        recommendations=recs,
        expected_impact=interv_data["expected_impact"]
    )

@router.post("/execute", status_code=status.HTTP_201_CREATED)
def record_executed_intervention(
    intervention_in: InterventionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin", "MinistryOfficer", "ProjectManager"]))
):
    """
    Record an executed administrative or operational intervention on a project.
    """
    project = db.query(Project).filter(
        (Project.project_id == intervention_in.project_id) | (Project.id == intervention_in.project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", intervention_in.project_id)

    new_interv = Intervention(
        project_id=project.id,
        intervention_type=intervention_in.intervention_type,
        description=intervention_in.description,
        applied_parameters=intervention_in.applied_parameters or {},
        status="Executed",
        executed_by=current_user.id
    )
    db.add(new_interv)
    db.commit()
    db.refresh(new_interv)

    return {
        "status": "success",
        "message": f"Intervention '{intervention_in.intervention_type}' successfully recorded for Project {project.project_id}.",
        "intervention_id": new_interv.id
    }
