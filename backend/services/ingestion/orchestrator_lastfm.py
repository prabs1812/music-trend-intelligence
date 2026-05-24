"""Data ingestion orchestrator using Last.fm, MusicBrainz, YouTube APIs."""

import asyncio
from datetime import datetime
from typing import Dict, Any, List
from backend.services.ingestion.lastfm_fetcher import lastfm_fetcher
from backend.services.ingestion.musicbrainz_fetcher import musicbrainz_fetcher
from backend.services.ingestion.reddit_fetcher import reddit_fetcher
from backend.services.ingestion.youtube_fetcher import youtube_fetcher
from backend.services.kafka_producer.producer import kafka_producer
from backend.database.mongodb import mongodb_manager
from backend.utils.config import settings
from backend.utils.logger import app_logger


class IngestionOrchestrator:
    """Orchestrates data ingestion from Last.fm, MusicBrainz, Reddit, and YouTube."""

    def __init__(self):
        self.running = False
        self.interval = settings.INGESTION_INTERVAL_SECONDS

    def _get_artist_image(self, artist: Dict[str, Any]) -> str:
        """
        Extract artist image URL from Last.fm data.
        Returns the largest available image or empty string.
        """
        images = artist.get("image", [])
        if not images:
            return ""

        # Last.fm returns images in multiple sizes
        # Priority: extralarge > large > medium > small
        for img in reversed(images):  # Reversed to get largest first
            url = img.get("#text", "")
            if url and url.strip():
                return url

        return ""

    async def fetch_lastfm_data(self) -> List[Dict[str, Any]]:
        """Fetch and process Last.fm trending data."""
        try:
            app_logger.info("Starting Last.fm data fetch")

            # Fetch top artists
            artists = await lastfm_fetcher.fetch_top_artists(limit=30)

            events = []
            for artist in artists:
                # Enrich with MusicBrainz metadata if MBID is available
                mbid = artist.get("mbid")
                enriched_data = {}

                if mbid:
                    app_logger.debug(f"Enriching {artist['name']} with MusicBrainz data")
                    enriched_data = await musicbrainz_fetcher.enrich_artist_data(
                        artist["name"],
                        mbid
                    )
                    # Small delay to respect MusicBrainz rate limit
                    await asyncio.sleep(1.1)
                else:
                    # Try to get MusicBrainz data by name
                    enriched_data = await musicbrainz_fetcher.enrich_artist_data(
                        artist["name"]
                    )
                    await asyncio.sleep(1.1)

                # Combine Last.fm and MusicBrainz data
                event = {
                    "event_type": "artist_data",
                    "artist_name": artist.get("name"),
                    "mbid": enriched_data.get("mbid") or artist.get("mbid"),

                    # Last.fm metrics
                    "playcount": artist.get("playcount", 0),
                    "listeners": artist.get("listeners", 0),

                    # Artist image from Last.fm
                    "image_url": self._get_artist_image(artist),

                    # MusicBrainz metadata
                    "genres": enriched_data.get("genres", []),
                    "tags": enriched_data.get("tags", []),
                    "country": enriched_data.get("country"),
                    "type": enriched_data.get("type"),

                    # Popularity calculation (based on listeners)
                    "popularity": min(100, (artist.get("listeners", 0) / 100000) * 10),

                    "timestamp": datetime.utcnow().isoformat()
                }
                events.append(event)

                # Publish to Kafka (optional)
                try:
                    if kafka_producer.is_connected():
                        kafka_producer.publish_spotify_event(event, key=artist.get("name"))
                except Exception as e:
                    app_logger.debug(f"Kafka publish skipped: {e}")

            app_logger.info(f"Processed {len(events)} Last.fm/MusicBrainz events")

            # Save to MongoDB
            if events and mongodb_manager.db is not None:
                try:
                    # Save artist data to artists collection
                    for event in events:
                        artist_doc = {
                            "name": event["artist_name"],
                            "mbid": event.get("mbid"),
                            "popularity": event.get("popularity", 0),
                            "image_url": event.get("image_url", ""),
                            "genres": event.get("genres", []),
                            "tags": event.get("tags", []),
                            "country": event.get("country"),
                            "type": event.get("type"),
                            "playcount": event.get("playcount", 0),
                            "listeners": event.get("listeners", 0),
                            "last_updated": datetime.utcnow()
                        }
                        # Upsert artist (update if exists, insert if not)
                        await mongodb_manager.db.artists.update_one(
                            {"name": event["artist_name"]},
                            {"$set": artist_doc},
                            upsert=True
                        )
                    app_logger.info(f"Saved {len(events)} artists to MongoDB")
                except Exception as e:
                    app_logger.error(f"Error saving artists to MongoDB: {e}")

            return events

        except Exception as e:
            app_logger.error(f"Error in Last.fm data fetch: {e}")
            return []

    async def fetch_reddit_data(self) -> List[Dict[str, Any]]:
        """Fetch and process Reddit data."""
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

                # Publish to Kafka (optional)
                try:
                    if kafka_producer.is_connected():
                        kafka_producer.publish_reddit_event(event, key=post.get("id"))
                except Exception as e:
                    app_logger.debug(f"Kafka publish skipped: {e}")

            app_logger.info(f"Processed {len(events)} Reddit events")
            return events

        except Exception as e:
            app_logger.error(f"Error in Reddit data fetch: {e}")
            return []

    async def fetch_genre_data(self) -> List[Dict[str, Any]]:
        """Fetch genre/tag data from Last.fm."""
        try:
            app_logger.info("Starting genre data fetch")
            tags = await lastfm_fetcher.fetch_top_tags(limit=15)

            events = []
            for tag in tags:
                event = {
                    "event_type": "genre_data",
                    "genre_name": tag.get("name"),
                    "reach": tag.get("reach", 0),
                    "taggings": tag.get("taggings", 0),
                    "timestamp": datetime.utcnow().isoformat()
                }
                events.append(event)

                # Publish to Kafka (optional - using youtube topic for now)
                try:
                    if kafka_producer.is_connected():
                        kafka_producer.publish_youtube_event(event, key=tag.get("name"))
                except Exception as e:
                    app_logger.debug(f"Kafka publish skipped: {e}")

            app_logger.info(f"Processed {len(events)} genre events")

            # Save to MongoDB
            if events and mongodb_manager.db is not None:
                try:
                    for event in events:
                        genre_doc = {
                            "name": event["genre_name"],
                            "reach": event.get("reach", 0),
                            "taggings": event.get("taggings", 0),
                            "last_updated": datetime.utcnow()
                        }
                        await mongodb_manager.db.genres.update_one(
                            {"name": event["genre_name"]},
                            {"$set": genre_doc},
                            upsert=True
                        )
                    app_logger.info(f"Saved {len(events)} genres to MongoDB")
                except Exception as e:
                    app_logger.error(f"Error saving genres to MongoDB: {e}")

            return events

        except Exception as e:
            app_logger.error(f"Error in genre data fetch: {e}")
            return []

    async def run_ingestion_cycle(self):
        """Run a single ingestion cycle from all sources."""
        app_logger.info("=" * 60)
        app_logger.info("Starting ingestion cycle (Last.fm + MusicBrainz + YouTube)")
        app_logger.info("=" * 60)

        start_time = datetime.utcnow()

        # Fetch Last.fm data (includes MusicBrainz enrichment)
        lastfm_results = await self.fetch_lastfm_data()

        # Get artist names for YouTube search
        artist_names = [event.get("artist_name") for event in lastfm_results if event.get("artist_name")]

        # Fetch YouTube data for these artists
        youtube_mentions = {}
        if artist_names and settings.YOUTUBE_API_KEY:
            try:
                app_logger.info("Fetching YouTube data for artists...")
                youtube_mentions = await self.fetch_youtube_data(artist_names)

                # Update artist documents with YouTube mentions
                if youtube_mentions and mongodb_manager.db is not None:
                    for artist_name, mention_count in youtube_mentions.items():
                        await mongodb_manager.db.artists.update_one(
                            {"name": artist_name},
                            {"$set": {"youtube_mentions": mention_count}},
                            upsert=False
                        )
                    app_logger.info(f"Updated {len(youtube_mentions)} artists with YouTube data")
            except Exception as e:
                app_logger.error(f"YouTube fetch failed: {e}")

        # Fetch Reddit data in parallel with genre data
        reddit_results, genre_results = await asyncio.gather(
            self.fetch_reddit_data(),
            self.fetch_genre_data(),
            return_exceptions=True
        )

        # Count successful events
        total_events = len(lastfm_results) + len(youtube_mentions)
        for result in [reddit_results, genre_results]:
            if isinstance(result, list):
                total_events += len(result)
            elif isinstance(result, Exception):
                app_logger.error(f"Ingestion error: {result}")

        elapsed = (datetime.utcnow() - start_time).total_seconds()

        app_logger.info("=" * 60)
        app_logger.info(f"Ingestion cycle completed in {elapsed:.2f}s")
        app_logger.info(f"Total events processed: {total_events}")
        app_logger.info("=" * 60)

        # Calculate trend scores after ingestion
        try:
            app_logger.info("Calculating trend scores...")
            from backend.services.analytics.trend_scorer_simple import trend_scorer
            await trend_scorer.initialize()
            await trend_scorer.calculate_trend_scores()
            app_logger.info("Trend scoring completed")
        except Exception as e:
            app_logger.error(f"Trend scoring failed: {e}")

    async def fetch_youtube_data(self, artist_names: List[str]) -> Dict[str, int]:
        """
        Fetch YouTube data for artists.
        Returns dict mapping artist_name -> mention_count (video count).
        """
        try:
            app_logger.info(f"Starting YouTube data fetch for {len(artist_names)} artists")

            artist_mentions = {}

            # Search for each artist on YouTube (limit to conserve quota)
            for artist_name in artist_names[:10]:  # Limit to 10 artists
                try:
                    # Search for artist music videos
                    query = f"{artist_name} music official"
                    videos = await youtube_fetcher.search_videos(query, max_results=5)

                    if videos:
                        # Count as mentions (number of recent videos found)
                        artist_mentions[artist_name] = len(videos)

                        app_logger.debug(f"{artist_name}: {len(videos)} videos found")

                    # Small delay to respect rate limits
                    await asyncio.sleep(0.5)

                except Exception as e:
                    app_logger.error(f"Error fetching YouTube data for {artist_name}: {e}")
                    continue

            app_logger.info(f"Fetched YouTube data for {len(artist_mentions)} artists")
            return artist_mentions

        except Exception as e:
            app_logger.error(f"Error in YouTube data fetch: {e}")
            return {}

    async def start(self):
        """Start the ingestion orchestrator."""
        if self.running:
            app_logger.warning("Orchestrator is already running")
            return

        self.running = True
        app_logger.info(f"Starting ingestion orchestrator (interval: {self.interval}s)")
        app_logger.info("Using Last.fm + MusicBrainz APIs")

        # Connect to MongoDB
        if not mongodb_manager.is_connected():
            try:
                await mongodb_manager.connect()
                app_logger.info("MongoDB connected for ingestion")
            except Exception as e:
                app_logger.error(f"Failed to connect to MongoDB: {e}")
                raise

        # Connect Kafka producer (optional)
        try:
            if not kafka_producer.is_connected():
                kafka_producer.connect()
                app_logger.info("Kafka producer connected")
        except Exception as e:
            app_logger.warning(f"Kafka connection failed (running without Kafka): {e}")

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
