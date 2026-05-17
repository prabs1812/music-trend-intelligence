"""Modified orchestrator that uses mock data for Spotify and YouTube."""

import asyncio
from datetime import datetime
from typing import Dict, Any, List

# Import mock fetchers instead of real ones
from backend.services.ingestion.spotify_fetcher_mock import spotify_fetcher
from backend.services.ingestion.youtube_fetcher_mock import youtube_fetcher
from backend.services.ingestion.reddit_fetcher import reddit_fetcher
from backend.services.kafka_producer.producer import kafka_producer
from backend.utils.config import settings
from backend.utils.logger import app_logger


class IngestionOrchestrator:
    """Orchestrates data ingestion from multiple sources (with mock data for Spotify/YouTube)."""

    def __init__(self):
        self.running = False
        self.interval = settings.INGESTION_INTERVAL_SECONDS

    async def fetch_spotify_data(self) -> List[Dict[str, Any]]:
        """Fetch and process Spotify data (MOCK DATA)."""
        try:
            app_logger.info("Starting Spotify data fetch (MOCK MODE)")
            artists = await spotify_fetcher.fetch_trending_artists()

            events = []
            for artist in artists:
                event = {
                    "event_type": "artist_data",
                    "artist_name": artist.get("name"),
                    "artist_id": artist.get("id"),
                    "popularity": artist.get("popularity", 0),
                    "followers": artist.get("followers", {}).get("total", 0),
                    "genres": artist.get("genres", []),
                    "timestamp": datetime.utcnow().isoformat()
                }
                events.append(event)

                # Publish to Kafka
                kafka_producer.publish_spotify_event(event, key=artist.get("id"))

            app_logger.info(f"Processed {len(events)} Spotify events (MOCK)")
            return events

        except Exception as e:
            app_logger.error(f"Error in Spotify data fetch: {e}")
            return []

    async def fetch_reddit_data(self) -> List[Dict[str, Any]]:
        """Fetch and process Reddit data (REAL API - if you have credentials)."""
        try:
            app_logger.info("Starting Reddit data fetch")
            posts = await reddit_fetcher.fetch_all_music_posts()

            events = []
            for post in posts:
                event = {
                    "event_type": "reddit_post",
                    "post_id": post.get("id"),
                    "title": post.get("title"),
                    "content": post.get("selftext", ""),
                    "subreddit": post.get("subreddit"),
                    "score": post.get("score", 0),
                    "upvote_ratio": post.get("upvote_ratio", 0),
                    "num_comments": post.get("num_comments", 0),
                    "url": post.get("permalink"),
                    "created_utc": post.get("created_utc"),
                    "timestamp": datetime.utcnow().isoformat()
                }
                events.append(event)

                # Publish to Kafka
                kafka_producer.publish_reddit_event(event, key=post.get("id"))

            app_logger.info(f"Processed {len(events)} Reddit events")
            return events

        except Exception as e:
            app_logger.error(f"Error in Reddit data fetch: {e}")
            return []

    async def fetch_youtube_data(self) -> List[Dict[str, Any]]:
        """Fetch and process YouTube data (MOCK DATA)."""
        try:
            app_logger.info("Starting YouTube data fetch (MOCK MODE)")
            videos = await youtube_fetcher.fetch_trending_music_videos()

            events = []
            for video in videos:
                event = {
                    "event_type": "youtube_video",
                    "video_id": video.get("video_id"),
                    "title": video.get("title"),
                    "channel": video.get("channel_title"),
                    "view_count": video.get("view_count", 0),
                    "like_count": video.get("like_count", 0),
                    "comment_count": video.get("comment_count", 0),
                    "published_at": video.get("published_at"),
                    "timestamp": datetime.utcnow().isoformat()
                }
                events.append(event)

                # Publish to Kafka
                kafka_producer.publish_youtube_event(event, key=video.get("video_id"))

            app_logger.info(f"Processed {len(events)} YouTube events (MOCK)")
            return events

        except Exception as e:
            app_logger.error(f"Error in YouTube data fetch: {e}")
            return []

    async def run_ingestion_cycle(self):
        """Run a single ingestion cycle from all sources."""
        app_logger.info("=" * 60)
        app_logger.info("Starting ingestion cycle (Spotify & YouTube: MOCK MODE)")
        app_logger.info("=" * 60)

        start_time = datetime.utcnow()

        # Fetch from all sources concurrently
        results = await asyncio.gather(
            self.fetch_spotify_data(),
            self.fetch_reddit_data(),
            self.fetch_youtube_data(),
            return_exceptions=True
        )

        # Count successful events
        total_events = 0
        for result in results:
            if isinstance(result, list):
                total_events += len(result)
            elif isinstance(result, Exception):
                app_logger.error(f"Ingestion error: {result}")

        elapsed = (datetime.utcnow() - start_time).total_seconds()

        app_logger.info("=" * 60)
        app_logger.info(f"Ingestion cycle completed in {elapsed:.2f}s")
        app_logger.info(f"Total events processed: {total_events}")
        app_logger.info("=" * 60)

    async def start(self):
        """Start the ingestion orchestrator."""
        if self.running:
            app_logger.warning("Orchestrator is already running")
            return

        self.running = True
        app_logger.info(f"Starting ingestion orchestrator (interval: {self.interval}s)")
        app_logger.info("NOTE: Using MOCK data for Spotify and YouTube")

        # Connect Kafka producer
        if not kafka_producer.is_connected():
            kafka_producer.connect()

        try:
            while self.running:
                await self.run_ingestion_cycle()

                # Wait for next cycle
                if self.running:
                    app_logger.info(f"Waiting {self.interval}s until next cycle...")
                    await asyncio.sleep(self.interval)

        except Exception as e:
            app_logger.error(f"Fatal error in orchestrator: {e}")
            raise
        finally:
            self.running = False

    def stop(self):
        """Stop the ingestion orchestrator."""
        app_logger.info("Stopping ingestion orchestrator")
        self.running = False


# Global orchestrator instance
ingestion_orchestrator = IngestionOrchestrator()
