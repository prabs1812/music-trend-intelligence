# API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Currently, no authentication is required for API endpoints. In production, implement API key or JWT authentication.

## Response Format

All responses are in JSON format.

### Success Response
```json
{
  "data": [...],
  "status": "success"
}
```

### Error Response
```json
{
  "detail": "Error message",
  "status": "error"
}
```

## Endpoints

### Trends

#### Get Trending Artists

```http
GET /trends/artists
```

**Query Parameters**:
- `limit` (integer, optional): Number of artists to return (1-100, default: 20)
- `time_range` (string, optional): Time range filter (1h, 6h, 24h, 7d, default: 24h)

**Response**:
```json
[
  {
    "rank": 1,
    "id": "507f1f77bcf86cd799439011",
    "name": "Taylor Swift",
    "trend_score": 87.5,
    "sentiment_score": 0.75,
    "popularity": 95.0,
    "reddit_mentions": 1250,
    "youtube_mentions": 3400,
    "growth_velocity": 12.3,
    "genres": ["pop", "country"]
  }
]
```

#### Get Trending Genres

```http
GET /trends/genres
```

**Query Parameters**:
- `limit` (integer, optional): Number of genres to return (1-50, default: 10)

**Response**:
```json
[
  {
    "rank": 1,
    "id": "507f1f77bcf86cd799439012",
    "name": "pop",
    "popularity": 85.5,
    "growth_rate": 5.2,
    "artist_count": 150,
    "trending_artists": ["Taylor Swift", "Ariana Grande", "Ed Sheeran"]
  }
]
```

#### Get Trend History

```http
GET /trends/history
```

**Query Parameters**:
- `artist_name` (string, optional): Filter by artist name
- `hours` (integer, optional): Hours of history (1-168, default: 24)

**Response**:
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "timestamp": "2026-05-17T10:30:00Z",
    "artist_name": "Drake",
    "source": "reddit",
    "engagement": {
      "views": 0,
      "likes": 0,
      "comments": 340,
      "upvotes": 1250
    },
    "sentiment_score": 0.85,
    "sentiment_label": "positive"
  }
]
```

#### Get Trends Summary

```http
GET /trends/summary
```

**Query Parameters**:
- `hours` (integer, optional): Time range in hours (1-168, default: 24)

**Response**:
```json
{
  "time_range_hours": 24,
  "total_artists": 1523,
  "total_trends": 45678,
  "by_source": {
    "spotify": {
      "count": 15234,
      "avg_sentiment": 0.65
    },
    "reddit": {
      "count": 18456,
      "avg_sentiment": 0.42
    },
    "youtube": {
      "count": 11988,
      "avg_sentiment": 0.71
    }
  }
}
```

### Artists

#### Get Artist Details

```http
GET /artists/{artist_id}
```

**Path Parameters**:
- `artist_id` (string, required): MongoDB ObjectId of the artist

**Response**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Taylor Swift",
  "spotify_id": "06HL4z0CvFAxyc27GXpf02",
  "popularity": 95.0,
  "genres": ["pop", "country"],
  "followers": 50000000,
  "trend_score": 87.5,
  "sentiment_score": 0.75,
  "reddit_mentions": 1250,
  "youtube_mentions": 3400,
  "growth_velocity": 12.3,
  "keywords": ["album", "tour", "new single"],
  "last_updated": "2026-05-17T10:30:00Z"
}
```

#### Search Artists

```http
GET /artists/
```

**Query Parameters**:
- `query` (string, required): Search query (min 1 character)
- `limit` (integer, optional): Number of results (1-50, default: 10)

**Response**:
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Taylor Swift",
    "trend_score": 87.5,
    "popularity": 95.0,
    "genres": ["pop", "country"]
  }
]
```

#### Get Artist Trends

```http
GET /artists/{artist_id}/trends
```

**Path Parameters**:
- `artist_id` (string, required): MongoDB ObjectId of the artist

**Query Parameters**:
- `limit` (integer, optional): Number of trends (1-200, default: 50)

**Response**:
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "timestamp": "2026-05-17T10:30:00Z",
    "source": "reddit",
    "engagement": {
      "upvotes": 1250,
      "comments": 340
    },
    "sentiment_score": 0.85,
    "title": "Taylor Swift's new album is amazing!"
  }
]
```

### Analytics

#### Get Sentiment Trends

```http
GET /analytics/sentiment
```

