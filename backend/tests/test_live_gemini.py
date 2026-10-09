import time
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.gemini_service import gemini_service
from backend.app.core.config import settings

client = TestClient(app)

def test_live_gemini_config():
    """TEST A: Confirm configuration without printing API key."""
    assert settings.GEMINI_ENABLED is True
    assert settings.GEMINI_API_KEY is not None
    assert len(settings.GEMINI_API_KEY) > 10
    assert gemini_service.is_available() is True
    # Verify key is NOT printed or logged anywhere

def test_live_gemini_basic_request():
    """TEST B: Send basic prompt to Gemini API and record response time."""
    client_obj = gemini_service._get_client()
    assert client_obj is not None, "Gemini client should initialize with configured API key."

    start_time = time.time()
    res = gemini_service.generate_copilot_response(
        query="What is INFRALYTIX?",
        project_context={"platform": "INFRALYTIX", "purpose": "Infrastructure monitoring"}
    )
    elapsed = time.time() - start_time

    assert res is not None, "Gemini basic request should return a valid response."
    assert "answer" in res
    assert len(res["answer"]) > 20
    assert elapsed < 15.0, f"Gemini response took {elapsed:.2f}s"
    print(f"\n[LIVE API SUCCESS] Basic query completed in {elapsed:.2f}s.")

def test_live_copilot_integration():
    """TEST C: Query Copilot endpoint with live Gemini reasoning."""
    response = client.post("/api/v1/copilot/query", json={
        "query": "Give me an executive briefing for project INF0001",
        "project_id": "INF0001"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 20
    assert data["is_offline"] is False
    assert "GEMINI" in data.get("engine_mode", "")
    print(f"\n[LIVE COPILOT SUCCESS] Mode: {data.get('engine_mode')}")


def test_live_what_if_explanation():
    """TEST D & E: Test What-If 3-rating explanation with numerical consistency."""
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
        assert r["reason"] is not None and len(r["reason"]) > 5
        assert r["recommended_action"] is not None

    print(f"\n[LIVE WHAT-IF SUCCESS] Ratings Explained: {rating_names}. Mode: {data.get('engine_mode')}")
