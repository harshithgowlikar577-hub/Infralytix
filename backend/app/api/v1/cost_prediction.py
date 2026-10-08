from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import pandas as pd
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import CostPredictionRequest, CostPredictionResponse, ModelTrainResponse
from backend.app.ml.cost_model import cost_model
from backend.app.services.auth_service import require_roles
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/ml/cost", tags=["Cost Overrun Prediction Engine"])

@router.post("/predict", response_model=CostPredictionResponse)
def predict_project_cost_overrun(request: CostPredictionRequest, db: Session = Depends(get_db)):
    """
    Predict anticipated final cost and cost overrun percentage using trained ML models (XGBoost / Random Forest / Gradient Boosting).
    """
    if request.project_id:
        project = db.query(Project).filter(
            (Project.project_id == request.project_id) | (Project.id == request.project_id),
            Project.is_deleted == False
        ).first()
        if project:
            orig_cost = project.original_cost
            curr_cost = project.current_cost
            exp = project.expenditure
            prog = project.progress_percentage
            delay = project.delay_days
        else:
            orig_cost = request.original_cost
            curr_cost = request.current_cost
            exp = request.expenditure
            prog = request.progress_percentage
            delay = request.delay_days
    else:
        orig_cost = request.original_cost
        curr_cost = request.current_cost
        exp = request.expenditure
        prog = request.progress_percentage
        delay = request.delay_days

    pred = cost_model.predict(
        original_cost=orig_cost,
        current_cost=curr_cost,
        expenditure=exp,
        progress_percentage=prog,
        delay_days=delay
    )

    return CostPredictionResponse(
        project_id=request.project_id,
        predicted_final_cost=pred["predicted_final_cost"],
        cost_overrun_percentage=pred["cost_overrun_percentage"],
        expected_escalation_cr=pred["expected_escalation_cr"],
        confidence_score=pred["confidence_score"],
        best_algorithm_used=pred["best_algorithm_used"],
        feature_importance=pred["feature_importance"]
    )

@router.post("/train", response_model=ModelTrainResponse)
def train_cost_prediction_model(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin"]))
):
    """
    Train and auto-evaluate Random Forest, Gradient Boosting, and XGBoost models on active database projects.
    """
    projects = db.query(Project).filter(Project.is_deleted == False).all()
    if len(projects) < 10:
        raise HTTPException(status_code=400, detail="Need at least 10 projects in the database to train ML models.")

    df = pd.DataFrame([
        {
            "original_cost": p.original_cost,
            "current_cost": p.current_cost,
            "expenditure": p.expenditure,
            "progress_percentage": p.progress_percentage,
            "delay_days": p.delay_days
        }
        for p in projects
    ])

    result = cost_model.train(df)
    return ModelTrainResponse(
        model_type="COST_OVERRUN_PREDICTION",
        status="Model Training Complete",
        best_algorithm=result["best_algorithm"],
        models_evaluated=result["metrics"],
        samples_trained_on=result["trained_samples"],
        training_timestamp=datetime.now()
    )
