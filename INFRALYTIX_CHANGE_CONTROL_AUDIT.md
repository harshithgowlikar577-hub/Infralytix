# INFRALYTIX CHANGE-CONTROL BASELINE & PRESERVATION AUDIT

**Project:** INFRALYTIX — Infrastructure Intelligence & Decision Support Platform  
**Audit Purpose:** Pre-Change Baseline Verification & Change Control Compliance  
**Audit Date:** October 10, 2026  
**Status:** BASELINE RECORDED & VERIFIED (Zero Destructive Operations)

---

## 1. Executive Summary & Policy Compliance

In strict adherence to the **Change-Control & Project Preservation Directives**, this document establishes the authoritative baseline of the working INFRALYTIX application.

All existing user modifications, untracked documentation files, database records, trained machine learning models, API contracts, and frontend/backend runtime processes have been audited and verified. **No destructive Git commands (`git reset`, `git clean`, `git revert`), schema drops, record alterations, or model overwrites have been or will be performed.**

---

## 2. Baseline Git Working-Tree Status

- **Current Branch:** `main`
- **Current HEAD Commit:** `0045fa3` (*Fix Gemini AI integration, AI Copilot, What-If explanations, and audit reports*)
- **Upstream Sync:** Up to date with `origin/main`

### Existing User Modifications (Preserved Intact)
1. `backend/app/api/v1/projects.py` — Adds uncapped GIS marker endpoint for 1,981 projects.
2. `frontend/src/components/gis/IndiaGisMap.tsx` — Connects GIS map to live markers and normalized state stats.
3. `frontend/src/components/gis/indiaMapData.ts` — Centralized state normalization and 36 administrative entity paths.
4. `frontend/src/hooks/useAPI.ts` — `useGISMarkers` hook definition.
5. `frontend/src/index.css` — Settings tab navigation overflow/flex layout adjustments.
6. `frontend/src/lib/api.ts` — `projectsAPI.gisMarkers` client route.
7. `frontend/src/pages/Dashboard.tsx` — Integrates live GIS data for Dashboard Section 3.
8. `frontend/src/pages/Settings.tsx` — Settings tabs layout improvements.

### Existing Untracked Files (Preserved Intact)
- `INFRALYTIX_GIS_DATA_ACCURACY_AUDIT.md`
- `INFRALYTIX_SETTINGS_FUNCTIONALITY_DISCOVERY_REPORT.md`
- `INFRALYTIX_SETTINGS_IMPLEMENTATION_AND_VERIFICATION_REPORT.md`
- `INFRALYTIX_SETTINGS_TAB_LAYOUT_FIX.md`
- `INFRALYTIX_SETTINGS_UI_AND_FUNCTIONALITY_AUDIT.md`
- `scratch/`
- `scripts/test_gis_data_accuracy.py`

---

## 3. Runtime Architecture & Startup Commands

| Service | Host & Port | Status | Command |
| :--- | :--- | :--- | :--- |
| **Backend API (FastAPI / Uvicorn)** | `http://127.0.0.1:8000` | **LIVE (HTTP 200)** | `python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000` |
| **Frontend UI (React / Vite)** | `http://localhost:5173` | **LIVE (HTTP 200)** | `npm run dev` (in `frontend/`) |

---

## 4. Database Baseline & Data Integrity Verification

- **Authoritative Database Location:** `infralytix.db` (Workspace Root)
- **Database File Size:** **344,928,256 bytes** (~328.95 MB)
- **Database Engine:** SQLite 3 (WAL / Serialized mode)
- **Table Record Inventory:**

| Table Name | Row Count | Integrity Status |
| :--- | :--- | :--- |
| `projects` | **1,981** | Preserved (100% active ministerial records) |
| `notifications` | **428,937** | Preserved |
| `project_health_scores` | **37,639** | Preserved |
| `project_risks` | **37,638** | Preserved |
| `interventions` | **3** | Preserved |
| `users` | **3** | Preserved |
| `roles` | **5** | Preserved |
| `audit_logs` | **1** | Preserved |

> [!IMPORTANT]
> **Data Integrity Guarantee:** Zero database records have been deleted, merged, or replaced with dummy sample data. All 1,981 real infrastructure projects remain the authoritative source of truth.

---

## 5. Machine Learning Model Artifacts & File Hashes

