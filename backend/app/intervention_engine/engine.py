from typing import Dict, Any, List
from backend.app.models import Project

class InterventionEngine:
    @staticmethod
    def generate_recommendations(
        project: Project,
        risk_score: float,
        health_score: float,
        predicted_delay_days: int = 0,
        predicted_cost_overrun_pct: float = 0.0
    ) -> Dict[str, Any]:
        recommendations = []
        
        # Rule 1: Severe Delay & Low Velocity -> Workforce Augmentation & Contractor Cure Notice
        if predicted_delay_days > 120 or project.delay_days > 90:
            recommendations.append({
                "id": "REC-01-WORKFORCE",
                "priority": "Critical" if risk_score > 75 else "High",
                "title": "Contractor Workforce & Machinery Augmentation",
                "action_directive": f"Issue formal contractual notice to {project.contractor or 'EPC Contractor'} to augment on-site manpower by >=20% and mobilize supplementary earthwork machinery.",
                "expected_delay_reduction_days": int(predicted_delay_days * 0.35),
                "expected_cost_avoidance_cr": round(project.current_cost * 0.05, 2),
                "target_authority": project.implementing_agency or "Project Director"
            })

        # Rule 2: High Cost Escalation or Progress-Spend Mismatch -> Financial Audit & Tranche Milestone Gating
        spend_mismatch = (project.expenditure / max(1.0, project.current_cost) * 100.0) - project.progress_percentage
        if predicted_cost_overrun_pct > 15.0 or spend_mismatch > 20.0:
            recommendations.append({
                "id": "REC-02-BUDGET",
                "priority": "High",
                "title": "Third-Party Financial Milestone Audit & Tranche Gating",
                "action_directive": "Freeze next capital expenditure release pending independent verification of physical work completed against cumulative spend.",
                "expected_delay_reduction_days": 15,
                "expected_cost_avoidance_cr": round(project.current_cost * 0.08, 2),
                "target_authority": project.ministry
            })

        # Rule 3: Statutory & Land Clearance Stagnation -> Inter-Ministerial Review
        if project.progress_percentage < 40.0 and project.delay_days > 60:
            recommendations.append({
                "id": "REC-03-CLEARANCE",
                "priority": "Critical" if risk_score > 75 else "High",
                "title": "Inter-Ministerial & State Revenue Department Escalation",
                "action_directive": f"Convene Level-1 Joint Coordination Committee with {project.state} State Revenue & Forest authorities to resolve pending Right-of-Way transfers.",
                "expected_delay_reduction_days": int(predicted_delay_days * 0.40),
                "expected_cost_avoidance_cr": round(project.current_cost * 0.04, 2),
                "target_authority": "Cabinet Infrastructure Taskforce / MoSPI"
            })

        # Rule 4: Routine Monitoring & Critical Path Realignment
        if not recommendations:
            recommendations.append({
                "id": "REC-04-ROUTINE",
                "priority": "Medium",
                "title": "Critical Path Milestone Verification",
                "action_directive": "Conduct bi-weekly milestone reviews to maintain current execution momentum and avoid emerging bottlenecks.",
                "expected_delay_reduction_days": 10,
                "expected_cost_avoidance_cr": 0.0,
                "target_authority": project.implementing_agency or "Project Directorate"
            })

        priority_level = "Critical" if risk_score > 75.0 else ("High" if risk_score > 50.0 else "Medium")

        total_delay_recovery = sum(r["expected_delay_reduction_days"] for r in recommendations)
        total_cost_saved = round(sum(r["expected_cost_avoidance_cr"] for r in recommendations), 2)

        return {
            "project_id": project.project_id,
            "priority": priority_level,
            "recommendations": recommendations,
            "expected_impact": {
                "potential_delay_recovery_days": total_delay_recovery,
                "potential_delay_recovery_months": round(total_delay_recovery / 30.4, 1),
                "potential_cost_avoidance_cr": total_cost_saved,
                "estimated_health_score_gain": round(min(25.0, 100.0 - health_score), 1)
            }
        }

intervention_engine = InterventionEngine()
