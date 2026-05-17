"""Kafka producer package."""

from backend.services.kafka_producer.producer import KafkaProducerService, kafka_producer

__all__ = ["KafkaProducerService", "kafka_producer"]
