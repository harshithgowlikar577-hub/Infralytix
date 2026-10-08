import pytest
from fastapi import status

# =========================================================================
# 1. AUTHENTICATION & RBAC TESTS
# =========================================================================

def test_user_registration(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "officer@railways.gov.in",
        "password": "RailPassword123!",
        "full_name": "S. K. Verma",
        "ministry": "Ministry of Railways",
        "role": "MinistryOfficer"
    })
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()
    assert data["email"] == "officer@railways.gov.in"
    assert data["role"] == "MinistryOfficer"

def test_user_login(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "test_admin@infralytix.gov.in",
        "password": "AdminPass123!"
    })
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_admin@infralytix.gov.in"

def test_get_current_user_profile(client, admin_token):
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["email"] == "test_admin@infralytix.gov.in"

# =========================================================================
# 2. PROJECTS EXPLORER TESTS
# =========================================================================

def test_list_projects(client):
    res = client.get("/api/v1/projects?limit=10")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["total_count"] >= 2
    assert len(data["projects"]) >= 2

def test_get_project_detail(client):
    res = client.get("/api/v1/projects/INF0001")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["project_id"] == "INF0001"
    assert data["original_cost"] == 1450.0

def test_project_not_found(client):
    res = client.get("/api/v1/projects/NON_EXISTENT_9999")
    assert res.status_code == status.HTTP_404_NOT_FOUND

# =========================================================================
# 3. PROJECT HEALTH ENGINE TESTS
# =========================================================================

def test_get_project_health(client):
    res = client.get("/api/v1/analytics/health/INF0001")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "health_score" in data
    assert "health_status" in data
    assert data["health_score"] >= 0 and data["health_score"] <= 100
    assert "formula_breakdown" in data
    assert "progress_component_35pct" in data["formula_breakdown"]

# =========================================================================
# 4. ML COST & DELAY PREDICTION TESTS
# =========================================================================

def test_predict_cost_overrun(client):
    res = client.post("/api/v1/ml/cost/predict", json={
        "project_id": "INF0001",
        "original_cost": 1450.0,
        "current_cost": 1680.0,
        "expenditure": 850.0,
        "progress_percentage": 42.0,
        "delay_days": 244
    })
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["predicted_final_cost"] >= 1450.0
    assert "cost_overrun_percentage" in data
    assert "best_algorithm_used" in data

def test_predict_schedule_delay(client):
    res = client.post("/api/v1/ml/delay/predict", json={
        "project_id": "INF0001",
        "progress_percentage": 42.0,
        "milestones_delayed": 3,
        "milestones_due": 5,
        "cost_utilization_pct": 58.0,
        "delay_days": 244
    })
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["predicted_delay_days"] >= 244
    assert "completion_probability" in data
    assert len(data["top_delay_drivers"]) > 0

# =========================================================================
# 5. RISK INTELLIGENCE ENGINE TESTS
# =========================================================================

def test_get_risk_profile(client):
    res = client.get("/api/v1/risk/INF0001")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["risk_score"] >= 0 and data["risk_score"] <= 100
    assert data["risk_level"] in ["Low", "Medium", "High", "Critical"]
    assert "delay_risk_subscore" in data
    assert len(data["risk_drivers"]) > 0

# =========================================================================
# 6. SIMILARITY & FAILURE DNA TESTS
# =========================================================================

def test_get_similarity_and_failure_dna(client):
    res = client.get("/api/v1/similarity/INF0001")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "cluster_archetype" in data
    assert "failure_dna_signature" in data
    assert "similar_projects" in data

# =========================================================================
# 7. INTERVENTION ENGINE TESTS
# =========================================================================

def test_get_intervention_recommendations(client):
    res = client.get("/api/v1/intervention/INF0001")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    assert "expected_impact" in data

def test_execute_intervention(client, admin_token):
    res = client.post(
        "/api/v1/intervention/execute",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "project_id": "INF0001",
            "intervention_type": "Workforce Augmentation",
            "description": "Mobilized 2 additional excavators and augmented labor by 25%.",
            "applied_parameters": {"manpower_boost_pct": 25.0}
        }
    )
    assert res.status_code == status.HTTP_201_CREATED
    assert res.json()["status"] == "success"

# =========================================================================
# 8. EARLY WARNING ENGINE TESTS
# =========================================================================

def test_get_early_warnings(client):
    res = client.get("/api/v1/warning/INF0001")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "warning_level" in data
    assert "active_warnings" in data
    assert len(data["active_warnings"]) > 0

# =========================================================================
# 9. WHAT-IF SIMULATION ENGINE TESTS
# =========================================================================

def test_what_if_simulation(client):
    res = client.post("/api/v1/simulation/run", json={
        "project_id": "INF0001",
        "manpower_boost_pct": 20.0,
        "budget_increase_pct": 10.0,
        "procurement_delay_removed": True,
        "milestones_expedited_count": 2
    })
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "baseline" in data
    assert "simulated" in data
    assert "net_improvement" in data
    assert data["net_improvement"]["delay_recovered_days"] >= 0

# =========================================================================
# 10. ANALYTICS & DASHBOARD TESTS
# =========================================================================

def test_dashboard_analytics(client):
    res = client.get("/api/v1/analytics/dashboard")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["total_projects"] >= 2
    assert "risk_distribution" in data
    assert "top_deteriorating_projects" in data

def test_ministry_analytics(client):
    res = client.get("/api/v1/analytics/ministry")
    assert res.status_code == status.HTTP_200_OK
    assert "ministries" in res.json()

def test_state_analytics(client):
    res = client.get("/api/v1/analytics/state")
    assert res.status_code == status.HTTP_200_OK
    assert "states" in res.json()

