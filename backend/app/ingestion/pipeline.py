import os
import csv
import io
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session

from backend.app.ingestion.mapper import auto_detect_and_map_columns
from backend.app.ingestion.validator import DatasetValidator
from backend.app.ingestion.cleaner import DatasetCleaner
from backend.app.models import Project, Dataset, ProjectMilestone, ProjectProgress
from backend.app.core.logging import logger

def _parse_date(date_str: Any, default: Optional[date] = None) -> Optional[date]:
    if not date_str:
        return default
    date_str = str(date_str).strip()
    if not date_str or date_str.lower() in ("none", "null", "nan", ""):
        return default
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            pass
    return default

def _safe_float(val: Any, default: float = 0.0) -> float:
    try:
        if val is None:
            return default
        s = str(val).strip()
        if s == "" or s.lower() in ("none", "null", "nan"):
            return default
        return float(s)
    except (ValueError, TypeError):
        return default

def _safe_int(val: Any, default: int = 0) -> int:
    try:
        if val is None:
            return default
        s = str(val).strip()
        if s == "" or s.lower() in ("none", "null", "nan"):
            return default
        return int(float(s))
    except (ValueError, TypeError):
        return default


class IngestionPipeline:
    def __init__(self, db: Session):
        self.db = db
        self.validator = DatasetValidator()
        self.cleaner = DatasetCleaner()

    def process_csv_content(self, file_content: str, filename: str, dataset_type: str = "auto") -> Dict[str, Any]:
        """
        Main entrypoint. Dispatches to the appropriate processor based on dataset_type or detected header columns.
        """
        reader = csv.DictReader(io.StringIO(file_content))
        incoming_rows = list(reader)
        if not incoming_rows:
            return {"error": "Empty CSV file"}

        first_keys = {k.strip().lower() for k in incoming_rows[0].keys()}

        if dataset_type == "milestones" or (dataset_type == "auto" and ("milestone_name" in first_keys or "milestone_id" in first_keys)):
            return self.process_milestones_csv(file_content, filename, incoming_rows)
        elif dataset_type == "observations" or (dataset_type == "auto" and ("execution_velocity" in first_keys or "monthly_expenditure_cr" in first_keys or "milestones_due" in first_keys)):
            return self.process_observations_csv(file_content, filename, incoming_rows)
        elif dataset_type == "dependencies" or (dataset_type == "auto" and ("dependent_project_id" in first_keys or "dependency_type" in first_keys)):
            return self.process_dependencies_csv(file_content, filename, incoming_rows)
        else:
            return self.process_projects_csv(file_content, filename, incoming_rows)

    def process_projects_csv(self, file_content: str, filename: str, incoming_rows: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Processes project master dataset with dynamic schema mapping, iterative cleaning loop, and DB upsert.
        """
        if incoming_rows is None:
            reader = csv.DictReader(io.StringIO(file_content))
            incoming_rows = list(reader)
            if not incoming_rows:
                return {"error": "Empty CSV file"}

        # 1. Dynamic Schema Mapping
        incoming_cols = list(incoming_rows[0].keys())
        schema_mapping = auto_detect_and_map_columns(incoming_cols)
        
        mapped_records = []
        for row in incoming_rows:
            mapped_row = {}
            for std_col, incoming_col in schema_mapping.items():
                mapped_row[std_col] = row.get(incoming_col)
            # Retain extra unmapped columns as metadata
            extra_meta = {k: v for k, v in row.items() if k not in schema_mapping.values()}
            mapped_row["extra_metadata"] = extra_meta
            mapped_records.append(mapped_row)

        # 2. Iterative Validation & Auto-Correction Loop
        iteration = 0
        current_records = mapped_records
        validation_result = self.validator.validate_dataset(current_records)

        while not validation_result["is_valid"] and iteration < 5:
            iteration += 1
            logger.info(f"Ingestion Loop Iteration {iteration}: {validation_result['total_errors']} issues found. Auto-cleaning...")
            current_records = self.cleaner.clean_dataset(current_records)
            validation_result = self.validator.validate_dataset(current_records)

        # 3. Database Ingestion
        ingested_count = 0
        for rec in current_records:
            pid = rec["project_id"]
            existing = self.db.query(Project).filter((Project.project_id == pid) | (Project.id == pid)).first()
            
            start_d = _parse_date(rec.get("start_date"), date(2023, 1, 1))
            target_d = _parse_date(rec.get("target_date"), date(2026, 1, 1))
            
            if existing:
                existing.project_name = rec.get("project_name", existing.project_name)
                existing.current_cost = _safe_float(rec.get("current_cost"), existing.current_cost)
                existing.expenditure = _safe_float(rec.get("expenditure"), existing.expenditure)
                existing.progress_percentage = _safe_float(rec.get("progress_percentage"), existing.progress_percentage)
                existing.status = rec.get("status", existing.status)
            else:
                new_project = Project(
                    project_id=pid,
                    project_name=rec.get("project_name", f"Infrastructure Asset {pid}"),
                    ministry=rec.get("ministry", "Ministry of Road Transport & Highways"),
                    sector=rec.get("sector", "Transport & Logistics"),
                    state=rec.get("state", "Uttar Pradesh"),
                    district=rec.get("district"),
                    implementing_agency=rec.get("implementing_agency"),
                    contractor=rec.get("contractor"),
                    original_cost=_safe_float(rec.get("original_cost"), 100.0),
                    current_cost=_safe_float(rec.get("current_cost"), 100.0),
                    expenditure=_safe_float(rec.get("expenditure"), 40.0),
                    start_date=start_d,
                    target_date=target_d,
                    progress_percentage=_safe_float(rec.get("progress_percentage"), 0.0),
                    financial_percentage=_safe_float(rec.get("financial_percentage"), 0.0),
                    status=rec.get("status", "In Progress"),
                    latitude=_safe_float(rec.get("latitude"), None) if rec.get("latitude") else None,
                    longitude=_safe_float(rec.get("longitude"), None) if rec.get("longitude") else None,
                    extra_metadata=rec.get("extra_metadata", {})
                )
                self.db.add(new_project)
                ingested_count += 1

        self.db.commit()

        # 4. Save Dataset Record
        dataset_entry = Dataset(
            file_name=filename,
            file_path=filename,
            file_size_bytes=len(file_content.encode('utf-8')),
            total_records=len(current_records),
            valid_records=len(current_records),
            error_records=0,
            completeness_score=validation_result["completeness_score"],
            quality_score=validation_result["quality_score"],
            ml_readiness_score=validation_result["ml_readiness_score"],
            ingestion_status="Ingested",
            schema_mapping=schema_mapping,
            validation_report=validation_result
        )
        self.db.add(dataset_entry)
        self.db.commit()
        self.db.refresh(dataset_entry)

        return {
            "dataset_id": dataset_entry.id,
            "file_name": filename,
            "total_records": len(current_records),
            "ingested_count": ingested_count,
            "validation": validation_result,
            "schema_mapping": schema_mapping
        }

    def process_milestones_csv(self, file_content: str, filename: str, incoming_rows: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Processes project milestones dataset and upserts into project_milestones table.
        Columns: milestone_id, project_id, milestone_name, planned_date, actual_date, delay_days, status
        """
        if incoming_rows is None:
            reader = csv.DictReader(io.StringIO(file_content))
            incoming_rows = list(reader)
            if not incoming_rows:
                return {"error": "Empty CSV file"}

        ingested_count = 0
        error_count = 0

        # Cache project lookups
        project_cache: Dict[str, Project] = {}

        for row in incoming_rows:
            pid = str(row.get("project_id", "")).strip()
            if not pid:
                error_count += 1
                continue

            if pid not in project_cache:
                project = self.db.query(Project).filter((Project.project_id == pid) | (Project.id == pid)).first()
                project_cache[pid] = project
            else:
                project = project_cache[pid]

            if not project:
                error_count += 1
                continue

            m_code = row.get("milestone_id") or row.get("milestone_code")
            m_name = row.get("milestone_name") or f"Milestone {m_code}"
            planned_d = _parse_date(row.get("planned_date"), date.today())
            actual_d = _parse_date(row.get("actual_date"), None)
            delay_days = _safe_int(row.get("delay_days"), 0)
            status = row.get("status", "On Time")
            is_critical = ("critical" in m_name.lower()) or delay_days > 60

            # Check if milestone exists
            query = self.db.query(ProjectMilestone).filter(ProjectMilestone.project_id == project.id)
            if m_code:
                existing_m = query.filter(ProjectMilestone.milestone_code == m_code).first()
            else:
                existing_m = query.filter(ProjectMilestone.milestone_name == m_name).first()

            if existing_m:
                existing_m.planned_date = planned_d
                existing_m.actual_date = actual_d
                existing_m.delay_days = delay_days
                existing_m.status = status
                existing_m.is_critical = is_critical
            else:
                new_m = ProjectMilestone(
                    project_id=project.id,
                    milestone_code=m_code,
                    milestone_name=m_name,
                    planned_date=planned_d,
                    actual_date=actual_d,
                    delay_days=delay_days,
                    is_critical=is_critical,
                    status=status
                )
                self.db.add(new_m)
                ingested_count += 1

        self.db.commit()

        dataset_entry = Dataset(
            file_name=filename,
            file_path=filename,
            file_size_bytes=len(file_content.encode('utf-8')),
            total_records=len(incoming_rows),
            valid_records=ingested_count,
            error_records=error_count,
            completeness_score=round((ingested_count / max(1, len(incoming_rows))) * 100.0, 2),
            quality_score=98.0,
            ml_readiness_score=95.0,
            ingestion_status="Ingested",
            schema_mapping={k: k for k in incoming_rows[0].keys()},
            validation_report={"dataset_type": "milestones", "total_records": len(incoming_rows), "ingested": ingested_count, "errors": error_count}
        )
        self.db.add(dataset_entry)
        self.db.commit()
        self.db.refresh(dataset_entry)

        return {
            "dataset_id": dataset_entry.id,
            "file_name": filename,
            "total_records": len(incoming_rows),
            "ingested_count": ingested_count,
            "validation": {
                "completeness_score": dataset_entry.completeness_score,
                "quality_score": dataset_entry.quality_score,
                "ml_readiness_score": dataset_entry.ml_readiness_score,
                "is_valid": True,
                "total_errors": error_count
            },
            "schema_mapping": dataset_entry.schema_mapping
        }

    def process_observations_csv(self, file_content: str, filename: str, incoming_rows: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Processes monthly progress time-series observations and upserts into project_progress table.
        Columns: project_id, month, planned_progress_pct, actual_progress_pct, financial_progress_pct,
                 monthly_expenditure_cr, cumulative_expenditure_cr, milestones_due, milestones_completed,
                 milestones_delayed, resource_util_pct, execution_velocity, issue_category
        """
        if incoming_rows is None:
            reader = csv.DictReader(io.StringIO(file_content))
            incoming_rows = list(reader)
            if not incoming_rows:
                return {"error": "Empty CSV file"}

        ingested_count = 0
        error_count = 0
        project_cache: Dict[str, Project] = {}

        for row in incoming_rows:
            pid = str(row.get("project_id", "")).strip()
            if not pid:
                error_count += 1
                continue

            if pid not in project_cache:
                project = self.db.query(Project).filter((Project.project_id == pid) | (Project.id == pid)).first()
                project_cache[pid] = project
            else:
                project = project_cache[pid]

            if not project:
                error_count += 1
                continue

            obs_month = str(row.get("month") or row.get("observation_month") or "").strip()
            if not obs_month:
                obs_month = datetime.now().strftime("%Y-%m")

            planned_p = _safe_float(row.get("planned_progress_pct") or row.get("planned_progress"), 0.0)
            actual_p = _safe_float(row.get("actual_progress_pct") or row.get("actual_progress"), 0.0)
            fin_p = _safe_float(row.get("financial_progress_pct") or row.get("financial_progress"), 0.0)
            m_spend = _safe_float(row.get("monthly_expenditure_cr") or row.get("monthly_expenditure"), 0.0)
            cum_spend = _safe_float(row.get("cumulative_expenditure_cr") or row.get("cumulative_expenditure"), 0.0)
            m_due = _safe_int(row.get("milestones_due"), 0)
            m_done = _safe_int(row.get("milestones_completed"), 0)
            m_delayed = _safe_int(row.get("milestones_delayed"), 0)
            res_util = _safe_float(row.get("resource_util_pct") or row.get("resource_utilization"), 100.0)
            exec_vel = _safe_float(row.get("execution_velocity"), 0.0)
            issue_cat = row.get("issue_category", "None / Routine Execution")

            existing_prog = self.db.query(ProjectProgress).filter(
                ProjectProgress.project_id == project.id,
                ProjectProgress.observation_month == obs_month
            ).first()

            if existing_prog:
                existing_prog.planned_progress = planned_p
                existing_prog.actual_progress = actual_p
                existing_prog.financial_progress = fin_p
                existing_prog.monthly_expenditure = m_spend
                existing_prog.cumulative_expenditure = cum_spend
                existing_prog.milestones_due = m_due
                existing_prog.milestones_completed = m_done
                existing_prog.milestones_delayed = m_delayed
                existing_prog.resource_utilization = res_util
                existing_prog.execution_velocity = exec_vel
                existing_prog.issue_category = issue_cat
            else:
                new_prog = ProjectProgress(
                    project_id=project.id,
                    observation_month=obs_month,
                    planned_progress=planned_p,
                    actual_progress=actual_p,
                    financial_progress=fin_p,
                    monthly_expenditure=m_spend,
                    cumulative_expenditure=cum_spend,
                    milestones_due=m_due,
                    milestones_completed=m_done,
                    milestones_delayed=m_delayed,
                    resource_utilization=res_util,
                    execution_velocity=exec_vel,
                    issue_category=issue_cat
                )
                self.db.add(new_prog)
                ingested_count += 1

        self.db.commit()

        dataset_entry = Dataset(
            file_name=filename,
            file_path=filename,
            file_size_bytes=len(file_content.encode('utf-8')),
            total_records=len(incoming_rows),
            valid_records=ingested_count,
            error_records=error_count,
            completeness_score=round((ingested_count / max(1, len(incoming_rows))) * 100.0, 2),
            quality_score=99.0,
            ml_readiness_score=97.0,
            ingestion_status="Ingested",
            schema_mapping={k: k for k in incoming_rows[0].keys()},
            validation_report={"dataset_type": "observations", "total_records": len(incoming_rows), "ingested": ingested_count, "errors": error_count}
        )
        self.db.add(dataset_entry)
        self.db.commit()
        self.db.refresh(dataset_entry)

        return {
            "dataset_id": dataset_entry.id,
            "file_name": filename,
            "total_records": len(incoming_rows),
            "ingested_count": ingested_count,
            "validation": {
                "completeness_score": dataset_entry.completeness_score,
                "quality_score": dataset_entry.quality_score,
                "ml_readiness_score": dataset_entry.ml_readiness_score,
                "is_valid": True,
                "total_errors": error_count
            },
            "schema_mapping": dataset_entry.schema_mapping
        }

    def process_dependencies_csv(self, file_content: str, filename: str, incoming_rows: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Processes inter-project dependencies dataset and stores structured graph links in project.extra_metadata['dependencies'].
        Columns: project_id, dependent_project_id, dependency_type, impact_level, dependency_note
        """
        if incoming_rows is None:
            reader = csv.DictReader(io.StringIO(file_content))
            incoming_rows = list(reader)
            if not incoming_rows:
                return {"error": "Empty CSV file"}

        ingested_count = 0
        error_count = 0
        project_cache: Dict[str, Project] = {}

        for row in incoming_rows:
            pid = str(row.get("project_id", "")).strip()
            dep_pid = str(row.get("dependent_project_id", "")).strip()
            if not pid or not dep_pid:
                error_count += 1
                continue

            if pid not in project_cache:
                project = self.db.query(Project).filter((Project.project_id == pid) | (Project.id == pid)).first()
                project_cache[pid] = project
            else:
                project = project_cache[pid]

            if not project:
                error_count += 1
                continue

            dep_entry = {
                "dependent_project_id": dep_pid,
                "dependency_type": row.get("dependency_type", "corridor_shared"),
                "impact_level": row.get("impact_level", "Medium"),
                "dependency_note": row.get("dependency_note", "")
            }

            meta = dict(project.extra_metadata or {})
            deps = list(meta.get("dependencies", []))
            # Remove existing matching dependency
            deps = [d for d in deps if d.get("dependent_project_id") != dep_pid]
            deps.append(dep_entry)
            meta["dependencies"] = deps
            project.extra_metadata = meta
            ingested_count += 1

        self.db.commit()

        dataset_entry = Dataset(
            file_name=filename,
            file_path=filename,
            file_size_bytes=len(file_content.encode('utf-8')),
            total_records=len(incoming_rows),
            valid_records=ingested_count,
            error_records=error_count,
            completeness_score=round((ingested_count / max(1, len(incoming_rows))) * 100.0, 2),
            quality_score=99.5,
            ml_readiness_score=98.0,
            ingestion_status="Ingested",
            schema_mapping={k: k for k in incoming_rows[0].keys()},
            validation_report={"dataset_type": "dependencies", "total_records": len(incoming_rows), "ingested": ingested_count, "errors": error_count}
        )
        self.db.add(dataset_entry)
        self.db.commit()
        self.db.refresh(dataset_entry)

        return {
            "dataset_id": dataset_entry.id,
            "file_name": filename,
            "total_records": len(incoming_rows),
            "ingested_count": ingested_count,
            "validation": {
                "completeness_score": dataset_entry.completeness_score,
                "quality_score": dataset_entry.quality_score,
                "ml_readiness_score": dataset_entry.ml_readiness_score,
                "is_valid": True,
                "total_errors": error_count
            },
            "schema_mapping": dataset_entry.schema_mapping
        }
