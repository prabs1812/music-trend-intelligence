"""Anomaly detection for identifying unusual patterns in music trends."""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import IsolationForest
from backend.database.mongodb import mongodb_manager
from backend.models.anomaly import AnomalyCreate, AnomalyType, AlertLevel
from backend.utils.config import settings
from backend.utils.logger import app_logger


class AnomalyDetector:
    """Detect anomalies in music trend data using statistical methods."""

    def __init__(self):
        self.z_score_threshold = settings.ANOMALY_DETECTION_THRESHOLD
        self.spike_threshold = settings.ANOMALY_SPIKE_THRESHOLD
        self.isolation_forest = None

    async def detect_z_score_anomalies(self, artist_name: str, metric: str, current_value: float) -> Optional[Dict]:
        """
        Detect anomalies using Z-score method.
        Anomaly if |z-score| > threshold (default 3.0).
        """
        try:
            db = mongodb_manager.db
            if not db:
                return None

            # Get historical data for the metric
            seven_days_ago = datetime.utcnow() - timedelta(days=7)

            trends = await db.trends.find({
                "artist_name": artist_name,
                "timestamp": {"$gte": seven_days_ago}
            }).to_list(length=1000)

            if len(trends) < 10:  # Need sufficient data
                return None

            # Extract metric values
            values = []
            for trend in trends:
                if metric == "mentions":
                    val = trend.get("engagement", {}).get("comments", 0)
                elif metric == "engagement":
                    val = (trend.get("engagement", {}).get("likes", 0) +
                          trend.get("engagement", {}).get("views", 0) / 100)
                else:
                    val = 0
                values.append(val)

            if not values:
                return None

            # Calculate statistics
            mean = np.mean(values)
            std = np.std(values)

            if std == 0:
                return None

            # Calculate Z-score
            z_score = (current_value - mean) / std

            # Check if anomaly
            if abs(z_score) > self.z_score_threshold:
                anomaly_type = AnomalyType.SPIKE if z_score > 0 else AnomalyType.DROP
                deviation_pct = ((current_value - mean) / mean * 100) if mean > 0 else 0

                # Determine alert level
                if abs(z_score) > 5:
                    alert_level = AlertLevel.CRITICAL
                elif abs(z_score) > 4:
                    alert_level = AlertLevel.HIGH
                elif abs(z_score) > 3:
                    alert_level = AlertLevel.MEDIUM
                else:
                    alert_level = AlertLevel.LOW

                return {
                    "artist_name": artist_name,
                    "anomaly_type": anomaly_type,
                    "alert_level": alert_level,
                    "metric": metric,
                    "current_value": current_value,
                    "expected_value": mean,
                    "z_score": round(z_score, 2),
                    "deviation_percentage": round(deviation_pct, 2),
                    "description": f"{'Spike' if z_score > 0 else 'Drop'} in {metric} ({abs(deviation_pct):.1f}% {'above' if z_score > 0 else 'below'} baseline)",
                    "detection_method": "z_score"
                }

            return None

        except Exception as e:
            app_logger.error(f"Error in Z-score anomaly detection: {e}")
            return None

    async def detect_spike_anomalies(self, artist_name: str) -> List[Dict]:
        """Detect sudden spikes in mentions or engagement (>200% increase)."""
        try:
            db = mongodb_manager.db
            if not db:
                return []

            # Get recent trends
            one_day_ago = datetime.utcnow() - timedelta(days=1)
            seven_days_ago = datetime.utcnow() - timedelta(days=7)

            recent_trends = await db.trends.find({
                "artist_name": artist_name,
                "timestamp": {"$gte": one_day_ago}
            }).to_list(length=100)

            historical_trends = await db.trends.find({
                "artist_name": artist_name,
                "timestamp": {"$gte": seven_days_ago, "$lt": one_day_ago}
            }).to_list(length=1000)

            if not recent_trends or not historical_trends:
                return []

            # Calculate averages
            recent_mentions = sum(t.get("engagement", {}).get("comments", 0) for t in recent_trends)
            historical_avg = sum(t.get("engagement", {}).get("comments", 0) for t in historical_trends) / len(historical_trends)

            if historical_avg == 0:
                return []

            # Check for spike
            increase_pct = ((recent_mentions - historical_avg) / historical_avg) * 100

            anomalies = []
            if increase_pct > 200:  # 200% increase
                anomalies.append({
                    "artist_name": artist_name,
                    "anomaly_type": AnomalyType.SPIKE,
                    "alert_level": AlertLevel.HIGH if increase_pct > 400 else AlertLevel.MEDIUM,
                    "metric": "mentions",
                    "current_value": recent_mentions,
                    "expected_value": historical_avg,
                    "z_score": 0.0,
                    "deviation_percentage": round(increase_pct, 2),
                    "description": f"Sudden spike in mentions ({increase_pct:.1f}% increase)",
                    "detection_method": "spike_detection"
                })

            return anomalies

        except Exception as e:
            app_logger.error(f"Error in spike detection: {e}")
            return []

    async def detect_sentiment_shift(self, artist_name: str) -> Optional[Dict]:
        """Detect significant shifts in sentiment."""
        try:
            db = mongodb_manager.db
            if not db:
                return None

            # Get recent artist data
            artist = await db.artists.find_one({"name": artist_name})
            if not artist:
                return None

            current_sentiment = artist.get("sentiment_score", 0)

            # Get historical sentiment
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            comments = await db.comments.find({
                "mentioned_artists": artist_name,
                "timestamp": {"$gte": seven_days_ago}
            }).to_list(length=1000)

            if len(comments) < 10:
                return None

            historical_sentiments = [c.get("sentiment_score", 0) for c in comments if c.get("sentiment_score") is not None]
            if not historical_sentiments:
                return None

            avg_historical = np.mean(historical_sentiments)

            # Check for significant shift
            shift = abs(current_sentiment - avg_historical)

            if shift > 0.5:  # Significant shift threshold
                return {
                    "artist_name": artist_name,
                    "anomaly_type": AnomalyType.SENTIMENT_SHIFT,
                    "alert_level": AlertLevel.MEDIUM,
                    "metric": "sentiment",
                    "current_value": current_sentiment,
                    "expected_value": avg_historical,
                    "z_score": 0.0,
                    "deviation_percentage": round(shift * 100, 2),
                    "description": f"Sentiment shift detected ({'positive' if current_sentiment > avg_historical else 'negative'} change)",
                    "detection_method": "sentiment_shift"
                }

            return None

        except Exception as e:
            app_logger.error(f"Error detecting sentiment shift: {e}")
            return None

    async def detect_isolation_forest_anomalies(self, artist_data: List[Dict]) -> List[int]:
        """Use Isolation Forest for unsupervised anomaly detection."""
        try:
            if len(artist_data) < 20:
                return []

            # Prepare feature matrix
            features = []
            for artist in artist_data:
                features.append([
                    artist.get("popularity", 0),
                    artist.get("reddit_mentions", 0),
                    artist.get("youtube_mentions", 0),
                    artist.get("sentiment_score", 0),
                    artist.get("growth_velocity", 0)
                ])

            X = np.array(features)

            # Train Isolation Forest
            clf = IsolationForest(contamination=0.1, random_state=42)
            predictions = clf.fit_predict(X)

            # Return indices of anomalies (-1 indicates anomaly)
            anomaly_indices = [i for i, pred in enumerate(predictions) if pred == -1]

            app_logger.info(f"Isolation Forest detected {len(anomaly_indices)} anomalies")
            return anomaly_indices

        except Exception as e:
            app_logger.error(f"Error in Isolation Forest detection: {e}")
            return []

    async def run_anomaly_detection(self):
        """Run all anomaly detection methods on current data."""
        try:
            db = mongodb_manager.db
            if not db:
                return

            app_logger.info("Starting anomaly detection cycle")

            # Get all artists
            artists = await db.artists.find({}).to_list(length=None)

            detected_anomalies = []

            for artist in artists:
                artist_name = artist["name"]

                # Z-score detection for mentions
                mentions_anomaly = await self.detect_z_score_anomalies(
                    artist_name,
                    "mentions",
                    artist.get("reddit_mentions", 0) + artist.get("youtube_mentions", 0)
                )
                if mentions_anomaly:
                    detected_anomalies.append(mentions_anomaly)

                # Spike detection
                spike_anomalies = await self.detect_spike_anomalies(artist_name)
                detected_anomalies.extend(spike_anomalies)

                # Sentiment shift detection
                sentiment_anomaly = await self.detect_sentiment_shift(artist_name)
                if sentiment_anomaly:
                    detected_anomalies.append(sentiment_anomaly)

            # Save anomalies to database
            for anomaly_data in detected_anomalies:
                await db.anomalies.insert_one({
                    **anomaly_data,
                    "timestamp": datetime.utcnow(),
                    "acknowledged": False,
                    "dismissed": False
                })

            app_logger.info(f"Detected and saved {len(detected_anomalies)} anomalies")

        except Exception as e:
            app_logger.error(f"Error in anomaly detection cycle: {e}")


# Global anomaly detector instance
anomaly_detector = AnomalyDetector()
