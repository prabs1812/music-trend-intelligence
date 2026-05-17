"""Data ingestion services package."""

from backend.services.ingestion.spotify_fetcher import SpotifyFetcher, spotify_fetcher
from backend.services.ingestion.reddit_fetcher import RedditFetcher, reddit_fetcher
from backend.services.ingestion.youtube_fetcher import YouTubeFetcher, youtube_fetcher
from backend.services.ingestion.orchestrator import IngestionOrchestrator, ingestion_orchestrator

__all__ = [
    "SpotifyFetcher",
    "spotify_fetcher",
    "RedditFetcher",
    "reddit_fetcher",
    "YouTubeFetcher",
    "youtube_fetcher",
    "IngestionOrchestrator",
    "ingestion_orchestrator",
]
