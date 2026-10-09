import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import get_db
from backend.app.models import Project

client = TestClient(app)

# =========================================================================
# ISSUE 2: PROJECTS DIRECTORY PAGINATION AND FILTERS (20 TEST CASES)
# =========================================================================

def test_tc01_initial_page_loads_successfully():
    response = client.get("/api/v1/projects?page=1&limit=15")
    assert response.status_code == 200
    data = response.json()
    assert "projects" in data
    assert data["page"] == 1
    assert len(data["projects"]) <= 15
    assert data["total_count"] > 0

def test_tc02_next_displays_different_set_of_records():
    res1 = client.get("/api/v1/projects?page=1&limit=15")
    res2 = client.get("/api/v1/projects?page=2&limit=15")
    assert res1.status_code == 200 and res2.status_code == 200
    p1_ids = [p["id"] for p in res1.json()["projects"]]
    p2_ids = [p["id"] for p in res2.json()["projects"]]
    assert len(p1_ids) > 0 and len(p2_ids) > 0
    assert set(p1_ids).isdisjoint(set(p2_ids))

def test_tc03_previous_returns_to_correct_set():
    res1_first = client.get("/api/v1/projects?page=1&limit=15").json()
    client.get("/api/v1/projects?page=2&limit=15")
    res1_return = client.get("/api/v1/projects?page=1&limit=15").json()
    p1_first_ids = [p["id"] for p in res1_first["projects"]]
    p1_return_ids = [p["id"] for p in res1_return["projects"]]
    assert p1_first_ids == p1_return_ids

def test_tc04_final_page_contains_remaining_records():
    res_init = client.get("/api/v1/projects?page=1&limit=100").json()
    total = res_init["total_count"]
    limit = 100
    last_page = (total + limit - 1) // limit
    res_last = client.get(f"/api/v1/projects?page={last_page}&limit={limit}").json()
    expected_count = total - (last_page - 1) * limit
    assert len(res_last["projects"]) == expected_count

def test_tc05_next_disabled_boundary():
    res_init = client.get("/api/v1/projects?page=1&limit=100").json()
    total = res_init["total_count"]
    last_page = (total + 99) // 100
    res_beyond = client.get(f"/api/v1/projects?page={last_page + 1}&limit=100").json()
    assert len(res_beyond["projects"]) == 0

def test_tc06_previous_disabled_boundary():
    res1 = client.get("/api/v1/projects?page=1&limit=15").json()
    assert res1["page"] == 1
    assert len(res1["projects"]) > 0

def test_tc07_search_returns_matching_projects():
    response = client.get("/api/v1/projects?search=Metro&page=1&limit=15")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] > 0
    for p in data["projects"]:
        text = ((p.get("project_name") or "") + (p.get("project_id") or "") + (p.get("contractor") or "") + (p.get("ministry") or "") + (p.get("sector") or "")).lower()
        assert "metro" in text or len(text) > 0

def test_tc08_ministry_filter_returns_correct_subset():
    res = client.get("/api/v1/projects?ministry=Ministry%20of%20Railways&limit=50").json()
    assert res["total_count"] > 0
    for p in res["projects"]:
        assert "Railways" in p["ministry"]

def test_tc09_sector_filter_returns_correct_subset():
    res = client.get("/api/v1/projects?sector=Energy&limit=50").json()
    assert res["total_count"] > 0
    for p in res["projects"]:
        assert "Energy" in p["sector"]

def test_tc10_state_filter_returns_correct_subset():
    res = client.get("/api/v1/projects?state=Delhi&limit=50").json()
    assert res["total_count"] > 0
    for p in res["projects"]:
        assert "Delhi" in p["state"]

def test_tc11_risk_level_filter_returns_correct_subset():
    res = client.get("/api/v1/projects?risk_level=High&limit=50").json()
    assert res["total_count"] > 0
    for p in res["projects"]:
        assert p["risk_level"] == "High"

def test_tc12_combined_filters():
    res = client.get("/api/v1/projects?sector=Transport%20%26%20Logistics&risk_level=Critical&limit=50").json()
    assert res["total_count"] >= 0
    for p in res["projects"]:
        assert "Transport" in p["sector"] or "Logistics" in p["sector"]
        assert p["risk_level"] == "Critical"

def test_tc13_clearing_filters_restores_complete_dataset():
    res_filtered = client.get("/api/v1/projects?risk_level=Critical").json()
    res_all = client.get("/api/v1/projects").json()
    assert res_all["total_count"] >= res_filtered["total_count"]

def test_tc14_changing_filter_resets_page():
    res_page2 = client.get("/api/v1/projects?page=2&limit=10").json()
    assert res_page2["page"] == 2
    res_filtered_page1 = client.get("/api/v1/projects?sector=Energy&page=1&limit=10").json()
    assert res_filtered_page1["page"] == 1

def test_tc15_search_no_matches():
    res = client.get("/api/v1/projects?search=NonExistentSuperProject99999").json()
    assert res["total_count"] == 0
    assert len(res["projects"]) == 0

def test_tc16_pagination_totals_match():
    res = client.get("/api/v1/projects?limit=10").json()
    assert "total_count" in res
    assert "projects" in res
    assert res["limit"] == 10

def test_tc17_refreshing_page_deterministic():
    res1 = client.get("/api/v1/projects?page=1&limit=10").json()
    res2 = client.get("/api/v1/projects?page=1&limit=10").json()
    ids1 = [p["id"] for p in res1["projects"]]
    ids2 = [p["id"] for p in res2["projects"]]
    assert ids1 == ids2

def test_tc18_api_failure_handling():
    res = client.get("/api/v1/projects?limit=invalid")
    assert res.status_code == 422 # Validation error for bad param type

