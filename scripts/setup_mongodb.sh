#!/bin/bash

# MongoDB Setup Script for Music Trend Intelligence System
# This script initializes MongoDB database and creates indexes

echo "=========================================="
echo "MongoDB Setup"
echo "=========================================="

# Configuration
MONGO_HOST=${MONGO_HOST:-"localhost"}
MONGO_PORT=${MONGO_PORT:-27017}
DB_NAME="music_trends"

echo "Connecting to MongoDB at $MONGO_HOST:$MONGO_PORT"
echo "Database: $DB_NAME"
echo ""

# Check if MongoDB is running
mongosh --host $MONGO_HOST --port $MONGO_PORT --eval "db.version()" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to MongoDB at $MONGO_HOST:$MONGO_PORT"
    echo "Please ensure MongoDB is running"
    exit 1
fi

echo "✓ MongoDB is running"
echo ""

# Create database and collections with indexes
echo "Creating database and indexes..."

mongosh --host $MONGO_HOST --port $MONGO_PORT <<EOF

use $DB_NAME

// Artists collection
db.artists.createIndex({ "name": 1 })
db.artists.createIndex({ "spotify_id": 1 })
db.artists.createIndex({ "trend_score": -1 })
db.artists.createIndex({ "last_updated": -1 })
print("✓ Artists indexes created")

// Trends collection
db.trends.createIndex({ "timestamp": -1 })
db.trends.createIndex({ "artist_name": 1 })
db.trends.createIndex({ "source": 1 })
db.trends.createIndex({ "artist_name": 1, "timestamp": -1 })
print("✓ Trends indexes created")

// Anomalies collection
db.anomalies.createIndex({ "timestamp": -1 })
db.anomalies.createIndex({ "artist_name": 1 })
db.anomalies.createIndex({ "alert_level": 1 })
db.anomalies.createIndex({ "dismissed": 1, "timestamp": -1 })
print("✓ Anomalies indexes created")

// Genres collection
db.genres.createIndex({ "name": 1 }, { unique: true })
db.genres.createIndex({ "popularity": -1 })
print("✓ Genres indexes created")

// Comments collection
db.comments.createIndex({ "timestamp": -1 })
db.comments.createIndex({ "source": 1 })
db.comments.createIndex({ "mentioned_artists": 1 })
db.comments.createIndex({ "processed": 1 })
print("✓ Comments indexes created")

// Show collections
print("")
print("Collections in database:")
db.getCollectionNames().forEach(function(collection) {
    print("  - " + collection)
})

EOF

echo ""
echo "=========================================="
echo "MongoDB setup completed!"
echo "=========================================="
echo "Database: $DB_NAME"
echo "Collections: artists, trends, anomalies, genres, comments"
echo "=========================================="
