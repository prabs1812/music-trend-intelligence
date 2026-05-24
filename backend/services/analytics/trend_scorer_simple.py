"""
Simple trend scoring service that calculates meaningful scores from Last.fm data.
This makes the dashboard show real numbers instead of zeros.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from backend.database.mongodb import mongodb_manager
from backend.utils.logger import app_logger


class SimpleTrendScorer:
    """Calculate trend scores from Last.fm playcount and listeners data."""

    def __init__(self):
        self.db = None

    async def initialize(self):
        """Initialize database connection."""
        if not mongodb_manager.is_connected():
            await mongodb_manager.connect()
        self.db = mongodb_manager.db

    async def calculate_trend_scores(self):
        """Calculate and update trend scores for all artists."""
        try:
            app_logger.info("Starting trend score calculation...")

            # Get all artists from database
            artists = await self.db.artists.find({}).to_list(length=None)

            if not artists:
                app_logger.warning("No artists found in database")
                return

            # Calculate max values for normalization
            max_listeners = max([a.get('listeners', 0) for a in artists])
            max_playcount = max([a.get('playcount', 0) for a in artists])

            app_logger.info(f"Processing {len(artists)} artists...")
            app_logger.info(f"Max listeners: {max_listeners}, Max playcount: {max_playcount}")

            updated_count = 0

            for artist in artists:
                artist_name = artist.get('name')
                listeners = artist.get('listeners', 0)
                playcount = artist.get('playcount', 0)

                # Calculate normalized scores (0-100)
                popularity = self._calculate_popularity(listeners, max_listeners)
                engagement = self._calculate_engagement(playcount, max_playcount)

                # Calculate trend score (weighted average)
                trend_score = self._calculate_trend_score(popularity, engagement)

                # Calculate growth velocity (compare with previous data)
                growth_velocity = await self._calculate_growth_velocity(artist_name, listeners, playcount)

                # Update artist document
                update_data = {
                    'popularity': popularity,
                    'trend_score': trend_score,
                    'growth_velocity': growth_velocity,
                    'last_scored': datetime.utcnow()
                }

                await self.db.artists.update_one(
                    {'name': artist_name},
                    {'$set': update_data}
                )

                updated_count += 1

                app_logger.debug(
                    f"Updated {artist_name}: "
                    f"trend_score={trend_score:.1f}, "
                    f"popularity={popularity:.1f}, "
                    f"growth_velocity={growth_velocity:.2f}"
                )

            app_logger.info(f"Successfully updated trend scores for {updated_count} artists")

            # Store snapshot for growth calculation
            await self._store_snapshot(artists)

        except Exception as e:
            app_logger.error(f"Error calculating trend scores: {e}")
            raise

    def _calculate_popularity(self, listeners: int, max_listeners: int) -> float:
        """
        Calculate popularity score (0-100) based on listeners.
        Uses logarithmic scale to handle wide range of values.
        """
        if max_listeners == 0 or listeners == 0:
            return 0.0

        # Logarithmic normalization for better distribution
        import math
        log_listeners = math.log10(listeners + 1)
        log_max = math.log10(max_listeners + 1)

        popularity = (log_listeners / log_max) * 100
        return round(min(100, max(0, popularity)), 2)

    def _calculate_engagement(self, playcount: int, max_playcount: int) -> float:
        """
        Calculate engagement score (0-100) based on playcount.
        """
        if max_playcount == 0 or playcount == 0:
            return 0.0

        import math
        log_playcount = math.log10(playcount + 1)
        log_max = math.log10(max_playcount + 1)

        engagement = (log_playcount / log_max) * 100
        return round(min(100, max(0, engagement)), 2)

    def _calculate_trend_score(self, popularity: float, engagement: float) -> float:
        """
        Calculate overall trend score (0-100).
        Weighted average of popularity and engagement.
        """
        # 60% popularity, 40% engagement
        trend_score = (popularity * 0.6) + (engagement * 0.4)
        return round(min(100, max(0, trend_score)), 2)

    async def _calculate_growth_velocity(
        self,
        artist_name: str,
        current_listeners: int,
        current_playcount: int
    ) -> float:
        """
        Calculate growth velocity by comparing with previous snapshot.
        Returns value between -10 and +10.
        """
        try:
            # Get previous snapshot (from last scoring run)
            snapshot = await self.db.trend_snapshots.find_one(
                {'artist_name': artist_name},
                sort=[('timestamp', -1)]
            )

            if not snapshot:
                return 0.0  # No previous data

            prev_listeners = snapshot.get('listeners', 0)
            prev_playcount = snapshot.get('playcount', 0)

            if prev_listeners == 0 and prev_playcount == 0:
                return 0.0

            # Calculate percentage change
            listener_change = 0
            if prev_listeners > 0:
                listener_change = ((current_listeners - prev_listeners) / prev_listeners) * 100

            playcount_change = 0
            if prev_playcount > 0:
                playcount_change = ((current_playcount - prev_playcount) / prev_playcount) * 100

            # Average the changes
            avg_change = (listener_change + playcount_change) / 2

            # Normalize to -10 to +10 scale
            # Cap at ±50% change = ±10 velocity
            velocity = (avg_change / 50) * 10
            velocity = max(-10, min(10, velocity))

            return round(velocity, 2)

        except Exception as e:
            app_logger.error(f"Error calculating growth velocity for {artist_name}: {e}")
            return 0.0

    async def _store_snapshot(self, artists: List[Dict]):
        """Store current data snapshot for future growth calculation."""
        try:
            timestamp = datetime.utcnow()

            # Store snapshot for each artist
            for artist in artists:
                snapshot = {
                    'artist_name': artist.get('name'),
                    'listeners': artist.get('listeners', 0),
                    'playcount': artist.get('playcount', 0),
                    'timestamp': timestamp
                }

                await self.db.trend_snapshots.insert_one(snapshot)

            # Clean up old snapshots (keep only last 7 days)
            cutoff_date = datetime.utcnow() - timedelta(days=7)
            result = await self.db.trend_snapshots.delete_many(
                {'timestamp': {'$lt': cutoff_date}}
            )

            app_logger.info(f"Stored snapshot for {len(artists)} artists, cleaned up {result.deleted_count} old snapshots")

        except Exception as e:
            app_logger.error(f"Error storing snapshot: {e}")


# Global instance
trend_scorer = SimpleTrendScorer()


async def run_trend_scoring():
    """Run trend scoring as a standalone job."""
    try:
        await trend_scorer.initialize()
        await trend_scorer.calculate_trend_scores()
        app_logger.info("Trend scoring completed successfully")
    except Exception as e:
        app_logger.error(f"Trend scoring failed: {e}")
        raise


if __name__ == "__main__":
    # Run trend scoring
    asyncio.run(run_trend_scoring())
