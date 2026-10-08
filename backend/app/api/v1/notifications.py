from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.database.session import get_db
from backend.app.notifications.service import notification_service
from backend.app.services.auth_service import get_current_user
from backend.app.models import User
from backend.app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/notifications", tags=["Notification & Alert Center"])


@router.get("")
def list_my_notifications(
    unread_only: bool = False,
    warning_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve paginated notifications for the currently authenticated user.
    Supports filtering by read status and warning level (Critical, Warning, Info).
    """
    return notification_service.get_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
        warning_level=warning_level,
        page=page,
        limit=limit
    )


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a single notification as read."""
    success = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not success:
        raise EntityNotFoundException("Notification", notification_id)
    return {"status": "success", "message": "Notification marked as read."}


@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all unread notifications as read for the current user."""
    count = notification_service.mark_all_as_read(db, current_user.id)
    return {"status": "success", "notifications_marked": count}


@router.delete("/{notification_id}")
def dismiss_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft-delete (dismiss) a notification."""
    success = notification_service.dismiss_notification(db, notification_id, current_user.id)
    if not success:
        raise EntityNotFoundException("Notification", notification_id)
    return {"status": "success", "message": "Notification dismissed."}
