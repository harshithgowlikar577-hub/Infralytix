from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.analytics.engine import analytics_engine
from backend.app.schemas import (
    DashboardAnalyticsResponse,
    MinistryAnalyticsResponse,
    StateAnalyticsResponse,
    SectorAnalyticsResponse,
    RiskAnalyticsResponse
)

router = APIRouter(prefix="/analytics", tags=["Portfolio & Governance Analytics"])

@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
def get_dashboard_summary_analytics(db: Session = Depends(get_db)):
    """
    Retrieve macro portfolio-wide metrics, capital at risk, delay exposures, and top deteriorating assets.
    """
    metrics = analytics_engine.get_dashboard_metrics(db)
    return DashboardAnalyticsResponse(**metrics)

@router.get("/ministry", response_model=MinistryAnalyticsResponse)
def get_ministry_level_analytics(db: Session = Depends(get_db)):
    """
    Retrieve aggregated expenditure, delay days, and project counts broken down by Union Ministry.
    """
    ministry_data = analytics_engine.get_ministry_analytics(db)
    return MinistryAnalyticsResponse(ministries=ministry_data)

@router.get("/state", response_model=StateAnalyticsResponse)
def get_state_level_analytics(db: Session = Depends(get_db)):
    """
    Retrieve state-wise project density, capital allocation, and average delay statistics.
    """
    state_data = analytics_engine.get_state_analytics(db)
    return StateAnalyticsResponse(states=state_data)

@router.get("/sector", response_model=SectorAnalyticsResponse)
def get_sector_level_analytics(db: Session = Depends(get_db)):
    """
    Retrieve sector-wise performance benchmarks across Transport, Energy, Water, Urban, etc.
    """
    sector_data = analytics_engine.get_sector_analytics(db)
    return SectorAnalyticsResponse(sectors=sector_data)

@router.get("/risk", response_model=RiskAnalyticsResponse)
def get_risk_portfolio_analytics(db: Session = Depends(get_db)):
    """
    Retrieve portfolio risk band distributions and sector/ministry risk correlation profiles.
    """
    risk_data = analytics_engine.get_risk_analytics(db)
    return RiskAnalyticsResponse(
        risk_bands=risk_data["risk_bands"],
        average_risk_by_sector=risk_data["average_delay_by_sector"],
        average_risk_by_ministry={}
    )

@router.get("/executive")
def get_executive_command_analytics(db: Session = Depends(get_db)):
    """
    National Executive Command Center telemetry for MoSPI, PMO, and Cabinet Secretariat.
    Includes National Health Score, Top 10 Critical, Top 10 Improving, Rankings, Exposure & AI Directives.
    """
    return analytics_engine.get_executive_command_metrics(db)

