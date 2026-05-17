"""Spotify API data fetcher with rate limiting and retry logic."""

import httpx
import base64
from typing import Optional, List, Dict, Any
import asyncio
from datetime import datetime, timedelta
from backend.utils.config import settings
from backend.utils.logger import app_logger


class SpotifyFetcher:
    """Fetches trending music data from Spotify API."""

    def __init__(self):
        self.client_id = settings.SPOTIFY_CLIENT_ID
        self.client_secret = settings.SPOTIFY_CLIENT_SECRET
        self.access_token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None
        self.base_url = "https://api.spotify.com/v1"
        self.rate_limit = settings.SPOTIFY_RATE_LIMIT
        self._request_count = 0
        self._last_reset = datetime.utcnow()

    async def _get_access_token(self) -> str:
        """Obtain Spotify API access token using client credentials flow."""
        if self.access_token and self.token_expires_at and datetime.utcnow() < self.token_expires_at:
            return self.access_token

        try:
            auth_string = f"{self.client_id}:{self.client_secret}"
            auth_bytes = auth_string.encode("utf-8")
            auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://accounts.spotify.com/api/token",
                    headers={
                        "Authorization": f"Basic {auth_base64}",
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    data={"grant_type": "client_credentials"},
                    timeout=10.0
                )

                response.raise_for_status()
                data = response.json()

                self.access_token = data["access_token"]
                expires_in = data.get("expires_in", 3600)
                self.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in - 60)

                app_logger.info("Successfully obtained Spotify access token")
                return self.access_token

        except Exception as e:
            app_logger.error(f"Failed to get Spotify access token: {e}")
            raise

    async def _check_rate_limit(self):
        """Enforce rate limiting."""
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

    async def _make_request(self, endpoint: str, params: Optional[Dict] = None, retries: int = 3) -> Dict[str, Any]:
        """Make authenticated request to Spotify API with retry logic."""
        await self._check_rate_limit()

        token = await self._get_access_token()
        url = f"{self.base_url}/{endpoint}"

        for attempt in range(retries):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        url,
                        headers={"Authorization": f"Bearer {token}"},
                        params=params,
                        timeout=15.0
                    )

                    if response.status_code == 429:
                        retry_after = int(response.headers.get("Retry-After", 1))
                        app_logger.warning(f"Rate limited by Spotify, waiting {retry_after}s")
                        await asyncio.sleep(retry_after)
                        continue

                    response.raise_for_status()
                    return response.json()

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    self.access_token = None
                    token = await self._get_access_token()
                    continue

                app_logger.error(f"HTTP error on attempt {attempt + 1}: {e}")
                if attempt == retries - 1:
                    raise

            except Exception as e:
                app_logger.error(f"Request error on attempt {attempt + 1}: {e}")
                if attempt == retries - 1:
                    raise

            await asyncio.sleep(2 ** attempt)

    async def fetch_trending_playlists(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch trending playlists."""
        try:
            data = await self._make_request(
                "browse/featured-playlists",
                params={"limit": limit, "country": "US"}
            )

            playlists = data.get("playlists", {}).get("items", [])
            app_logger.info(f"Fetched {len(playlists)} trending playlists from Spotify")
            return playlists

        except Exception as e:
            app_logger.error(f"Error fetching trending playlists: {e}")
            return []

    async def fetch_playlist_tracks(self, playlist_id: str) -> List[Dict[str, Any]]:
        """Fetch tracks from a playlist."""
        try:
            data = await self._make_request(f"playlists/{playlist_id}/tracks")
            tracks = data.get("items", [])
            return tracks

        except Exception as e:
            app_logger.error(f"Error fetching playlist tracks: {e}")
            return []

    async def fetch_artist_data(self, artist_id: str) -> Optional[Dict[str, Any]]:
        """Fetch detailed artist data."""
        try:
            data = await self._make_request(f"artists/{artist_id}")
            return data

        except Exception as e:
            app_logger.error(f"Error fetching artist data: {e}")
            return None

    async def search_artists(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for artists."""
        try:
            data = await self._make_request(
                "search",
                params={"q": query, "type": "artist", "limit": limit}
            )

            artists = data.get("artists", {}).get("items", [])
            return artists

        except Exception as e:
            app_logger.error(f"Error searching artists: {e}")
            return []

    async def fetch_trending_artists(self) -> List[Dict[str, Any]]:
        """Fetch trending artists by analyzing featured playlists."""
        try:
            playlists = await self.fetch_trending_playlists(limit=10)
            artist_data = {}

            for playlist in playlists:
                playlist_id = playlist.get("id")
                if not playlist_id:
                    continue

                tracks = await self.fetch_playlist_tracks(playlist_id)

                for item in tracks:
                    track = item.get("track", {})
                    if not track:
                        continue

                    for artist in track.get("artists", []):
                        artist_id = artist.get("id")
                        if artist_id and artist_id not in artist_data:
                            artist_info = await self.fetch_artist_data(artist_id)
                            if artist_info:
                                artist_data[artist_id] = artist_info

            app_logger.info(f"Collected data for {len(artist_data)} trending artists")
            return list(artist_data.values())

        except Exception as e:
            app_logger.error(f"Error fetching trending artists: {e}")
            return []


# Global Spotify fetcher instance
spotify_fetcher = SpotifyFetcher()
