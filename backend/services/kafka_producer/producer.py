"""Kafka producer service for publishing events."""

from kafka import KafkaProducer
from kafka.errors import KafkaError, KafkaTimeoutError
import json
from typing import Dict, Any, Optional
from datetime import datetime
from backend.utils.config import settings
from backend.utils.logger import app_logger


class KafkaProducerService:
    """Kafka producer for publishing music trend events."""

    def __init__(self):
        self.producer: Optional[KafkaProducer] = None
        self._connected: bool = False

    def connect(self):
        """Initialize Kafka producer connection."""
        try:
            app_logger.info(f"Connecting to Kafka at {settings.KAFKA_BOOTSTRAP_SERVERS}")

            self.producer = KafkaProducer(
                bootstrap_servers=settings.kafka_bootstrap_servers_list,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None,
                acks='all',  # Wait for all replicas to acknowledge
                retries=3,
                max_in_flight_requests_per_connection=5,
                compression_type='gzip',
                linger_ms=10,  # Batch messages for efficiency
                batch_size=16384,
            )

            self._connected = True
            app_logger.info("Successfully connected to Kafka producer")

        except KafkaError as e:
            app_logger.error(f"Failed to connect to Kafka producer: {e}")
            raise

    def disconnect(self):
        """Close Kafka producer connection."""
        if self.producer:
            self.producer.flush()
            self.producer.close()
            self._connected = False
            app_logger.info("Disconnected from Kafka producer")

    def is_connected(self) -> bool:
        """Check if producer is connected."""
        return self._connected

    def _add_metadata(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Add metadata to event data."""
        data['_metadata'] = {
            'timestamp': datetime.utcnow().isoformat(),
            'producer': 'music-trend-producer',
            'version': '1.0'
        }
        return data

    def publish_spotify_event(self, data: Dict[str, Any], key: Optional[str] = None):
        """Publish Spotify event to Kafka."""
        return self._publish(settings.KAFKA_TOPIC_SPOTIFY, data, key)

    def publish_reddit_event(self, data: Dict[str, Any], key: Optional[str] = None):
        """Publish Reddit event to Kafka."""
        return self._publish(settings.KAFKA_TOPIC_REDDIT, data, key)

    def publish_youtube_event(self, data: Dict[str, Any], key: Optional[str] = None):
        """Publish YouTube event to Kafka."""
        return self._publish(settings.KAFKA_TOPIC_YOUTUBE, data, key)

    def publish_processed_trend(self, data: Dict[str, Any], key: Optional[str] = None):
        """Publish processed trend event to Kafka."""
        return self._publish(settings.KAFKA_TOPIC_PROCESSED, data, key)

    def _publish(self, topic: str, data: Dict[str, Any], key: Optional[str] = None):
        """Publish event to specified Kafka topic."""
        if not self._connected:
            raise RuntimeError("Kafka producer is not connected")

        try:
            # Add metadata
            enriched_data = self._add_metadata(data)

            # Send to Kafka
            future = self.producer.send(
                topic,
                value=enriched_data,
                key=key
            )

            # Wait for acknowledgment (with timeout)
            record_metadata = future.get(timeout=10)

            app_logger.debug(
                f"Published to {topic} - partition: {record_metadata.partition}, "
                f"offset: {record_metadata.offset}"
            )

            return True

        except KafkaTimeoutError as e:
            app_logger.error(f"Timeout publishing to {topic}: {e}")
            return False

        except KafkaError as e:
            app_logger.error(f"Error publishing to {topic}: {e}")
            return False

    def publish_batch(self, topic: str, events: list[Dict[str, Any]]):
        """Publish multiple events to a topic."""
        if not self._connected:
            raise RuntimeError("Kafka producer is not connected")

        success_count = 0
        for event in events:
            if self._publish(topic, event):
                success_count += 1

        app_logger.info(f"Published {success_count}/{len(events)} events to {topic}")
        return success_count


# Global producer instance
kafka_producer = KafkaProducerService()
