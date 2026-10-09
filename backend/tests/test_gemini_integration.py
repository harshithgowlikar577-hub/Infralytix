import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.gemini_service import gemini_service
from backend.app.core.config import settings

client = TestClient(app)

def test_gemini_service_availability_check():
    """Verify gemini_service.is_available() logic."""
    # When GEMINI_ENABLED is False or API key is placeholder
    original_enabled = settings.GEMINI_ENABLED
    original_key = settings.GEMINI_API_KEY
    try:
        settings.GEMINI_ENABLED = False
        assert gemini_service.is_available() is False

        settings.GEMINI_ENABLED = True
        settings.GEMINI_API_KEY = "your_gemini_api_key_here"
        assert gemini_service.is_available() is False

        settings.GEMINI_API_KEY = None
        assert gemini_service.is_available() is False
    finally:
        settings.GEMINI_ENABLED = original_enabled
        settings.GEMINI_API_KEY = original_key

def test_copilot_endpoint_fallback():
    """Verify /api/v1/copilot/query returns valid structured response (Gemini or deterministic fallback)."""
    response = client.post("/api/v1/copilot/query", json={
        "query": "What is the status of PRJ0001?",
        "project_id": "PRJ0001"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "intent" in data
    assert "citations" in data
    assert "suggested_actions" in data
    assert "engine_mode" in data

def test_simulation_explain_endpoint():
    """Verify /api/v1/simulation/explain endpoint returns structured 3-rating explanations."""
    response = client.post("/api/v1/simulation/explain", json={
        "project_id": "INF0001",
        "manpower_boost_pct": 20,
        "budget_increase_pct": 10,
        "procurement_delay_removed": True,
        "milestones_expedited_count": 2
    })
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == "INF0001"

    assert "summary" in data
    assert "ratings" in data
    assert len(data["ratings"]) >= 3

    rating_names = [r["name"] for r in data["ratings"]]
    assert "Health Rating" in rating_names
    assert "Schedule Delay Rating" in rating_names
    assert "Cost & Outlay Rating" in rating_names

    for r in data["ratings"]:
        assert "rating_value" in r
        assert "reason" in r
        assert "baseline_comparison" in r
        assert "recommended_action" in r

    assert "main_benefit" in data
    assert "main_tradeoff" in data
    assert "uncertainties" in data
    assert "next_steps" in data
    assert "engine_mode" in data
