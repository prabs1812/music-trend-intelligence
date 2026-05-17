"""Reddit API data fetcher with rate limiting."""

import httpx
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
from backend.utils.config import settings
from backend.utils.logger import app_logger


class RedditFetcher:
    """Fetches music-related data from Reddit API."""

    def __init__(self):
        self.client_id = settings.REDDIT_CLIENT_ID
        self.client_secret = settings.REDDIT_CLIENT_SECRET
        self.user_agent = settings.REDDIT_USER_AGENT
        self.access_token: Optional[str] = None
        self.base_url = "https://oauth.reddit.com"
        self.rate_limit = settings.REDDIT_RATE_LIMIT
        self._request_count = 0
        self._last_reset = datetime.utcnow()

        # Music-related subreddits to monitor
        self.subreddits = [
            "music",
            "hiphopheads",
            "popheads",
            "indieheads",
            "electronicmusic",
            "rnb",
            "country",
            "rock"
        ]

    async def _get_access_token(self) -> str:
        """Obtain Reddit API access token."""
        if self.access_token:
            return self.access_token

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://www.reddit.com/api/v1/access_token",
                    auth=(self.client_id, self.client_secret),
                    headers={"User-Agent": self.user_agent},
                    data={"grant_type": "client_credentials"},
                    timeout=10.0
                )

                response.raise_for_status()
                data = response.json()
                self.access_token = data["access_token"]

                app_logger.info("Successfully obtained Reddit access token")
                return self.access_token

        except Exception as e:
            app_logger.error(f"Failed to get Reddit access token: {e}")
            raise

    async def _check_rate_limit(self):
        """Enforce rate limiting (60 requests per minute)."""
        now = datetime.utcnow()
        if (now - self._last_reset).total_seconds() >= 60:
            self._request_count = 0
            self._last_reset = now

        if self._request_count >= self.rate_limit:
            sleep_time = 60 - (now - self._last_reset).total_seconds()
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
            self._request_count = 0
            self._last_reset = datetime.utcnow()

        self._request_count += 1

    async def _make_request(self, endpoint: str, params: Optional[Dict] = None, retries: int = 3) -> Dict[str, Any]:
        """Make authenticated request to Reddit API with retry logic."""
        await self._check_rate_limit()

        token = await self._get_access_token()
        url = f"{self.base_url}/{endpoint}"

        for attempt in range(retries):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        url,
                        headers={
                            "Authorization": f"Bearer {token}",
                            "User-Agent": self.user_agent
                        },
                        params=params,
                        timeout=15.0
                    )

                    if response.status_code == 429:
                        retry_after = int(response.headers.get("Retry-After", 60))
                        app_logger.warning(f"Rate limited by Reddit, waiting {retry_after}s")
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

    async def fetch_subreddit_posts(self, subreddit: str, limit: int = 25, time_filter: str = "day") -> List[Dict[str, Any]]:
        """Fetch hot posts from a subreddit."""
        try:
            data = await self._make_request(
                f"r/{subreddit}/hot",
                params={"limit": limit, "t": time_filter}
            )

            posts = []
            for child in data.get("data", {}).get("children", []):
                post_data = child.get("data", {})
                posts.append({
                    "id": post_data.get("id"),
                    "title": post_data.get("title"),
                    "selftext": post_data.get("selftext", ""),
                    "author": post_data.get("author"),
                    "score": post_data.get("score", 0),
                    "upvote_ratio": post_data.get("upvote_ratio", 0),
                    "num_comments": post_data.get("num_comments", 0),
                    "created_utc": post_data.get("created_utc"),
                    "url": post_data.get("url"),
                    "permalink": f"https://reddit.com{post_data.get('permalink', '')}",
                    "subreddit": subreddit
                })

            app_logger.info(f"Fetched {len(posts)} posts from r/{subreddit}")
            return posts

        except Exception as e:
            app_logger.error(f"Error fetching posts from r/{subreddit}: {e}")
            return []

    async def fetch_post_comments(self, subreddit: str, post_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch comments from a specific post."""
        try:
            data = await self._make_request(
                f"r/{subreddit}/comments/{post_id}",
                params={"limit": limit}
            )

            comments = []
            if len(data) > 1:
                for child in data[1].get("data", {}).get("children", []):
                    comment_data = child.get("data", {})
                    if comment_data.get("body"):
                        comments.append({
                            "id": comment_data.get("id"),
                            "body": comment_data.get("body"),
                            "author": comment_data.get("author"),
                            "score": comment_data.get("score", 0),
                            "created_utc": comment_data.get("created_utc"),
                        })

            return comments

        except Exception as e:
            app_logger.error(f"Error fetching comments: {e}")
            return []

    async def fetch_all_music_posts(self) -> List[Dict[str, Any]]:
        """Fetch posts from all monitored music subreddits."""
        all_posts = []

        for subreddit in self.subreddits:
            posts = await self.fetch_subreddit_posts(subreddit, limit=25)
            all_posts.extend(posts)
            await asyncio.sleep(0.5)  # Small delay between subreddits

        app_logger.info(f"Fetched total of {len(all_posts)} posts from {len(self.subreddits)} subreddits")
        return all_posts


# Global Reddit fetcher instance
reddit_fetcher = RedditFetcher()
