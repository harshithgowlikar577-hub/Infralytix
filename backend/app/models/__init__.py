import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Date, Text,
    ForeignKey, JSON, Enum, Index
)
from sqlalchemy.orm import relationship
from backend.app.database.base import BaseModel, Base, TimestampMixin, SoftDeleteMixin

# =========================================================================
# 1. USER & ACCESS CONTROL MODELS
# =========================================================================

class Role(BaseModel):
    __tablename__ = "roles"
    
    name = Column(String(50), unique=True, nullable=False, index=True) # SuperAdmin, MinistryOfficer, ProjectManager, PublicViewer
    description = Column(String(255), nullable=True)
    permissions = Column(JSON, default=list)

    users = relationship("User", back_populates="role")

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=True)
    ministry = Column(String(255), nullable=True) # Ministry scope for MinistryOfficer
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime, nullable=True)

    role = relationship("Role", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

# =========================================================================
# 2. MASTER PROJECT & LOCATION MODELS
# =========================================================================

class Project(BaseModel):
    __tablename__ = "projects"
    
    project_id = Column(String(50), unique=True, nullable=False, index=True) # e.g. INF0001, PRJ0002
    project_name = Column(String(500), nullable=False, index=True)
    ministry = Column(String(255), nullable=False, index=True)
    sector = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=True)
    implementing_agency = Column(String(255), nullable=True)
    contractor = Column(String(255), nullable=True)
    
    # Financial snapshot
    original_cost = Column(Float, default=0.0, nullable=False)
    current_cost = Column(Float, default=0.0, nullable=False)
    expenditure = Column(Float, default=0.0, nullable=False)
    
    # Timeline snapshot
    start_date = Column(Date, nullable=False)
    target_date = Column(Date, nullable=False)
    actual_completion_date = Column(Date, nullable=True)
    delay_days = Column(Integer, default=0, nullable=False)
    
    # Progress and Status
    progress_percentage = Column(Float, default=0.0, nullable=False)
    financial_percentage = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="In Progress", nullable=False, index=True) # In Progress, Completed, Delayed, Stalled
    risk_level = Column(String(20), default="Low", nullable=False, index=True) # Low, Medium, High, Critical
    
    # Coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Dynamic metadata attributes
    extra_metadata = Column(JSON, default=dict)

    # Relationships
    locations = relationship("ProjectLocation", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")
    progress_records = relationship("ProjectProgress", back_populates="project", cascade="all, delete-orphan")
    costs = relationship("ProjectCost", back_populates="project", cascade="all, delete-orphan")
    risks = relationship("ProjectRisk", back_populates="project", cascade="all, delete-orphan")
    predictions = relationship("ProjectPrediction", back_populates="project", cascade="all, delete-orphan")
    health_scores = relationship("ProjectHealthScore", back_populates="project", cascade="all, delete-orphan")
    recommendations = relationship("ProjectRecommendation", back_populates="project", cascade="all, delete-orphan")
    similarities = relationship("ProjectSimilarity", foreign_keys="ProjectSimilarity.project_id", back_populates="project", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="project", cascade="all, delete-orphan")

class ProjectLocation(BaseModel):
    __tablename__ = "project_locations"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=True)
    sub_district = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geographical_zone = Column(String(100), nullable=True) # North, South, East, West, North-East, Central
    
    project = relationship("Project", back_populates="locations")

# =========================================================================
# 3. MILESTONES & PROGRESS TIME-SERIES MODELS
# =========================================================================

class ProjectMilestone(BaseModel):
    __tablename__ = "project_milestones"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    milestone_code = Column(String(50), nullable=True)
    milestone_name = Column(String(255), nullable=False)
    planned_date = Column(Date, nullable=False)
    actual_date = Column(Date, nullable=True)
    delay_days = Column(Integer, default=0, nullable=False)
    is_critical = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="On Time", nullable=False) # On Time, Delayed, Completed

    project = relationship("Project", back_populates="milestones")

class ProjectProgress(BaseModel):
    __tablename__ = "project_progress"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    observation_month = Column(String(7), nullable=False, index=True) # YYYY-MM
    planned_progress = Column(Float, default=0.0, nullable=False)
    actual_progress = Column(Float, default=0.0, nullable=False)
    financial_progress = Column(Float, default=0.0, nullable=False)
    monthly_expenditure = Column(Float, default=0.0, nullable=False)
    cumulative_expenditure = Column(Float, default=0.0, nullable=False)
    milestones_due = Column(Integer, default=0, nullable=False)
    milestones_completed = Column(Integer, default=0, nullable=False)
    milestones_delayed = Column(Integer, default=0, nullable=False)
    resource_utilization = Column(Float, default=100.0, nullable=False)
    execution_velocity = Column(Float, default=0.0, nullable=False)
    issue_category = Column(String(255), default="None / Routine Execution", nullable=False)

    project = relationship("Project", back_populates="progress_records")

class ProjectCost(BaseModel):
    __tablename__ = "project_costs"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    fiscal_year = Column(String(20), nullable=False) # e.g. 2024-25
    original_budget = Column(Float, default=0.0, nullable=False)
    revised_budget = Column(Float, default=0.0, nullable=False)
    expenditure_to_date = Column(Float, default=0.0, nullable=False)
    cost_overrun_amount = Column(Float, default=0.0, nullable=False)
    cost_overrun_pct = Column(Float, default=0.0, nullable=False)

    project = relationship("Project", back_populates="costs")

