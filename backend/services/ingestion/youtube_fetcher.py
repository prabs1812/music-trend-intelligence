"""YouTube Data API fetcher with rate limiting."""

import httpx
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
from backend.utils.config import settings
from backend.utils.logger import app_logger


class YouTubeFetcher:
    """Fetches music-related data from YouTube Data API."""

    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.base_url = "https://www.googleapis.com/youtube/v3"
        self.rate_limit = settings.YOUTUBE_RATE_LIMIT
        self._request_count = 0
        self._last_reset = datetime.utcnow()

        # Music-related search queries
        self.search_queries = [
            "new music 2026",
            "trending music",
            "music video",
            "official audio",
            "new album",
            "music release"
        ]

    async def _check_rate_limit(self):
        """Enforce rate limiting (quota units per day)."""
        now = datetime.utcnow()
        if (now - self._last_reset).total_seconds() >= 86400:  # 24 hours
            self._request_count = 0
            self._last_reset = now

        if self._request_count >= self.rate_limit:
            app_logger.warning("YouTube API daily quota reached")
            raise Exception("YouTube API quota exceeded")

        self._request_count += 1

    async def _make_request(self, endpoint: str, params: Dict[str, Any], retries: int = 3) -> Dict[str, Any]:
        """Make request to YouTube API with retry logic."""
        await self._check_rate_limit()

        url = f"{self.base_url}/{endpoint}"
        params["key"] = self.api_key

        for attempt in range(retries):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        url,
                        params=params,
                        timeout=15.0
                    )

                    if response.status_code == 403:
                        error_data = response.json()
                        error_reason = error_data.get("error", {}).get("errors", [{}])[0].get("reason")

                        if error_reason == "quotaExceeded":
                            app_logger.error("YouTube API quota exceeded")
                            raise Exception("YouTube API quota exceeded")

                    response.raise_for_status()
                    return response.json()

            except httpx.HTTPStatusError as e:
                app_logger.error(f"HTTP error on attempt {attempt + 1}: {e}")
                if attempt == retries - 1:
                    raise

            except Exception as e:
                app_logger.error(f"Request error on attempt {attempt + 1}: {e}")
                if attempt == retries - 1:
                    raise

            await asyncio.sleep(2 ** attempt)

    async def search_videos(self, query: str, max_results: int = 25, order: str = "viewCount") -> List[Dict[str, Any]]:
        """Search for music videos."""
        try:
            data = await self._make_request(
                "search",
                params={
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "videoCategoryId": "10",  # Music category
                    "maxResults": max_results,
                    "order": order,
                    "relevanceLanguage": "en"
                }
            )

            videos = []
            for item in data.get("items", []):
                video_id = item.get("id", {}).get("videoId")
                snippet = item.get("snippet", {})

                videos.append({
                    "video_id": video_id,
                    "title": snippet.get("title"),
                    "description": snippet.get("description"),
                    "channel_title": snippet.get("channelTitle"),
                    "published_at": snippet.get("publishedAt"),
                    "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url")
                })

            app_logger.info(f"Found {len(videos)} videos for query: {query}")
            return videos

        except Exception as e:
            app_logger.error(f"Error searching videos: {e}")
            return []

    async def get_video_statistics(self, video_ids: List[str]) -> List[Dict[str, Any]]:
        """Get detailed statistics for videos."""
        if not video_ids:
            return []

        try:
            # YouTube API allows up to 50 video IDs per request
            video_ids_str = ",".join(video_ids[:50])

            data = await self._make_request(
                "videos",
                params={
                    "part": "statistics,snippet",
                    "id": video_ids_str
                }
            )

            videos_data = []
            for item in data.get("items", []):
                video_id = item.get("id")
                snippet = item.get("snippet", {})
                stats = item.get("statistics", {})

                videos_data.append({
                    "video_id": video_id,
                    "title": snippet.get("title"),
                    "channel_title": snippet.get("channelTitle"),
                    "view_count": int(stats.get("viewCount", 0)),
                    "like_count": int(stats.get("likeCount", 0)),
                    "comment_count": int(stats.get("commentCount", 0)),
                    "published_at": snippet.get("publishedAt")
                })

            app_logger.info(f"Fetched statistics for {len(videos_data)} videos")
            return videos_data

        except Exception as e:
            app_logger.error(f"Error fetching video statistics: {e}")
            return []

    async def get_video_comments(self, video_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
        """Get comments from a video."""
        try:
            data = await self._make_request(
                "commentThreads",
                params={
                    "part": "snippet",
                    "videoId": video_id,
                    "maxResults": max_results,
                    "order": "relevance",
                    "textFormat": "plainText"
                }
            )

            comments = []
            for item in data.get("items", []):
                comment = item.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
                comments.append({
                    "comment_id": item.get("id"),
                    "text": comment.get("textDisplay"),
                    "author": comment.get("authorDisplayName"),
                    "like_count": comment.get("likeCount", 0),
                    "published_at": comment.get("publishedAt")
                })

            return comments

        except Exception as e:
            app_logger.error(f"Error fetching comments for video {video_id}: {e}")
            return []

    async def fetch_trending_music_videos(self) -> List[Dict[str, Any]]:
        """Fetch trending music videos with statistics."""
        all_videos = []

        for query in self.search_queries[:3]:  # Limit queries to conserve quota
            videos = await self.search_videos(query, max_results=10)

            if videos:
                video_ids = [v["video_id"] for v in videos if v.get("video_id")]
                detailed_videos = await self.get_video_statistics(video_ids)
                all_videos.extend(detailed_videos)

            await asyncio.sleep(1)  # Small delay between queries

        app_logger.info(f"Fetched total of {len(all_videos)} trending music videos")
        return all_videos


# Global YouTube fetcher instance
youtube_fetcher = YouTubeFetcher()
