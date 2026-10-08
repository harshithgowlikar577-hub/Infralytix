import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_executive_analytics_endpoint():
    """Verify Phase 3 Executive Command Center endpoint returns national health score and rankings."""
    resp = client.get("/api/v1/analytics/executive")
    assert resp.status_code == 200
    data = resp.json()
    assert "national_health_score" in data
    assert 0 <= data["national_health_score"] <= 100
    assert "national_health_status" in data
    assert "top_10_critical_projects" in data
    assert len(data["top_10_critical_projects"]) <= 10
    assert "top_10_improving_projects" in data
    assert "ministry_rankings" in data
    assert "sector_rankings" in data
    assert "ai_recommendations" in data
    assert len(data["ai_recommendations"]) >= 1
    assert "health_breakdown" in data
    assert "budget_exposure" in data
    assert "quarterly_forecast" in data

def test_portfolio_predictive_early_warnings():
    """Verify Phase 6 Predictive Early Warning Center returns 4 priority queues and analytics."""
    resp = client.get("/api/v1/warning/portfolio/predictive?limit_per_queue=10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_alerts"] > 0
    assert "escalation_queue" in data
    assert "critical_queue" in data
    assert "high_risk_queue" in data
    assert "watch_list" in data
    assert data["total_capex_at_risk_cr"] > 0
    assert 0 <= data["average_delay_probability"] <= 100
    assert 0 <= data["average_cost_escalation_probability"] <= 100

    # Verify attributes of first item in escalation queue
    if data["escalation_queue"]:
        item = data["escalation_queue"][0]
        assert "warning_id" in item
        assert "project_id" in item
        assert "delay_probability" in item
        assert "cost_escalation_probability" in item
        assert "primary_cause" in item
        assert "forecast_impact" in item
        assert "urgency" in item
        assert "owner" in item
        assert "expected_recovery" in item
        assert "recommended_action" in item

def test_copilot_state_analysis():
    """Verify Copilot correctly handles state analysis intent."""
    resp = client.post("/api/v1/copilot/query", json={"query": "Why is Rajasthan risk increasing?"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "STATE_ANALYSIS"
    assert len(data["citations"]) > 0
    assert data["is_offline"] is True
    assert data["engine_mode"] == "LOCAL_RAG_DETERMINISTIC"

def test_copilot_project_comparison():
    """Verify Copilot handles project comparison intent."""
    resp = client.post("/api/v1/copilot/query", json={"query": "Compare PRJ0671 and PRJ0573"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "PROJECT_COMPARISON"
    assert len(data["citations"]) == 2

def test_copilot_project_summary():
    """Verify Copilot handles single project summary intent."""
    resp = client.post("/api/v1/copilot/query", json={"query": "Summarize PRJ0671"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "PROJECT_SUMMARY"
    assert len(data["citations"]) >= 1

def test_copilot_top_critical():
    """Verify Copilot returns top critical projects."""
    resp = client.post("/api/v1/copilot/query", json={"query": "Show top 10 projects needing intervention"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "TOP_CRITICAL"
    assert len(data["citations"]) > 0

def test_copilot_2030_targets():
    """Verify Copilot handles 2030 strategic targets intent."""
    resp = client.post("/api/v1/copilot/query", json={"query": "What projects threaten 2030 targets?"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "2030_TARGETS"
    assert len(data["citations"]) > 0

def test_copilot_portfolio_overview():
    """Verify Copilot handles general overview fallback."""
    resp = client.post("/api/v1/copilot/query", json={"query": "What is the overall infrastructure health?"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "PORTFOLIO_OVERVIEW"
    assert data["is_offline"] is True

def test_ml_delay_prediction():
    """Verify live ML delay model returns predictions."""
    resp = client.post("/api/v1/ml/delay/predict", json={
        "progress_percentage": 45.0,
        "cost_utilization_pct": 55.0,
        "delay_days": 120,
        "milestones_delayed": 3,
        "milestones_due": 8,
    })
    assert resp.status_code == 200
    d = resp.json()
    assert "predicted_delay_days" in d
    assert "confidence_score" in d
    assert "algorithm" in d or "predicted_delay_months" in d

def test_ml_cost_prediction():
    """Verify live ML cost model returns predictions."""
    resp = client.post("/api/v1/ml/cost/predict", json={
        "original_cost": 1000.0,
        "current_cost": 1150.0,
        "expenditure": 600.0,
        "progress_percentage": 50.0,
        "delay_days": 90
    })
    assert resp.status_code == 200
    c = resp.json()
    assert "predicted_final_cost" in c
    assert "cost_overrun_percentage" in c
    assert "confidence_score" in c
