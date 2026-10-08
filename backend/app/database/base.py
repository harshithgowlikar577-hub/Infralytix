import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Boolean, String
from sqlalchemy.orm import declarative_base, declared_attr

Base = declarative_base()

class TimestampMixin:
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

class SoftDeleteMixin:
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = datetime.now(timezone.utc)

class BaseModel(Base, TimestampMixin, SoftDeleteMixin):
    __abstract__ = True
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