The production predictive models located in `backend/trained_models/` were audited for artifact paths, file sizes, and cryptographic SHA-256 hashes:

| Model Name | Artifact Path | Size | SHA-256 Hash |
| :--- | :--- | :--- | :--- |
| **Cost Prediction Model** (RandomForest) | `backend/trained_models/cost_prediction_model.joblib` | 247,698 bytes | `d39f9c88f832ce37c687672e31228716cbfb040e74ffd4be068d65f2411b91cd` |
| **Delay Prediction Model** (GradientBoosting) | `backend/trained_models/delay_prediction_model.joblib` | 301,565 bytes | `6465006c54522b537b41a27a8fd3a54ab8da1c00c966577c537f6cf554b6e4df` |

> [!NOTE]
> Both models are loaded cleanly on application startup and remain completely untouched.

---

## 6. Authoritative API Route Contracts

The FastAPI application exposes **43 registered endpoints** across 16 route groups in OpenAPI v3.0:

- **Root & Health:** `GET /`, `GET /health`
- **Analytics:** `GET /api/v1/analytics/dashboard`, `/executive`, `/health/{project_id}`, `/ministry`, `/risk`, `/sector`, `/state`
- **Projects:** `GET /api/v1/projects`, `POST /api/v1/projects`, `GET /api/v1/projects/gis-markers`, `GET /api/v1/projects/{project_id}`, `PUT`, `DELETE`
- **AI Governance Copilot:** `POST /api/v1/copilot/query`
- **Simulation:** `POST /api/v1/simulation/run`, `POST /api/v1/simulation/explain`
- **Machine Learning:** `POST /api/v1/ml/cost/predict`, `POST /api/v1/ml/delay/predict`, `GET /api/v1/ml/status`, `POST /api/v1/ml/train/*`
- **Early Warnings & Interventions:** `GET /api/v1/warning/{project_id}`, `GET /api/v1/warning/portfolio/predictive`, `GET /api/v1/intervention/{project_id}`, `POST /api/v1/intervention/execute`
- **Authentication & Ingestion:** `/auth/login`, `/auth/refresh`, `/auth/me`, `/ingestion/upload/*`
- **Notifications & Scheduler:** `/notifications/*`, `/scheduler/*`

All contracts, HTTP verbs, and shared schemas remain intact.

---

## 7. Baseline Test Execution Results

| Test Suite / Target | Command | Result | Pass Rate |
| :--- | :--- | :--- | :--- |
| **GIS Data Accuracy & Reconciliation** | `python scripts/test_gis_data_accuracy.py` | **PASS** | **14 / 14 (100%)** |
| **Gemini AI Integration Suite** | `pytest backend/tests/test_gemini_integration.py` | **PASS** | **3 / 3 (100%)** |
| **Frontend Production Build** | `npm run build` (in `frontend/`) | **PASS** | **2,779 modules, 769ms** |
| **Live Copilot Reasoning Verification** | `POST /api/v1/copilot/query` | **PASS** | **200 OK (`GEMINI_LLM_gemini-3.6-flash`)** |

---

## 8. Strictly Protected Modules (No Changes Permitted)

The following areas are designated as **PROTECTED** under Change-Control directives:
- Dashboard and KPI calculations (`Dashboard.tsx`, analytics engines).
- Projects Directory & Data Ingestion (`Projects.tsx`, `ingestion.py`).
- GIS Maps & Spatial Boundaries (`IndiaGisMap.tsx`, `indiaMapData.ts`).
- Risk Monitor & Early Warnings (`RiskMonitor.tsx`, `early_warning.py`).
- Portfolio Analytics & Reports (`Analytics.tsx`, `Reports.tsx`).
- What-If Calculations (`Simulator.tsx`, simulation engines).
- Settings & Preferences (`Settings.tsx`).
- Authentication & Authorization architecture (`auth.py`, session management).
- Database schemas & existing project records (`infralytix.db`).
- Global CSS, theme, sidebar, header, and navigation.
- Production ML model files (`backend/trained_models/*.joblib`).

---

## 9. Next Steps & Change Control Plan

Any subsequent improvements will be strictly confined to:
1. AI Copilot response generation & response formatting.
2. Directly related AI retrieval / Gemini integration code.
3. Tests specifically required for these areas.

Before any patch is applied, it will be validated using isolated regression tests, ensuring zero side-effects across the existing platform.
