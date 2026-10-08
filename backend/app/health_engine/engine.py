from typing import Dict, Any, List
from datetime import datetime, date

class HealthEngine:
    @staticmethod
    def calculate_health_score(
        progress_percentage: float,
        expenditure: float,
        current_cost: float,
        original_cost: float,
        start_date: date,
        target_date: date,
        delay_days: int = 0,
        milestones_completed: int = 5,
        milestones_due: int = 5
    ) -> Dict[str, Any]:
        """
        Calculate Unified Project Health Score (0-100) based on 4 calibrated dimensions:
        - 35% Progress Health
        - 25% Budget Utilization Health
        - 20% Milestone Completion Health
        - 20% Delay Performance Health
        """
        # 1. Progress Component (35%)
        # Calculates whether physical progress is keeping pace with elapsed project duration
        today = date.today()
        total_duration = max(1, (target_date - start_date).days)
        elapsed_duration = max(0, min(total_duration, (today - start_date).days))
        expected_progress = (elapsed_duration / total_duration) * 100.0 if total_duration > 0 else 100.0
        
        if expected_progress > 0:
            progress_ratio = min(1.2, progress_percentage / expected_progress)
            progress_score = min(100.0, max(0.0, progress_ratio * 100.0))
        else:
            progress_score = 100.0

        # 2. Budget Utilization Component (25%)
        # Assesses expenditure relative to progress and cost growth
        cost_baseline = max(1.0, current_cost)
        spend_pct = (expenditure / cost_baseline) * 100.0
        # Check for progress-spend alignment
        spend_mismatch = abs(spend_pct - progress_percentage)
        budget_score = max(0.0, 100.0 - (spend_mismatch * 1.5))
        # Penalty if revised cost > original cost by >20%
        if original_cost > 0 and current_cost > original_cost * 1.2:
            budget_score = max(0.0, budget_score - 15.0)

        # 3. Milestone Completion Component (20%)
        if milestones_due > 0:
            milestone_ratio = milestones_completed / milestones_due
            milestone_score = min(100.0, max(0.0, milestone_ratio * 100.0))
        else:
            milestone_score = 100.0

        # 4. Delay Performance Component (20%)
        if delay_days <= 0:
            delay_score = 100.0
        elif delay_days <= 60:
            delay_score = max(0.0, 100.0 - (delay_days * 0.5))
        elif delay_days <= 180:
            delay_score = max(0.0, 70.0 - ((delay_days - 60) * 0.3))
        else:
            delay_score = max(0.0, 34.0 - ((delay_days - 180) * 0.1))

        # Composite Health Calculation
        health_score = round(
            (0.35 * progress_score) +
            (0.25 * budget_score) +
            (0.20 * milestone_score) +
            (0.20 * delay_score),
            1
        )
        health_score = min(100.0, max(0.0, health_score))

        # Determine Health Status
        if health_score >= 75.0:
            health_status = "Healthy"
        elif health_score >= 50.0:
            health_status = "Warning"
        else:
            health_status = "Critical"

        # Generate diagnostic insights
        insights = []
        if progress_score < 60.0:
            insights.append(f"Physical progress ({progress_percentage:.1f}%) is lagging behind the timeline expectation ({expected_progress:.1f}%).")
        if budget_score < 60.0:
            insights.append("Budget utilization shows mismatch with actual physical progress on site.")
        if delay_score < 60.0:
            insights.append(f"Accumulated schedule delay of {delay_days} days is significantly degrading project health.")
        if milestone_score < 70.0:
            insights.append(f"Milestone completion rate is {milestone_score:.0f}%, indicating execution bottlenecks.")
        if not insights:
            insights.append("Project execution is proceeding according to approved timelines and budget allocations.")

        return {
            "health_score": health_score,
            "health_status": health_status,
            "formula_breakdown": {
                "progress_component_35pct": round(progress_score, 1),
                "budget_component_25pct": round(budget_score, 1),
                "milestone_component_20pct": round(milestone_score, 1),
                "delay_component_20pct": round(delay_score, 1)
            },
            "insights": insights
        }
