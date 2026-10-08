import json
import time
import urllib.request
import urllib.parse
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def make_req(endpoint, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    url = f"{BASE_URL}{endpoint}"
    req_data = None
    if data is not None:
        if isinstance(data, dict):
            req_data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, (bytes, bytearray)):
            req_data = data
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            latency = round((time.time() - t0) * 1000, 1)
            body = resp.read().decode("utf-8")
            try:
                parsed = json.loads(body)
            except Exception:
                parsed = body
            return resp.status, latency, parsed
    except urllib.error.HTTPError as e:
        latency = round((time.time() - t0) * 1000, 1)
        err_body = e.read().decode("utf-8", errors="ignore")
        return e.code, latency, err_body
    except Exception as e:
        latency = round((time.time() - t0) * 1000, 1)
        return 0, latency, str(e)

def audit_apis():
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "endpoints_tested": 0,
        "passed": 0,
        "failed": 0,
        "details": []
    }

    # 1. Health
    code, lat, body = make_req("/health")
    report["endpoints_tested"] += 1
    if code == 200 and isinstance(body, dict) and body.get("status") == "HEALTHY":
        report["passed"] += 1
        report["details"].append({"endpoint": "/health", "status": "PASS", "code": 200, "latency_ms": lat})
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/health", "status": "FAIL", "code": code, "latency_ms": lat, "resp": str(body)[:100]})

    # 2. Login
    code, lat, body = make_req("/api/v1/auth/login", method="POST", data={"email": "admin@infralytix.gov.in", "password": "Infralytix2026!"})
    token = None
    report["endpoints_tested"] += 1
    if code == 200 and isinstance(body, dict) and "access_token" in body:
        token = body["access_token"]
        report["passed"] += 1
        report["details"].append({"endpoint": "/api/v1/auth/login", "status": "PASS", "code": 200, "latency_ms": lat})
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/api/v1/auth/login", "status": "FAIL", "code": code, "latency_ms": lat, "resp": str(body)[:100]})

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 3. Dashboard
    code, lat, body = make_req("/api/v1/analytics/dashboard", headers=headers)
    report["endpoints_tested"] += 1
    if code == 200 and isinstance(body, dict):
        report["passed"] += 1
        report["details"].append({
            "endpoint": "/api/v1/analytics/dashboard",
            "status": "PASS",
            "code": 200,
            "latency_ms": lat,
            "total_projects": body.get("total_projects"),
            "delayed_projects": body.get("delayed_projects_count") or body.get("critical_projects")
        })
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/api/v1/analytics/dashboard", "status": "FAIL", "code": code, "latency_ms": lat})

    # 4. Projects list & limit & filters
    code, lat, body = make_req("/api/v1/projects?limit=10", headers=headers)
    first_pid = None
    report["endpoints_tested"] += 1
    if code == 200:
        items = body.get("projects") or body.get("items") or (body if isinstance(body, list) else [])
        if items:
            first_pid = items[0].get("id") or items[0].get("project_id")
        report["passed"] += 1
        report["details"].append({"endpoint": "/api/v1/projects?limit=10", "status": "PASS", "code": 200, "latency_ms": lat, "count": len(items)})
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/api/v1/projects?limit=10", "status": "FAIL", "code": code, "latency_ms": lat})

    # 5. Project single item dossier
    if first_pid:
        code, lat, body = make_req(f"/api/v1/projects/{first_pid}", headers=headers)
        report["endpoints_tested"] += 1
        if code == 200:
            report["passed"] += 1
            report["details"].append({"endpoint": f"/api/v1/projects/{first_pid}", "status": "PASS", "code": 200, "latency_ms": lat})
        else:
            report["failed"] += 1
            report["details"].append({"endpoint": f"/api/v1/projects/{first_pid}", "status": "FAIL", "code": code, "latency_ms": lat})

    # 6. Sector Analytics (/api/v1/analytics/sector)
    code, lat, body = make_req("/api/v1/analytics/sector", headers=headers)
    report["endpoints_tested"] += 1
    if code == 200:
        sectors = body.get("sectors") or (body if isinstance(body, list) else [])
        report["passed"] += 1
        report["details"].append({"endpoint": "/api/v1/analytics/sector", "status": "PASS", "code": 200, "latency_ms": lat, "sector_count": len(sectors)})
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/api/v1/analytics/sector", "status": "FAIL", "code": code, "latency_ms": lat})

    # 7. Ministry Analytics (/api/v1/analytics/ministry)
    code, lat, body = make_req("/api/v1/analytics/ministry", headers=headers)
    report["endpoints_tested"] += 1
    if code == 200:
        ministries = body.get("ministries") or (body if isinstance(body, list) else [])
        report["passed"] += 1
        report["details"].append({"endpoint": "/api/v1/analytics/ministry", "status": "PASS", "code": 200, "latency_ms": lat, "ministry_count": len(ministries)})
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/api/v1/analytics/ministry", "status": "FAIL", "code": code, "latency_ms": lat})

    # 8. Risk Analytics
    code, lat, body = make_req("/api/v1/analytics/risk", headers=headers)
    report["endpoints_tested"] += 1
    if code == 200:
        report["passed"] += 1
        report["details"].append({"endpoint": "/api/v1/analytics/risk", "status": "PASS", "code": 200, "latency_ms": lat})
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/api/v1/analytics/risk", "status": "FAIL", "code": code, "latency_ms": lat})

    # 9. Notifications (authenticated)
    code, lat, body = make_req("/api/v1/notifications", headers=headers)
    report["endpoints_tested"] += 1
    if code == 200:
        report["passed"] += 1
        report["details"].append({"endpoint": "/api/v1/notifications", "status": "PASS", "code": 200, "latency_ms": lat, "unread_count": body.get("unread_count")})
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/api/v1/notifications", "status": "FAIL", "code": code, "latency_ms": lat})

    # 10. Simulation endpoint (/api/v1/simulation/run)
    code, lat, body = make_req(
        "/api/v1/simulation/run",
        method="POST",
        data={
            "project_id": first_pid,
            "manpower_boost_pct": 20.0,
            "budget_increase_pct": 10.0,
            "procurement_delay_removed": True,
            "milestones_expedited_count": 2,
            "efficiency_gain_pct": 5.0
        },
        headers=headers
    )
    report["endpoints_tested"] += 1
    if code == 200:
        report["passed"] += 1
        report["details"].append({"endpoint": "/api/v1/simulation/run", "status": "PASS", "code": 200, "latency_ms": lat})
    else:
        report["failed"] += 1
        report["details"].append({"endpoint": "/api/v1/simulation/run", "status": "FAIL", "code": code, "latency_ms": lat, "resp": str(body)[:100]})

    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    audit_apis()