# =========================================================================
# 4. RISK, HEALTH & PREDICTION MODELS
# =========================================================================

class ProjectRisk(BaseModel):
    __tablename__ = "project_risks"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    risk_score = Column(Float, default=0.0, nullable=False, index=True) # 0 - 100
    risk_level = Column(String(20), default="Low", nullable=False, index=True) # Low, Medium, High, Critical
    delay_risk_subscore = Column(Float, default=0.0, nullable=False) # 40%
    cost_risk_subscore = Column(Float, default=0.0, nullable=False)  # 30%
    progress_risk_subscore = Column(Float, default=0.0, nullable=False) # 20%
    external_risk_subscore = Column(Float, default=0.0, nullable=False) # 10%
    risk_drivers = Column(JSON, default=list) # List of driver objects with SHAP attributions
    trajectory = Column(String(50), default="Stable", nullable=False) # Improving, Stable, Deteriorating, Rapidly Deteriorating

    project = relationship("Project", back_populates="risks")

class ProjectPrediction(BaseModel):
    __tablename__ = "project_predictions"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    model_type = Column(String(50), nullable=False) # COST_OVERRUN, DELAY_PREDICTION
    algorithm_used = Column(String(100), nullable=False) # XGBoost, Random Forest, Gradient Boosting
    predicted_final_cost = Column(Float, nullable=True)
    cost_overrun_percentage = Column(Float, nullable=True)
    predicted_delay_days = Column(Integer, nullable=True)
    completion_probability = Column(Float, nullable=True)
    confidence_score = Column(Float, default=0.85, nullable=False)
    feature_importance = Column(JSON, default=dict)

    project = relationship("Project", back_populates="predictions")

class ProjectHealthScore(BaseModel):
    __tablename__ = "project_health_scores"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    health_score = Column(Float, default=100.0, nullable=False, index=True) # 0 - 100
    health_status = Column(String(20), default="Healthy", nullable=False, index=True) # Healthy, Warning, Critical
    progress_score = Column(Float, default=0.0, nullable=False) # 35%
    budget_score = Column(Float, default=0.0, nullable=False)   # 25%
    milestone_score = Column(Float, default=0.0, nullable=False)# 20%
    delay_score = Column(Float, default=0.0, nullable=False)    # 20%
    breakdown_notes = Column(Text, nullable=True)

    project = relationship("Project", back_populates="health_scores")

# =========================================================================
# 5. SIMILARITY, INTERVENTION & DECISION SUPPORT MODELS
# =========================================================================

class ProjectSimilarity(BaseModel):
    __tablename__ = "project_similarities"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    similar_project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    similarity_score = Column(Float, default=0.0, nullable=False) # 0 - 1.0 (Cosine / KNN)
    failure_dna_match_pct = Column(Float, default=0.0, nullable=False)
    matched_features = Column(JSON, default=dict)
    historical_outcomes = Column(JSON, default=list)

    project = relationship("Project", foreign_keys=[project_id], back_populates="similarities")
    similar_project = relationship("Project", foreign_keys=[similar_project_id])

class ProjectRecommendation(BaseModel):
    __tablename__ = "project_recommendations"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    priority = Column(String(20), default="Medium", nullable=False) # Critical, High, Medium, Low
    recommendation_title = Column(String(255), nullable=False)
    action_directive = Column(Text, nullable=False)
    expected_delay_reduction_days = Column(Integer, default=0)
    expected_cost_avoidance = Column(Float, default=0.0)
    target_authority = Column(String(255), nullable=True)
    status = Column(String(50), default="Pending", nullable=False) # Pending, In Progress, Completed, Dismissed

    project = relationship("Project", back_populates="recommendations")

class Intervention(BaseModel):
    __tablename__ = "interventions"
    
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    intervention_type = Column(String(100), nullable=False) # Workforce, Budget Reallocation, Site Inspection, Fast-Track Procurement
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Proposed", nullable=False) # Proposed, Approved, Executed, Cancelled
    expected_impact = Column(JSON, default=dict)
    applied_parameters = Column(JSON, default=dict)
    executed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    executed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="interventions")

# =========================================================================
# 6. DATASETS, NOTIFICATIONS & AUDIT LOG MODELS
# =========================================================================

class Dataset(BaseModel):
    __tablename__ = "datasets"
    
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    total_records = Column(Integer, default=0)
    valid_records = Column(Integer, default=0)
    error_records = Column(Integer, default=0)
    completeness_score = Column(Float, default=100.0)
    quality_score = Column(Float, default=100.0)
    ml_readiness_score = Column(Float, default=100.0)
    ingestion_status = Column(String(50), default="Uploaded", nullable=False) # Uploaded, Validating, Cleaned, Ingested, Failed
    schema_mapping = Column(JSON, default=dict)
    validation_report = Column(JSON, default=dict)

class Notification(BaseModel):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("idx_notifications_user_del_created", "user_id", "is_deleted", "created_at"),
    )
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    warning_level = Column(String(20), default="Info", nullable=False) # Critical, Warning, Info
    is_read = Column(Boolean, default=False, nullable=False)
    action_url = Column(String(255), nullable=True)

    user = relationship("User", back_populates="notifications")

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True) # INGESTION, PREDICTION_RUN, INTERVENTION_CREATE, LOGIN
    entity_name = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    payload = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)

    user = relationship("User", back_populates="audit_logs")
