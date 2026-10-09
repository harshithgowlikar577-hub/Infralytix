import os
import sys

# Add repository root to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date

# Set testing environment
os.environ["DATABASE_URL"] = "sqlite:///./test_infralytix.db"
os.environ["ENVIRONMENT"] = "testing"

from backend.app.database.base import Base
from backend.app.database.session import get_db
from backend.app.main import app
from backend.app.models import Project, Role, User
from backend.app.core.security import hash_password, create_access_token

TEST_DATABASE_URL = "sqlite:///./test_infralytix.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create test roles
    role_admin = Role(name="SuperAdmin", description="Admin")
    role_officer = Role(name="MinistryOfficer", description="Officer")
    db.add_all([role_admin, role_officer])
    db.commit()

    # Create test users
    admin_user = User(
        email="test_admin@infralytix.gov.in",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Test Admin",
        role_id=role_admin.id,
        is_active=True
    )
    db.add(admin_user)

    # Seed exact p1 and p2 required by test_api_suite
    p1 = Project(
        project_id="INF0001",
        project_name="Mega Express Corridor Phase II",
        ministry="Ministry of Road Transport & Highways",
        sector="Transport & Logistics",
        state="Uttar Pradesh",
        original_cost=1450.0,
        current_cost=1680.0,
        expenditure=850.0,
        start_date=date(2023, 4, 1),
        target_date=date(2026, 3, 31),
        actual_completion_date=date(2026, 11, 30),
        delay_days=244,
        progress_percentage=42.0,
        financial_percentage=58.0,
        status="In Progress",
        risk_level="Critical"
    )
    p2 = Project(
        project_id="PRJ0002",
        project_name="Solar Ultra Mega Park Phase I",
        ministry="Ministry of Power",
        sector="Energy",
        state="Gujarat",
        original_cost=1200.0,
        current_cost=1250.0,
        expenditure=600.0,
        start_date=date(2022, 1, 15),
        target_date=date(2025, 6, 30),
        delay_days=30,
        progress_percentage=85.0,
        financial_percentage=80.0,
        status="In Progress",
        risk_level="Low"
    )
    db.add_all([p1, p2])

    # Additional sample projects for pagination & filters (INF0003 -> INF0030)
    ministries = [
        "Ministry of Railways", "Ministry of Road Transport & Highways", "Ministry of Power",
        "Ministry of Communications", "Ministry of Housing & Urban Affairs", "Ministry of Civil Aviation"
    ]
    sectors = ["Transport & Logistics", "Energy", "Communication", "Water & Sanitation", "Social & Commercial", "Others"]
    states = ["Uttar Pradesh", "Gujarat", "Delhi", "Maharashtra", "Bihar", "Tamil Nadu", "Karnataka", "Assam", "West Bengal", "Rajasthan"]
    risk_levels = ["Critical", "High", "Medium", "Low"]
    statuses = ["In Progress", "Delayed", "Completed"]

    projects_list = []
    for i in range(3, 31):
        m = ministries[i % len(ministries)]
        sec = sectors[i % len(sectors)]
        st = states[i % len(states)]
        if i % 4 == 0:
            rk = "Critical"
        elif i % 4 == 1:
            rk = "High"
        elif i % 4 == 2:
            rk = "Medium"
        else:
            rk = "Critical"
        stat = statuses[i % len(statuses)]
        name_prefix = "Metro" if i % 3 == 0 else ("Expressway" if i % 4 == 0 else "Project")

        p = Project(
            project_id=f"INF{i:04d}",
            project_name=f"{name_prefix} Asset {i} Corridor",
            ministry=m,
            sector=sec,
            state=st,
            original_cost=1000.0 + i * 50,
            current_cost=1100.0 + i * 60,
            expenditure=500.0 + i * 30,
            start_date=date(2023, 1, 1),
            target_date=date(2026, 12, 31),
            delay_days=15 * (i % 10) + 10,
            progress_percentage=min(95.0, 10.0 + i * 2.8),
            financial_percentage=min(95.0, 12.0 + i * 2.7),
            status=stat,
            risk_level=rk
        )
        projects_list.append(p)

    db.add_all(projects_list)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    try:
        if os.path.exists("./test_infralytix.db"):
            os.remove("./test_infralytix.db")
    except PermissionError:
        pass  # Windows may hold SQLite file lock briefly after engine disposal

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token(db_session):
    admin = db_session.query(User).filter(User.email == "test_admin@infralytix.gov.in").first()
    return create_access_token(subject=admin.id, role="SuperAdmin")
