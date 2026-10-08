from typing import Optional, Dict, Any, List
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session

from backend.app.database.session import SessionLocal
from backend.app.models import Project, ProjectRisk, ProjectHealthScore
from backend.app.risk_engine.engine import RiskIntelligenceEngine
from backend.app.health_engine.engine import HealthEngine
from backend.app.early_warning_engine.engine import EarlyWarningEngine
from backend.app.ml.delay_model import delay_model
from backend.app.ml.cost_model import cost_model
from backend.app.notifications.service import NotificationService
from backend.app.core.logging import logger

_scheduler: Optional[BackgroundScheduler] = None

def recalculate_all_project_risks() -> int:
    """
    Periodic job: Recalculates risk profiles for all active projects.
    Updates project.risk_level and adds ProjectRisk history.
    """
    logger.info("Executing scheduled job: recalculate_all_project_risks")
    db: Session = SessionLocal()
    updated = 0
    try:
        projects = db.query(Project).filter(Project.is_deleted == False).all()
        for project in projects:
            try:
                due_m = len(project.milestones) if project.milestones else 5
                delayed_m = len([m for m in project.milestones if m.status == "Delayed"]) if project.milestones else 1

                profile = RiskIntelligenceEngine.calculate_risk_profile(
                    progress_percentage=project.progress_percentage,
                    expenditure=project.expenditure,
                    current_cost=project.current_cost,
                    original_cost=project.original_cost,
                    delay_days=project.delay_days,
                    milestones_delayed=delayed_m,
                    milestones_due=due_m
                )

                project.risk_level = profile["risk_level"]

                risk_entry = ProjectRisk(
                    project_id=project.id,
                    risk_score=profile["risk_score"],
                    risk_level=profile["risk_level"],
                    delay_risk_subscore=profile["delay_risk_subscore"],
                    cost_risk_subscore=profile["cost_risk_subscore"],
                    progress_risk_subscore=profile["progress_risk_subscore"],
                    external_risk_subscore=profile["external_risk_subscore"],
                    risk_drivers=profile["risk_drivers"],
                    trajectory=profile.get("trajectory", "Stable")
                )
                db.add(risk_entry)
                updated += 1
            except Exception as e:
                logger.error(f"Error recalculating risk for project {project.project_id}: {e}")
        db.commit()
        logger.info(f"Completed risk recalculation for {updated} projects.")
        return updated
    except Exception as e:
        logger.error(f"Error in recalculate_all_project_risks job: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

def recalculate_all_health_scores() -> int:
    """
    Periodic job: Recalculates health scores for all active projects.
    Adds ProjectHealthScore history record.
    """
    logger.info("Executing scheduled job: recalculate_all_health_scores")
    db: Session = SessionLocal()
    updated = 0
    try:
        projects = db.query(Project).filter(Project.is_deleted == False).all()
        for project in projects:
            try:
                completed_m = len([m for m in project.milestones if m.status == "Completed"]) if project.milestones else 4
                due_m = len(project.milestones) if project.milestones else 5

                health = HealthEngine.calculate_health_score(
                    progress_percentage=project.progress_percentage,
                    expenditure=project.expenditure,
                    current_cost=project.current_cost,
                    original_cost=project.original_cost,
                    start_date=project.start_date,
                    target_date=project.target_date,
                    delay_days=project.delay_days,
                    milestones_completed=completed_m,
                    milestones_due=due_m
                )

                breakdown = health.get("formula_breakdown", {})
                health_entry = ProjectHealthScore(
                    project_id=project.id,
                    health_score=health["health_score"],
                    health_status=health["health_status"],
                    progress_score=breakdown.get("progress_component_35pct", 0.0),
                    budget_score=breakdown.get("budget_component_25pct", 0.0),
                    milestone_score=breakdown.get("milestone_component_20pct", 0.0),
                    delay_score=breakdown.get("delay_component_20pct", 0.0),
                    breakdown_notes=f"Periodic health score computed on {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                )
                db.add(health_entry)
                updated += 1
            except Exception as e:
                logger.error(f"Error calculating health for project {project.project_id}: {e}")
        db.commit()
        logger.info(f"Completed health score recalculation for {updated} projects.")
        return updated
    except Exception as e:
        logger.error(f"Error in recalculate_all_health_scores job: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

def scan_for_early_warnings() -> int:
    """
    Periodic job: Evaluates all projects against early warning heuristics and broadcasts alerts.
    """
    logger.info("Executing scheduled job: scan_for_early_warnings")
    db: Session = SessionLocal()
    alerts_generated = 0
    try:
        projects = db.query(Project).filter(Project.is_deleted == False).all()
        for project in projects:
            try:
                d_res = delay_model.predict(
                    progress_percentage=project.progress_percentage,
                    milestones_delayed=1,
                    milestones_due=5,
                    cost_utilization_pct=(project.expenditure / max(1.0, project.current_cost)) * 100.0,
                    current_delay_days=project.delay_days
                )
                c_res = cost_model.predict(
                    original_cost=project.original_cost,
                    current_cost=project.current_cost,
                    expenditure=project.expenditure,
                    progress_percentage=project.progress_percentage,
                    delay_days=project.delay_days
                )

                risk_score = 80.0 if project.risk_level == "Critical" else (65.0 if project.risk_level == "High" else 30.0)
                health_score = 40.0 if project.risk_level == "Critical" else 75.0

                warnings_dict = EarlyWarningEngine.evaluate_project_warnings(
                    project=project,
                    risk_score=risk_score,
                    health_score=health_score,
                    predicted_delay_days=d_res.get("predicted_delay_days", 0),
                    predicted_cost_overrun_pct=c_res.get("cost_overrun_percentage", 0.0)
                )

                for w in warnings_dict.get("active_warnings", []):
                    if w.get("warning_level") in ("Critical", "High"):
                        NotificationService.broadcast_notification(
                            db=db,
                            title=f"Early Warning: {w['trigger_type']} on {project.project_id}",
                            message=w["alert_reason"],
                            warning_level=w["warning_level"],
                            project_id=project.id,
                            action_url=f"/projects/{project.project_id}"
                        )
                        alerts_generated += 1
            except Exception as e:
                logger.error(f"Error scanning early warnings for project {project.project_id}: {e}")
        db.commit()
        logger.info(f"Completed early warning scan. Broadcasted {alerts_generated} alerts.")
        return alerts_generated
    except Exception as e:
        logger.error(f"Error in scan_for_early_warnings job: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

def start_scheduler() -> BackgroundScheduler:
    """
    Starts the APScheduler with configured recurring intelligence jobs.
    """
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        return _scheduler

    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        recalculate_all_project_risks,
        trigger=IntervalTrigger(minutes=60),
        id="job_recalculate_risks",
        name="Hourly Project Risk Recalculation",
        replace_existing=True
    )
    _scheduler.add_job(
        recalculate_all_health_scores,
        trigger=IntervalTrigger(minutes=60),
        id="job_recalculate_health",
        name="Hourly Project Health Recalculation",
        replace_existing=True
    )
    _scheduler.add_job(
        scan_for_early_warnings,
        trigger=IntervalTrigger(minutes=30),
        id="job_early_warnings",
        name="Half-Hourly Early Warning Scan",
        replace_existing=True
    )
    _scheduler.start()
    logger.info("APScheduler initialized and running with 3 background intelligence jobs.")
    return _scheduler

def shutdown_scheduler():
    """
    Shuts down the APScheduler gracefully.
    """
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("APScheduler shut down successfully.")
        _scheduler = None

def get_scheduler() -> Optional[BackgroundScheduler]:
    """
    Returns the running scheduler instance or None.
    """
    global _scheduler
    return _scheduler

def get_scheduler_status() -> Dict[str, Any]:
    """
    Returns the current status of the scheduler and its registered jobs.
    """
    global _scheduler
    if _scheduler is None or not _scheduler.running:
        return {"status": "STOPPED", "jobs": []}

    jobs = []
    for job in _scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": str(job.next_run_time) if job.next_run_time else None,
            "trigger": str(job.trigger)
        })

    return {
        "status": "RUNNING",
        "jobs_count": len(jobs),
        "jobs": jobs
    }