**Query Parameters**:
- `hours` (integer, optional): Time range in hours (1-168, default: 24)

**Response**:
```json
{
  "time_range_hours": 24,
  "data_points": [
    {
      "timestamp": "2026-05-17 10:00",
      "avg_sentiment": 0.652,
      "positive_count": 1234,
      "negative_count": 456,
      "neutral_count": 789,
      "total_count": 2479
    }
  ]
}
```

#### Get Anomalies

```http
GET /analytics/anomalies
```

**Query Parameters**:
- `limit` (integer, optional): Number of anomalies (1-100, default: 20)
- `dismissed` (boolean, optional): Include dismissed anomalies (default: false)

**Response**:
```json
[
  {
    "id": "507f1f77bcf86cd799439014",
    "timestamp": "2026-05-17T10:30:00Z",
    "artist_name": "Olivia Rodrigo",
    "anomaly_type": "spike",
    "alert_level": "high",
    "metric": "reddit_mentions",
    "current_value": 2500.0,
    "expected_value": 450.0,
    "deviation_percentage": 455.6,
    "description": "Sudden spike in Reddit mentions (455.6% above baseline)",
    "acknowledged": false,
    "dismissed": false
  }
]
```

#### Acknowledge Anomaly

```http
POST /analytics/anomalies/{anomaly_id}/acknowledge
```

**Path Parameters**:
- `anomaly_id` (string, required): MongoDB ObjectId of the anomaly

**Response**:
```json
{
  "status": "acknowledged"
}
```

#### Dismiss Anomaly

```http
POST /analytics/anomalies/{anomaly_id}/dismiss
```

**Path Parameters**:
- `anomaly_id` (string, required): MongoDB ObjectId of the anomaly

**Response**:
```json
{
  "status": "dismissed"
}
```

#### Get Engagement Metrics

```http
GET /analytics/engagement
```

**Query Parameters**:
- `hours` (integer, optional): Time range in hours (1-168, default: 24)

**Response**:
```json
{
  "time_range_hours": 24,
  "by_source": {
    "spotify": {
      "total_views": 0,
      "total_likes": 0,
      "total_comments": 0,
      "avg_engagement": 0
    },
    "reddit": {
      "total_views": 0,
      "total_likes": 45678,
      "total_comments": 12345,
      "avg_engagement": 2345.67
    },
    "youtube": {
      "total_views": 5678901,
      "total_likes": 234567,
      "total_comments": 45678,
      "avg_engagement": 12345.89
    }
  }
}
```

### System

#### Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "healthy",
  "mongodb": true,
  "redis": true,
  "kafka_producer": true,
  "kafka_consumer": true,
  "websocket_connections": 5
}
```

#### System Stats

```http
GET /api/v1/stats
```

**Response**:
```json
{
  "total_artists": 1523,
  "total_trends": 45678,
  "total_anomalies": 23,
  "total_comments": 12345,
  "websocket_connections": 5
}
```

## WebSocket API

### Connection

Connect to WebSocket endpoints using the `ws://` protocol (or `wss://` in production).

### Trends WebSocket

```
ws://localhost:8000/ws/trends
```

**Messages Received**:
```json
{
  "type": "trend_update",
  "timestamp": "2026-05-17T10:30:00Z",
  "data": {
    "artist_name": "Taylor Swift",
    "trend_score": 87.5
  }
}
```

### Anomalies WebSocket

```
ws://localhost:8000/ws/anomalies
```

**Messages Received**:
```json
{
  "type": "anomaly_alert",
  "timestamp": "2026-05-17T10:30:00Z",
  "data": {
    "artist_name": "Olivia Rodrigo",
    "anomaly_type": "spike",
    "alert_level": "high"
  }
}
```

### Dashboard WebSocket

```
ws://localhost:8000/ws/dashboard
```

**Messages Received**:
- All trend updates
- All anomaly alerts
- Heartbeat messages

**Heartbeat**:
```json
{
  "type": "heartbeat",
  "timestamp": "2026-05-17T10:30:00Z"
}
```

**Client Messages**:
Send `"ping"` to receive `{"type": "pong"}` response.

## Error Codes

- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection issue)

## Rate Limiting

Currently no rate limiting is implemented. In production, implement per-client rate limiting.

## Pagination

For endpoints returning large datasets, results are limited by the `limit` parameter. Implement cursor-based pagination for production use.

## Versioning

API is versioned via URL path (`/api/v1/`). Breaking changes will increment the version number.
