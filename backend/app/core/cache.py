import json
from typing import Any, Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger

class CacheService:
    def __init__(self):
        self.memory_store = {}
        self.redis_client = None
        
        if settings.CACHE_ENABLED:
            try:
                import redis
                self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                logger.info("Connected to Redis cache successfully.")
            except Exception as e:
                logger.warning(f"Redis unavailable ({e}), falling back to in-memory cache.")

    def get(self, key: str) -> Optional[Any]:
        if self.redis_client:
            try:
                val = self.redis_client.get(key)
                return json.loads(val) if val else None
            except Exception:
                pass
        return self.memory_store.get(key)

    def set(self, key: str, value: Any, ttl: int = settings.CACHE_TTL_SECONDS) -> bool:
        if self.redis_client:
            try:
                self.redis_client.setex(key, ttl, json.dumps(value))
                return True
            except Exception:
                pass
        self.memory_store[key] = value
        return True

    def delete(self, key: str) -> bool:
        if self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception:
                pass
        self.memory_store.pop(key, None)
        return True

    def clear(self) -> bool:
        if self.redis_client:
            try:
                self.redis_client.flushdb()
            except Exception:
                pass
        self.memory_store.clear()
        return True

cache = CacheService()
