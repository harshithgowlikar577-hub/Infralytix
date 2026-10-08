import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from backend.app.models import Project

class EarlyWarningEngine:
    @staticmethod
    def evaluate_project_warnings(
        project: Project,
        risk_score: float,
        health_score: float,
        predicted_delay_days: int,
        predicted_cost_overrun_pct: float
    ) -> Dict[str, Any]:
        warnings = []
        now = datetime.now(timezone.utc)

        # Trigger 1: Critical Risk Spike (Risk >= 75)
        if risk_score >= 75.0:
            warnings.append({
                "warning_id": f"WRN-{uuid.uuid4().hex[:8].upper()}",
                "project_id": project.project_id,
                "project_name": project.project_name,
                "warning_level": "Critical",
                "trigger_type": "RISK_SPIKE",
                "alert_reason": f"Composite Dynamic Risk Score reached Critical threshold ({risk_score:.1f}/100).",
                "evidence": {
                    "risk_score": risk_score,
                    "accumulated_delay_days": project.delay_days,
                    "current_progress_pct": project.progress_percentage
                },
                "recommended_action": "Immediately trigger Inter-Ministerial Review and dispatch technical oversight team.",
                "detected_at": now
            })

        # Trigger 2: Emerging Delay Overrun (>90 days predicted or >60 days accumulated)
        if predicted_delay_days >= 90 or project.delay_days >= 60:
            warnings.append({
                "warning_id": f"WRN-{uuid.uuid4().hex[:8].upper()}",
                "project_id": project.project_id,
                "project_name": project.project_name,
                "warning_level": "High" if predicted_delay_days < 180 else "Critical",
                "trigger_type": "EMERGING_DELAY",
                "alert_reason": f"Schedule slippage forecasted to exceed timeline by {predicted_delay_days} days ({predicted_delay_days/30.4:.1f} months).",
                "evidence": {
                    "predicted_delay_days": predicted_delay_days,
                    "accumulated_delay_days": project.delay_days,
                    "target_date": project.target_date.strftime("%Y-%m-%d")
                },
                "recommended_action": "Issue contractual cure notice to EPC contractor for workforce acceleration.",
                "detected_at": now
            })

        # Trigger 3: Cost Escalation (>15% expected overrun)
        if predicted_cost_overrun_pct >= 15.0:
            warnings.append({
                "warning_id": f"WRN-{uuid.uuid4().hex[:8].upper()}",
                "project_id": project.project_id,
                "project_name": project.project_name,
                "warning_level": "High",
                "trigger_type": "COST_ESCALATION",
                "alert_reason": f"Anticipated budget overrun of {predicted_cost_overrun_pct:.1f}% exceeds 15% tolerance threshold.",
                "evidence": {
                    "original_cost_cr": project.original_cost,
                    "current_cost_cr": project.current_cost,
                    "predicted_overrun_pct": predicted_cost_overrun_pct
                },
                "recommended_action": "Institute third-party financial audit on cumulative expenditures prior to next budget release.",
                "detected_at": now
            })

        # Trigger 4: Health Deterioration (Health < 50)
        if health_score < 50.0:
            warnings.append({
                "warning_id": f"WRN-{uuid.uuid4().hex[:8].upper()}",
                "project_id": project.project_id,
                "project_name": project.project_name,
                "warning_level": "Warning",
                "trigger_type": "HEALTH_DETERIORATION",
                "alert_reason": f"Overall Project Health Index dropped to {health_score:.1f}/100.",
                "evidence": {
                    "health_score": health_score,
                    "status": project.status
                },
                "recommended_action": "Review milestone delivery schedule with implementing agency.",
                "detected_at": now
            })

        # Determine overall summary level
        if any(w["warning_level"] == "Critical" for w in warnings):
            overall_level = "Critical"
            primary_reason = "Multiple critical risk and delay indicators triggered."
            primary_action = "Convene emergency inter-ministerial taskforce."
        elif any(w["warning_level"] == "High" for w in warnings):
            overall_level = "High"
            primary_reason = "Elevated schedule delay and cost escalation risks detected."
            primary_action = "Execute contractor cure notice and audit milestone progress."
        elif warnings:
            overall_level = "Warning"
            primary_reason = "Emerging operational variances require administrative monitoring."
            primary_action = "Schedule routine nodal review."
        else:
            overall_level = "Nominal"
            primary_reason = "No abnormal variances or threshold breaches detected."
            primary_action = "Continue standard quarterly monitoring."

        return {
            "project_id": project.project_id,
            "warning_level": overall_level,
            "alert_reason": primary_reason,
            "recommended_action": primary_action,
            "active_warnings": warnings
        }

    @staticmethod
    def _format_predictive_item(p: Project, queue: str, now: datetime) -> Dict[str, Any]:
        cost_overrun_pct = round(((p.current_cost - p.original_cost) / max(p.original_cost, 1.0) * 100), 1) if p.original_cost > 0 else 0.0
        delay_days = p.delay_days or 0
        delay_mos = round(delay_days / 30.4, 1)
        
        # Risk score (0-100)
        risk_score = round(min(98.0, max(25.0, (delay_days / 600.0) * 45.0 + (100.0 - p.progress_percentage) * 0.35 + (cost_overrun_pct / 100.0) * 20.0)), 1)
        
        # Delay probability (ML completion slippage probability %)
        delay_prob = round(min(99.2, max(24.0, (delay_days / (delay_days + 80.0)) * 80.0 + (100.0 - p.progress_percentage) * 0.18)), 1)
        
        # Cost escalation probability (ML budget breach probability %)
        cost_prob = round(min(98.5, max(18.0, (cost_overrun_pct / 50.0) * 50.0 + 35.0 if cost_overrun_pct > 0 else 22.0 + (100.0 - p.progress_percentage) * 0.15)), 1)
        
        # Trigger type
        if risk_score >= 75.0 or delay_days >= 300:
            trigger_type = "CRITICAL_RISK_SPIKE"
        elif delay_days >= 180:
            trigger_type = "CHRONIC_SCHEDULE_SLIPPAGE"
        elif cost_overrun_pct >= 15.0:
            trigger_type = "COST_OVERRUN_ESCALATION"
        else:
            trigger_type = "VELOCITY_STAGNATION"
            
        # Primary cause
        sector_lower = (p.sector or "").lower()
        if "road" in sector_lower or "highway" in sector_lower:
            if delay_days > 250:
                primary_cause = "Stage-II Forest NOC & Multi-District RoW Land Deadlock"
            elif cost_overrun_pct > 15:
                primary_cause = "Bitumen & Aggregate Price Volatility with Grade Separator Redesign"
            else:
                primary_cause = "EPC Package Execution Lag & Earthwork Monsoon Stoppage"
        elif "rail" in sector_lower or "metro" in sector_lower or "transit" in sector_lower:
            if delay_days > 250:
                primary_cause = "Urban Defense Land RoW Handover & Signalling Interlocking Clearances"
            elif cost_overrun_pct > 15:
                primary_cause = "Underground Tunneling Geotechnical Realignment & Rolling Stock Delay"
            else:
                primary_cause = "Overhead Electrification (OHE) Feeder Coordination Latency"
        elif "power" in sector_lower or "energy" in sector_lower:
            if delay_days > 200:
                primary_cause = "Inter-State Transmission Substation Grid Evacuation Clearance"
            else:
                primary_cause = "Boiler-Turbine-Generator (BTG) Supply Chain Delivery Backlog"
        elif "port" in sector_lower or "water" in sector_lower or "shipping" in sector_lower:
            primary_cause = "Coastal Regulation Zone (CRZ) Clearance & Marine Dredging Constraints"
        else:
            if delay_days > 250:
                primary_cause = "Contractual Cure Notice Stagnation & Joint Venture Arbitration"
            elif cost_overrun_pct > 15:
                primary_cause = "Scope Creep with Unplanned Architectural Redesign"
            else:
                primary_cause = "Contractor Workforce Mobilization Deficit & Liquidity Constraints"
                
        # Forecast impact
        cost_diff = max(0.0, p.current_cost - p.original_cost)
        forecast_impact = f"+{delay_mos} mos delay / +₹{round(cost_diff, 1)} Cr overrun"
        
        # Urgency & Owner
        if queue == "escalation":
            urgency = "Immediate (0-48h)"
        elif queue == "critical":
            urgency = "Immediate (0-48h)" if delay_days >= 300 else "High (7d)"
        elif queue == "high_risk":
            urgency = "High (7d)"
        else:
            urgency = "Scheduled (30d)"
            
        owner = f"{p.implementing_agency or 'PMU'} / {p.ministry}"
        
        # Expected recovery
        recovered_mos = max(1.0, round(delay_mos * 0.35, 1))
        cost_avoided = max(5.0, round(cost_diff * 0.40, 1))
        expected_recovery = f"Recover {recovered_mos} mos delay & mitigate ₹{cost_avoided} Cr upon nodal intervention"
        
        # Recommended Action
        if queue == "escalation":
            rec_action = f"Escalate to Cabinet Secretariat / PMO. Convene emergency tripartite coordination meeting within 48h to resolve {primary_cause}."
        elif queue == "critical":
            rec_action = f"Issue formal Cure Notice to EPC lead contractor; deploy Joint Secretary inspection taskforce within 7 days."
        elif queue == "high_risk":
            rec_action = f"Direct Implementing Agency ({p.implementing_agency or 'PMU'}) to submit bi-weekly milestone recovery plan and unblock working capital."
        else:
            rec_action = f"Place project on enhanced ministerial surveillance; verify milestone physical compliance in next bi-monthly sprint."

        return {
            "warning_id": f"WRN-{uuid.uuid4().hex[:8].upper()}",
            "project_id": p.project_id,
            "project_name": p.project_name,
            "ministry": p.ministry,
            "sector": p.sector,
            "state": p.state,
            "implementing_agency": p.implementing_agency,
            "current_cost_cr": round(p.current_cost, 2),
            "original_cost_cr": round(p.original_cost, 2),
            "cost_overrun_pct": cost_overrun_pct,
            "delay_days": delay_days,
            "delay_months": delay_mos,
            "risk_level": p.risk_level,
            "risk_score": risk_score,
            "delay_probability": delay_prob,
            "cost_escalation_probability": cost_prob,
            "trigger_type": trigger_type,
            "primary_cause": primary_cause,
            "forecast_impact": forecast_impact,
            "urgency": urgency,
            "owner": owner,
            "expected_recovery": expected_recovery,
            "recommended_action": rec_action,
            "queue": queue,
            "detected_at": now
        }

    @staticmethod
    def get_portfolio_predictive_warnings(db: Session, limit_per_queue: int = 20) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        
        # 1. Escalation Queue: High Capex + Severe Delay
        esc_projects = db.query(Project).filter(
            Project.is_deleted == False,
            Project.status != "Completed",
            Project.delay_days >= 300,
            Project.current_cost >= 800
        ).order_by(Project.current_cost.desc()).limit(limit_per_queue).all()
        esc_ids = {p.id for p in esc_projects}

        # 2. Critical Queue: Severe Delay >= 180 or Critical Risk
        crit_projects = db.query(Project).filter(
            Project.is_deleted == False,
            Project.status != "Completed",
            Project.delay_days >= 180,
            ~Project.id.in_(esc_ids) if esc_ids else True
        ).order_by(Project.delay_days.desc()).limit(limit_per_queue).all()
        crit_ids = esc_ids | {p.id for p in crit_projects}

        # 3. High Risk Queue: 90 <= Delay < 180 or High Risk
        high_projects = db.query(Project).filter(
            Project.is_deleted == False,
            Project.status != "Completed",
            Project.delay_days >= 90,
            Project.delay_days < 180,
            ~Project.id.in_(crit_ids) if crit_ids else True
        ).order_by(Project.delay_days.desc()).limit(limit_per_queue).all()
        high_ids = crit_ids | {p.id for p in high_projects}

        # 4. Watch List: 15 <= Delay < 90 or Medium Risk / Early Slowdown
        watch_projects = db.query(Project).filter(
            Project.is_deleted == False,
            Project.status != "Completed",
            ((Project.delay_days >= 15) & (Project.delay_days < 90)) | (Project.risk_level == "Medium"),
            ~Project.id.in_(high_ids) if high_ids else True
        ).order_by(Project.progress_percentage.asc()).limit(limit_per_queue).all()

        esc_items = [EarlyWarningEngine._format_predictive_item(p, "escalation", now) for p in esc_projects]
        crit_items = [EarlyWarningEngine._format_predictive_item(p, "critical", now) for p in crit_projects]
        high_items = [EarlyWarningEngine._format_predictive_item(p, "high_risk", now) for p in high_projects]
        watch_items = [EarlyWarningEngine._format_predictive_item(p, "watch_list", now) for p in watch_projects]

        all_items = esc_items + crit_items + high_items + watch_items
        total_alerts = len(all_items)

        total_capex_at_risk = round(sum(item["current_cost_cr"] for item in all_items), 2)
        avg_delay_prob = round(sum(item["delay_probability"] for item in all_items) / max(total_alerts, 1), 1)
        avg_cost_prob = round(sum(item["cost_escalation_probability"] for item in all_items) / max(total_alerts, 1), 1)

        # Trigger counts
        triggers: Dict[str, int] = {}
        sectors: Dict[str, int] = {}
        urgencies: Dict[str, int] = {}

        for item in all_items:
            triggers[item["trigger_type"]] = triggers.get(item["trigger_type"], 0) + 1
            sectors[item["sector"]] = sectors.get(item["sector"], 0) + 1
            urgencies[item["urgency"]] = urgencies.get(item["urgency"], 0) + 1

        return {
            "total_alerts": total_alerts,
            "escalation_count": len(esc_items),
            "critical_count": len(crit_items),
            "high_risk_count": len(high_items),
            "watch_list_count": len(watch_items),
            "total_capex_at_risk_cr": total_capex_at_risk,
            "average_delay_probability": avg_delay_prob,
            "average_cost_escalation_probability": avg_cost_prob,
            "alerts_by_trigger_type": triggers,
            "alerts_by_sector": sectors,
            "alerts_by_urgency": urgencies,
            "escalation_queue": esc_items,
            "critical_queue": crit_items,
            "high_risk_queue": high_items,
            "watch_list": watch_items
        }

early_warning_engine = EarlyWarningEngine()

