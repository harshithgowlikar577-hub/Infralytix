from typing import Dict, List, Any
import re

COLUMN_SYNONYMS = {
    "project_id": ["project_id", "project id", "id", "prj_id", "projectid", "proj_id"],
    "project_name": ["project_name", "project name", "name", "title", "project_title"],
    "ministry": ["ministry", "implementing_ministry", "implementing ministry", "min_name", "dept_ministry"],
    "sector": ["sector", "hml_sector", "sector_name", "category"],
    "state": ["state", "state_name", "state_ut", "province", "location_state"],
    "district": ["district", "district_name", "city", "location_district"],
    "implementing_agency": ["implementing_agency", "agency", "implementing agency", "nodal_agency"],
    "contractor": ["contractor", "epc_contractor", "contractor_name", "builder"],
    "original_cost": ["original_cost", "original_cost_cr", "sanctioned_cost", "approved_cost", "original cost"],
    "current_cost": ["current_cost", "revised_cost", "revised_cost_cr", "latest_cost", "revised cost"],
    "expenditure": ["expenditure", "current_expenditure", "current_expenditure_cr", "cumulative_expenditure", "spend"],
    "start_date": ["start_date", "approved_date", "sanction_date", "commencement_date", "start date"],
    "target_date": ["target_date", "planned_completion_date", "original_completion_date", "target date"],
    "actual_completion_date": ["actual_completion_date", "current_expected_date", "completion_date", "actual completion"],
    "progress_percentage": ["progress_percentage", "physical_progress_pct", "physical_progress", "progress_pct", "progress %"],
    "financial_percentage": ["financial_percentage", "financial_progress_pct", "financial_progress", "financial_pct", "spend %"],
    "delay_days": ["delay_days", "delay", "slippage_days", "time_overrun_days"],
    "status": ["status", "project_status", "current_status", "execution_status"],
    "risk_level": ["risk_level", "risk_band", "risk", "risk_category"],
    "latitude": ["latitude", "lat", "geo_latitude"],
    "longitude": ["longitude", "long", "lng", "geo_longitude"]
}

def auto_detect_and_map_columns(incoming_columns: List[str]) -> Dict[str, str]:
    mapping = {}
    normalized_incoming = {re.sub(r'[^a-zA-Z0-9]', '', col.lower()): col for col in incoming_columns}
    
    for standard_col, synonyms in COLUMN_SYNONYMS.items():
        for syn in synonyms:
            clean_syn = re.sub(r'[^a-zA-Z0-9]', '', syn.lower())
            if clean_syn in normalized_incoming:
                mapping[standard_col] = normalized_incoming[clean_syn]
                break
                
    return mapping
