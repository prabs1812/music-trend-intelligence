from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from typing import Optional
from backend.utils.config import settings
from backend.utils.logger import app_logger


class MongoDBManager:
    """MongoDB connection manager with async support."""

    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self._connected: bool = False

    async def connect(self):
        """Establish connection to MongoDB."""
        try:
            app_logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}")

            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                serverSelectionTimeoutMS=5000,
            )

            # Test connection
            await self.client.admin.command("ping")

            self.db = self.client[settings.MONGODB_DB_NAME]
            self._connected = True

            # Create indexes
            await self._create_indexes()

            app_logger.info(f"Successfully connected to MongoDB database: {settings.MONGODB_DB_NAME}")

        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            app_logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def _create_indexes(self):
        """Create database indexes for optimal query performance."""
        try:
            # Artists collection indexes
            await self.db.artists.create_index("name")
            await self.db.artists.create_index("spotify_id")
            await self.db.artists.create_index([("trend_score", -1)])
            await self.db.artists.create_index([("last_updated", -1)])

            # Trends collection indexes
            await self.db.trends.create_index([("timestamp", -1)])
            await self.db.trends.create_index("artist_name")
            await self.db.trends.create_index("source")
            await self.db.trends.create_index([("artist_name", 1), ("timestamp", -1)])

            # Anomalies collection indexes
            await self.db.anomalies.create_index([("timestamp", -1)])
            await self.db.anomalies.create_index("artist_name")
            await self.db.anomalies.create_index("alert_level")
            await self.db.anomalies.create_index([("dismissed", 1), ("timestamp", -1)])

            # Genres collection indexes
            await self.db.genres.create_index("name", unique=True)
            await self.db.genres.create_index([("popularity", -1)])

            # Comments collection indexes
            await self.db.comments.create_index([("timestamp", -1)])
            await self.db.comments.create_index("source")
            await self.db.comments.create_index("mentioned_artists")
            await self.db.comments.create_index([("processed", 1)])

            app_logger.info("MongoDB indexes created successfully")

        except Exception as e:
            app_logger.warning(f"Error creating indexes: {e}")

    async def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            self._connected = False
            app_logger.info("Disconnected from MongoDB")

    def is_connected(self) -> bool:
        """Check if MongoDB is connected."""
        return self._connected

    def get_collection(self, collection_name: str):
        """Get a MongoDB collection."""
        if not self._connected or not self.db:
            raise RuntimeError("MongoDB is not connected")
        return self.db[collection_name]


# Global MongoDB manager instance
mongodb_manager = MongoDBManager()


async def get_mongodb() -> AsyncIOMotorDatabase:
    """Dependency to get MongoDB database instance."""
    if not mongodb_manager.is_connected():
        await mongodb_manager.connect()
    return mongodb_manager.db
