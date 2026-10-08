from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session, Query


def paginate_query(
    query: Query,
    page: int = 1,
    limit: int = 25
) -> Tuple[int, list]:
    """
    Apply pagination to a SQLAlchemy query.
    Returns (total_count, paginated_results).
    """
    total = query.count()
    results = query.offset((page - 1) * limit).limit(limit).all()
    return total, results


def build_pagination_response(
    items: list,
    total_count: int,
    page: int,
    limit: int,
    items_key: str = "items"
) -> Dict[str, Any]:
    """
    Build a standardized pagination response envelope.
    """
    total_pages = max(1, (total_count + limit - 1) // limit)
    return {
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
        items_key: items
    }
