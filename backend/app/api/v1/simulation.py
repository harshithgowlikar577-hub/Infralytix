from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import SimulationRequest, SimulationResponse, WhatIfExplanationResponse, WhatIfRatingExplanation
from backend.app.simulation_engine.engine import simulation_engine
from backend.app.services.gemini_service import gemini_service
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
        delay_reduction_months=sim_result["delay_reduction_months"],
        cost_avoidance_cr=sim_result["cost_avoidance_cr"],
        disclaimer=sim_result["disclaimer"]
    )

@router.post("/explain", response_model=WhatIfExplanationResponse)
def explain_what_if_scenario(request: SimulationRequest, db: Session = Depends(get_db)):
    """
    Generates personalized AI reasoning explaining the 3 existing What-If ratings:
    1. Health Rating (Health Score & Status)
    2. Schedule Delay Rating (Predicted Delay Days/Months)
    3. Cost & Outlay Rating (Projected Final Cost & Overrun %)
    plus Risk Rating (Risk Score & Level).

    Gemini acts as an additive explanation layer over authoritative ML and simulation engine results.
    """
    project = db.query(Project).filter(
        (Project.project_id == request.project_id) | (Project.id == request.project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", request.project_id)

    # 1. Run authoritative simulation engine first
    sim_result = simulation_engine.run_simulation(
        project=project,
        manpower_boost_pct=request.manpower_boost_pct,
        budget_increase_pct=request.budget_increase_pct,
        procurement_delay_removed=request.procurement_delay_removed,
        milestones_expedited_count=request.milestones_expedited_count,
        efficiency_gain_pct=request.efficiency_gain_pct
    )

    baseline = sim_result["baseline"]
    simulated = sim_result["simulated"]
    net_improvement = sim_result["net_improvement"]

    # 2. Call Gemini AI Service for natural language reasoning if available
    if gemini_service.is_available():
        gemini_explanation = gemini_service.explain_what_if_scenario(
            project_id=project.project_id,
            project_name=project.project_name,
            sector=project.sector or "Infrastructure",
            state=project.state or "National",
            baseline=baseline,
            simulated=simulated,
            net_improvement=net_improvement
        )
        if gemini_explanation:
            return WhatIfExplanationResponse(
                project_id=project.project_id,
                summary=gemini_explanation.get("summary", "Scenario simulation completed."),
                ratings=[
                    WhatIfRatingExplanation(**r) for r in gemini_explanation.get("ratings", [])
                ],
                main_benefit=gemini_explanation.get("main_benefit", f"Recovered {net_improvement.get('delay_recovered_days')} days of critical path delay."),
                main_tradeoff=gemini_explanation.get("main_tradeoff", f"Requires additional capex deployment of +{request.budget_increase_pct}%."),
                uncertainties=gemini_explanation.get("uncertainties", ["Contractor mobilization velocity relies on regional site clearance."]),
                next_steps=gemini_explanation.get("next_steps", ["Dispatch nodal intervention directive to project director."]),
                engine_mode=gemini_explanation.get("engine_mode", "GEMINI_LLM"),
                disclaimer="AI-generated explanation based on authoritative backend What-If simulation engine outputs."
            )

    # 3. Deterministic Fallback Explanation (when Gemini API is disabled or offline)
    delay_rec_days = net_improvement.get("delay_recovered_days", 0)
    delay_rec_mos = net_improvement.get("delay_recovered_months", 0.0)
    cost_sav = net_improvement.get("cost_avoidance_cr", 0.0)
    health_gain = net_improvement.get("health_score_gain", 0.0)
    risk_red = net_improvement.get("risk_score_reduction", 0.0)

    fallback_ratings = [
        WhatIfRatingExplanation(
            name="Health Rating",
            rating_value=f"{simulated.get('health_status', 'Monitored')} ({simulated.get('health_score', 0)}/100)",
            reason=f"Project health score shifts from {baseline.get('health_score')} to {simulated.get('health_score')} due to milestone acceleration.",
            baseline_comparison=f"Gain of +{health_gain} health points compared to baseline.",
            recommended_action="Maintain monthly physical progress audits to retain health gains.",
            is_favorable=health_gain >= 0
        ),
        WhatIfRatingExplanation(
            name="Schedule Delay Rating",
            rating_value=f"{simulated.get('predicted_delay_days', 0)} Days ({simulated.get('predicted_delay_months', 0.0)} Months)",
            reason=f"Accelerated manpower (+{request.manpower_boost_pct}%) and clearance unblocking recovers {delay_rec_days} days off critical path.",
            baseline_comparison=f"Timeline recovered by {delay_rec_mos} months vs baseline schedule.",
            recommended_action="Issue 30-day recovery milestone schedule to EPC contractor.",
            is_favorable=delay_rec_days > 0
        ),
        WhatIfRatingExplanation(
            name="Cost & Outlay Rating",
            rating_value=f"₹{simulated.get('predicted_final_cost', 0):,.2f} Cr ({simulated.get('cost_overrun_pct', 0)}% Overrun)",
            reason=f"Early schedule completion avoids lingering overhead inflation, yielding cost avoidance of ₹{cost_sav:,.2f} Cr.",
            baseline_comparison=f"Net cost avoidance of ₹{cost_sav:,.2f} Cr relative to baseline overrun trajectory.",
            recommended_action="Validate liquidity tranche release against physical milestone targets.",
            is_favorable=cost_sav >= 0
        ),
        WhatIfRatingExplanation(
            name="Risk Rating",
            rating_value=f"{simulated.get('risk_level', 'Medium')} (Score: {simulated.get('risk_score', 0)})",
            reason=f"Composite risk score decreases from {baseline.get('risk_score')} to {simulated.get('risk_score')}.",
            baseline_comparison=f"Risk reduction of -{risk_red} points.",
            recommended_action="Reclassify project priority queue in Cabinet monitoring dashboard.",
            is_favorable=risk_red >= 0
        )
    ]

    return WhatIfExplanationResponse(
        project_id=project.project_id,
        summary=f"Simulated intervention parameters recover {delay_rec_days} days of critical path delay and achieve ₹{cost_sav:,.2f} Cr in cost avoidance.",
        ratings=fallback_ratings,
        main_benefit=f"Schedule recovery of {delay_rec_mos} months pulling completion closer to target timeline.",
        main_tradeoff=f"Capital liquidity expansion of +{request.budget_increase_pct}% required upfront.",
        uncertainties=["Subcontractor shift mobilization speed on site.", "Inter-departmental utility relocation clearance timelines."],
        next_steps=["Convene review meeting with line ministry project management unit."],
        engine_mode="DETERMINISTIC_FALLBACK",
        disclaimer="Deterministic rule explanation engine output (Gemini API offline or disabled)."
    )
