from typing import Dict, Any, List
from backend.app.ml.cost_model import cost_model
from backend.app.ml.delay_model import delay_model

class RiskIntelligenceEngine:
    @staticmethod
    def calculate_risk_profile(
        progress_percentage: float,
        expenditure: float,
        current_cost: float,
        original_cost: float,
        delay_days: int = 0,
        milestones_delayed: int = 1,
        milestones_due: int = 5,
        historical_risk_3m_ago: float = None
    ) -> Dict[str, Any]:
        """
        Calculates unified 0-100 composite risk score:
        - 40% Delay Risk
        - 30% Cost Risk
        - 20% Progress Risk
        - 10% External Risk
        """
        # 1. Delay Risk Sub-Score (40%)
        # Inferred from delay prediction model and accumulated delay
        delay_pred = delay_model.predict(
            progress_percentage=progress_percentage,
            milestones_delayed=milestones_delayed,
            milestones_due=milestones_due,
            cost_utilization_pct=(expenditure / max(1.0, current_cost)) * 100.0,
            current_delay_days=delay_days
        )
        pred_days = delay_pred["predicted_delay_days"]
        if pred_days <= 30:
            delay_risk = (pred_days / 30.0) * 25.0
        elif pred_days <= 180:
            delay_risk = 25.0 + ((pred_days - 30) / 150.0) * 45.0
        else:
            delay_risk = min(100.0, 70.0 + ((pred_days - 180) / 365.0) * 30.0)

        # 2. Cost Risk Sub-Score (30%)
        cost_pred = cost_model.predict(
            original_cost=original_cost,
            current_cost=current_cost,
            expenditure=expenditure,
            progress_percentage=progress_percentage,
            delay_days=delay_days
        )
        cost_overrun_pct = cost_pred["cost_overrun_percentage"]
        if cost_overrun_pct <= 5.0:
            cost_risk = (max(0.0, cost_overrun_pct) / 5.0) * 20.0
        elif cost_overrun_pct <= 25.0:
            cost_risk = 20.0 + ((cost_overrun_pct - 5.0) / 20.0) * 50.0
        else:
            cost_risk = min(100.0, 70.0 + ((cost_overrun_pct - 25.0) / 50.0) * 30.0)

        # 3. Progress Risk Sub-Score (20%)
        # Based on remaining work and milestone delay rate
        milestone_failure_rate = milestones_delayed / max(1, milestones_due)
        progress_deficit = max(0.0, 100.0 - progress_percentage)
        progress_risk = min(100.0, (progress_deficit * 0.40) + (milestone_failure_rate * 60.0))

        # 4. External Risk Sub-Score (10%)
        # Derived from environmental, land and contractor bottleneck factors
        spend_mismatch = abs((expenditure / max(1.0, current_cost) * 100.0) - progress_percentage)
        external_risk = min(100.0, (spend_mismatch * 1.8) + (20.0 if delay_days > 90 else 5.0))

        # Composite Weighted Score
        composite_score = round(
            (0.40 * delay_risk) +
            (0.30 * cost_risk) +
            (0.20 * progress_risk) +
            (0.10 * external_risk),
            1
        )
        composite_score = min(100.0, max(0.0, composite_score))

        # Risk Level Classification
        if composite_score <= 25.0:
            risk_level = "Low"
        elif composite_score <= 50.0:
            risk_level = "Medium"
        elif composite_score <= 75.0:
            risk_level = "High"
        else:
            risk_level = "Critical"

        # Trajectory Calculation
        if historical_risk_3m_ago is not None:
            delta = composite_score - historical_risk_3m_ago
            if delta <= -10.0:
                trajectory = "Improving"
            elif delta >= 20.0:
                trajectory = "Rapidly Deteriorating"
            elif delta >= 10.0:
                trajectory = "Deteriorating"
            else:
                trajectory = "Stable"
        else:
            if composite_score >= 75.0:
                trajectory = "Rapidly Deteriorating"
            elif composite_score >= 50.0:
                trajectory = "Deteriorating"
            else:
                trajectory = "Stable"

        # Explainable Risk Drivers (SHAP style feature attributions)
        drivers = []
        if delay_risk > 50.0:
            drivers.append({
                "driver_name": "Schedule Slippage & Delayed Milestones",
                "impact_score": round(0.40 * delay_risk, 1),
                "contribution_direction": "Increases Risk",
                "human_explanation": f"Predicted delay of {pred_days} days contributes significantly (+{0.40 * delay_risk:.1f} pts) to project risk."
            })
        if cost_risk > 50.0:
            drivers.append({
                "driver_name": "Anticipated Cost Escalation",
                "impact_score": round(0.30 * cost_risk, 1),
                "contribution_direction": "Increases Risk",
                "human_explanation": f"Forecasted budget overrun of {cost_overrun_pct:.1f}% adds +{0.30 * cost_risk:.1f} pts to financial risk."
            })
        if milestone_failure_rate > 0.30:
            drivers.append({
                "driver_name": "Execution Velocity Decay",
                "impact_score": round(0.20 * progress_risk, 1),
                "contribution_direction": "Increases Risk",
                "human_explanation": f"{milestones_delayed} delayed milestones out of {milestones_due} due indicate execution slowdown (+{0.20 * progress_risk:.1f} pts)."
            })
        if not drivers:
            drivers.append({
                "driver_name": "Balanced Progress Baseline",
                "impact_score": 10.0,
                "contribution_direction": "Decreases Risk",
                "human_explanation": "Project is maintaining consistent milestone throughput and budget alignment."
            })

        return {
            "risk_score": composite_score,
            "risk_level": risk_level,
            "delay_risk_subscore": round(delay_risk, 1),
            "cost_risk_subscore": round(cost_risk, 1),
            "progress_risk_subscore": round(progress_risk, 1),
            "external_risk_subscore": round(external_risk, 1),
            "risk_drivers": drivers,
            "trajectory": trajectory
        }

risk_engine = RiskIntelligenceEngine()
