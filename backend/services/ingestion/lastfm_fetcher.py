"""Last.fm API data fetcher for trending artists and popularity data."""

import httpx
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
from backend.utils.config import settings
from backend.utils.logger import app_logger


class LastFmFetcher:
    """Fetches music trend data from Last.fm API."""

    def __init__(self):
        self.api_key = settings.LASTFM_API_KEY
        self.base_url = "http://ws.audioscrobbler.com/2.0/"
        self.rate_limit = 5  # Last.fm allows 5 requests per second
        self._request_count = 0
        self._last_reset = datetime.utcnow()

    async def _check_rate_limit(self):
        """Enforce rate limiting (5 requests per second)."""
        now = datetime.utcnow()
        if (now - self._last_reset).total_seconds() >= 1:
            self._request_count = 0
            self._last_reset = now

        if self._request_count >= self.rate_limit:
            sleep_time = 1 - (now - self._last_reset).total_seconds()
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
            self._request_count = 0
            self._last_reset = datetime.utcnow()

        self._request_count += 1

    async def _make_request(self, params: Dict[str, Any], retries: int = 3) -> Dict[str, Any]:
        """Make request to Last.fm API with retry logic."""
        await self._check_rate_limit()

        params.update({
            "api_key": self.api_key,
            "format": "json"
        })

        for attempt in range(retries):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        self.base_url,
                        params=params,
                        timeout=15.0
                    )

                    if response.status_code == 429:
                        app_logger.warning("Rate limited by Last.fm, waiting...")
                        await asyncio.sleep(2)
                        continue

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

    async def fetch_top_artists(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch top/trending artists from Last.fm chart."""
        try:
            data = await self._make_request({
                "method": "chart.gettopartists",
                "limit": limit
            })

            artists = []
            for artist_data in data.get("artists", {}).get("artist", []):
                artists.append({
                    "name": artist_data.get("name"),
                    "mbid": artist_data.get("mbid"),  # MusicBrainz ID
                    "playcount": int(artist_data.get("playcount", 0)),
                    "listeners": int(artist_data.get("listeners", 0)),
                    "url": artist_data.get("url")
                })

            app_logger.info(f"Fetched {len(artists)} top artists from Last.fm")
            return artists

        except Exception as e:
            app_logger.error(f"Error fetching top artists: {e}")
            return []

    async def fetch_artist_info(self, artist_name: str) -> Optional[Dict[str, Any]]:
        """Fetch detailed information about an artist."""
        try:
            data = await self._make_request({
                "method": "artist.getinfo",
                "artist": artist_name
            })

            artist = data.get("artist", {})

            # Extract tags (genres)
            tags = []
            for tag in artist.get("tags", {}).get("tag", []):
                tags.append(tag.get("name"))

            return {
                "name": artist.get("name"),
                "mbid": artist.get("mbid"),
                "playcount": int(artist.get("stats", {}).get("playcount", 0)),
                "listeners": int(artist.get("stats", {}).get("listeners", 0)),
                "tags": tags[:5],  # Top 5 tags
                "bio": artist.get("bio", {}).get("summary", ""),
                "url": artist.get("url")
            }

        except Exception as e:
            app_logger.error(f"Error fetching artist info for {artist_name}: {e}")
            return None

    async def fetch_artist_top_tracks(self, artist_name: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch top tracks for an artist."""
        try:
            data = await self._make_request({
                "method": "artist.gettoptracks",
                "artist": artist_name,
                "limit": limit
            })

            tracks = []
            for track in data.get("toptracks", {}).get("track", []):
                tracks.append({
                    "name": track.get("name"),
                    "playcount": int(track.get("playcount", 0)),
                    "listeners": int(track.get("listeners", 0)),
                    "url": track.get("url")
                })

            return tracks

        except Exception as e:
            app_logger.error(f"Error fetching top tracks for {artist_name}: {e}")
            return []

    async def fetch_top_tags(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch top music tags (genres)."""
        try:
            data = await self._make_request({
                "method": "chart.gettoptags",
                "limit": limit
            })

            tags = []
            for tag in data.get("tags", {}).get("tag", []):
                tags.append({
                    "name": tag.get("name"),
                    "reach": int(tag.get("reach", 0)),
                    "taggings": int(tag.get("taggings", 0))
                })

            app_logger.info(f"Fetched {len(tags)} top tags from Last.fm")
            return tags

        except Exception as e:
            app_logger.error(f"Error fetching top tags: {e}")
            return []

    async def fetch_tag_top_artists(self, tag: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch top artists for a specific tag/genre."""
        try:
            data = await self._make_request({
                "method": "tag.gettopartists",
                "tag": tag,
                "limit": limit
            })

            artists = []
            for artist in data.get("topartists", {}).get("artist", []):
                artists.append({
                    "name": artist.get("name"),
                    "mbid": artist.get("mbid"),
                    "url": artist.get("url")
                })

            return artists

        except Exception as e:
            app_logger.error(f"Error fetching artists for tag {tag}: {e}")
            return []

    async def fetch_similar_artists(self, artist_name: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch similar artists."""
        try:
            data = await self._make_request({
                "method": "artist.getsimilar",
                "artist": artist_name,
                "limit": limit
            })

            similar = []
            for artist in data.get("similarartists", {}).get("artist", []):
                similar.append({
                    "name": artist.get("name"),
                    "mbid": artist.get("mbid"),
                    "match": float(artist.get("match", 0))
                })

            return similar

        except Exception as e:
            app_logger.error(f"Error fetching similar artists for {artist_name}: {e}")
            return []


# Global Last.fm fetcher instance
lastfm_fetcher = LastFmFetcher()
