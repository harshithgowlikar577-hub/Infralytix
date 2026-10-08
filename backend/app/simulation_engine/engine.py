from typing import Dict, Any
from backend.app.models import Project
from backend.app.health_engine.engine import HealthEngine
from backend.app.ml.delay_model import delay_model
from backend.app.ml.cost_model import cost_model
from backend.app.risk_engine.engine import risk_engine

class WhatIfSimulationEngine:
    @staticmethod
    def run_simulation(
        project: Project,
        manpower_boost_pct: float = 0.0,
        budget_increase_pct: float = 0.0,
        procurement_delay_removed: bool = False,
        milestones_expedited_count: int = 0,
        efficiency_gain_pct: float = 0.0
    ) -> Dict[str, Any]:
        """
        Executes real-time parameter perturbation simulation over project variables.
        """
        # 1. Baseline Calculations
        base_health = HealthEngine.calculate_health_score(
            progress_percentage=project.progress_percentage,
            expenditure=project.expenditure,
            current_cost=project.current_cost,
            original_cost=project.original_cost,
            start_date=project.start_date,
            target_date=project.target_date,
            delay_days=project.delay_days
        )
        base_delay = delay_model.predict(
            progress_percentage=project.progress_percentage,
            current_delay_days=project.delay_days
        )
        base_cost = cost_model.predict(
            original_cost=project.original_cost,
            current_cost=project.current_cost,
            expenditure=project.expenditure,
            progress_percentage=project.progress_percentage,
            delay_days=project.delay_days
        )
        base_risk = risk_engine.calculate_risk_profile(
            progress_percentage=project.progress_percentage,
            expenditure=project.expenditure,
            current_cost=project.current_cost,
            original_cost=project.original_cost,
            delay_days=project.delay_days
        )

        # 2. Perturbation Transfer Functions
        # Manpower boost & efficiency gain increase physical execution rate
        effective_velocity_gain = (manpower_boost_pct * 0.45) + (efficiency_gain_pct * 0.35)
        simulated_progress = min(100.0, project.progress_percentage + (project.progress_percentage * (effective_velocity_gain / 100.0) * 0.25) + (milestones_expedited_count * 2.5))
        
        # Procurement delay removal directly recovers 30 to 90 days of delay
        procurement_recovery = 60 if procurement_delay_removed else 0
        milestone_recovery = milestones_expedited_count * 30
        manpower_recovery = int(project.delay_days * (manpower_boost_pct / 100.0) * 0.30)
        
        total_delay_recovered = min(project.delay_days, procurement_recovery + milestone_recovery + manpower_recovery)
        simulated_delay_days = max(0, project.delay_days - total_delay_recovered)

        # Budget adjustment impact
        budget_expansion_cr = project.current_cost * (budget_increase_pct / 100.0)
        simulated_current_cost = project.current_cost + budget_expansion_cr
        
        # 3. Re-run Intelligence Engines on Simulated State
        sim_health = HealthEngine.calculate_health_score(
            progress_percentage=simulated_progress,
            expenditure=project.expenditure,
            current_cost=simulated_current_cost,
            original_cost=project.original_cost,
            start_date=project.start_date,
            target_date=project.target_date,
            delay_days=simulated_delay_days
        )
        sim_delay = delay_model.predict(
            progress_percentage=simulated_progress,
            current_delay_days=simulated_delay_days
        )
        sim_cost = cost_model.predict(
            original_cost=project.original_cost,
            current_cost=simulated_current_cost,
            expenditure=project.expenditure,
            progress_percentage=simulated_progress,
            delay_days=simulated_delay_days
        )
        sim_risk = risk_engine.calculate_risk_profile(
            progress_percentage=simulated_progress,
            expenditure=project.expenditure,
            current_cost=simulated_current_cost,
            original_cost=project.original_cost,
            delay_days=simulated_delay_days
        )

        net_delay_gain_days = max(0, base_delay["predicted_delay_days"] - sim_delay["predicted_delay_days"])
        net_cost_avoidance = round(max(0.0, base_cost["predicted_final_cost"] - sim_cost["predicted_final_cost"]), 2)
        net_health_gain = round(sim_health["health_score"] - base_health["health_score"], 1)

        return {
            "project_id": project.project_id,
            "baseline": {
                "health_score": base_health["health_score"],
                "health_status": base_health["health_status"],
                "predicted_delay_days": base_delay["predicted_delay_days"],
                "predicted_delay_months": base_delay["predicted_delay_months"],
                "predicted_final_cost": base_cost["predicted_final_cost"],
                "cost_overrun_pct": base_cost["cost_overrun_percentage"],
                "risk_score": base_risk["risk_score"],
                "risk_level": base_risk["risk_level"]
            },
            "simulated": {
                "health_score": sim_health["health_score"],
                "health_status": sim_health["health_status"],
                "predicted_delay_days": sim_delay["predicted_delay_days"],
                "predicted_delay_months": sim_delay["predicted_delay_months"],
                "predicted_final_cost": sim_cost["predicted_final_cost"],
                "cost_overrun_pct": sim_cost["cost_overrun_percentage"],
                "risk_score": sim_risk["risk_score"],
                "risk_level": sim_risk["risk_level"]
            },
            "net_improvement": {
                "delay_recovered_days": net_delay_gain_days,
                "delay_recovered_months": round(net_delay_gain_days / 30.4, 1),
                "cost_avoidance_cr": net_cost_avoidance,
                "health_score_gain": net_health_gain,
                "risk_score_reduction": round(base_risk["risk_score"] - sim_risk["risk_score"], 1)
            },
            "disclaimer": "Scenario estimate calculated using perturbation transfer model — not a guaranteed outcome."
        }

simulation_engine = WhatIfSimulationEngine()
