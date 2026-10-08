from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# =========================================================================
# 1. AUTH & USER SCHEMAS
# =========================================================================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    ministry: Optional[str] = None
    role: str = "ProjectManager" # SuperAdmin, MinistryOfficer, ProjectManager, PublicViewer

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

# =========================================================================
# 2. PROJECT SCHEMAS
# =========================================================================

class ProjectBase(BaseModel):
    project_id: str
    project_name: str
    ministry: str
    sector: str
    state: str
    district: Optional[str] = None
    implementing_agency: Optional[str] = None
    contractor: Optional[str] = None
    original_cost: float = Field(default=0.0, ge=0)
    current_cost: float = Field(default=0.0, ge=0)
    expenditure: float = Field(default=0.0, ge=0)
    start_date: date
    target_date: date
    actual_completion_date: Optional[date] = None
    delay_days: int = 0
    progress_percentage: float = Field(default=0.0, ge=0, le=100)
    financial_percentage: float = Field(default=0.0, ge=0, le=100)
    status: str = "In Progress"
    risk_level: str = "Low"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    extra_metadata: Optional[Dict[str, Any]] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    current_cost: Optional[float] = None
    expenditure: Optional[float] = None
    target_date: Optional[date] = None
    actual_completion_date: Optional[date] = None
    delay_days: Optional[int] = None
    progress_percentage: Optional[float] = None
    financial_percentage: Optional[float] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None

class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime

class ProjectListResponse(BaseModel):
    total_count: int
    page: int
    limit: int
    projects: List[ProjectOut]

# =========================================================================
# 3. INGESTION & DATASET SCHEMAS
# =========================================================================

class IngestionUploadResponse(BaseModel):
    dataset_id: str
    file_name: str
    total_records: int
    valid_records: int
    error_records: int
    completeness_score: float
    quality_score: float
    ml_readiness_score: float
    status: str
    message: str

class ValidationReportResponse(BaseModel):
    dataset_id: str
    is_valid: bool
    completeness_score: float
    quality_score: float
    null_values_count: int
    duplicate_rows_count: int
    type_errors_count: int
    integrity_errors_count: int
    consistency_errors_count: int
    corrections_applied: List[Dict[str, Any]]
    validation_status: str

class CleaningResponse(BaseModel):
    dataset_id: str
    status: str
    records_cleaned: int
    quality_score_after_cleaning: float
    message: str

# =========================================================================
# 4. HEALTH ENGINE SCHEMAS
# =========================================================================

class HealthScoreResponse(BaseModel):
    project_id: str
    health_score: float = Field(..., ge=0, le=100) # 0 - 100
    health_status: str # Healthy | Warning | Critical
    formula_breakdown: Dict[str, float] = {
        "progress_component_35pct": 0.0,
        "budget_component_25pct": 0.0,
        "milestone_component_20pct": 0.0,
        "delay_component_20pct": 0.0
    }
    insights: List[str]

# =========================================================================
# 5. ML PREDICTION SCHEMAS (COST & DELAY)
# =========================================================================

class CostPredictionRequest(BaseModel):
    project_id: Optional[str] = None
    original_cost: float
    current_cost: float
    expenditure: float
    progress_percentage: float
    delay_days: int
    sector: Optional[str] = "Transport & Logistics"

class CostPredictionResponse(BaseModel):
    project_id: Optional[str] = None
    predicted_final_cost: float
    cost_overrun_percentage: float
    expected_escalation_cr: float
    confidence_score: float
    best_algorithm_used: str
    feature_importance: Dict[str, float]

class DelayPredictionRequest(BaseModel):
    project_id: Optional[str] = None
    progress_percentage: float
    milestones_delayed: int = 0
    milestones_due: int = 5
    cost_utilization_pct: float
    delay_days: int = 0
    sector: Optional[str] = "Transport & Logistics"
    state: Optional[str] = "Uttar Pradesh"

class DelayPredictionResponse(BaseModel):
    project_id: Optional[str] = None
    predicted_delay_days: int
    predicted_delay_months: float
    completion_probability: float
    forecasted_completion_date: Optional[str] = None
    confidence_score: float
    best_algorithm_used: str
    top_delay_drivers: List[Dict[str, Any]]

class ModelTrainResponse(BaseModel):
    model_type: str
    status: str
    best_algorithm: str
    models_evaluated: Dict[str, Dict[str, float]] # e.g. XGBoost, RandomForest, GradientBoosting
    samples_trained_on: int
    training_timestamp: datetime

# =========================================================================
# 6. RISK INTELLIGENCE SCHEMAS
# =========================================================================

class RiskDriver(BaseModel):
    driver_name: str
    impact_score: float
    contribution_direction: str # Increases Risk | Decreases Risk
    human_explanation: str

class RiskResponse(BaseModel):
    project_id: str
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: str # Low (0-25) | Medium (26-50) | High (51-75) | Critical (76-100)
    delay_risk_subscore: float # 40%
    cost_risk_subscore: float   # 30%
    progress_risk_subscore: float # 20%
    external_risk_subscore: float # 10%
    risk_drivers: List[RiskDriver]
    trajectory: str # Improving | Stable | Deteriorating | Rapidly Deteriorating

# =========================================================================
# 7. FAILURE DNA & SIMILARITY SCHEMAS
# =========================================================================

class SimilarProjectItem(BaseModel):
    project_id: str
    project_name: str
    sector: str
    state: str
    similarity_score: float
    failure_dna_match_pct: float
    historical_observed_delay_days: int
    historical_cost_overrun_pct: float
    key_bottleneck: str

