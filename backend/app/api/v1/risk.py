from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import RiskResponse, RiskDriver
from backend.app.risk_engine.engine import risk_engine
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/risk", tags=["Risk Intelligence Engine"])

@router.get("/{project_id}", response_model=RiskResponse)
def get_project_risk_profile(project_id: str, db: Session = Depends(get_db)):
    """
    Generate dynamic 0-100 composite risk score (40% Delay, 30% Cost, 20% Progress, 10% External), risk band, trajectory, and SHAP drivers.
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

    drivers = [
        RiskDriver(
            driver_name=d["driver_name"],
            impact_score=d["impact_score"],
            contribution_direction=d["contribution_direction"],
            human_explanation=d["human_explanation"]
        )
        for d in risk_data["risk_drivers"]
    ]

    return RiskResponse(
        project_id=project.project_id,
        risk_score=risk_data["risk_score"],
        risk_level=risk_data["risk_level"],
        delay_risk_subscore=risk_data["delay_risk_subscore"],
        cost_risk_subscore=risk_data["cost_risk_subscore"],
        progress_risk_subscore=risk_data["progress_risk_subscore"],
        external_risk_subscore=risk_data["external_risk_subscore"],
        risk_drivers=drivers,
        trajectory=risk_data["trajectory"]
    )