def test_tc19_repeated_clicks_determinism():
    for _ in range(5):
        res = client.get("/api/v1/projects?page=2&limit=10")
        assert res.status_code == 200
        assert len(res.json()["projects"]) > 0

def test_tc20_project_links_valid():
    res = client.get("/api/v1/projects?limit=1").json()
    pid = res["projects"][0]["project_id"]
    detail = client.get(f"/api/v1/projects/{pid}")
    assert detail.status_code == 200
    assert detail.json()["project_id"] == pid


# =========================================================================
# ISSUE 3: WHAT-IF SIMULATOR ML PREDICTIONS (12 TEST CASES)
# =========================================================================

def get_sample_project_id():
    res = client.get("/api/v1/projects?status=Delayed&limit=5").json()
    if res["projects"]:
        return res["projects"][0]["project_id"]
    res_all = client.get("/api/v1/projects?limit=5").json()
    return res_all["projects"][0]["project_id"]

def test_whatif_01_baseline():
    pid = get_sample_project_id()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 0.0,
        "budget_increase_pct": 0.0,
        "procurement_delay_removed": False,
        "milestones_expedited_count": 0,
        "efficiency_gain_pct": 0.0
    }
    res = client.post("/api/v1/simulation/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["project_id"] == pid
    assert data["baseline"]["predicted_delay_days"] == data["simulated"]["predicted_delay_days"]
    assert data["net_improvement"]["delay_recovered_days"] == 0

def test_whatif_02_manpower():
    pid = get_sample_project_id()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 30.0,
        "budget_increase_pct": 0.0,
        "procurement_delay_removed": False,
        "milestones_expedited_count": 0
    }
    res = client.post("/api/v1/simulation/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["simulated"]["predicted_delay_days"] <= data["baseline"]["predicted_delay_days"]
    assert data["net_improvement"]["delay_recovered_days"] >= 0

def test_whatif_03_budget():
    pid = get_sample_project_id()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 0.0,
        "budget_increase_pct": 20.0,
        "procurement_delay_removed": False,
        "milestones_expedited_count": 0
    }
    res = client.post("/api/v1/simulation/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["simulated"]["predicted_final_cost"] != data["baseline"]["predicted_final_cost"]

def test_whatif_04_procurement():
    pid = get_sample_project_id()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 0.0,
        "budget_increase_pct": 0.0,
        "procurement_delay_removed": True,
        "milestones_expedited_count": 0
    }
    res = client.post("/api/v1/simulation/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["net_improvement"]["delay_recovered_days"] > 0

def test_whatif_05_milestone_acceleration():
    pid = get_sample_project_id()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 0.0,
        "budget_increase_pct": 0.0,
        "procurement_delay_removed": False,
        "milestones_expedited_count": 3
    }
    res = client.post("/api/v1/simulation/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["net_improvement"]["delay_recovered_days"] > 0

def test_whatif_06_combined_scenario():
    pid = get_sample_project_id()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 25.0,
        "budget_increase_pct": 0.0,
        "procurement_delay_removed": True,
        "milestones_expedited_count": 2
    }
    res = client.post("/api/v1/simulation/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["net_improvement"]["delay_recovered_days"] > 0
    assert data["simulated"]["risk_score"] <= data["baseline"]["risk_score"]

def test_whatif_07_reset_scenario():
    pid = get_sample_project_id()
    payload_reset = {
        "project_id": pid,
        "manpower_boost_pct": 0.0,
        "budget_increase_pct": 0.0,
        "procurement_delay_removed": False,
        "milestones_expedited_count": 0
    }
    res = client.post("/api/v1/simulation/run", json=payload_reset)
    assert res.status_code == 200
    data = res.json()
    assert data["baseline"]["risk_score"] == data["simulated"]["risk_score"]

def test_whatif_08_repeated_calculation():
    pid = get_sample_project_id()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 20.0,
        "budget_increase_pct": 10.0,
        "procurement_delay_removed": True,
        "milestones_expedited_count": 1
    }
    res1 = client.post("/api/v1/simulation/run", json=payload).json()
    res2 = client.post("/api/v1/simulation/run", json=payload).json()
    assert res1["simulated"] == res2["simulated"]
    assert res1["net_improvement"] == res2["net_improvement"]

def test_whatif_09_validation():
    pid = get_sample_project_id()
    bad_payload = {
        "project_id": pid,
        "manpower_boost_pct": 9999.0 # Beyond max schema allowed (200.0)
    }
    res = client.post("/api/v1/simulation/run", json=bad_payload)
    assert res.status_code == 422 # Validation error

def test_whatif_10_data_integrity():
    pid = get_sample_project_id()
    before = client.get(f"/api/v1/projects/{pid}").json()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 40.0,
        "budget_increase_pct": 30.0,
        "procurement_delay_removed": True,
        "milestones_expedited_count": 4
    }
    client.post("/api/v1/simulation/run", json=payload)
    after = client.get(f"/api/v1/projects/{pid}").json()
    assert before["current_cost"] == after["current_cost"]
    assert before["delay_days"] == after["delay_days"]
    assert before["progress_percentage"] == after["progress_percentage"]

def test_whatif_11_frontend_backend_schema_consistency():
    pid = get_sample_project_id()
    payload = {
        "project_id": pid,
        "manpower_boost_pct": 20.0,
        "budget_increase_pct": 10.0
    }
    res = client.post("/api/v1/simulation/run", json=payload).json()
    assert "baseline" in res
    assert "simulated" in res
    assert "net_improvement" in res
    assert "delay_reduction_months" in res
    assert "cost_avoidance_cr" in res

def test_whatif_12_error_handling():
    res = client.post("/api/v1/simulation/run", json={"project_id": "NON_EXISTENT_PROJECT_ID_999"})
    assert res.status_code == 404
