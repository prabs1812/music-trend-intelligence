"""Trend scoring algorithm for ranking artists and genres."""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from backend.database.mongodb import mongodb_manager
from backend.database.redis_client import redis_manager
from backend.utils.config import settings
from backend.utils.logger import app_logger
import numpy as np


class TrendScorer:
    """Calculate trend scores for artists based on multiple metrics."""

    def __init__(self):
        self.weights = {
            "spotify_popularity": 0.30,
            "reddit_mentions": 0.25,
            "youtube_engagement": 0.25,
            "sentiment": 0.15,
            "growth_velocity": 0.05
        }

    async def calculate_trend_score(self, artist_data: Dict) -> float:
        """
        Calculate weighted trend score for an artist.

        Formula:
        trend_score = (0.3 * normalized_spotify_popularity +
                      0.25 * normalized_reddit_mentions +
                      0.25 * normalized_youtube_engagement +
                      0.15 * sentiment_score +
                      0.05 * growth_velocity)
        """
        try:
            # Extract metrics
            spotify_pop = artist_data.get("popularity", 0)
            reddit_mentions = artist_data.get("reddit_mentions", 0)
            youtube_mentions = artist_data.get("youtube_mentions", 0)
            sentiment = artist_data.get("sentiment_score", 0)
            growth = artist_data.get("growth_velocity", 0)

            # Normalize metrics to 0-1 scale
            norm_spotify = self._normalize(spotify_pop, 0, 100)
            norm_reddit = self._normalize_log(reddit_mentions, 1000)
            norm_youtube = self._normalize_log(youtube_mentions, 5000)
            norm_sentiment = (sentiment + 1) / 2  # Convert -1 to 1 range to 0-1
            norm_growth = self._normalize(growth, -10, 50)

            # Calculate weighted score
            score = (
                self.weights["spotify_popularity"] * norm_spotify +
                self.weights["reddit_mentions"] * norm_reddit +
                self.weights["youtube_engagement"] * norm_youtube +
                self.weights["sentiment"] * norm_sentiment +
                self.weights["growth_velocity"] * norm_growth
            )

            # Scale to 0-100
            final_score = score * 100

            return round(final_score, 2)

        except Exception as e:
            app_logger.error(f"Error calculating trend score: {e}")
            return 0.0

    def _normalize(self, value: float, min_val: float, max_val: float) -> float:
        """Normalize value to 0-1 range."""
        if max_val == min_val:
            return 0.0
        normalized = (value - min_val) / (max_val - min_val)
        return max(0.0, min(1.0, normalized))

    def _normalize_log(self, value: float, reference: float) -> float:
        """Logarithmic normalization for skewed distributions."""
        if value <= 0:
            return 0.0
        log_value = np.log1p(value)
        log_reference = np.log1p(reference)
        return min(1.0, log_value / log_reference)

    async def calculate_growth_velocity(self, artist_name: str) -> float:
        """Calculate growth velocity based on historical trend scores."""
        try:
            db = mongodb_manager.db
            if not db:
                return 0.0

            # Get historical scores from last 7 days
            seven_days_ago = datetime.utcnow() - timedelta(days=7)

            trends = await db.trends.find({
                "artist_name": artist_name,
                "timestamp": {"$gte": seven_days_ago}
            }).sort("timestamp", 1).to_list(length=100)

            if len(trends) < 2:
                return 0.0

            # Calculate rate of change
            first_score = trends[0].get("engagement", {}).get("score", 0)
            last_score = trends[-1].get("engagement", {}).get("score", 0)

            time_diff = (trends[-1]["timestamp"] - trends[0]["timestamp"]).total_seconds() / 86400  # days

            if time_diff == 0:
                return 0.0

            velocity = ((last_score - first_score) / first_score * 100) / time_diff if first_score > 0 else 0

            return round(velocity, 2)

        except Exception as e:
            app_logger.error(f"Error calculating growth velocity: {e}")
            return 0.0

    async def update_artist_scores(self):
        """Update trend scores for all artists in database."""
        try:
            db = mongodb_manager.db
            if not db:
                app_logger.error("MongoDB not connected")
                return

            artists = await db.artists.find({}).to_list(length=None)
            app_logger.info(f"Updating trend scores for {len(artists)} artists")

            updated_count = 0
            for artist in artists:
                # Calculate growth velocity
                growth = await self.calculate_growth_velocity(artist["name"])

                # Update artist data with growth
                artist["growth_velocity"] = growth

                # Calculate new trend score
                new_score = await self.calculate_trend_score(artist)

                # Update in database
                await db.artists.update_one(
                    {"_id": artist["_id"]},
                    {
                        "$set": {
                            "trend_score": new_score,
                            "growth_velocity": growth,
                            "last_updated": datetime.utcnow()
                        }
                    }
                )

                # Update in Redis sorted set for fast retrieval
                await redis_manager.zadd(
                    "trending_artists",
                    {artist["name"]: new_score}
                )

                updated_count += 1

            app_logger.info(f"Updated trend scores for {updated_count} artists")

        except Exception as e:
            app_logger.error(f"Error updating artist scores: {e}")

    async def get_top_trending_artists(self, limit: int = 20) -> List[Dict]:
        """Get top trending artists from Redis cache."""
        try:
            # Try Redis first
            if redis_manager.is_connected():
                artist_names = await redis_manager.zrevrange(
                    "trending_artists",
                    0,
                    limit - 1,
                    withscores=True
                )

                if artist_names:
                    results = []
                    for i, (name, score) in enumerate(artist_names):
                        results.append({
                            "rank": i + 1,
                            "name": name,
                            "trend_score": score
                        })
                    return results

            # Fallback to MongoDB
            db = mongodb_manager.db
            if not db:
                return []

            artists = await db.artists.find({}).sort("trend_score", -1).limit(limit).to_list(length=limit)

            results = []
            for i, artist in enumerate(artists):
                results.append({
                    "rank": i + 1,
                    "name": artist["name"],
                    "trend_score": artist.get("trend_score", 0)
                })

            return results

        except Exception as e:
            app_logger.error(f"Error getting top trending artists: {e}")
            return []


# Global trend scorer instance
trend_scorer = TrendScorer()
