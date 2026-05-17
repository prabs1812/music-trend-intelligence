from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Music Trend Intelligence System"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # API Server
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "music_trends"
    MONGODB_MAX_POOL_SIZE: int = 10
    MONGODB_MIN_POOL_SIZE: int = 1

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    REDIS_MAX_CONNECTIONS: int = 10

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_CONSUMER_GROUP: str = "music-trend-consumers"
    KAFKA_AUTO_OFFSET_RESET: str = "earliest"
    KAFKA_ENABLE_AUTO_COMMIT: bool = True

    # Kafka Topics
    KAFKA_TOPIC_SPOTIFY: str = "spotify_events"
    KAFKA_TOPIC_REDDIT: str = "reddit_events"
    KAFKA_TOPIC_YOUTUBE: str = "youtube_events"
    KAFKA_TOPIC_PROCESSED: str = "processed_trends"

    # Last.fm API
    LASTFM_API_KEY: str = ""

    # MusicBrainz API
    MUSICBRAINZ_USER_AGENT: str = "MusicTrendIntelligence/1.0 ( contact@example.com )"

    # Reddit API
    REDDIT_CLIENT_ID: str = ""
    REDDIT_CLIENT_SECRET: str = ""
    REDDIT_USER_AGENT: str = "MusicTrendBot/1.0"

    # Legacy API settings (for backward compatibility)
    SPOTIFY_CLIENT_ID: str = ""
    SPOTIFY_CLIENT_SECRET: str = ""
    YOUTUBE_API_KEY: str = ""

    # Data Ingestion
    INGESTION_INTERVAL_SECONDS: int = 300
    LASTFM_RATE_LIMIT: int = 5
    MUSICBRAINZ_RATE_LIMIT: int = 1
    REDDIT_RATE_LIMIT: int = 60

    # Legacy rate limits (for backward compatibility)
    SPOTIFY_RATE_LIMIT: int = 30
    YOUTUBE_RATE_LIMIT: int = 100

    # Analytics
    TREND_SCORE_UPDATE_INTERVAL: int = 600
    ANOMALY_DETECTION_THRESHOLD: float = 3.0
    ANOMALY_SPIKE_THRESHOLD: float = 2.0

    # Cache TTL
    CACHE_TTL_TRENDING_ARTISTS: int = 300
    CACHE_TTL_GENRES: int = 300
    CACHE_TTL_ANALYTICS: int = 180

    # NLP Models
    SENTIMENT_MODEL: str = "distilbert-base-uncased-finetuned-sst-2-english"
    SPACY_MODEL: str = "en_core_web_sm"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: str = "*"
    CORS_ALLOW_HEADERS: str = "*"

    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30
    WS_MAX_CONNECTIONS: int = 100

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def kafka_bootstrap_servers_list(self) -> List[str]:
        """Parse Kafka bootstrap servers string into list."""
        return [server.strip() for server in self.KAFKA_BOOTSTRAP_SERVERS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
