import re
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import CopilotRequest, CopilotResponse
from backend.app.services.gemini_service import gemini_service

router = APIRouter(prefix="/copilot", tags=["AI Governance Copilot"])

STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh"
]

SECTORS = [
    "Highways", "Roads", "Road Transport", "Railways", "Power", "Energy",
    "Renewables", "Petroleum", "Urban Transit", "Metro", "Water", "Ports", "Telecom"
]

MINISTRIES = [
    "MoRTH", "NHAI", "Railways", "RVNL", "Power", "NTPC", "Petroleum", "MoPNG",
    "Housing and Urban Affairs", "MoHUA", "Shipping", "Ports"
]

def _finalize_copilot_response(
    raw_query: str,
    intent: str,
    answer_fallback: str,
    citations: List[Dict[str, Any]],
    actions: List[Dict[str, str]],
    context_data: Dict[str, Any]
) -> CopilotResponse:
    """
    Routes query through Gemini AI when available.
    Falls back seamlessly to local deterministic RAG if Gemini is unavailable, rate-limited, or disabled.
    """
    if gemini_service.is_available():
        context_data["intent"] = intent
        context_data["citations"] = citations
        gemini_res = gemini_service.generate_copilot_response(raw_query, context_data)
        if gemini_res:
            return CopilotResponse(
                answer=gemini_res["answer"],
                intent=intent,
                citations=citations,
                suggested_actions=actions,
                is_offline=False,
                engine_mode=gemini_res.get("engine_mode", "GEMINI_LLM")
            )

    return CopilotResponse(
        answer=answer_fallback,
        intent=intent,
        citations=citations,
        suggested_actions=actions,
        is_offline=True,
        engine_mode="LOCAL_RAG_DETERMINISTIC"
    )

