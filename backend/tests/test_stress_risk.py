import time
from datetime import datetime
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.models import Base, Project
from backend.app.analytics.engine import AnalyticsEngine

@pytest.fixture
def memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def generate_projects(n: int):
    sectors = ['Transport & Logistics', 'Energy', 'Water & Sanitation', 'Social & Commercial', 'Communication', 'Others']
    ministries = ['Ministry of Railways', 'Ministry of Road Transport', 'Ministry of Power', 'Ministry of Coal']
    states = ['Maharashtra', 'Uttar Pradesh', 'Gujarat', 'Tamil Nadu', 'Karnataka']
    risk_levels = ['Low', 'Medium', 'High', 'Critical']
    statuses = ['In Progress', 'Completed', 'Delayed']

    projects = []
    now = datetime.utcnow()
    for i in range(n):
        p = Project(
            project_id=f"STRESS_{n}_{i:06d}",
            project_name=f"Stress Test Infrastructure Asset {i}",
            sector=sectors[i % len(sectors)],
            ministry=ministries[i % len(ministries)],
            state=states[i % len(states)],
            risk_level=risk_levels[i % len(risk_levels)],
            status=statuses[i % len(statuses)],
            original_cost=float(100 + (i % 500)),
            current_cost=float(110 + (i % 600)),
            expenditure=float(50 + (i % 400)),
            delay_days=int(i % 600),
            progress_percentage=float(i % 100),
            start_date=now,
            target_date=now,
            is_deleted=False
        )
        projects.append(p)
    return projects

@pytest.mark.parametrize("record_count", [100, 1000, 10000])
def test_risk_analytics_stress(memory_db, record_count):
    projects = generate_projects(record_count)
    memory_db.bulk_save_objects(projects)
    memory_db.commit()

    engine = AnalyticsEngine()

    t0 = time.time()
    risk_res = engine.get_risk_analytics(memory_db)
    t_risk = time.time() - t0

    t1 = time.time()
    sector_res = engine.get_sector_analytics(memory_db)
    t_sector = time.time() - t1

    assert t_risk < 2.0, f"Risk analytics took {t_risk:.3f}s (> 2.0s limit) for {record_count} records"
    assert t_sector < 2.0, f"Sector analytics took {t_sector:.3f}s (> 2.0s limit) for {record_count} records"
    assert len(risk_res["risk_bands"]) > 0
    assert len(sector_res) > 0
    print(f"\n[PASS] {record_count} records: Risk={t_risk*1000:.1f}ms, Sector={t_sector*1000:.1f}ms")
