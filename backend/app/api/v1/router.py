from fastapi import APIRouter
from backend.app.api.v1 import (
    auth,
    projects,
    ingestion,
    health,
    cost_prediction,
    delay_prediction,
    risk,
    similarity,
    intervention,
    early_warning,
    simulation,
    analytics,
    notifications,
    ml_training,
    scheduler,
    copilot
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(ingestion.router)
api_router.include_router(health.router)
api_router.include_router(cost_prediction.router)
api_router.include_router(delay_prediction.router)
api_router.include_router(risk.router)
api_router.include_router(similarity.router)
api_router.include_router(intervention.router)
api_router.include_router(early_warning.router)
api_router.include_router(simulation.router)
api_router.include_router(analytics.router)
api_router.include_router(notifications.router)
api_router.include_router(ml_training.router)
api_router.include_router(scheduler.router)
api_router.include_router(copilot.router)

