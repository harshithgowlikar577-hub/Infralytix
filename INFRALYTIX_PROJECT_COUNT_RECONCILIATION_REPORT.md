# INFRALYTIX PROJECT COUNT RECONCILIATION & EXECUTIVE KPI AUDIT REPORT

**Project Name**: INFRALYTIX Executive Decision Center / Command Center  
**Audit Date**: October 9, 2026  
**Status**: COMPLETE — 100% Verified & Reconciled  
**Priority**: CRITICAL  

---

## EXECUTIVE SUMMARY & RECONCILIATION TABLE

An exhaustive dataset audit, backend aggregation overhaul, and frontend KPI binding repair were conducted across all 21 modules of the **INFRALYTIX** platform. The discrepancy observed in prior dashboard renderings (where Healthy: 4,439, Delayed: 2,218, High Risk: 2,972 appeared alongside Total Projects: 1,981) was traced to hardcoded fallback constants in frontend components and un-deduplicated historical observation snapshots in historical tracking tables (`project_health_scores` and `project_risks` containing 29,715 records across 15 observation cycles).

Every metric across Executive KPIs, GIS Intelligence, Portfolio Analytics, Risk Monitors, and Project Intelligence has now been reconciled against the authoritative SQLite database (`infralytix.db`).

### Verified KPI Reconciliation Summary

| Executive KPI Metric | Screenshot Observation | Verified Authoritative Value | Primary Data Source | Exact Domain / Business Rule | Discrepancy Status |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **Total Monitored Projects** | 1,981 / (7,411 fallback) | **1,981** | `projects` table (`is_deleted = 0`) | Unique non-deleted physical project records (`id` / `project_id`) | **RECONCILED** |
| **Healthy Projects** | 4,439 | **268** | `project_health_scores` (Latest snapshot per project) | Latest composite health score $\ge 75.0$ / `health_status = 'Healthy'` | **FIXED & BOUND** |
| **Delayed Projects (Status)** | 2,218 | **90** | `projects.status` | Projects with administrative status explicitly set to `'Delayed'` | **FIXED & BOUND** |
| **Schedule Delayed Projects** | — | **1,518** | `projects.delay_days` | Projects with recorded positive schedule slippage (`delay_days > 0`) | **VERIFIED** |
| **High-Risk Projects (High Band)** | 2,972 | **1,161** | `projects.risk_level` | Projects classified in the `'High'` risk tier ($50.0 < \text{Risk Score} \le 75.0$) | **FIXED & BOUND** |
| **Critical-Risk Projects** | — | **384** | `projects.risk_level` | Projects classified in the `'Critical'` risk tier ($\text{Risk Score} > 75.0$) | **VERIFIED** |
| **High + Critical Risk Combined** | 2,972 | **1,545** | `projects.risk_level` | Portfolio assets requiring ministerial priority escalation | **RECONCILED** |
| **Total Sanctioned / Original Cost** | ₹20.74 Lakh Cr | **₹37,13,243.42 Cr** | `projects.original_cost` | Sum of baseline sanctioned project costs | **RECONCILED** |
| **Total Revised / Current Cost** | ₹24.96 Lakh Cr | **₹43,00,606.90 Cr** | `projects.current_cost` | Sum of current approved/revised project outlays | **RECONCILED** |
| **Total Actual Expenditure** | — | **₹20,36,545.12 Cr** | `projects.expenditure` | Verified expenditure disbursement to date | **VERIFIED** |
| **Forecasted Cost Escalation** | — | **₹5,87,363.48 Cr** | `current_cost - original_cost` | Net capital overrun exposure across active assets | **VERIFIED** |
| **Mapped States / UTs** | 35 | **36** | `projects.state` | 36 States & UTs with 100% geographical assignment (0 missing) | **RECONCILED** |

---

## SECTION A — DATASET INVENTORY

1. **Active Database Connection**: SQLite database located at `c:\Users\harsh\OneDrive\Desktop\INFRALYTIX\infralytix.db` (244,322,304 bytes). Configured via `DATABASE_URL=sqlite:///./infralytix.db`.
2. **Authoritative Project Table**: `projects`.
3. **Total Physical Rows in `projects`**: **1,981**.
4. **Unique Project IDs**: **1,981** unique values for `id` (UUID format) and **1,981** unique values for `project_id` (human identifiers, e.g., `INF0001`, `PRJ0002`).
5. **Duplicate / Null Project Identifiers**: **0** duplicate IDs; **0** null or missing primary keys; **0** deleted records (`is_deleted = 0` for all 1,981 records).
6. **Missing Project Names**: **0** (100% populated).
7. **Status Field Distribution**:
   - `In Progress`: **1,743** (87.99%)
   - `Completed`: **148** (7.47%)
   - `Delayed`: **90** (4.54%)
   - *Sum of Exclusive Status Categories*: $1,743 + 148 + 90 = 1,981$ (**100.0%**).
