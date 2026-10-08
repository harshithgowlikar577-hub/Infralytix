from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import SimulationRequest, SimulationResponse
from backend.app.simulation_engine.engine import simulation_engine
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/simulation", tags=["What-If Scenario Simulation Engine"])

@router.post("/run", response_model=SimulationResponse)
def run_what_if_simulation(request: SimulationRequest, db: Session = Depends(get_db)):
    """
    Simulate decision scenarios (e.g., +20% manpower, +15% budget, procurement bottleneck removal) and calculate new forecast outcomes.
    """
    project = db.query(Project).filter(
        (Project.project_id == request.project_id) | (Project.id == request.project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", request.project_id)

    sim_result = simulation_engine.run_simulation(
        project=project,
        manpower_boost_pct=request.manpower_boost_pct,
        budget_increase_pct=request.budget_increase_pct,
        procurement_delay_removed=request.procurement_delay_removed,
        milestones_expedited_count=request.milestones_expedited_count,
        efficiency_gain_pct=request.efficiency_gain_pct
    )

    return SimulationResponse(
        project_id=project.project_id,
        baseline=sim_result["baseline"],
        simulated=sim_result["simulated"],
        net_improvement=sim_result["net_improvement"],
        disclaimer=sim_result["disclaimer"]
    )
