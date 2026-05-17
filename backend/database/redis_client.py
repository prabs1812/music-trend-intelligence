import redis.asyncio as redis
from redis.asyncio import Redis
from redis.exceptions import ConnectionError, TimeoutError
from typing import Optional, Any
import json
from backend.utils.config import settings
from backend.utils.logger import app_logger


class RedisManager:
    """Redis connection manager with async support."""

    def __init__(self):
        self.client: Optional[Redis] = None
        self._connected: bool = False

    async def connect(self):
        """Establish connection to Redis."""
        try:
            app_logger.info(f"Connecting to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT}")

            self.client = await redis.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}",
                password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                encoding="utf-8",
                decode_responses=True,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
            )

            # Test connection
            await self.client.ping()
            self._connected = True

            app_logger.info("Successfully connected to Redis")

        except (ConnectionError, TimeoutError) as e:
            app_logger.error(f"Failed to connect to Redis: {e}")
            raise

    async def disconnect(self):
        """Close Redis connection."""
        if self.client:
            await self.client.close()
            self._connected = False
            app_logger.info("Disconnected from Redis")

    def is_connected(self) -> bool:
        """Check if Redis is connected."""
        return self._connected

    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        return await self.client.get(key)

    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in Redis with optional TTL."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")

        if isinstance(value, (dict, list)):
            value = json.dumps(value)

        if ttl:
            await self.client.setex(key, ttl, value)
        else:
            await self.client.set(key, value)

    async def delete(self, key: str):
        """Delete key from Redis."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        await self.client.delete(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        return await self.client.exists(key) > 0

    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment counter in Redis."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        return await self.client.incrby(key, amount)

    async def zadd(self, key: str, mapping: dict, nx: bool = False):
        """Add to sorted set."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        await self.client.zadd(key, mapping, nx=nx)

    async def zrevrange(self, key: str, start: int, end: int, withscores: bool = False):
        """Get range from sorted set in descending order."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        return await self.client.zrevrange(key, start, end, withscores=withscores)

    async def zrem(self, key: str, *members):
        """Remove members from sorted set."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        await self.client.zrem(key, *members)

    async def hset(self, name: str, key: str, value: Any):
        """Set hash field."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")

        if isinstance(value, (dict, list)):
            value = json.dumps(value)

        await self.client.hset(name, key, value)

    async def hget(self, name: str, key: str) -> Optional[str]:
        """Get hash field."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        return await self.client.hget(name, key)

    async def hgetall(self, name: str) -> dict:
        """Get all hash fields."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        return await self.client.hgetall(name)

    async def hdel(self, name: str, *keys):
        """Delete hash fields."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        await self.client.hdel(name, *keys)

    async def expire(self, key: str, seconds: int):
        """Set expiration on key."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        await self.client.expire(key, seconds)

    async def flushdb(self):
        """Clear current database (use with caution)."""
        if not self._connected:
            raise RuntimeError("Redis is not connected")
        await self.client.flushdb()
        app_logger.warning("Redis database flushed")


# Global Redis manager instance
redis_manager = RedisManager()


async def get_redis() -> Redis:
    """Dependency to get Redis client instance."""
    if not redis_manager.is_connected():
        await redis_manager.connect()
    return redis_manager.client