def test_sector_analytics(client):
    res = client.get("/api/v1/analytics/sector")
    assert res.status_code == status.HTTP_200_OK
    assert "sectors" in res.json()

def test_risk_analytics(client):
    res = client.get("/api/v1/analytics/risk")
    assert res.status_code == status.HTTP_200_OK
    assert "risk_bands" in res.json()

# =========================================================================
# 11. NOTIFICATION SYSTEM TESTS
# =========================================================================

def test_list_notifications(client, admin_token):
    res = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "notifications" in data
    assert "unread_count" in data

def test_notification_lifecycle(client, admin_token, db_session):
    from backend.app.notifications.service import NotificationService
    # Create notification
    notif = NotificationService.create_notification(
        db=db_session,
        title="Test Critical Warning",
        message="Corridor construction has stalled.",
        warning_level="Critical",
        project_id=None,
        action_url="/projects/INF0001"
    )
    assert notif.id is not None
    assert notif.is_read is False

    # Mark as read
    res = client.put(f"/api/v1/notifications/{notif.id}/read", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["status"] in ("success", "READ")

    # Read all
    res = client.put("/api/v1/notifications/read-all", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK

    # Dismiss notification
    res = client.delete(f"/api/v1/notifications/{notif.id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK

# =========================================================================
# 12. ML TRAINING & MODEL MANAGEMENT TESTS
# =========================================================================

def test_ml_model_status(client, admin_token):
    res = client.get("/api/v1/ml/status", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "cost_model" in data
    assert "delay_model" in data
    assert data["cost_model"]["is_trained"] is True

def test_retrain_cost_model(client, admin_token):
    res = client.post("/api/v1/ml/train/cost", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["status"] in ("SUCCESS", "success")
    assert "models_evaluated" in data

def test_retrain_delay_model(client, admin_token):
    res = client.post("/api/v1/ml/train/delay", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["status"] in ("SUCCESS", "success")
    assert "models_evaluated" in data


# =========================================================================
# 13. PROJECT SOFT-DELETE TESTS
# =========================================================================

def test_soft_delete_project(client, admin_token, db_session):
    from backend.app.models import Project
    from datetime import date
    # Create temp project
    temp_p = Project(
        project_id="TEMP_DEL_999",
        project_name="Deletable Temporary Asset",
        ministry="Ministry of Ports, Shipping and Waterways",
        sector="Shipping",
        state="Maharashtra",
        original_cost=50.0,
        current_cost=50.0,
        expenditure=10.0,
        start_date=date(2023, 1, 1),
        target_date=date(2025, 1, 1),
        delay_days=0,
        progress_percentage=20.0,
        financial_percentage=20.0,
        status="In Progress",
        risk_level="Low"
    )
    db_session.add(temp_p)
    db_session.commit()

    # Soft delete via API
    res = client.delete(f"/api/v1/projects/{temp_p.id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["status"] in ("DELETED", "success")

    # Verify not returned in normal list
    res = client.get("/api/v1/projects")
    project_ids = [p["project_id"] for p in res.json()["projects"]]
    assert "TEMP_DEL_999" not in project_ids


# =========================================================================
# 14. MULTI-DATASET INGESTION TESTS (MILESTONES, OBSERVATIONS, DEPS)
# =========================================================================

def test_ingest_milestones_csv(client, admin_token):
    csv_data = (
        "milestone_id,project_id,milestone_name,planned_date,actual_date,delay_days,status\n"
        "M-TEST-01,INF0001,Substructure Pier Work,2024-01-15,2024-03-20,65,Delayed\n"
        "M-TEST-02,INF0001,Superstructure Girder Erection,2024-06-01,,0,On Time\n"
    )
    res = client.post(
        "/api/v1/ingestion/upload/milestones",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("test_milestones.csv", csv_data, "text/csv")}
    )
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["valid_records"] == 2
    assert data["status"] == "Ingested"

def test_ingest_observations_csv(client, admin_token):
    csv_data = (
        "project_id,month,planned_progress_pct,actual_progress_pct,financial_progress_pct,"
        "monthly_expenditure_cr,cumulative_expenditure_cr,milestones_due,milestones_completed,"
        "milestones_delayed,resource_util_pct,execution_velocity,issue_category\n"
        "INF0001,2025-09,60.0,45.0,50.0,50.0,900.0,6,2,4,75.0,3.0,Land Acquisition Clearance\n"
    )
    res = client.post(
        "/api/v1/ingestion/upload/observations",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("test_observations.csv", csv_data, "text/csv")}
    )
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["valid_records"] == 1
    assert data["status"] == "Ingested"

def test_ingest_dependencies_csv(client, admin_token):
    csv_data = (
        "project_id,dependent_project_id,dependency_type,impact_level,dependency_note\n"
        "INF0001,PRJ0002,power_grid_interconnection,High,Grid feeder needed for traction power\n"
    )
    res = client.post(
        "/api/v1/ingestion/upload/dependencies",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("test_dependencies.csv", csv_data, "text/csv")}
    )
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["valid_records"] == 1
    assert data["status"] == "Ingested"

# =========================================================================
# 15. SCHEDULER SYSTEM & TRIGGER TESTS
# =========================================================================

def test_scheduler_status(client, admin_token):
    res = client.get("/api/v1/scheduler/status", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    assert "status" in res.json()

def test_scheduler_manual_triggers(client, admin_token):
    # Recalculate risks
    res = client.post("/api/v1/scheduler/trigger/recalculate_risks", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["status"] == "SUCCESS"

    # Recalculate health
    res = client.post("/api/v1/scheduler/trigger/recalculate_health", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["status"] == "SUCCESS"

    # Early warnings
    res = client.post("/api/v1/scheduler/trigger/early_warnings", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["status"] == "SUCCESS"

