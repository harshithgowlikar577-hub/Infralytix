import os
import csv
import pandas as pd
from datetime import datetime
from backend.app.database.session import SessionLocal, init_db
from backend.app.models import Project, Role, User
from backend.app.core.security import hash_password
from backend.app.core.logging import logger
from backend.app.ml.cost_model import cost_model
from backend.app.ml.delay_model import delay_model

def seed_database():
    logger.info("Initializing database schema...")
    init_db()
    db = SessionLocal()

    try:
        # 1. Seed Roles
        roles_data = [
            ("SuperAdmin", "Full administrative control over portfolio, models, and users"),
            ("MinistryOfficer", "Ministry level project monitoring and decision support"),
            ("ProjectManager", "Project director level execution and simulation tracking"),
            ("PublicViewer", "Read-only access to public macro analytics")
        ]
        role_map = {}
        for r_name, r_desc in roles_data:
            role = db.query(Role).filter(Role.name == r_name).first()
            if not role:
                role = Role(name=r_name, description=r_desc)
                db.add(role)
                db.commit()
                db.refresh(role)
            role_map[r_name] = role.id

        # 2. Seed Default SuperAdmin User
        admin_user = db.query(User).filter(User.email == "admin@infralytix.gov.in").first()
        if not admin_user:
            admin_user = User(
                email="admin@infralytix.gov.in",
                hashed_password=hash_password("Infralytix2026!"),
                full_name="National Infrastructure Administrator",
                role_id=role_map["SuperAdmin"],
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("Default SuperAdmin user created (admin@infralytix.gov.in / Infralytix2026!)")

        # 3. Seed Projects from datasets/projects.csv
        csv_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "projects.csv")
        if os.path.exists(csv_path):
            logger.info(f"Loading projects from {csv_path}...")
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                rows = list(reader)

            count_seeded = 0
            for r in rows:
                pid = r.get("project_id")
                existing = db.query(Project).filter(Project.project_id == pid).first()
                if not existing:
                    start_d = datetime.strptime(r.get("approved_date", "2023-01-01"), "%Y-%m-%d").date()
                    target_d = datetime.strptime(r.get("planned_completion_date", "2026-01-01"), "%Y-%m-%d").date()
                    act_d = datetime.strptime(r.get("current_expected_date", "2026-06-01"), "%Y-%m-%d").date()
                    
                    delay_days = max(0, (act_d - target_d).days)
                    
                    p = Project(
                        project_id=pid,
                        project_name=r.get("project_name", f"Infrastructure Asset {pid}"),
                        ministry=r.get("implementing_ministry", "Ministry of Road Transport & Highways"),
                        sector=r.get("sector", "Transport & Logistics"),
                        state=r.get("state", "Uttar Pradesh"),
                        implementing_agency=r.get("implementing_agency", "NHAI"),
                        contractor=r.get("contractor", "Larsen & Toubro Ltd"),
                        original_cost=float(r.get("original_cost_cr", 100.0)),
                        current_cost=float(r.get("revised_cost_cr", 100.0)),
                        expenditure=float(r.get("current_expenditure_cr", 40.0)),
                        start_date=start_d,
                        target_date=target_d,
                        actual_completion_date=act_d,
                        delay_days=delay_days,
                        progress_percentage=float(r.get("physical_progress_pct", 0.0)),
                        financial_percentage=float(r.get("financial_progress_pct", 0.0)),
                        status=r.get("project_status", "In Progress"),
                        risk_level=r.get("risk_band", "Safe")
                    )
                    db.add(p)
                    count_seeded += 1
            
            db.commit()
            logger.info(f"Seeded {count_seeded} projects into the database.")

            # 4. Initial ML Training on Seeded Dataset
            df_train = pd.DataFrame([
                {
                    "original_cost": float(r.get("original_cost_cr", 100.0)),
                    "current_cost": float(r.get("revised_cost_cr", 100.0)),
                    "expenditure": float(r.get("current_expenditure_cr", 40.0)),
                    "progress_percentage": float(r.get("physical_progress_pct", 0.0)),
                    "delay_days": float(max(0, (datetime.strptime(r.get("current_expected_date", "2026-06-01"), "%Y-%m-%d") - datetime.strptime(r.get("planned_completion_date", "2026-01-01"), "%Y-%m-%d")).days)),
                    "milestones_delayed": 1 if float(r.get("physical_progress_pct", 0.0)) < 50 else 0,
                    "milestones_due": 5
                }
                for r in rows
            ])

            logger.info("Training initial ML cost and delay models...")
            cost_model.train(df_train)
            delay_model.train(df_train)
            logger.info("ML models trained and ready for live inferences.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
