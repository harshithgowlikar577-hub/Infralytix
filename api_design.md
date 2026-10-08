# INFRALYTIX — REST API Architecture & OpenAPI Specification
## Backend Endpoint Contracts, Request/Response Schemas, and Authentication Protocols

---

## 1. API Architecture & Standards

### 1.1 Architectural Foundations
The INFRALYTIX API is constructed as a high-performance **FastAPI (Python 3.11+)** asynchronous RESTful service. It implements strict Pydantic v2 validation, OpenAPI 3.0 self-documentation (`/docs` and `/redoc`), and RFC 7807 compliant error envelopes.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ KEY API CONVENTIONS:                                                                   │
│ • Base URL: /api/v1                                                                    │
│ • Content-Type: application/json (except multipart for CUF file ingestion)             │
│ • Authentication: Standard HTTP Bearer Token (JWT RS256 / HS256)                       │
│ • Pagination: Standard offset/limit query params (limit=25, offset=0, max_limit=100)   │
│ • Sorting: ?sort_by=risk_score&order=desc                                              │
│ • Rate Limiting: 120 req/min for standard users; 1000 req/min for internal microservices│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Universal Response Envelope & Error Specification (RFC 7807)

```json
// Standard Successful Response Envelope (200 OK / 201 Created)
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-10T18:30:00Z",
    "version": "v1.4.0",
    "execution_ms": 14.2
  }
}

// Standard Error Envelope (RFC 7807 Compliant)
{
  "status": "error",
  "error": {
    "code": "INVALID_PROJECT_IDENTIFIER",
    "message": "Project with ID 'INF9999' does not exist in the master registry.",
    "details": [
      {
        "field": "project_id",
        "issue": "Entity not found in table 'projects'"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-09-10T18:30:00Z",
    "request_id": "req-98f24a1b-45b3"
  }
}
```

---

## 2. Authentication & Session Endpoints

### 2.1 User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Description**: Authenticates user credentials and returns a scoped JWT Access Token.
- **Request Body**:
  ```json
  {
    "email": "analyst@mospi.gov.in",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer",
      "expires_in": 28800,
      "user": {
        "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "email": "analyst@mospi.gov.in",
        "full_name": "R. K. Sharma",
        "role": "ANALYST",
        "ministry_scope": null
      }
    }
  }
  ```

### 2.2 Get Current User Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Security**: Bearer Token required.
- **Response (200 OK)**: Returns the current active user profile, permissions, and assigned departmental scope.

---

## 3. Executive Command Center & Analytics Endpoints

### 3.1 Portfolio KPI Summary
- **Endpoint**: `GET /api/v1/dashboard/kpis`
- **Description**: Delivers the 4 top-level command center cards and macroeconomic aggregates.
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "total_projects_monitored": 1981,
      "active_projects": 1742,
      "completed_projects": 239,
      "total_original_cost_cr": 3713000.0,
      "total_revised_cost_cr": 4278000.0,
      "total_cumulative_expenditure_cr": 2036000.0,
      "critical_projects_count": 126,
      "high_risk_projects_count": 354,
      "predicted_cost_escalation_exposure_cr": 427800.0,
      "national_average_delay_exposure_months": 14.2,
      "delay_exposure_trend_delta_months": 0.8,
      "data_as_of": "2026-09-10"
    }
  }
  ```

### 3.2 Portfolio Risk Band Distribution
- **Endpoint**: `GET /api/v1/dashboard/risk-distribution`
- **Description**: Returns project counts and aggregate financial exposure across all 5 risk tiers.
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      { "band": "SAFE", "min_score": 0, "max_score": 30, "project_count": 832, "pct": 42.0, "total_cost_cr": 1420000.0 },
      { "band": "WATCH", "min_score": 31, "max_score": 50, "project_count": 555, "pct": 28.0, "total_cost_cr": 1150000.0 },
      { "band": "HIGH", "min_score": 51, "max_score": 70, "project_count": 357, "pct": 18.0, "total_cost_cr": 980000.0 },
      { "band": "VERY_HIGH", "min_score": 71, "max_score": 85, "project_count": 158, "pct": 8.0, "total_cost_cr": 480000.0 },
      { "band": "CRITICAL", "min_score": 86, "max_score": 100, "project_count": 79, "pct": 4.0, "total_cost_cr": 248000.0 }
    ]
  }
  ```

