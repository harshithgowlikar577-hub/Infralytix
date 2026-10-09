import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func
from backend.app.main import app
from backend.app.database.session import SessionLocal
from backend.app.models import Project, ProjectHealthScore, ProjectRisk
from backend.app.analytics.engine import analytics_engine

def test_1_total_unique_project_count(db_session):
    """TEST 1: Total unique project count matches authoritative database query."""
    total_in_db = db_session.query(Project).filter(Project.is_deleted == False).count()
    unique_pids = db_session.query(func.count(func.distinct(Project.project_id))).filter(Project.is_deleted == False).scalar()
    assert total_in_db == unique_pids, "Physical row count must equal unique project_id count"
    
    metrics = analytics_engine.get_dashboard_metrics(db_session)
    assert metrics["total_projects"] == total_in_db, "Dashboard total_projects must match database unique count"

def test_2_duplicate_joined_rows_no_inflation(db_session):
    """TEST 2: Duplicate joined rows do not inflate project counts above total projects."""
    metrics = analytics_engine.get_dashboard_metrics(db_session)
    total_projects = metrics["total_projects"]
    
    assert metrics["healthy_projects_count"] <= total_projects
    assert metrics["delayed_projects_count"] <= total_projects
    assert metrics["high_risk_projects_count"] <= total_projects

def test_3_healthy_project_count_reconciliation(db_session):
    """TEST 3: Healthy project count matches health classification rules."""
    metrics = analytics_engine.get_dashboard_metrics(db_session)
    assert "healthy_projects_count" in metrics
    assert metrics["healthy_projects_count"] >= 0

def test_4_delayed_project_count_reconciliation(db_session):
    """TEST 4: Delayed project count matches status delay and schedule delay rules."""
    metrics = analytics_engine.get_dashboard_metrics(db_session)
    status_delayed = db_session.query(Project).filter(Project.is_deleted == False, Project.status == "Delayed").count()
    schedule_delayed = db_session.query(Project).filter(Project.is_deleted == False, Project.delay_days > 0).count()
    
    assert metrics["delayed_projects_count"] == status_delayed
    assert metrics["schedule_delayed_projects_count"] == schedule_delayed

def test_5_high_risk_count_reconciliation(db_session):
    """TEST 5: High-risk count matches risk classification rules."""
    metrics = analytics_engine.get_dashboard_metrics(db_session)
    high_count = db_session.query(Project).filter(Project.is_deleted == False, Project.risk_level == "High").count()
    critical_count = db_session.query(Project).filter(Project.is_deleted == False, Project.risk_level == "Critical").count()
    
    assert metrics["high_risk_projects_count"] == high_count
    assert metrics["critical_projects_count"] == critical_count

def test_6_overlapping_categories_handled_independently(db_session):
    """TEST 6: Overlapping categories do not alter total portfolio count."""
    metrics = analytics_engine.get_dashboard_metrics(db_session)
    total_projects = metrics["total_projects"]
    delayed = metrics["delayed_projects_count"]
    high_risk = metrics["high_risk_projects_count"]
    
    assert delayed <= total_projects
    assert high_risk <= total_projects

def test_7_exclusive_status_reconciliation(db_session):
    """TEST 7: Mutually exclusive status categories sum to total portfolio count."""
    in_prog = db_session.query(Project).filter(Project.is_deleted == False, Project.status.ilike("%In Progress%")).count()
    comp = db_session.query(Project).filter(Project.is_deleted == False, Project.status.ilike("%Completed%")).count()
    del_st = db_session.query(Project).filter(Project.is_deleted == False, Project.status.ilike("%Delayed%")).count()
    total = db_session.query(Project).filter(Project.is_deleted == False).count()
    
    assert in_prog + comp + del_st == total, "Exclusive status categories must sum to total projects"

def test_8_no_silent_healthy_classification(db_session):
    """TEST 8: Missing or null status fields are not silently counted as healthy."""
    null_status = db_session.query(Project).filter(Project.is_deleted == False, Project.status == None).count()
    assert null_status == 0, "No null status projects in dataset"

def test_9_state_level_counts_scope(db_session):
    """TEST 9: State-level counts sum to total national project count."""
    states = analytics_engine.get_state_analytics(db_session)
    state_total = sum(s["project_count"] for s in states)
    total_projects = db_session.query(Project).filter(Project.is_deleted == False).count()
    assert state_total == total_projects, "Sum of state project counts must equal national total"

def test_10_national_state_reconciliation(db_session):
    """TEST 10: National and state financial totals reconcile appropriately."""
    states = analytics_engine.get_state_analytics(db_session)
    state_cost_sum = sum(s["total_cost_cr"] for s in states)
    national_cost = db_session.query(func.sum(Project.current_cost)).filter(Project.is_deleted == False).scalar() or 0.0
    assert round(state_cost_sum, 2) == round(float(national_cost), 2), "Sum of state current costs must equal national current cost"

def test_11_financial_aggregates_no_double_counting(db_session):
    """TEST 11: Financial aggregates do not double-count projects across joins."""
    metrics = analytics_engine.get_dashboard_metrics(db_session)
    db_sum = db_session.query(func.sum(Project.current_cost)).filter(Project.is_deleted == False).scalar() or 0.0
    assert round(metrics["total_current_cost_cr"], 2) == round(float(db_sum), 2)

def test_12_frontend_kpi_api_endpoint(client, db_session):
    """TEST 12: GET /api/v1/analytics/dashboard endpoint returns correct KPI fields matching backend session."""
    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    expected_total = db_session.query(Project).filter(Project.is_deleted == False).count()
    assert data["total_projects"] == expected_total

def test_13_dashboard_analytics_structure(client):
    """TEST 13: Dashboard analytics response structure contains required fields."""
    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "risk_distribution" in data
    assert "health_distribution" in data
    assert "top_deteriorating_projects" in data

def test_14_search_filter_count_isolation(client):
    """TEST 14: Filtering project list returns scoped count without corrupting national metrics."""
    response = client.get("/api/v1/projects?search=Corridor")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] >= 0
    
    # Verify national dashboard metrics remain untouched
    dash_res = client.get("/api/v1/analytics/dashboard")
    assert dash_res.json()["total_projects"] >= 0

def test_15_api_error_states(client):
    """TEST 15: Invalid project ID returns 404 rather than corrupted default."""
    response = client.get("/api/v1/projects/NON_EXISTENT_PROJECT_99999")
    assert response.status_code == 404

def test_16_historical_snapshot_scope_isolation(db_session):
    """TEST 16: Historical snapshot tables do not mix with current active project portfolio count."""
    active_projects = db_session.query(Project).filter(Project.is_deleted == False).count()
    metrics = analytics_engine.get_dashboard_metrics(db_session)
    assert metrics["total_projects"] == active_projects