@router.post("/query", response_model=CopilotResponse)
def query_copilot(payload: CopilotRequest, db: Session = Depends(get_db)):
    """
    Hybrid AI Governance Copilot:
    Uses Google Gemini AI as an additive reasoning layer when available.
    Falls back seamlessly to Offline Deterministic Local RAG over SQLite database.
    """
    raw_query = (payload.query or "").strip()
    query_lower = raw_query.lower()
    
    # 1. Check for Project IDs in query or payload
    extracted_pids = re.findall(r'\b(PRJ\d+|INF\d+)\b', raw_query, re.IGNORECASE)
    extracted_pids = [p.upper() for p in extracted_pids]
    if payload.project_id and payload.project_id.upper() not in extracted_pids:
        extracted_pids.insert(0, payload.project_id.upper())

    # Check for State mentions
    matched_state = None
    for state in STATES:
        if state.lower() in query_lower:
            matched_state = state
            break

    # Check for Sector mentions
    matched_sector = None
    for sector in SECTORS:
        if sector.lower() in query_lower:
            matched_sector = sector
            break

    # =========================================================================
    # INTENT 1: PROJECT COMPARISON (2 or more projects)
    # =========================================================================
    if len(extracted_pids) >= 2 or ("compare" in query_lower and len(extracted_pids) >= 1):
        pids_to_fetch = extracted_pids[:2]
        if len(pids_to_fetch) == 1:
            base_p = db.query(Project).filter(Project.project_id == pids_to_fetch[0]).first()
            if base_p:
                other_p = db.query(Project).filter(
                    Project.sector == base_p.sector,
                    Project.project_id != base_p.project_id,
                    Project.is_deleted == False
                ).order_by(Project.delay_days.desc()).first()
                if other_p:
                    pids_to_fetch.append(other_p.project_id)

        projects = db.query(Project).filter(Project.project_id.in_(pids_to_fetch)).all()
        if len(projects) < 2:
            projects = db.query(Project).filter(Project.is_deleted == False).limit(2).all()

        if len(projects) >= 2:
            p1, p2 = projects[0], projects[1]
            p1_overrun = round(((p1.current_cost - p1.original_cost) / max(p1.original_cost, 1.0)) * 100, 1)
            p2_overrun = round(((p2.current_cost - p2.original_cost) / max(p2.original_cost, 1.0)) * 100, 1)

            answer = f"""Here's a comparison between these two projects:

| | {p1.project_id} | {p2.project_id} |
| :--- | :--- | :--- |
| Name | {p1.project_name} | {p2.project_name} |
| Sector | {p1.sector} | {p2.sector} |
| State | {p1.state} | {p2.state} |
| Cost | ₹{p1.current_cost:,.1f} Cr (+{p1_overrun}%) | ₹{p2.current_cost:,.1f} Cr (+{p2_overrun}%) |
| Delay | {p1.delay_days} days | {p2.delay_days} days |
| Progress | {p1.progress_percentage:.1f}% | {p2.progress_percentage:.1f}% |
| Risk | {p1.risk_level} | {p2.risk_level} |

**{p1.project_id if p1.progress_percentage > p2.progress_percentage else p2.project_id}** is ahead on physical progress ({max(p1.progress_percentage, p2.progress_percentage):.1f}%). **{p1.project_id if p1.delay_days > p2.delay_days else p2.project_id}** has a larger delay ({max(p1.delay_days, p2.delay_days)} days) and should be reviewed first."""

            citations = [
                {"project_id": p.project_id, "project_name": p.project_name, "cost_cr": p.current_cost, "delay_days": p.delay_days, "risk": p.risk_level}
                for p in [p1, p2]
            ]
            actions = [
                {"label": f"Dossier: {p1.project_id}", "link": f"/projects/{p1.project_id}"},
                {"label": f"Dossier: {p2.project_id}", "link": f"/projects/{p2.project_id}"},
                {"label": "Simulate Interventions", "link": "/simulator"}
            ]

            context_data = {
                "p1": {"project_id": p1.project_id, "name": p1.project_name, "cost": p1.current_cost, "delay": p1.delay_days, "risk": p1.risk_level},
                "p2": {"project_id": p2.project_id, "name": p2.project_name, "cost": p2.current_cost, "delay": p2.delay_days, "risk": p2.risk_level}
            }

            return _finalize_copilot_response(
                raw_query=raw_query,
                intent="PROJECT_COMPARISON",
                answer_fallback=answer,
                citations=citations,
                actions=actions,
                context_data=context_data
            )

    # =========================================================================
    # INTENT 2: SINGLE PROJECT DEEP DIVE / RISK EXPLANATION
    # =========================================================================
    if len(extracted_pids) == 1 or ("project" in query_lower and any(kw in query_lower for kw in ["summary", "detail", "tell me about", "why", "risk", "status"])):
        project = None
        if extracted_pids:
            project = db.query(Project).filter(Project.project_id == extracted_pids[0]).first()
        if not project and "prj" not in query_lower:
            words = [w for w in raw_query.split() if len(w) > 4 and w.lower() not in ["project", "status", "about", "explain", "detail"]]
            if words:
                project = db.query(Project).filter(Project.project_name.ilike(f"%{words[0]}%"), Project.is_deleted == False).first()

        if not project:
            project = db.query(Project).filter(Project.is_deleted == False).first()

        if project:
            overrun_cr = max(0.0, project.current_cost - project.original_cost)
            overrun_pct = round((overrun_cr / max(project.original_cost, 1.0)) * 100, 1)
            delay_mos = round(project.delay_days / 30.4, 1)

            sector_l = (project.sector or "").lower()
            if "road" in sector_l or "highway" in sector_l:
                root_cause = "Stage-II Forest clearance renewal & multi-district Right-of-Way (RoW) acquisition dispute."
            elif "rail" in sector_l or "metro" in sector_l:
                root_cause = "Urban land transfer friction & overhead traction interlocking synchronization."
            elif "power" in sector_l or "energy" in sector_l:
                root_cause = "Grid evacuation substation substation commissioning & environmental buffer zone approval."
            else:
                root_cause = "Contractor workforce remobilization deficit and working capital constraints."

            answer = f"""**{project.project_name}** ({project.project_id})

- Status: {project.status}
- Risk: {project.risk_level}
- Location: {project.state}{f', {project.district}' if project.district else ''} | Sector: {project.sector}
- Cost: ₹{project.original_cost:,.1f} Cr approved → ₹{project.current_cost:,.1f} Cr current (+₹{overrun_cr:,.1f} Cr, {overrun_pct}% over budget)
- Spent so far: ₹{project.expenditure:,.1f} Cr ({round((project.expenditure/max(project.current_cost, 1.0))*100, 1)}% of budget used)
- Delay: {project.delay_days} days ({delay_mos} months behind schedule)
- Physical progress: {project.progress_percentage:.1f}% complete

This project is {project.risk_level.lower()} risk. It needs close monitoring and a clear plan to recover the schedule."""

            citations = [{
                "project_id": project.project_id,
                "project_name": project.project_name,
                "cost_cr": project.current_cost,
                "delay_days": project.delay_days,
                "risk": project.risk_level
            }]
            actions = [
                {"label": "Open 360° Dossier", "link": f"/projects/{project.project_id}"},
                {"label": "Simulate Interventions", "link": "/simulator"},
                {"label": "View Early Warnings", "link": "/early-warnings"}
            ]

            context_data = {
                "project_id": project.project_id,
                "project_name": project.project_name,
                "sector": project.sector,
                "state": project.state,
                "ministry": project.ministry,
                "original_cost": project.original_cost,
                "current_cost": project.current_cost,
                "expenditure": project.expenditure,
                "delay_days": project.delay_days,
                "progress_percentage": project.progress_percentage,
                "risk_level": project.risk_level
            }

            return _finalize_copilot_response(
                raw_query=raw_query,
                intent="PROJECT_SUMMARY",
                answer_fallback=answer,
                citations=citations,
                actions=actions,
                context_data=context_data
            )

    # =========================================================================
    # INTENT 3: STATE ANALYSIS (e.g. "Why is Rajasthan risk increasing?")
    # =========================================================================
    if matched_state or "state" in query_lower:
        state_name = matched_state or "Rajasthan"
        state_projects = db.query(Project).filter(
            Project.state.ilike(f"%{state_name}%"),
            Project.is_deleted == False
        ).order_by(Project.delay_days.desc()).all()

        if not state_projects:
            state_projects = db.query(Project).filter(Project.is_deleted == False).order_by(Project.delay_days.desc()).limit(3).all()

        if state_projects:
            total_st_proj = len(state_projects)
            total_st_cost = sum(p.current_cost for p in state_projects)
            avg_st_delay = round(sum(p.delay_days for p in state_projects) / max(total_st_proj, 1), 1)
            critical_st = [p for p in state_projects if p.risk_level == "Critical"]
            high_st = [p for p in state_projects if p.risk_level == "High"]

            top_critical = state_projects[:4]

            proj_table = "\n".join([
                f"| **{p.project_id}** | {p.project_name[:38]}... | ₹{p.current_cost:,.1f} Cr | {p.delay_days}d ({round(p.delay_days/30.4, 1)}m) | **{p.risk_level}** |"
                for p in top_critical
            ])

            answer = f"""{state_name} has {total_st_proj} monitored projects with a total outlay of ₹{total_st_cost:,.0f} Crore. On average, projects are delayed by {avg_st_delay} days. There are {len(critical_st)} critical-risk and {len(high_st)} high-risk projects.

Projects needing the most attention:

| ID | Name | Cost | Delay | Risk |
| :--- | :--- | :--- | :--- | :--- |
{proj_table}

Common issues include land acquisition delays, contractor funding problems, and slow approvals for utility shifts. Review the critical projects and set clear deadlines for each."""

            citations = [
                {"project_id": p.project_id, "project_name": p.project_name, "cost_cr": p.current_cost, "delay_days": p.delay_days, "risk": p.risk_level}
                for p in top_critical
            ]
            actions = [
                {"label": "Filter on Map Intelligence", "link": "/map"},
                {"label": "View Alert Center", "link": "/early-warnings"},
                {"label": "Download State Report", "link": "/reports"}
            ]

            context_data = {
                "state_name": state_name,
                "total_projects": total_st_proj,
                "total_cost_cr": total_st_cost,
                "average_delay_days": avg_st_delay,
                "critical_count": len(critical_st),
                "top_critical_projects": [p.project_id for p in top_critical]
            }

            return _finalize_copilot_response(
                raw_query=raw_query,
                intent="STATE_ANALYSIS",
                answer_fallback=answer,
                citations=citations,
                actions=actions,
                context_data=context_data
            )

    # =========================================================================
    # INTENT 4: TOP CRITICAL / 10 PROJECTS NEEDING INTERVENTION
    # =========================================================================
    if any(kw in query_lower for kw in ["top 10", "top projects", "critical", "needing intervention", "worst", "highest risk", "most delayed"]):
        critical_projects = db.query(Project).filter(
            Project.is_deleted == False,
            Project.status != "Completed"
        ).order_by(Project.delay_days.desc(), Project.current_cost.desc()).limit(10).all()

        total_capex = sum(p.current_cost for p in critical_projects)

        table_rows = "\n".join([
            f"| **{i+1}** | **{p.project_id}** | {p.project_name[:36]}... | {p.sector} | ₹{p.current_cost:,.1f} Cr | {p.delay_days}d | **{p.risk_level}** |"
            for i, p in enumerate(critical_projects)
        ])

        answer = f"""Here are the 10 projects that need the most attention right now, based on delay and cost:

| # | ID | Name | Sector | Cost | Delay | Risk |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
{table_rows}

Total outlay for these 10 projects: ₹{total_capex:,.0f} Crore.

Suggested next steps:
- Open each project's detail page to check the specific issues.
- Focus on the highest-delay projects first and assign recovery deadlines.
- Use the Early Warnings page to see which ones have active alerts."""

        citations = [
            {"project_id": p.project_id, "project_name": p.project_name, "cost_cr": p.current_cost, "delay_days": p.delay_days, "risk": p.risk_level}
            for p in critical_projects[:5]
        ]
        actions = [
            {"label": "Executive Command Center", "link": "/dashboard"},
            {"label": "Early Warning Queues", "link": "/early-warnings"},
            {"label": "Generate Cabinet Memo", "link": "/reports"}
        ]

        context_data = {
            "total_capex_at_stake": total_capex,
            "top_projects": [p.project_id for p in critical_projects]
        }

        return _finalize_copilot_response(
            raw_query=raw_query,
            intent="TOP_CRITICAL",
            answer_fallback=answer,
            citations=citations,
            actions=actions,
            context_data=context_data
        )

    # =========================================================================
    # INTENT 5: 2030 TARGETS / STRATEGIC CORRIDORS (PM GatiShakti)
    # =========================================================================
    if any(kw in query_lower for kw in ["2030", "gatishakti", "target", "vision", "strategic corridor"]):
        strategic = db.query(Project).filter(
            Project.is_deleted == False,
            Project.current_cost >= 1000.0,
            Project.delay_days >= 180
        ).order_by(Project.current_cost.desc()).limit(6).all()

        total_threatened_capex = sum(p.current_cost for p in strategic)

        table_rows = "\n".join([
            f"| **{p.project_id}** | {p.project_name[:36]}... | {p.sector} | ₹{p.current_cost:,.1f} Cr | {p.delay_days}d delay | **{p.risk_level}** |"
            for p in strategic
        ])

        answer = f"""These are the largest projects (over ₹{1000:.0f} Crore) that are seriously delayed (6+ months) and could affect national infrastructure targets:

| ID | Name | Sector | Cost | Delay | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
{table_rows}

Total outlay at risk: ₹{total_threatened_capex:,.0f} Crore across {len(strategic)} major projects.

To get back on track: review each project's specific delays, confirm what approvals are still pending, and set firm deadlines for resolving them."""

        citations = [
            {"project_id": p.project_id, "project_name": p.project_name, "cost_cr": p.current_cost, "delay_days": p.delay_days, "risk": p.risk_level}
            for p in strategic
        ]
        actions = [
            {"label": "Inspect on Map Intelligence", "link": "/map"},
            {"label": "Executive Dashboard", "link": "/dashboard"},
            {"label": "Generate Strategic Report", "link": "/reports"}
        ]

        context_data = {
            "total_threatened_capex": total_threatened_capex,
            "strategic_corridors": [p.project_id for p in strategic]
        }

        return _finalize_copilot_response(
            raw_query=raw_query,
            intent="2030_TARGETS",
            answer_fallback=answer,
            citations=citations,
            actions=actions,
            context_data=context_data
        )

    # =========================================================================
    # INTENT 6: DEFAULT PORTFOLIO BRIEFING (ZERO-HALLUCINATION FALLBACK)
    # =========================================================================
    total_proj = db.query(Project).filter(Project.is_deleted == False).count()
    delayed_proj = db.query(Project).filter(Project.is_deleted == False, Project.delay_days > 0).count()
    critical_proj = db.query(Project).filter(Project.is_deleted == False, Project.risk_level == "Critical").count()
    high_proj = db.query(Project).filter(Project.is_deleted == False, Project.risk_level == "High").count()

    cur_sum = db.query(func.sum(Project.current_cost)).filter(Project.is_deleted == False).scalar() or 0.0
    orig_sum = db.query(func.sum(Project.original_cost)).filter(Project.is_deleted == False).scalar() or 0.0
    avg_delay = db.query(func.avg(Project.delay_days)).filter(Project.is_deleted == False).scalar() or 0.0

    sample_critical = db.query(Project).filter(
        Project.is_deleted == False,
        Project.risk_level == "Critical"
    ).order_by(Project.delay_days.desc()).limit(3).all()

    cost_overrun_total = max(0.0, float(cur_sum) - float(orig_sum))

    answer = f"""Here's a quick overview of all {total_proj:,} monitored infrastructure projects:

- Total current outlay: ₹{float(cur_sum):,.0f} Crore
- Cost over original budget: ₹{cost_overrun_total:,.0f} Crore
- Average delay: {float(avg_delay):.0f} days ({round(float(avg_delay)/30.4, 1)} months)
- Projects at critical risk: {critical_proj} ({round(critical_proj/max(total_proj,1)*100, 1)}%)
- Projects at high risk: {high_proj}
- Delayed projects: {delayed_proj} out of {total_proj}

Some critical projects to look at first:
""" + "\n".join([
        f"- {p.project_id}: {p.project_name[:45]} — {p.delay_days} days delayed, ₹{p.current_cost:,.0f} Cr, {p.risk_level} risk"
        for p in sample_critical
    ]) + """\n\nTry asking about a specific project (e.g. 'Tell me about PRJ0671'), a state, or a sector for more detail."""

    citations = [
        {"project_id": p.project_id, "project_name": p.project_name, "cost_cr": p.current_cost, "delay_days": p.delay_days, "risk": p.risk_level}
        for p in sample_critical
    ]
    actions = [
        {"label": "Executive Command Center", "link": "/dashboard"},
        {"label": "Early Warning Queues", "link": "/early-warnings"},
        {"label": "Risk Monitor", "link": "/radar"}
    ]

    context_data = {
        "total_projects": total_proj,
        "critical_projects": critical_proj,
        "average_delay_days": round(float(avg_delay), 1)
    }

    return _finalize_copilot_response(
        raw_query=raw_query,
        intent="PORTFOLIO_OVERVIEW",
        answer_fallback=answer,
        citations=citations,
        actions=actions,
        context_data=context_data
    )