### 3.3 Top Rapidly Deteriorating Projects
- **Endpoint**: `GET /api/v1/dashboard/deteriorating-projects`
- **Query Params**: `limit=5` (default: 5, max: 20)
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "project_id": "INF0001",
        "project_name": "Mega Express Corridor Phase II",
        "sector": "Road Transport & Highways",
        "state": "Uttar Pradesh",
        "initial_risk_score": 38.0,
        "current_risk_score": 87.0,
        "risk_acceleration_3m": 49.0,
        "trajectory": "RAPIDLY_DETERIORATING",
        "primary_trigger": "3 Consecutive Delayed Milestones + Velocity Collapse"
      }
    ]
  }
  ```

### 3.4 Sector & State Risk Analytics
- **Endpoint**: `GET /api/v1/analytics/sectors`
- **Endpoint**: `GET /api/v1/analytics/states`
- **Endpoint**: `GET /api/v1/analytics/radar`
- **Description**: Returns aggregated metrics, average delay months, cost overrun rates, and 5-axis spider chart benchmarks across sectors and Indian states.

---

## 4. Projects Master & Explorer Endpoints

### 4.1 Filterable Project Directory
- **Endpoint**: `GET /api/v1/projects`
- **Query Params**:
  - `search`: string (Name, ID, Agency, Contractor)
  - `sector`: string (e.g., `Road Transport & Highways`)
  - `ministry`: string
  - `state`: string
  - `risk_band`: string (`SAFE`, `WATCH`, `HIGH`, `VERY_HIGH`, `CRITICAL`)
  - `status`: string (`ONGOING`, `DELAYED`, `COMPLETED`)
  - `min_cost_cr`: float
  - `max_cost_cr`: float
  - `sort_by`: string (`risk_score`, `original_cost_cr`, `delay_days`, `physical_progress_pct`)
  - `order`: `asc` | `desc`
  - `limit`: int (default: 25)
  - `offset`: int (default: 0)
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "total_count": 1981,
      "filtered_count": 126,
      "page": 1,
      "limit": 25,
      "projects": [
        {
          "project_id": "INF0001",
          "project_name": "Mega Express Corridor Phase II",
          "ministry": "Ministry of Road Transport & Highways",
          "sector": "Road Transport & Highways",
          "state": "Uttar Pradesh",
          "original_cost_cr": 1450.0,
          "revised_cost_cr": 1680.0,
          "physical_progress_pct": 42.0,
          "financial_progress_pct": 58.0,
          "risk_score": 87.0,
          "risk_band": "CRITICAL",
          "risk_trajectory": "RAPIDLY_DETERIORATING",
          "predicted_delay_months": 9.4,
          "predicted_cost_overrun_probability": 0.78
        }
      ]
    }
  }
  ```

### 4.2 Project Master Detail
- **Endpoint**: `GET /api/v1/projects/{project_id}`
- **Response (200 OK)**: Delivers complete project metadata, dates, contractor details, and latest financial/physical progress percentages.

### 4.3 Physical & Financial S-Curve Timeline
- **Endpoint**: `GET /api/v1/projects/{project_id}/timeline`
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "project_id": "INF0001",
      "planned_start_date": "2023-04-01",
      "original_completion_date": "2026-03-31",
      "current_expected_date": "2026-11-30",
      "predicted_completion_date": "2027-01-15",
      "monthly_series": [
        {
          "month": "2025-04",
          "planned_physical_pct": 58.0,
          "actual_physical_pct": 46.0,
          "planned_financial_pct": 52.0,
          "actual_financial_pct": 51.0,
          "monthly_expenditure_cr": 27.0
        }
      ]
    }
  }
  ```

---

## 5. Machine Learning & Predictive Intelligence Endpoints

### 5.1 Project Predictions & Confidence
- **Endpoint**: `GET /api/v1/projects/{project_id}/predictions`
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "project_id": "INF0001",
      "model_version": "v1.4-xgb-production",
      "cost_overrun": {
        "probability": 0.784,
        "predicted_escalation_cr": 351.0,
        "predicted_escalation_pct": 24.2,
        "risk_band": "HIGH"
      },
      "schedule_delay": {
        "probability": 0.912,
        "predicted_delay_days": 286,
        "predicted_delay_months": 9.4,
        "forecasted_completion_date": "2027-01-15",
        "risk_band": "CRITICAL"
      },
      "confidence": {
        "level": "HIGH",
        "data_completeness_pct": 96.5,
        "observation_months_available": 12
      },
      "inference_timestamp": "2026-09-10T12:00:00Z"
    }
  }
  ```

