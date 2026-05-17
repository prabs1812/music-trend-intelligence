#!/bin/bash

# Kafka Setup Script for Music Trend Intelligence System
# This script creates the required Kafka topics

echo "=========================================="
echo "Kafka Topics Setup"
echo "=========================================="

# Configuration
KAFKA_HOME=${KAFKA_HOME:-"/opt/kafka"}
BOOTSTRAP_SERVER="localhost:9092"
REPLICATION_FACTOR=1

# Check if Kafka is installed
if [ ! -d "$KAFKA_HOME" ]; then
    echo "Error: Kafka not found at $KAFKA_HOME"
    echo "Please set KAFKA_HOME environment variable or install Kafka"
    exit 1
fi

echo "Using Kafka installation at: $KAFKA_HOME"
echo ""

# Function to create topic
create_topic() {
    local topic_name=$1
    local partitions=$2

    echo "Creating topic: $topic_name (partitions: $partitions)"

    $KAFKA_HOME/bin/kafka-topics.sh \
        --create \
        --topic $topic_name \
        --bootstrap-server $BOOTSTRAP_SERVER \
        --partitions $partitions \
        --replication-factor $REPLICATION_FACTOR \
        --if-not-exists

    if [ $? -eq 0 ]; then
        echo "✓ Topic $topic_name created successfully"
    else
        echo "✗ Failed to create topic $topic_name"
    fi
    echo ""
}

# Check if Kafka is running
echo "Checking Kafka connection..."
$KAFKA_HOME/bin/kafka-broker-api-versions.sh --bootstrap-server $BOOTSTRAP_SERVER > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to Kafka at $BOOTSTRAP_SERVER"
    echo "Please ensure Kafka is running"
    exit 1
fi

echo "✓ Kafka is running"
echo ""

# Create topics
create_topic "spotify_events" 3
create_topic "reddit_events" 3
create_topic "youtube_events" 3
create_topic "processed_trends" 5

# List all topics
echo "=========================================="
echo "Current Kafka Topics:"
echo "=========================================="
$KAFKA_HOME/bin/kafka-topics.sh --list --bootstrap-server $BOOTSTRAP_SERVER

echo ""
echo "=========================================="
echo "Kafka setup completed!"
echo "=========================================="
