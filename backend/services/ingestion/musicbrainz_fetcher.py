"""MusicBrainz API data fetcher for artist metadata and genre information."""

import httpx
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
from backend.utils.config import settings
from backend.utils.logger import app_logger


class MusicBrainzFetcher:
    """Fetches artist metadata from MusicBrainz API."""

    def __init__(self):
        self.base_url = "https://musicbrainz.org/ws/2"
        self.user_agent = settings.MUSICBRAINZ_USER_AGENT
        self.rate_limit = 1  # MusicBrainz: 1 request per second
        self._last_request = datetime.utcnow()

    async def _check_rate_limit(self):
        """Enforce rate limiting (1 request per second)."""
        now = datetime.utcnow()
        time_since_last = (now - self._last_request).total_seconds()

        if time_since_last < 1.0:
            await asyncio.sleep(1.0 - time_since_last)

        self._last_request = datetime.utcnow()

    async def _make_request(self, endpoint: str, params: Dict[str, Any], retries: int = 3) -> Dict[str, Any]:
        """Make request to MusicBrainz API with retry logic."""
        await self._check_rate_limit()

        url = f"{self.base_url}/{endpoint}"
        params["fmt"] = "json"

        for attempt in range(retries):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        url,
                        params=params,
                        headers={"User-Agent": self.user_agent},
                        timeout=15.0
                    )

                    if response.status_code == 503:
                        app_logger.warning("MusicBrainz rate limited, waiting...")
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

    async def search_artist(self, artist_name: str) -> Optional[Dict[str, Any]]:
        """Search for an artist by name."""
        try:
            data = await self._make_request(
                "artist",
                {"query": f'artist:"{artist_name}"', "limit": 1}
            )

            artists = data.get("artists", [])
            if not artists:
                return None

            artist = artists[0]
            return {
                "id": artist.get("id"),
                "name": artist.get("name"),
                "type": artist.get("type"),
                "country": artist.get("country"),
                "disambiguation": artist.get("disambiguation", ""),
                "score": artist.get("score", 0)
            }

        except Exception as e:
            app_logger.error(f"Error searching for artist {artist_name}: {e}")
            return None

    async def fetch_artist_details(self, mbid: str) -> Optional[Dict[str, Any]]:
        """Fetch detailed artist information by MusicBrainz ID."""
        try:
            data = await self._make_request(
                f"artist/{mbid}",
                {"inc": "tags+genres+ratings+aliases"}
            )

            # Extract genres and tags
            genres = []
            for genre in data.get("genres", []):
                genres.append(genre.get("name"))

            tags = []
            for tag in data.get("tags", []):
                tags.append(tag.get("name"))

            return {
                "id": data.get("id"),
                "name": data.get("name"),
                "type": data.get("type"),
                "country": data.get("country"),
                "life_span": data.get("life-span", {}),
                "genres": genres,
                "tags": tags,
                "rating": data.get("rating", {}).get("value"),
                "disambiguation": data.get("disambiguation", "")
            }

        except Exception as e:
            app_logger.error(f"Error fetching artist details for {mbid}: {e}")
            return None

    async def fetch_artist_releases(self, mbid: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch releases (albums) for an artist."""
        try:
            data = await self._make_request(
                "release",
                {
                    "artist": mbid,
                    "type": "album",
                    "status": "official",
                    "limit": limit
                }
            )

            releases = []
            for release in data.get("releases", []):
                releases.append({
                    "id": release.get("id"),
                    "title": release.get("title"),
                    "date": release.get("date"),
                    "country": release.get("country"),
                    "status": release.get("status")
                })

            return releases

        except Exception as e:
            app_logger.error(f"Error fetching releases for {mbid}: {e}")
            return []

    async def fetch_artist_by_name(self, artist_name: str) -> Optional[Dict[str, Any]]:
        """Fetch complete artist information by name (search + details)."""
        try:
            # First search for the artist
            search_result = await self.search_artist(artist_name)
            if not search_result:
                return None

            mbid = search_result.get("id")
            if not mbid:
                return None

            # Then fetch detailed information
            details = await self.fetch_artist_details(mbid)

            if details:
                # Merge search and detail results
                details.update({
                    "country": search_result.get("country") or details.get("country"),
                    "type": search_result.get("type") or details.get("type")
                })

            return details

        except Exception as e:
            app_logger.error(f"Error fetching artist by name {artist_name}: {e}")
            return None

    async def enrich_artist_data(self, artist_name: str, mbid: Optional[str] = None) -> Dict[str, Any]:
        """Enrich artist data with MusicBrainz metadata."""
        try:
            if mbid:
                # Use provided MBID
                details = await self.fetch_artist_details(mbid)
            else:
                # Search by name
                details = await self.fetch_artist_by_name(artist_name)

            if not details:
                return {
                    "name": artist_name,
                    "genres": [],
                    "tags": [],
                    "country": None,
                    "type": None
                }

            return {
                "name": details.get("name", artist_name),
                "mbid": details.get("id"),
                "genres": details.get("genres", []),
                "tags": details.get("tags", []),
                "country": details.get("country"),
                "type": details.get("type"),
                "rating": details.get("rating"),
                "life_span": details.get("life_span", {})
            }

        except Exception as e:
            app_logger.error(f"Error enriching artist data for {artist_name}: {e}")
            return {
                "name": artist_name,
                "genres": [],
                "tags": [],
                "country": None,
                "type": None
            }


# Global MusicBrainz fetcher instance
musicbrainz_fetcher = MusicBrainzFetcher()