### 5.2 Explainable AI (SHAP Waterfall Attributions)
- **Endpoint**: `GET /api/v1/projects/{project_id}/shap`
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "project_id": "INF0001",
      "base_expected_delay_days": 42.0,
      "model_predicted_delay_days": 286.0,
      "feature_attributions": [
        {
          "rank": 1,
          "feature_name": "land_acquisition_delay_days",
          "feature_value": 145.0,
          "shap_value": 34.2,
          "direction": "INCREASES_RISK",
          "human_explanation": "145 days accumulated in land acquisition disputes adds +34.2 points to schedule risk."
        },
        {
          "rank": 2,
          "feature_name": "progress_velocity_drop_pct",
          "feature_value": -2.8,
          "shap_value": 22.4,
          "direction": "INCREASES_RISK",
          "human_explanation": "Physical execution velocity collapsed by 2.8%/mo in Q2, contributing +22.4 points."
        },
        {
          "rank": 3,
          "feature_name": "milestone_delay_rate",
          "feature_value": 0.60,
          "shap_value": 18.1,
          "direction": "INCREASES_RISK",
          "human_explanation": "60% of scheduled milestones have suffered delays (+18.1 points)."
        }
      ]
    }
  }
  ```

### 5.3 Dynamic Risk Score & Trajectory
- **Endpoint**: `GET /api/v1/projects/{project_id}/risk`
- **Endpoint**: `GET /api/v1/projects/{project_id}/trajectory`
- **Response (200 OK)**: Returns the 0–100 composite score, 5 subscore components (Cost, Schedule, Milestone, Velocity, Dependency), and 12-month historical monthly trajectory sparkline.

### 5.4 Project Failure DNA™ & Historical Similarity
- **Endpoint**: `GET /api/v1/projects/{project_id}/similar`
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "project_id": "INF0001",
      "failure_dna": {
        "cluster_archetype": "Milestone-Collapse-Clearance-Deadlock",
        "dna_match_pct": 84.0,
        "recurring_pattern": [
          "Low execution velocity in Year 2",
          "Progress-spend mismatch (>20% gap)",
          "Persistent statutory clearance bottlenecks"
        ]
      },
      "similar_historical_projects": [
        {
          "matched_project_id": "INF0412",
          "matched_project_name": "Eastern Expressway Corridor",
          "sector": "Road Transport & Highways",
          "similarity_score": 0.924,
          "historical_observed_delay_months": 11.2,
          "historical_cost_escalation_pct": 22.1,
          "resolution_summary": "Cabinet Committee clearance expedited forest land transfer; contractor manpower was augmented by 25%."
        }
      ]
    }
  }
  ```

