from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import pandas as pd
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import DelayPredictionRequest, DelayPredictionResponse, ModelTrainResponse
from backend.app.ml.delay_model import delay_model
from backend.app.services.auth_service import require_roles

router = APIRouter(prefix="/ml/delay", tags=["Schedule Delay Prediction Engine"])

@router.post("/predict", response_model=DelayPredictionResponse)
def predict_project_schedule_delay(request: DelayPredictionRequest, db: Session = Depends(get_db)):
    """
    Predict anticipated schedule delay days, completion probability, and top delay drivers using trained ML models.
    """
    if request.project_id:
        project = db.query(Project).filter(
            (Project.project_id == request.project_id) | (Project.id == request.project_id),
            Project.is_deleted == False
        ).first()
        if project:
            prog = project.progress_percentage
            cost_util = (project.expenditure / max(1.0, project.current_cost)) * 100.0
            cur_delay = project.delay_days
        else:
            prog = request.progress_percentage
            cost_util = request.cost_utilization_pct
            cur_delay = request.delay_days
    else:
        prog = request.progress_percentage
        cost_util = request.cost_utilization_pct
        cur_delay = request.delay_days

    pred = delay_model.predict(
        progress_percentage=prog,
        milestones_delayed=request.milestones_delayed,
        milestones_due=request.milestones_due,
        cost_utilization_pct=cost_util,
        current_delay_days=cur_delay
    )

    return DelayPredictionResponse(
        project_id=request.project_id,
        predicted_delay_days=pred["predicted_delay_days"],
        predicted_delay_months=pred["predicted_delay_months"],
        completion_probability=pred["completion_probability"],
        forecasted_completion_date=pred["forecasted_completion_date"],
        confidence_score=pred["confidence_score"],
        best_algorithm_used=pred["best_algorithm_used"],
        top_delay_drivers=pred["top_delay_drivers"]
    )

@router.post("/train", response_model=ModelTrainResponse)
def train_delay_prediction_model(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin"]))
):
    """
    Train and auto-evaluate Random Forest, Gradient Boosting, and XGBoost models for schedule overrun forecasting.
    """
    projects = db.query(Project).filter(Project.is_deleted == False).all()
    if len(projects) < 10:
        raise HTTPException(status_code=400, detail="Need at least 10 projects in the database to train ML models.")

    df = pd.DataFrame([
        {
            "current_cost": p.current_cost,
            "expenditure": p.expenditure,
            "progress_percentage": p.progress_percentage,
            "delay_days": p.delay_days,
            "milestones_delayed": 1 if p.delay_days > 30 else 0,
            "milestones_due": 5
        }
        for p in projects
    ])

    result = delay_model.train(df)
    return ModelTrainResponse(
        model_type="SCHEDULE_DELAY_PREDICTION",
        status="Model Training Complete",
        best_algorithm=result["best_algorithm"],
        models_evaluated=result["metrics"],
        samples_trained_on=result["trained_samples"],
        training_timestamp=datetime.now()
    )
