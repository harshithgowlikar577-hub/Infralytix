from typing import List, Dict, Any
from datetime import datetime, timedelta

OFFICIAL_STATES_LIST = [
    "Uttar Pradesh", "Maharashtra", "Gujarat", "Rajasthan", "Tamil Nadu",
    "Karnataka", "Madhya Pradesh", "Andhra Pradesh", "West Bengal", "Bihar",
    "Odisha", "Telangana", "Kerala", "Jharkhand", "Assam", "Punjab",
    "Haryana", "Chhattisgarh", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir",
    "Goa", "Tripura", "Meghalaya", "Manipur", "Nagaland", "Arunachal Pradesh",
    "Mizoram", "Sikkim", "Delhi", "Puducherry", "Chandigarh", "Ladakh",
    "Andaman & Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
]

class DatasetCleaner:
    def __init__(self):
        self.corrections = []

    def clean_dataset(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        self.corrections = []
        cleaned = []
        seen_ids = set()

        for idx, row in enumerate(records):
            clean_row = dict(row)
            
            # 1. Project ID & Duplicates
            pid = str(clean_row.get("project_id", "")).strip()
            if not pid or pid in seen_ids:
                new_pid = f"PRJ{len(seen_ids)+1:04d}"
                self.corrections.append({"row": idx, "field": "project_id", "from": pid, "to": new_pid, "reason": "Missing or duplicate ID"})
                pid = new_pid
            seen_ids.add(pid)
            clean_row["project_id"] = pid

            # 2. Project Name
            pname = str(clean_row.get("project_name", "")).strip()
            if not pname or pname.lower() in ("nan", "null"):
                clean_row["project_name"] = f"National Infrastructure Development {pid}"
                self.corrections.append({"row": idx, "field": "project_name", "action": "Populated default title"})

            # 3. Ministry & Sector
            min_name = str(clean_row.get("ministry", "")).strip()
            if not min_name or min_name.lower() in ("nan", "null"):
                clean_row["ministry"] = "Ministry of Road Transport & Highways"
            
            sector = str(clean_row.get("sector", "")).strip()
            if not sector or sector.lower() in ("nan", "null"):
                clean_row["sector"] = "Transport & Logistics"

            # 4. State
            state = str(clean_row.get("state", "")).strip()
            if not state or state not in OFFICIAL_STATES_LIST:
                clean_row["state"] = "Uttar Pradesh"
                self.corrections.append({"row": idx, "field": "state", "from": state, "to": "Uttar Pradesh", "reason": "Standardized official state"})

            # 5. Costs & Expenditure
            try:
                orig_cost = max(10.0, float(clean_row.get("original_cost", 100.0)))
            except (ValueError, TypeError):
                orig_cost = 100.0
            
            try:
                cur_cost = max(orig_cost, float(clean_row.get("current_cost", orig_cost)))
            except (ValueError, TypeError):
                cur_cost = orig_cost * 1.05

            try:
                exp = max(0.0, min(cur_cost, float(clean_row.get("expenditure", cur_cost * 0.45))))
            except (ValueError, TypeError):
                exp = cur_cost * 0.45

            clean_row["original_cost"] = round(orig_cost, 2)
            clean_row["current_cost"] = round(cur_cost, 2)
            clean_row["expenditure"] = round(exp, 2)

            # 6. Dates
            start_str = str(clean_row.get("start_date", "")).strip()
            try:
                start_dt = datetime.strptime(start_str, "%Y-%m-%d")
            except Exception:
                start_dt = datetime(2023, 1, 15)
                clean_row["start_date"] = "2023-01-15"

            target_str = str(clean_row.get("target_date", "")).strip()
            try:
                target_dt = datetime.strptime(target_str, "%Y-%m-%d")
                if target_dt < start_dt:
                    target_dt = start_dt + timedelta(days=1095)
                    clean_row["target_date"] = target_dt.strftime("%Y-%m-%d")
            except Exception:
                target_dt = start_dt + timedelta(days=1095)
                clean_row["target_date"] = target_dt.strftime("%Y-%m-%d")

            # 7. Progress & Status
            try:
                prog = max(0.0, min(100.0, float(clean_row.get("progress_percentage", 0.0))))
            except (ValueError, TypeError):
                prog = 0.0
            clean_row["progress_percentage"] = round(prog, 1)

            status = str(clean_row.get("status", "In Progress")).strip()
            if status not in ["In Progress", "Completed", "Delayed", "Stalled"]:
                status = "In Progress"
            if status == "Completed":
                clean_row["progress_percentage"] = 100.0
                clean_row["financial_percentage"] = 100.0
            clean_row["status"] = status

            cleaned.append(clean_row)

        return cleaned
