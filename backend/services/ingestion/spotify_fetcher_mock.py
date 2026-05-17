"""Mock Spotify data generator for testing without API credentials."""

import random
from typing import List, Dict, Any
from datetime import datetime
from backend.utils.logger import app_logger


class MockSpotifyFetcher:
    """Generates mock Spotify data for testing."""

    def __init__(self):
        self.mock_artists = [
            {"name": "Taylor Swift", "id": "mock_ts", "genres": ["pop", "country"], "popularity": 95},
            {"name": "Drake", "id": "mock_drake", "genres": ["hip hop", "rap"], "popularity": 92},
            {"name": "Bad Bunny", "id": "mock_bb", "genres": ["reggaeton", "latin"], "popularity": 90},
            {"name": "The Weeknd", "id": "mock_weeknd", "genres": ["r&b", "pop"], "popularity": 88},
            {"name": "Ariana Grande", "id": "mock_ag", "genres": ["pop"], "popularity": 87},
            {"name": "Ed Sheeran", "id": "mock_es", "genres": ["pop", "folk"], "popularity": 86},
            {"name": "Billie Eilish", "id": "mock_be", "genres": ["pop", "alternative"], "popularity": 85},
            {"name": "Post Malone", "id": "mock_pm", "genres": ["hip hop", "pop"], "popularity": 84},
            {"name": "Dua Lipa", "id": "mock_dl", "genres": ["pop", "dance"], "popularity": 83},
            {"name": "Olivia Rodrigo", "id": "mock_or", "genres": ["pop", "rock"], "popularity": 82},
            {"name": "SZA", "id": "mock_sza", "genres": ["r&b", "soul"], "popularity": 81},
            {"name": "Harry Styles", "id": "mock_hs", "genres": ["pop", "rock"], "popularity": 80},
            {"name": "Doja Cat", "id": "mock_dc", "genres": ["pop", "hip hop"], "popularity": 79},
            {"name": "Travis Scott", "id": "mock_ts2", "genres": ["hip hop", "trap"], "popularity": 78},
            {"name": "Kendrick Lamar", "id": "mock_kl", "genres": ["hip hop", "rap"], "popularity": 77},
        ]

    async def fetch_trending_artists(self) -> List[Dict[str, Any]]:
        """Generate mock trending artists data."""
        app_logger.info("Generating mock Spotify data (no API key required)")

        # Randomly vary popularity to simulate trends
        artists = []
        for artist in self.mock_artists:
            artists.append({
                "id": artist["id"],
                "name": artist["name"],
                "genres": artist["genres"],
                "popularity": artist["popularity"] + random.randint(-5, 5),
                "followers": {
                    "total": random.randint(1000000, 50000000)
                }
            })

        return artists

    async def fetch_trending_playlists(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Generate mock playlists."""
        return []

    async def fetch_playlist_tracks(self, playlist_id: str) -> List[Dict[str, Any]]:
        """Generate mock tracks."""
        return []

    async def fetch_artist_data(self, artist_id: str) -> Dict[str, Any]:
        """Generate mock artist data."""
        return {}

    async def search_artists(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate mock search results."""
        return []


# Global mock fetcher instance
spotify_fetcher = MockSpotifyFetcher()