class SimilarityResponse(BaseModel):
    project_id: str
    similarity_score: float
    cluster_archetype: str
    failure_dna_signature: Dict[str, float]
    similar_projects: List[SimilarProjectItem]
    historical_outcomes: List[Dict[str, Any]]

# =========================================================================
# 8. INTERVENTION & RECOMMENDATION SCHEMAS
# =========================================================================

class RecommendationItem(BaseModel):
    id: Optional[str] = None
    priority: str # Critical | High | Medium | Low
    title: str
    action_directive: str
    expected_delay_reduction_days: int
    expected_cost_avoidance_cr: float
    target_authority: str

class InterventionResponse(BaseModel):
    project_id: str
    priority: str # Critical | High | Medium | Low
    recommendations: List[RecommendationItem]
    expected_impact: Dict[str, Any]

class InterventionCreate(BaseModel):
    project_id: str
    intervention_type: str # Workforce | Budget Reallocation | Site Inspection | Fast-Track Procurement
    description: str
    applied_parameters: Optional[Dict[str, Any]] = None

# =========================================================================
# 9. EARLY WARNING SCHEMAS
# =========================================================================

class EarlyWarningItem(BaseModel):
    warning_id: str
    project_id: str
    project_name: str
    warning_level: str # Critical | High | Warning | Info
    trigger_type: str # EMERGING_DELAY | COST_ESCALATION | HEALTH_DETERIORATION | RISK_SPIKE
    alert_reason: str
    evidence: Dict[str, Any]
    recommended_action: str
    detected_at: datetime

class EarlyWarningResponse(BaseModel):
    project_id: str
    warning_level: str
    alert_reason: str
    recommended_action: str
    active_warnings: List[EarlyWarningItem]

class PredictiveWarningItem(BaseModel):
    warning_id: str
    project_id: str
    project_name: str
    ministry: str
    sector: str
    state: str
    implementing_agency: Optional[str] = None
    current_cost_cr: float
    original_cost_cr: float
    cost_overrun_pct: float
    delay_days: int
    delay_months: float
    risk_level: str
    risk_score: float
    delay_probability: float
    cost_escalation_probability: float
    trigger_type: str
    primary_cause: str
    forecast_impact: str
    urgency: str
    owner: str
    expected_recovery: str
    recommended_action: str
    queue: str  # escalation | critical | high_risk | watch_list
    detected_at: datetime

class PredictiveEarlyWarningPortfolioResponse(BaseModel):
    total_alerts: int
    escalation_count: int
    critical_count: int
    high_risk_count: int
    watch_list_count: int
    total_capex_at_risk_cr: float
    average_delay_probability: float
    average_cost_escalation_probability: float
    alerts_by_trigger_type: Dict[str, int]
    alerts_by_sector: Dict[str, int]
    alerts_by_urgency: Dict[str, int]
    escalation_queue: List[PredictiveWarningItem]
    critical_queue: List[PredictiveWarningItem]
    high_risk_queue: List[PredictiveWarningItem]
    watch_list: List[PredictiveWarningItem]


# =========================================================================
# 10. WHAT-IF SIMULATION SCHEMAS
# =========================================================================

class SimulationRequest(BaseModel):
    project_id: str
    manpower_boost_pct: float = Field(default=0.0, ge=-50.0, le=200.0) # e.g. +20%
    budget_increase_pct: float = Field(default=0.0, ge=-50.0, le=200.0) # e.g. +15%
    procurement_delay_removed: bool = False
    milestones_expedited_count: int = Field(default=0, ge=0)
    efficiency_gain_pct: float = Field(default=0.0, ge=-50.0, le=100.0)

class SimulationResponse(BaseModel):
    project_id: str
    baseline: Dict[str, Any]
    simulated: Dict[str, Any]
    net_improvement: Dict[str, Any]
    disclaimer: str = "Scenario estimate based on transfer function model — not a guaranteed outcome."

# =========================================================================
# 11. ANALYTICS & DASHBOARD SCHEMAS
# =========================================================================

class DashboardAnalyticsResponse(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    delayed_projects_count: Optional[int] = 0
    critical_projects_count: int
    high_risk_projects_count: int
    total_original_cost_cr: float
    total_current_cost_cr: float
    total_expenditure_cr: float
    predicted_cost_exposure_cr: float
    average_delay_days: float
    risk_distribution: Dict[str, int]
    top_deteriorating_projects: List[Dict[str, Any]]

class MinistryAnalyticsResponse(BaseModel):
    ministries: List[Dict[str, Any]]

class StateAnalyticsResponse(BaseModel):
    states: List[Dict[str, Any]]

class SectorAnalyticsResponse(BaseModel):
    sectors: List[Dict[str, Any]]

class RiskAnalyticsResponse(BaseModel):
    risk_bands: List[Dict[str, Any]]
    average_risk_by_sector: Dict[str, float]
    average_risk_by_ministry: Dict[str, float]

# =========================================================================
# 12. COPILOT SCHEMAS
# =========================================================================

class CopilotRequest(BaseModel):
    query: str
    project_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

class CopilotResponse(BaseModel):
    answer: str
    intent: str
    citations: List[Dict[str, Any]] = []
    suggested_actions: List[Dict[str, str]] = []
    is_offline: bool = True
    engine_mode: str = "LOCAL_RAG_DETERMINISTIC"

