from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models import Notification, User
from backend.app.core.logging import logger


class NotificationService:
    """
    Enterprise notification management service.
    Supports alert creation, user-scoped retrieval, batch operations,
    and integration with Early Warning and Risk Intelligence engines.
    """

    @staticmethod
    def create_notification(
        db: Session,
        title: str,
        message: str,
        warning_level: str = "Info",
        user_id: Optional[str] = None,
        project_id: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> Notification:
        """Create and persist a notification record."""
        notification = Notification(
            user_id=user_id,
            project_id=project_id,
            title=title,
            message=message,
            warning_level=warning_level,
            action_url=action_url
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        logger.info(f"Notification created: [{warning_level}] {title}")
        return notification

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: str,
        unread_only: bool = False,
        warning_level: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        """Retrieve paginated notifications for a specific user."""
        query = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_deleted == False
        )
        if unread_only:
            query = query.filter(Notification.is_read == False)
        if warning_level:
            query = query.filter(Notification.warning_level == warning_level)

        total = query.count()
        notifications = query.order_by(
            Notification.created_at.desc()
        ).offset((page - 1) * limit).limit(limit).all()

        unread_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False,
            Notification.is_deleted == False
        ).count()

        return {
            "total_count": total,
            "unread_count": unread_count,
            "page": page,
            "limit": limit,
            "notifications": [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "warning_level": n.warning_level,
                    "project_id": n.project_id,
                    "is_read": n.is_read,
                    "action_url": n.action_url,
                    "created_at": n.created_at.isoformat() if n.created_at else None
                }
                for n in notifications
            ]
        }

    @staticmethod
    def mark_as_read(db: Session, notification_id: str, user_id: str) -> bool:
        """Mark a single notification as read."""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            (Notification.user_id == user_id) | (Notification.user_id.is_(None)),
            Notification.is_deleted == False
        ).first()
        if not notification:
            return False
        notification.is_read = True
        db.commit()
        return True

    @staticmethod
    def mark_all_as_read(db: Session, user_id: str) -> int:
        """Mark all unread notifications for a user as read. Returns count affected."""
        count = db.query(Notification).filter(
            (Notification.user_id == user_id) | (Notification.user_id.is_(None)),
            Notification.is_read == False,
            Notification.is_deleted == False
        ).update({"is_read": True}, synchronize_session=False)
        db.commit()
        return count

    @staticmethod
    def dismiss_notification(db: Session, notification_id: str, user_id: str) -> bool:
        """Soft-delete a notification."""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            (Notification.user_id == user_id) | (Notification.user_id.is_(None)),
            Notification.is_deleted == False
        ).first()
        if not notification:
            return False
        notification.soft_delete()
        db.commit()
        return True


    @staticmethod
    def broadcast_notification(
        db: Session,
        title: str,
        message: str,
        warning_level: str = "Info",
        project_id: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> int:
        """
        Broadcast a notification to ALL active users.
        Used by Early Warning and Risk engines for system-wide alerts.
        """
        active_users = db.query(User).filter(
            User.is_active == True,
            User.is_deleted == False
        ).all()

        count = 0
        for user in active_users:
            notification = Notification(
                user_id=user.id,
                project_id=project_id,
                title=title,
                message=message,
                warning_level=warning_level,
                action_url=action_url
            )
            db.add(notification)
            count += 1

        db.commit()
        logger.info(f"Broadcast notification sent to {count} users: [{warning_level}] {title}")
        return count


notification_service = NotificationService()
