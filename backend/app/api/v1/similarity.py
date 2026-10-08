from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models import Project
from backend.app.schemas import SimilarityResponse, SimilarProjectItem
from backend.app.similarity_engine.engine import similarity_engine
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/similarity", tags=["Failure DNA & Similarity Engine"])

@router.get("/{project_id}", response_model=SimilarityResponse)
def get_similar_projects_and_failure_dna(
    project_id: str,
    top_k: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """
    Find historically comparable infrastructure projects and match against Failure DNA archetypes using multi-dimensional Cosine / KNN metrics.
    """
    project = db.query(Project).filter(
        (Project.project_id == project_id) | (Project.id == project_id),
        Project.is_deleted == False
    ).first()
    if not project:
        raise EntityNotFoundException("Project", project_id)

    sim_data = similarity_engine.find_similar_projects(db, project, top_k=top_k)

    similar_items = [
        SimilarProjectItem(
            project_id=item["project_id"],
            project_name=item["project_name"],
            sector=item["sector"],
            state=item["state"],
            similarity_score=item["similarity_score"],
            failure_dna_match_pct=item["failure_dna_match_pct"],
            historical_observed_delay_days=item["historical_observed_delay_days"],
            historical_cost_overrun_pct=item["historical_cost_overrun_pct"],
            key_bottleneck=item["key_bottleneck"]
        )
        for item in sim_data["similar_projects"]
    ]

    return SimilarityResponse(
        project_id=project.project_id,
        similarity_score=sim_data["similarity_score"],
        cluster_archetype=sim_data["cluster_archetype"],
        failure_dna_signature=sim_data["failure_dna_signature"],
        similar_projects=similar_items,
        historical_outcomes=sim_data["historical_outcomes"]
    )
