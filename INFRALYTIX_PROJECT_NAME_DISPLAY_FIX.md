# INFRALYTIX — Project Name Display Fix Report

**Date:** October 9, 2026  
**Project:** INFRALYTIX Infrastructure Monitoring Platform  
**Issue Priority:** High  
**Status:** Resolved & Verified  

---

## 1. Executive Summary & Root Cause

### Problem Description
In the Projects Directory table (and certain other card views / search dropdowns), the **Project & Agency** column was rendering raw UUID string identifiers (such as `87dffb25-cb07-434d-8b2d-c0ac1aa2ee2e`) instead of readable project titles (such as *"NH-44 Widening & Strengthening"*).

### Data Flow Trace & Root Cause Analysis
1. **Database Schema (`projects` table):**
   - Contains 1,981 project records.
   - Primary key column: `id` (VARCHAR UUID e.g. `87dffb25-cb07-434d-8b2d-c0ac1aa2ee2e`).
   - Project code column: `project_id` (VARCHAR human-readable code e.g. `INF0001`).
   - Project name column: `project_name` (TEXT readable project name e.g. *"NH-44 Widening & Strengthening"*).
2. **SQLAlchemy Model (`Project` in `backend/app/models/project.py`):**
   - Attribute `Project.project_name` maps to database column `project_name`.
   - Attribute `Project.project_id` maps to database column `project_id`.
   - Attribute `Project.id` maps to database column `id`.
3. **FastAPI Project Endpoint & Schema (`backend/app/schemas/project.py` & `backend/app/api/endpoints/projects.py`):**
   - Schema `ProjectResponse` includes `id: str`, `project_id: str`, `project_name: str`, `ministry: Optional[str]`, `implementing_agency: Optional[str]`.
   - Backend API response payload structure:
     ```json
     {
       "id": "87dffb25-cb07-434d-8b2d-c0ac1aa2ee2e",
       "project_id": "INF0001",
       "project_name": "NH-44 Widening & Strengthening",
       "ministry": "Ministry of Road Transport & Highways",
       "implementing_agency": "NHAI"
     }
     ```
4. **Frontend Root Cause:**
   - The backend API contract was returning `project_name` and `project_id`.
   - However, frontend components (`Projects.tsx`, `Dashboard.tsx`, `RiskRadar.tsx`, `TopBar.tsx`, `ExecutiveView.tsx`, `ProjectDossier.tsx`) were querying `proj.name` instead of `proj.project_name`.
   - Because `proj.name` evaluated to `undefined`, fallback evaluation logic fell back to `proj.id` (the database primary key UUID).

---

## 2. Actual Database & API Metadata

- **Actual Database Field for Project Name:** `project_name`
- **Actual Database Field for Human-Readable Code:** `project_id`
- **Actual Database Field for Primary Key UUID:** `id`
- **Total Records Audited in Database:** 1,981 project records
- **Number of Records with Missing Names (`project_name` IS NULL or empty):** `0` records (100% of projects in the database have valid, non-null project names).
- **API Response Payload:** Preserved existing backend API contract without modification.

---

## 3. Files Modified

| File Path | Description of Changes |
| :--- | :--- |
| [`frontend/src/pages/Projects.tsx`](file:///c:/Users/harsh/OneDrive/Desktop/INFRALYTIX/frontend/src/pages/Projects.tsx) | Updated Projects Directory table column to display `proj.project_name \|\| proj.name \|\| 'Project name unavailable'` on primary line and `proj.project_id` with `proj.ministry` / `proj.implementing_agency` on secondary line. Preserved `proj.id` for navigation and row keys. |
| [`frontend/src/pages/Dashboard.tsx`](file:///c:/Users/harsh/OneDrive/Desktop/INFRALYTIX/frontend/src/pages/Dashboard.tsx) | Updated Dashboard project cards and tables to display `proj.project_name` as title and `proj.project_id` for subtitle badges. |
| [`frontend/src/pages/RiskRadar.tsx`](file:///c:/Users/harsh/OneDrive/Desktop/INFRALYTIX/frontend/src/pages/RiskRadar.tsx) | Updated Risk Radar table row primary title to use `proj.project_name` and sub-text to display `proj.project_id`. |
| [`frontend/src/components/layout/TopBar.tsx`](file:///c:/Users/harsh/OneDrive/Desktop/INFRALYTIX/frontend/src/components/layout/TopBar.tsx) | Updated TopBar live search dropdown results list to render `proj.project_name` and `proj.project_id`. |
| [`frontend/src/components/dashboard/ExecutiveView.tsx`](file:///c:/Users/harsh/OneDrive/Desktop/INFRALYTIX/frontend/src/components/dashboard/ExecutiveView.tsx) | Updated Executive View deteriorating project items to render `project_name` and `project_id`. |
| [`frontend/src/pages/ProjectDossier.tsx`](file:///c:/Users/harsh/OneDrive/Desktop/INFRALYTIX/frontend/src/pages/ProjectDossier.tsx) | Updated Project Dossier page header to display `project.project_name` and `project.project_id` badge while retaining original `projectId` route param. |

---

## 4. Layout & Display Format Compliance

### Projects Directory Table Column Structure

**Primary Line:**  
`[Actual Project Name]` (e.g., *"NH-44 Widening & Strengthening"*)

**Secondary Line:**  
`[Project ID] • [Ministry / Implementing Agency]` (e.g., `"INF0001 • Ministry of Road Transport & Highways"`)

**Fallback Behavior:**  
If a project record ever lacks a `project_name`, the frontend displays `"Project name unavailable"` instead of leaking a UUID string into the visible title cell.

---

## 5. Verification & Test Results

### 1. Database Audit
- Audited 1,981 project rows in SQLite database (`infralytix.db`).
- **Result:** `1,981 / 1,981` rows contain valid non-null `project_name` strings. 0 records missing project names.

### 2. Backend API Verification
- Executed `GET /api/v1/projects` via FastAPI backend server.
- **Result:** Responses correctly deliver `project_name`, `project_id`, `id`, `ministry`, and `implementing_agency`. 44/44 unit and API integration tests passed cleanly in pytest (`10.39s`).

### 3. Frontend Production Build & Type Check
- Ran `npm run build` (`tsc && vite build`) in `frontend/`.
- **Result:** 0 TypeScript errors. Clean bundle output generated in `dist/` in 1.15s.

### 4. Navigation & Route Integrity
- Verified clicking project rows or search result items triggers `navigate('/projects/${proj.id}')`.
- Project Dossiers load cleanly using the underlying database ID without breaking existing routes or ML model inference calls.

### 5. Search, Filter, Sort & Pagination
- Search filters by `project_name`, `project_id`, `ministry`, `implementing_agency`, and `sector`.
- Filters, sorting, and pagination work seamlessly.

---

## 6. Remaining Issues

- **None.** The project name display fix has been applied root-cause style across all affected frontend components, preserving all backend models, database schemas, ML features, and application routes.
