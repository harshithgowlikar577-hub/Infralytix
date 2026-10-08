import os
import pandas as pd
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.database.session import get_db
from backend.app.ml.cost_model import cost_model
from backend.app.ml.delay_model import delay_model
from backend.app.models import Project
from backend.app.schemas import ModelTrainResponse
from backend.app.services.auth_service import require_roles
from backend.app.services.audit_service import audit_service
from backend.app.core.config import settings
from backend.app.core.logging import logger

router = APIRouter(prefix="/ml", tags=["ML Model Training & Management"])


def _load_training_dataframe(db: Session) -> pd.DataFrame:
    """
    Loads unified training dataframe from database projects,
    falling back to official calibrated PAIMANA dataset if DB has <10 active projects.
    """
    projects = db.query(Project).filter(Project.is_deleted == False).all()
    if len(projects) >= 10:
        return pd.DataFrame([
            {
                "original_cost": float(p.original_cost),
                "current_cost": float(p.current_cost),
                "expenditure": float(p.expenditure),
                "progress_percentage": float(p.progress_percentage),
                "delay_days": float(p.delay_days),
                "milestones_delayed": 1,
                "milestones_due": 5
            }
            for p in projects
        ])

    csv_path = os.path.join(settings.DATASETS_DIR, "projects.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(settings.REPO_DIR, "datasets", "projects.csv")

    if os.path.exists(csv_path):
        raw = pd.read_csv(csv_path)
        df = pd.DataFrame()
        df["original_cost"] = raw["original_cost_cr"] if "original_cost_cr" in raw.columns else raw.get("original_cost", 100.0)
        df["current_cost"] = raw["revised_cost_cr"] if "revised_cost_cr" in raw.columns else raw.get("current_cost", 100.0)
        df["expenditure"] = raw["current_expenditure_cr"] if "current_expenditure_cr" in raw.columns else raw.get("expenditure", 50.0)
        df["progress_percentage"] = raw["physical_progress_pct"] if "physical_progress_pct" in raw.columns else raw.get("progress_percentage", 50.0)

        if "planned_completion_date" in raw.columns and "current_expected_date" in raw.columns:
            p_date = pd.to_datetime(raw["planned_completion_date"], errors="coerce")
            e_date = pd.to_datetime(raw["current_expected_date"], errors="coerce")
            df["delay_days"] = (e_date - p_date).dt.days.fillna(0).clip(lower=0)
        else:
            df["delay_days"] = raw.get("delay_days", 0)

        df["milestones_delayed"] = 1
        df["milestones_due"] = 5
        return df

    return pd.DataFrame()


@router.post("/train/cost", response_model=ModelTrainResponse)
def train_cost_prediction_model(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["SuperAdmin"]))
):
    """
    Re-train the Cost Prediction model using current project data or official calibrated dataset.
    Only SuperAdmin role can trigger model training.
    """
    now = datetime.now(timezone.utc)
    df = _load_training_dataframe(db)

    if len(df) < 10:
        return ModelTrainResponse(
            model_type="COST_OVERRUN",
            status="error",
            best_algorithm="N/A",
            models_evaluated={},
            samples_trained_on=len(df),
            training_timestamp=now
        )

    result = cost_model.train(df)

    audit_service.log_action(
        db=db,
        action="MODEL_TRAIN_COST",
        entity_name="MLModel",
        entity_id="cost_prediction_model",
        user_id=current_user.id,
        payload={"samples": len(df), "best_algorithm": result.get("best_algorithm", "N/A")}
    )

    return ModelTrainResponse(
        model_type="COST_OVERRUN",
        status="SUCCESS",
        best_algorithm=result.get("best_algorithm", "N/A"),
        models_evaluated=result.get("metrics", {}),
        samples_trained_on=result.get("trained_samples", len(df)),
        training_timestamp=now
    )


@router.post("/train/delay", response_model=ModelTrainResponse)
def train_delay_prediction_model(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["SuperAdmin"]))
):
    """
    Re-train the Delay Prediction model using current project data or official calibrated dataset.
    Only SuperAdmin role can trigger model training.
    """
    now = datetime.now(timezone.utc)
    df = _load_training_dataframe(db)

    if len(df) < 10:
        return ModelTrainResponse(
            model_type="DELAY_PREDICTION",
            status="error",
            best_algorithm="N/A",
            models_evaluated={},
            samples_trained_on=len(df),
            training_timestamp=now
        )

    result = delay_model.train(df)

    audit_service.log_action(
        db=db,
        action="MODEL_TRAIN_DELAY",
        entity_name="MLModel",
        entity_id="delay_prediction_model",
        user_id=current_user.id,
        payload={"samples": len(df), "best_algorithm": result.get("best_algorithm", "N/A")}
    )

    return ModelTrainResponse(
        model_type="DELAY_PREDICTION",
        status="SUCCESS",
        best_algorithm=result.get("best_algorithm", "N/A"),
        models_evaluated=result.get("metrics", {}),
        samples_trained_on=result.get("trained_samples", len(df)),
        training_timestamp=now
    )


@router.get("/status")
def get_ml_model_status(current_user=Depends(require_roles(["SuperAdmin"]))):
    """
    Return current status and metadata for all trained ML models. Only SuperAdmin role can access.
    """

    cost_path = os.path.join(settings.TRAINED_MODELS_DIR, "cost_prediction_model.joblib")
    delay_path = os.path.join(settings.TRAINED_MODELS_DIR, "delay_prediction_model.joblib")

    def model_info(path: str, model_obj, model_type: str):
        exists = os.path.exists(path)
        size_bytes = os.path.getsize(path) if exists else 0
        is_trained = model_obj.model is not None
        return {
            "model_type": model_type,
            "is_loaded": is_trained,
            "is_trained": is_trained,
            "best_algorithm": model_obj.best_algorithm,
            "model_file_exists": exists,
            "model_file_size_bytes": size_bytes,
            "feature_names": model_obj.feature_names
        }

    c_info = model_info(cost_path, cost_model, "COST_OVERRUN")
    d_info = model_info(delay_path, delay_model, "DELAY_PREDICTION")

    return {
        "models": [c_info, d_info],
        "cost_model": c_info,
        "delay_model": d_info
    }