8. **Delay Days (`delay_days`) Distribution**:
   - `delay_days > 0` (Schedule Slippage): **1,518** (76.63%)
   - `delay_days == 0` (On Schedule): **463** (23.37%)
   - `delay_days < 0`: **0**
9. **Risk Level Distribution (`risk_level`)**:
   - `Low`: **24** (1.21%)
   - `Medium`: **412** (20.80%)
   - `High`: **1,161** (58.61%)
   - `Critical`: **384** (19.38%)
   - *Sum of Exclusive Risk Bands*: $24 + 412 + 1,161 + 384 = 1,981$ (**100.0%**).
10. **Latest Health Status Distribution** (derived from latest snapshot per project in `project_health_scores`):
    - `Healthy`: **268** (13.53%)
    - `Warning`: **1,353** (68.30%)
    - `Critical`: **360** (18.17%)
    - *Sum of Exclusive Latest Health Categories*: $268 + 1,353 + 360 = 1,981$ (**100.0%**).
11. **Historical Snapshot Scope Analysis**:
    - `project_health_scores` table contains **29,715** total physical rows (15 observation snapshots per project for 1,981 projects).
    - `project_risks` table contains **29,715** total physical rows (15 observation snapshots per project for 1,981 projects).
    - Aggregations summing across raw table rows without grouping by latest observation cycle inflated metrics by $15\times$.

---

## SECTION B — EXECUTIVE KPI RECONCILIATION

### 1. Total Projects Card
- **Original Displayed Value**: 1,981 (or fallback 7,411)
- **Verified Authoritative Value**: **1,981**
- **Calculation Rule**: `SELECT COUNT(*) FROM projects WHERE is_deleted = 0;`
- **Root Cause & Fix**: Frontend `Dashboard.tsx` had fallback string `"7,411 audited assets"` in subtitle and fallback `7411` when API loading. Updated to bind directly to `dashData.total_projects` (1,981).

### 2. Healthy Projects Card
- **Original Displayed Value**: 4,439
- **Verified Authoritative Value**: **268** (13.5%)
- **Calculation Rule**: Latest observation in `project_health_scores` with `health_status = 'Healthy'` ($\text{Health Score} \ge 75.0$).
- **Root Cause & Fix**: Hardcoded constant `const healthyProjects = 4439;` in `Dashboard.tsx` derived from raw historical snapshot row counts. Replaced with live backend field `dashData.healthy_projects_count`.

### 3. Delayed Projects Card
- **Original Displayed Value**: 2,218
- **Verified Authoritative Value**: **90** (Status Delayed) / **1,518** (Schedule Delayed `delay_days > 0`)
- **Calculation Rule**: `SELECT COUNT(*) FROM projects WHERE status = 'Delayed';`
- **Root Cause & Fix**: Hardcoded constant `const delayedProjects = 2218;` in `Dashboard.tsx`. Replaced with live backend field `dashData.delayed_projects_count`.

### 4. High-Risk Projects Card
- **Original Displayed Value**: 2,972
- **Verified Authoritative Value**: **1,161** (High Risk Band) / **1,545** (High + Critical Risk Combined)
- **Calculation Rule**: `SELECT COUNT(*) FROM projects WHERE risk_level = 'High';`
- **Root Cause & Fix**: Property key mismatch (`dashData?.high_risk_count` in frontend vs `high_risk_projects_count` in API schema), causing frontend to fallback to `2972`. Fixed field mapping in `DashboardAnalyticsResponse` and `Dashboard.tsx`.

---

## SECTION C — CROSS-MODULE AUDIT

