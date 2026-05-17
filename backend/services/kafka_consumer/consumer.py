"""Kafka consumer service for processing events."""

from kafka import KafkaConsumer
from kafka.errors import KafkaError
import json
from typing import Optional, Callable, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
from backend.utils.config import settings
from backend.utils.logger import app_logger


class KafkaConsumerService:
    """Kafka consumer for processing music trend events."""

    def __init__(self):
        self.consumer: Optional[KafkaConsumer] = None
        self._connected: bool = False
        self._running: bool = False
        self.executor = ThreadPoolExecutor(max_workers=4)

        # Event handlers
        self.handlers: Dict[str, Callable] = {}

    def connect(self):
        """Initialize Kafka consumer connection."""
        try:
            app_logger.info(f"Connecting to Kafka consumer at {settings.KAFKA_BOOTSTRAP_SERVERS}")

            topics = [
                settings.KAFKA_TOPIC_SPOTIFY,
                settings.KAFKA_TOPIC_REDDIT,
                settings.KAFKA_TOPIC_YOUTUBE,
            ]

            self.consumer = KafkaConsumer(
                *topics,
                bootstrap_servers=settings.kafka_bootstrap_servers_list,
                group_id=settings.KAFKA_CONSUMER_GROUP,
                auto_offset_reset=settings.KAFKA_AUTO_OFFSET_RESET,
                enable_auto_commit=settings.KAFKA_ENABLE_AUTO_COMMIT,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                key_deserializer=lambda k: k.decode('utf-8') if k else None,
                max_poll_records=100,
                session_timeout_ms=30000,
                heartbeat_interval_ms=10000,
            )

            self._connected = True
            app_logger.info(f"Successfully connected to Kafka consumer, subscribed to: {topics}")

        except KafkaError as e:
            app_logger.error(f"Failed to connect to Kafka consumer: {e}")
            raise

    def disconnect(self):
        """Close Kafka consumer connection."""
        self._running = False
        if self.consumer:
            self.consumer.close()
            self._connected = False
            app_logger.info("Disconnected from Kafka consumer")

    def is_connected(self) -> bool:
        """Check if consumer is connected."""
        return self._connected

    def register_handler(self, topic: str, handler: Callable):
        """Register a handler function for a specific topic."""
        self.handlers[topic] = handler
        app_logger.info(f"Registered handler for topic: {topic}")

    async def start_consuming(self):
        """Start consuming messages from Kafka."""
        if not self._connected:
            raise RuntimeError("Kafka consumer is not connected")

        self._running = True
        app_logger.info("Starting Kafka consumer loop")

        try:
            while self._running:
                # Poll for messages (non-blocking with timeout)
                messages = self.consumer.poll(timeout_ms=1000, max_records=50)

                if not messages:
                    await asyncio.sleep(0.1)
                    continue

                # Process messages
                for topic_partition, records in messages.items():
                    topic = topic_partition.topic

                    app_logger.debug(f"Received {len(records)} messages from {topic}")

                    for record in records:
                        try:
                            await self._process_message(topic, record)
                        except Exception as e:
                            app_logger.error(f"Error processing message from {topic}: {e}")
                            # Continue processing other messages

                # Small delay to prevent CPU spinning
                await asyncio.sleep(0.01)

        except Exception as e:
            app_logger.error(f"Error in consumer loop: {e}")
            raise
        finally:
            self._running = False

    async def _process_message(self, topic: str, record):
        """Process a single Kafka message."""
        try:
            data = record.value
            key = record.key

            app_logger.debug(
                f"Processing message from {topic} - "
                f"partition: {record.partition}, offset: {record.offset}"
            )

            # Get handler for this topic
            handler = self.handlers.get(topic)

            if handler:
                # Execute handler
                if asyncio.iscoroutinefunction(handler):
                    await handler(data, key)
                else:
                    # Run sync handler in executor
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(self.executor, handler, data, key)
            else:
                app_logger.warning(f"No handler registered for topic: {topic}")

        except Exception as e:
            app_logger.error(f"Error processing message: {e}")
            # Could implement dead letter queue here
            raise

    def stop(self):
        """Stop the consumer loop."""
        app_logger.info("Stopping Kafka consumer")
        self._running = False


# Global consumer instance
kafka_consumer = KafkaConsumerService()
