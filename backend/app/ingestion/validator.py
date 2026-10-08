from typing import List, Dict, Any, Tuple
from datetime import datetime

OFFICIAL_STATES = {
    "Uttar Pradesh", "Maharashtra", "Gujarat", "Rajasthan", "Tamil Nadu",
    "Karnataka", "Madhya Pradesh", "Andhra Pradesh", "West Bengal", "Bihar",
    "Odisha", "Telangana", "Kerala", "Jharkhand", "Assam", "Punjab",
    "Haryana", "Chhattisgarh", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir",
    "Goa", "Tripura", "Meghalaya", "Manipur", "Nagaland", "Arunachal Pradesh",
    "Mizoram", "Sikkim", "Delhi", "Puducherry", "Chandigarh", "Ladakh",
    "Andaman & Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
}

OFFICIAL_SECTORS = {
    "Transport & Logistics", "Energy", "Water & Sanitation",
    "Communication", "Social & Commercial", "Others"
}

class DatasetValidator:
    def __init__(self):
        self.null_count = 0
        self.duplicate_count = 0
        self.type_error_count = 0
        self.integrity_error_count = 0
        self.consistency_error_count = 0
        self.issues = []

    def validate_dataset(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        self.null_count = 0
        self.duplicate_count = 0
        self.type_error_count = 0
        self.integrity_error_count = 0
        self.consistency_error_count = 0
        self.issues = []

        seen_ids = set()
        total_cells = len(records) * len(records[0].keys()) if records else 1

        for idx, row in enumerate(records):
            # 1. Null Checks
            for k, v in row.items():
                if v is None or str(v).strip() == "" or str(v).lower() in ("nan", "null", "none"):
                    self.null_count += 1
                    self.issues.append({"row": idx, "field": k, "issue": "NULL_OR_BLANK_VALUE"})

            # 2. Duplicate Check
            pid = str(row.get("project_id", "")).strip()
            if pid in seen_ids:
                self.duplicate_count += 1
                self.issues.append({"row": idx, "field": "project_id", "issue": f"DUPLICATE_PROJECT_ID: {pid}"})
            if pid:
                seen_ids.add(pid)

            # 3. Numeric & Range Validation
            try:
                prog = float(row.get("progress_percentage", 0.0))
                if prog < 0.0 or prog > 100.0:
                    self.type_error_count += 1
                    self.issues.append({"row": idx, "field": "progress_percentage", "issue": "OUT_OF_BOUNDS_PROGRESS"})
            except ValueError:
                self.type_error_count += 1

            try:
                orig_cost = float(row.get("original_cost", 0.0))
                rev_cost = float(row.get("current_cost", orig_cost))
                exp = float(row.get("expenditure", 0.0))
                if orig_cost < 0 or rev_cost < 0 or exp < 0:
                    self.type_error_count += 1
                    self.issues.append({"row": idx, "field": "cost_fields", "issue": "NEGATIVE_COST_OR_EXPENDITURE"})
                if exp > rev_cost * 1.5:
                    self.consistency_error_count += 1
                    self.issues.append({"row": idx, "field": "expenditure", "issue": "EXCESSIVE_EXPENDITURE_MISMATCH"})
            except ValueError:
                self.type_error_count += 1

            # 4. State & Sector Integrity
            state = str(row.get("state", "")).strip()
            if state and state not in OFFICIAL_STATES:
                self.integrity_error_count += 1
                self.issues.append({"row": idx, "field": "state", "issue": f"INVALID_STATE: {state}"})

            sector = str(row.get("sector", "")).strip()
            if sector and sector not in OFFICIAL_SECTORS:
                self.integrity_error_count += 1
                self.issues.append({"row": idx, "field": "sector", "issue": f"INVALID_SECTOR: {sector}"})

            # 5. Date Consistency
            start_str = str(row.get("start_date", "")).strip()
            target_str = str(row.get("target_date", "")).strip()
            try:
                start_dt = datetime.strptime(start_str, "%Y-%m-%d")
                target_dt = datetime.strptime(target_str, "%Y-%m-%d")
                if target_dt < start_dt:
                    self.consistency_error_count += 1
                    self.issues.append({"row": idx, "field": "target_date", "issue": "TARGET_DATE_BEFORE_START_DATE"})
            except Exception:
                pass

        total_errors = self.null_count + self.duplicate_count + self.type_error_count + self.integrity_error_count + self.consistency_error_count
        completeness = max(0.0, round((1.0 - (self.null_count / max(1, total_cells))) * 100.0, 2))
        quality_score = max(0.0, round((1.0 - (total_errors / max(1, total_cells))) * 100.0, 2))
        ml_readiness = 100.0 if total_errors == 0 else max(50.0, round(quality_score * 0.95, 2))

        return {
            "is_valid": total_errors == 0,
            "total_records": len(records),
            "total_errors": total_errors,
            "null_values_count": self.null_count,
            "duplicate_rows_count": self.duplicate_count,
            "type_errors_count": self.type_error_count,
            "integrity_errors_count": self.integrity_error_count,
            "consistency_errors_count": self.consistency_error_count,
            "completeness_score": completeness,
            "quality_score": quality_score,
            "ml_readiness_score": ml_readiness,
            "issues_sample": self.issues[:20]
        }