| Module Name | Metric Displayed | Expected Calculation | Actual Verified Value | Status | Explanation |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Executive Dashboard / Command Center** | Total, Healthy, Delayed, High-Risk | Live backend aggregation | 1,981 / 268 / 90 / 1,161 | **PASS** | Bound to live `/api/v1/analytics/dashboard` response. |
| **Projects Directory** | Project list count, search, pagination | Dynamic query filtering | 1,981 total (63 for MH) | **PASS** | Evaluates live `ProjectListResponse.total_count`. |
| **Project Dossier** | Single project 360 view | Unique key query | 1,981 unique IDs | **PASS** | Correct primary key lookups (`INF0001`-`PRJ1981`). |
| **Risk Radar / Monitor** | Risk band distribution | Risk engine counts | Low: 24, Med: 412, High: 1,161, Crit: 384 | **PASS** | Matches latest `risk_level` classification. |
| **Early Warnings** | Critical & high risk alerts | Active threshold scan | 1,545 high/crit assets | **PASS** | Bound to live risk trigger conditions. |
| **Portfolio Analytics** | Financial outlays & cost overruns | Sum of project costs | Orig: ₹37.13L Cr, Curr: ₹43.00L Cr | **PASS** | Sum of non-deleted project cost fields. |
| **Project Intelligence** | Top deteriorating assets | Sorted by delay_days desc | Top 10 critical assets | **PASS** | Bounded limit query without duplication. |
| **India GIS Map** | State density & markers | Latitude/Longitude plot | 1,981 markers across 36 states | **PASS** | 100% valid coordinates, state fallback fixed. |
| **Reports Engine** | Executive PDF / CSV summary | Aggregated KPI object | Reconciled portfolio stats | **PASS** | Binds to backend executive analytics. |
| **AI Copilot** | Conversational project queries | Contextual database retrieval | Bounded to 1,981 projects | **PASS** | No hardcoded or hallucinated counts. |
| **Model Lab** | ML delay/cost predictions | Inference per project | 1,981 predicted profiles | **PASS** | Models evaluated without duplicating project rows. |

---

## SECTION D — ROOT CAUSES

1. **Hardcoded Fallback Constants in Frontend UI**: `Dashboard.tsx` contained static assignments (`healthyProjects = 4439; delayedProjects = 2218; highRiskProjects = 2972;`) that overrode API responses when loading or when schema keys mismatched.
2. **API Field Mismatch**: Backend returned `high_risk_projects_count` while frontend evaluated `dashData?.high_risk_count`, evaluating to `undefined` and triggering hardcoded fallbacks.
3. **Historical Snapshot Aggregation**: Raw table row counts on `project_health_scores` (29,715) and `project_risks` (29,715) were summed across 15 historical reporting cycles instead of selecting the latest observation cycle (`rn = 1`).
4. **State Detail Fallback Limits**: `Dashboard.tsx` called `useProjects({ limit: 40 })`, which fetched only 40 projects client-side, causing state-level filtering to fail and fall back to hardcoded state counts (`Maharashtra 153`).
5. **Map State Normalization Redirect**: `IndiaGisMap.tsx` had a rule mapping `Dadra & Nagar Haveli & Daman & Diu` projects to `Gujarat`.

---

## SECTION E — CODE CHANGES

### 1. `backend/app/analytics/engine.py`
- Added `healthy_projects_count`, `schedule_delayed_projects_count`, `high_risk_count`, and `health_distribution` to `AnalyticsEngine.get_dashboard_metrics()`.
- Implemented latest-snapshot subquery (`ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at DESC)`) for `project_health_scores`.
- Updated `get_state_analytics()` to return `total_original_cost_cr`, `total_cost_cr`, `total_expenditure_cr`, `average_delay_days`, and `average_progress_pct` for all 36 States/UTs.

### 2. `backend/app/schemas/__init__.py`
- Updated `DashboardAnalyticsResponse` schema to support `healthy_projects_count`, `schedule_delayed_projects_count`, `high_risk_count`, and `health_distribution`.

### 3. `frontend/src/pages/Dashboard.tsx`
- Replaced hardcoded KPI constants with live `dashData` API bindings.
- Updated MetricCard subtitles to calculate percentages dynamically from `totalProjects`.
- Replaced hardcoded state summary calculations with `useStateAnalytics()` hook.

### 4. `frontend/src/components/gis/IndiaGisMap.tsx`
- Fixed `normalizeStateName` to properly preserve `Dadra and Nagar Haveli and Daman and Diu` instead of remapping to Gujarat.

### 5. `backend/tests/test_project_count_reconciliation.py`
- Created comprehensive 16-test suite covering all data integrity, reconciliation, state scope, and API requirements.

---

## SECTION F — TEST RESULTS

- **Pytest Suite Execution**: `pytest backend/tests`
- **Total Tests Executed**: **60**
- **Passed**: **60** (100% Pass Rate)
- **Failed**: **0**
- **Vite Production Build**: `npm run build` in `frontend/`
- **Build Status**: SUCCESS (0 errors, 2,779 modules transformed cleanly).

---

## SECTION G — REMAINING ISSUES & VERIFICATION SUMMARY

- **Unresolved Discrepancies**: **NONE**.
- **Missing Source Data**: **NONE** (All 1,981 projects have complete primary keys, states, sectors, status, risk levels, and coordinates).
- **Regression Check**: All existing ML models, risk engines, authorization paths, and UI components remain completely intact.

---
*Report certified by Antigravity AI Pair Programmer & System Auditor.*
