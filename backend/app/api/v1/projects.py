from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import ProjectOut, ProjectCreate, ProjectUpdate, ProjectListResponse
from backend.app.services.auth_service import get_current_user, require_roles
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/projects", tags=["Project Registry & Explorer"])

@router.get("", response_model=ProjectListResponse)
def list_projects(
    search: Optional[str] = None,
    ministry: Optional[str] = None,
    sector: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search and filter infrastructure projects across ministries, sectors, states, and risk levels.
    """
    query = db.query(Project).filter(Project.is_deleted == False)

    if search:
        search_clean = search.strip()
        query = query.filter(
            Project.project_name.ilike(f"%{search_clean}%") |
            Project.project_id.ilike(f"%{search_clean}%") |
            Project.contractor.ilike(f"%{search_clean}%") |
            Project.ministry.ilike(f"%{search_clean}%") |
            Project.sector.ilike(f"%{search_clean}%") |
            Project.state.ilike(f"%{search_clean}%")
        )
    if ministry:
        query = query.filter(Project.ministry.ilike(f"%{ministry.strip()}%"))
    if sector:
        query = query.filter(Project.sector.ilike(f"%{sector.strip()}%"))
    if state:
        query = query.filter(Project.state.ilike(f"%{state.strip()}%"))
    if status:
        st_clean = status.strip()
        st_lower = st_clean.lower()
        if st_lower in ["delayed", "stalled"]:
            query = query.filter(Project.status == "Delayed")
        elif st_lower in ["in progress", "inprogress", "on_track", "on track", "active"]:
            query = query.filter(Project.status == "In Progress")
        elif st_lower == "completed":
            query = query.filter(Project.status == "Completed")
        elif "," in st_clean:
            statuses = [s.strip() for s in st_clean.split(",")]
            query = query.filter(Project.status.in_(statuses))
        else:
            query = query.filter(Project.status.ilike(f"%{st_clean}%"))

    if risk_level:
        rk_clean = risk_level.strip()
        rk_lower = rk_clean.lower()
        if rk_lower in ["critical"]:
            query = query.filter(Project.risk_level == "Critical")
        elif rk_lower in ["high"]:
            query = query.filter(Project.risk_level == "High")
        elif rk_lower in ["medium"]:
            query = query.filter(Project.risk_level == "Medium")
        elif rk_lower in ["low", "safe"]:
            query = query.filter(Project.risk_level == "Low")
        elif "," in rk_clean:
            levels = [r.strip() for r in rk_clean.split(",")]
            query = query.filter(Project.risk_level.in_(levels))
        else:
            query = query.filter(Project.risk_level.ilike(f"%{rk_clean}%"))

    total = query.count()
    projects = query.order_by(Project.id.asc()).offset((page - 1) * limit).limit(limit).all()

    return ProjectListResponse(
        total_count=total,
        page=page,
        limit=limit,
        projects=projects
    )

@router.get("/gis-markers")
def get_gis_markers(
    search: Optional[str] = None,
    ministry: Optional[str] = None,
    sector: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve authoritative GIS project markers and location accuracy metrics for National GIS Intelligence map.
    """
    query = db.query(Project).filter(Project.is_deleted == False)

    if search:
        search_clean = search.strip()
        query = query.filter(
            Project.project_name.ilike(f"%{search_clean}%") |
            Project.project_id.ilike(f"%{search_clean}%") |
            Project.contractor.ilike(f"%{search_clean}%") |
            Project.ministry.ilike(f"%{search_clean}%") |
            Project.sector.ilike(f"%{search_clean}%") |
            Project.state.ilike(f"%{search_clean}%")
        )
    if ministry:
        query = query.filter(Project.ministry.ilike(f"%{ministry.strip()}%"))
    if sector:
        query = query.filter(Project.sector.ilike(f"%{sector.strip()}%"))
    if state:
        st_clean = state.strip()
        query = query.filter(Project.state.ilike(f"%{st_clean}%"))
    if status:
        st_clean = status.strip()
        st_lower = st_clean.lower()
        if st_lower in ["delayed", "stalled"]:
            query = query.filter(Project.status == "Delayed")
        elif st_lower in ["in progress", "inprogress", "on_track", "on track", "active"]:
            query = query.filter(Project.status == "In Progress")
        elif st_lower == "completed":
            query = query.filter(Project.status == "Completed")
        else:
            query = query.filter(Project.status.ilike(f"%{st_clean}%"))
    if risk_level:
        rk_clean = risk_level.strip()
        rk_lower = rk_clean.lower()
        if rk_lower in ["critical"]:
            query = query.filter(Project.risk_level == "Critical")
        elif rk_lower in ["high"]:
            query = query.filter(Project.risk_level == "High")
        elif rk_lower in ["medium"]:
            query = query.filter(Project.risk_level == "Medium")
        elif rk_lower in ["low", "safe"]:
            query = query.filter(Project.risk_level == "Low")
        else:
            query = query.filter(Project.risk_level.ilike(f"%{rk_clean}%"))

    projects = query.order_by(Project.id.asc()).all()

    markers = []
    valid_coords_count = 0
    missing_coords_count = 0
    invalid_coords_count = 0

    for p in projects:
        lat = p.latitude
        lng = p.longitude
        has_valid_coords = False

        if lat is not None and lng is not None and lat != 0 and lng != 0:
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                valid_coords_count += 1
                has_valid_coords = True
            else:
                invalid_coords_count += 1
        else:
            missing_coords_count += 1

        risk_score = 88 if p.risk_level == "Critical" else (72 if p.risk_level == "High" else (48 if p.risk_level == "Medium" else 22))

        markers.append({
            "id": p.id,
            "project_id": p.project_id,
            "project_name": p.project_name,
            "state": p.state,
            "district": p.district,
            "ministry": p.ministry,
            "sector": p.sector,
            "latitude": float(lat) if (has_valid_coords and lat is not None) else None,
            "longitude": float(lng) if (has_valid_coords and lng is not None) else None,
            "has_valid_coords": has_valid_coords,
            "risk_level": p.risk_level or "Low",
            "risk_score": risk_score,
            "progress_percentage": float(p.progress_percentage or 0),
            "current_cost": float(p.current_cost or 0),
            "original_cost": float(p.original_cost or 0),
            "delay_days": int(p.delay_days or 0),
            "status": p.status or "In Progress",
        })

    return {
        "total_projects": len(projects),
        "valid_coordinates_count": valid_coords_count,
        "missing_coordinates_count": missing_coords_count,
        "invalid_coordinates_count": invalid_coords_count,
        "markers": markers
    }

@router.get("/{project_id}", response_model=ProjectOut)
def get_project_detail(project_id: str, db: Session = Depends(get_db)):
    """
    Retrieve comprehensive 360-degree master metadata for a specific project.
    """
    project = db.query(Project).filter(
        (Project.project_id == project_id) | (Project.id == project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", project_id)
    return project

@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin", "MinistryOfficer", "ProjectManager"]))
):
    """
    Register a new infrastructure asset into the national registry.
    """
    existing = db.query(Project).filter(Project.project_id == project_in.project_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project ID already exists.")

    new_project = Project(**project_in.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin", "MinistryOfficer", "ProjectManager"]))
):
    """
    Update project progress, cost, or target timelines.
    """
    project = db.query(Project).filter(
        (Project.project_id == project_id) | (Project.id == project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", project_id)

    update_data = project_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(project, field, val)

    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["SuperAdmin"]))
):
    """
    Soft-delete an infrastructure project from the national registry.
    Only SuperAdmin role is authorized for project removal.
    """
    project = db.query(Project).filter(
        (Project.project_id == project_id) | (Project.id == project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", project_id)

    project.soft_delete()
    db.commit()
    return {
        "status": "success",
        "message": f"Project '{project.project_name}' ({project.project_id}) has been soft-deleted.",
        "project_id": project.project_id
    }