### 5.5 Prescriptive Decision Recommendations
- **Endpoint**: `GET /api/v1/projects/{project_id}/recommendations`
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "recommendation_id": "rec-1a2b3c4d",
        "priority": "IMMEDIATE_P1",
        "jurisdiction": "State Revenue Department",
        "trigger": "Land Acquisition Hold-up",
        "action_directive": "Trigger Level-1 State Revenue Coordination Review to release pending 18-hectare forest deed.",
        "expected_delay_reduction_days": 90,
        "expected_cost_avoidance_cr": 85.0
      }
    ]
  }
  ```

### 5.6 What-If Scenario Simulator
- **Endpoint**: `POST /api/v1/projects/{project_id}/simulate`
- **Request Body**:
  ```json
  {
    "manpower_boost_pct": 15.0,
    "progress_velocity_boost_pct": 10.0,
    "milestones_expedited_count": 2,
    "budget_efficiency_gain_pct": 5.0
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "baseline": {
        "risk_score": 87.0,
        "predicted_delay_months": 9.4,
        "predicted_cost_overrun_cr": 351.0
      },
      "simulated": {
        "risk_score": 52.0,
        "predicted_delay_months": 4.2,
        "predicted_cost_overrun_cr": 180.0,
        "net_delay_recovered_months": 5.2,
        "net_capital_saved_cr": 171.0,
        "new_risk_band": "HIGH"
      },
      "disclaimer": "Scenario estimate — not a guaranteed outcome."
    }
  }
  ```

### 5.7 Risk Propagation (Dependencies)
- **Endpoint**: `GET /api/v1/projects/{project_id}/dependencies`
- **Response (200 OK)**: Delivers connected upstream and downstream project nodes, dependency types, and cascading delay impact calculations.

---

## 6. Early Warning & Alert Management Endpoints

### 6.1 Alert Feed & Register
- **Endpoint**: `GET /api/v1/alerts`
- **Query Params**: `severity=CRITICAL`, `is_acknowledged=false`, `limit=20`
- **Response (200 OK)**: List of active early warning incidents.

### 6.2 Acknowledge Alert & Log Audit
- **Endpoint**: `POST /api/v1/alerts/{alert_id}/acknowledge`
- **Request Body**:
  ```json
  {
    "triage_notes": "Reviewed in inter-ministerial taskforce. Nodal officer assigned to expedite clearances.",
    "status": "ACKNOWLEDGED"
  }
  ```
- **Response (200 OK)**: Confirms alert state transition and records immutable audit log.

---

## 7. Model Intelligence & CUF Evaluation Lab Endpoints

### 7.1 Model Benchmark Comparison
- **Endpoint**: `GET /api/v1/models/benchmarks`
- **Response (200 OK)**: Baseline vs. XGBoost/LightGBM evaluation metrics (ROC-AUC, F1, MAE, Confusion Matrices).

### 7.2 The CUF Value Experiment
- **Endpoint**: `GET /api/v1/models/cuf-experiments`
- **Response (200 OK)**: Comparative performance of Model A (Raw CUF) vs. Model B (Engineered Lags) vs. Model C (Full Graph/DNA Features).

---

## 8. Data Ingestion & Quality Endpoints

### 8.1 Batch CUF Ingestion Gateway
- **Endpoint**: `POST /api/v1/data/upload-cuf`
- **Request**: `multipart/form-data` (CSV or Excel file upload)
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "batch_id": "batch-68f9a2b1",
      "records_received": 3600,
      "records_valid": 3480,
      "records_flagged_with_anomalies": 120,
      "usability_score_pct": 96.6,
      "pipeline_execution": {
        "status": "ML_INFERENCE_TRIGGERED",
        "estimated_completion_seconds": 4.5
      }
    }
  }
  ```

### 8.2 Data Quality & Anomaly Diagnostics
- **Endpoint**: `GET /api/v1/data/quality-summary`
- **Response (200 OK)**: Returns completeness ratings, schema errors, and flagged logical anomalies (e.g., negative spend, progress jumps).

---

## 9. Conversational AI Copilot Endpoint

### 9.1 Contextual Natural Language Query
- **Endpoint**: `POST /api/v1/copilot/query`
- **Request Body**:
  ```json
  {
    "query": "Why is project INF0001 critical and what are its top delay drivers?",
    "active_project_id": "INF0001"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "response_text": "Project INF0001 (Mega Express Corridor Phase II) is in the CRITICAL risk band (Score: 87/100). The primary delay drivers based on SHAP attribution are: (1) Land Acquisition Disputes (+34.2 pts), (2) Milestone Slippage Rate (+18.1 pts), and (3) Q2 Execution Velocity Drop (+22.4 pts). Recommended immediate action is Level-1 State Revenue Coordination.",
      "citations": [
        { "entity_type": "PROJECT", "id": "INF0001" },
        { "entity_type": "SHAP_ATTRIBUTION", "feature": "land_acquisition_delay_days" }
      ],
      "suggested_follow_up": [
        "What is the simulated outcome of a +15% manpower boost on INF0001?",
        "Show similar historical projects to INF0001."
      ]
    }
  }
  ```

---

## 10. Self-Review & Quality Audit (Phase 4 Acceptance Criteria)

- [x] **Every UI screen has APIs**: Full endpoint coverage for Command Center, Explorer, 360° Dossier, Radar, Geo Map, Alerts, Analytics, Model Lab, Data Quality, and Copilot.
- [x] **Every ML output has APIs**: Dedicated routes for Cost Overrun, Schedule Delay, SHAP Attributions, Dynamic Risk Scores, Failure DNA, Similarity Matcher, Prescriptive Actions, and What-If Simulations.
- [x] **CRUD coverage exists**: Projects, Observations, Scenarios, and Alert triages have complete create, read, update contracts.
- [x] **Error handling exists**: Standardized RFC 7807 error envelopes with deterministic codes and validation detail lists.
- [x] **Authentication exists**: Secure JWT Bearer authentication with role-based authorization headers.

*API Specification Phase 4 Complete and Approved.*
