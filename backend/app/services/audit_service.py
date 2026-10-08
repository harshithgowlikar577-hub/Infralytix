from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import Request

from backend.app.models import AuditLog
from backend.app.core.logging import logger


class AuditService:
    """
    Enterprise audit trail service for compliance and governance.
    Records all significant system operations with user context,
    entity references, timestamps, and client metadata.
    """

    @staticmethod
    def log_action(
        db: Session,
        action: str,
        entity_name: str,
        entity_id: Optional[str] = None,
        user_id: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """
        Record an audit event.

        Actions:
            LOGIN, LOGOUT, REGISTER,
            PROJECT_CREATE, PROJECT_UPDATE, PROJECT_DELETE,
            INGESTION_UPLOAD, INGESTION_VALIDATE,
            PREDICTION_RUN_COST, PREDICTION_RUN_DELAY,
            MODEL_TRAIN_COST, MODEL_TRAIN_DELAY,
            INTERVENTION_CREATE, INTERVENTION_EXECUTE,
            NOTIFICATION_BROADCAST, NOTIFICATION_DISMISS,
            SIMULATION_RUN, RISK_CALCULATION,
            SYSTEM_STARTUP, SYSTEM_SHUTDOWN
        """
        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_name=entity_name,
            entity_id=str(entity_id) if entity_id else None,
            payload=payload or {},
            ip_address=ip_address
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        logger.info(f"Audit: [{action}] {entity_name}/{entity_id} by user={user_id}")
        return audit_entry

    @staticmethod
    def log_from_request(
        db: Session,
        request: Request,
        action: str,
        entity_name: str,
        entity_id: Optional[str] = None,
        user_id: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Record an audit event with automatic IP extraction from the HTTP request."""
        client_ip = request.client.host if request.client else "unknown"
        return AuditService.log_action(
            db=db,
            action=action,
            entity_name=entity_name,
            entity_id=entity_id,
            user_id=user_id,
            payload=payload,
            ip_address=client_ip
        )

    @staticmethod
    def get_audit_trail(
        db: Session,
        entity_name: Optional[str] = None,
        entity_id: Optional[str] = None,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Dict[str, Any]:
        """Retrieve paginated audit trail with optional filters."""
        query = db.query(AuditLog)

        if entity_name:
            query = query.filter(AuditLog.entity_name == entity_name)
        if entity_id:
            query = query.filter(AuditLog.entity_id == entity_id)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action)

        total = query.count()
        logs = query.order_by(
            AuditLog.created_at.desc()
        ).offset((page - 1) * limit).limit(limit).all()

        return {
            "total_count": total,
            "page": page,
            "limit": limit,
            "audit_logs": [
                {
                    "id": log.id,
                    "action": log.action,
                    "entity_name": log.entity_name,
                    "entity_id": log.entity_id,
                    "user_id": log.user_id,
                    "payload": log.payload,
                    "ip_address": log.ip_address,
                    "created_at": log.created_at.isoformat() if log.created_at else None
                }
                for log in logs
            ]
        }


audit_service = AuditService()
