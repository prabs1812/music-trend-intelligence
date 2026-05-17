"""Mock YouTube data generator for testing without API credentials."""

import random
from typing import List, Dict, Any
from datetime import datetime
from backend.utils.logger import app_logger


class MockYouTubeFetcher:
    """Generates mock YouTube data for testing."""

    def __init__(self):
        self.mock_videos = [
            "Taylor Swift - New Song (Official Video)",
            "Drake - Latest Hit (Music Video)",
            "Bad Bunny - Un Verano Sin Ti",
            "The Weeknd - Blinding Lights",
            "Ariana Grande - positions (official video)",
            "Ed Sheeran - Shape of You",
            "Billie Eilish - bad guy",
            "Post Malone - Circles",
            "Dua Lipa - Levitating",
            "Olivia Rodrigo - drivers license",
            "SZA - Kill Bill (Official Video)",
            "Harry Styles - As It Was",
            "Doja Cat - Paint The Town Red",
            "Travis Scott - SICKO MODE",
            "Kendrick Lamar - HUMBLE.",
        ]

    async def fetch_trending_music_videos(self) -> List[Dict[str, Any]]:
        """Generate mock trending videos."""
        app_logger.info("Generating mock YouTube data (no API key required)")

        videos = []
        for i, title in enumerate(self.mock_videos):
            videos.append({
                "video_id": f"mock_video_{i}",
                "title": title,
                "channel_title": title.split(" - ")[0] if " - " in title else "Music Channel",
                "view_count": random.randint(1000000, 100000000),
                "like_count": random.randint(50000, 5000000),
                "comment_count": random.randint(1000, 100000),
                "published_at": datetime.utcnow().isoformat()
            })

        return videos

    async def search_videos(self, query: str, max_results: int = 25, order: str = "viewCount") -> List[Dict[str, Any]]:
        """Generate mock search results."""
        return []

    async def get_video_statistics(self, video_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate mock video statistics."""
        return []

    async def get_video_comments(self, video_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
        """Generate mock comments."""
        return []


# Global mock fetcher instance
youtube_fetcher = MockYouTubeFetcher()
