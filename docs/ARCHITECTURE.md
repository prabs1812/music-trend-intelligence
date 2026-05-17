# Architecture Documentation

## System Overview

The Music Trend Intelligence System is built using a microservices architecture with event-driven design patterns. The system processes data from multiple sources (Spotify, Reddit, YouTube) in near real-time, performs NLP analysis, calculates trend scores, detects anomalies, and presents insights through a live dashboard.

## Core Components

### 1. Data Ingestion Layer

**Purpose**: Fetch data from external APIs with rate limiting and retry logic.

**Components**:
- `SpotifyFetcher`: Fetches trending playlists, tracks, and artist data
- `RedditFetcher`: Monitors music subreddits for posts and comments
- `YouTubeFetcher`: Searches for trending music videos and statistics
- `IngestionOrchestrator`: Coordinates all fetchers on a scheduled interval

**Design Decisions**:
- Async/await pattern for non-blocking I/O
- Exponential backoff for retries
- Per-API rate limiting to respect quotas
- Graceful degradation if one API fails

### 2. Event Streaming Layer (Kafka)

**Purpose**: Decouple data ingestion from processing for scalability.

**Topics**:
- `spotify_events`: Raw Spotify data
- `reddit_events`: Reddit posts and comments
- `youtube_events`: YouTube video data
- `processed_trends`: Analyzed trend data

**Design Decisions**:
- Multiple partitions for parallel processing
- JSON serialization for flexibility
- Consumer groups for load distribution
- At-least-once delivery semantics

### 3. NLP Processing Layer

**Purpose**: Extract insights from unstructured text.

**Components**:
- `SentimentAnalyzer`: HuggingFace DistilBERT for sentiment classification
- `KeywordExtractor`: spaCy + TF-IDF for keyword extraction
- `EntityDetector`: Named entity recognition for artist mentions

**Design Decisions**:
- Batch processing for efficiency
- Model caching to avoid reloading
- Lazy initialization to reduce startup time
- GPU support when available

### 4. Analytics Engine

**Purpose**: Calculate trend scores and detect anomalies.

**Components**:
- `TrendScorer`: Weighted algorithm combining multiple metrics
- `AnomalyDetector`: Statistical and ML-based anomaly detection

**Trend Scoring Formula**:
```python
trend_score = (
    0.30 * normalized_spotify_popularity +
    0.25 * normalized_reddit_mentions +
    0.25 * normalized_youtube_engagement +
    0.15 * sentiment_score +
    0.05 * growth_velocity
)
```

**Anomaly Detection Methods**:
1. **Z-Score**: Detects outliers > 3σ from mean
2. **Spike Detection**: Identifies >200% increases
3. **Sentiment Shift**: Tracks significant sentiment changes
4. **Isolation Forest**: Unsupervised ML for complex patterns

### 5. Storage Layer

**MongoDB Collections**:
- `artists`: Artist profiles and metrics
- `trends`: Time-series trend events
- `anomalies`: Detected anomalies
- `genres`: Genre statistics
- `comments`: Text data for NLP

**Indexes**:
- `artists`: name, spotify_id, trend_score (desc)
- `trends`: timestamp (desc), artist_name, source
- `anomalies`: timestamp (desc), alert_level, dismissed

**Redis Data Structures**:
- Sorted Sets: `trending_artists` (score-based ranking)
- Hashes: Artist metadata cache
- Keys: Individual metric caches with TTL

### 6. API Layer (FastAPI)

**Purpose**: Expose data via REST and WebSocket.

**REST Endpoints**:
- `/api/v1/trends/*`: Trending data
- `/api/v1/artists/*`: Artist information
- `/api/v1/analytics/*`: Analytics and anomalies

**WebSocket Endpoints**:
- `/ws/trends`: Real-time trend updates
- `/ws/anomalies`: Anomaly alerts
- `/ws/dashboard`: Combined feed

**Design Decisions**:
- Async request handlers
- Pydantic for validation
- CORS for frontend access
- Automatic API documentation (Swagger)

### 7. Frontend (React)

**Components**:
- `Dashboard`: Main layout and orchestration
- `TrendingArtists`: Ranked artist list
- `GenreChart`: Genre popularity visualization
- `SentimentGraph`: Sentiment time-series
- `AnomalyAlerts`: Real-time alert cards
- `EngagementHeatmap`: Engagement metrics by source

**State Management**:
- React hooks for local state
- WebSocket for real-time updates
- Axios for API calls

## Data Flow

### Ingestion Flow
```
External APIs → Fetchers → Kafka Producer → Kafka Topics
```

### Processing Flow
```
Kafka Topics → Consumer → NLP Processing → Analytics → MongoDB/Redis
```

### Query Flow
```
Frontend → FastAPI → MongoDB/Redis → Response
```

### Real-Time Flow
```
Analytics → WebSocket Manager → Connected Clients
```

## Scalability Considerations

### Horizontal Scaling
- **Kafka Consumers**: Add more consumer instances in the same group
- **API Servers**: Deploy multiple FastAPI instances behind load balancer
- **MongoDB**: Replica sets for read scaling
- **Redis**: Redis Cluster for distributed caching

### Vertical Scaling
- **NLP Processing**: GPU acceleration for transformers
- **Database**: Increase MongoDB RAM for working set
- **Redis**: Increase memory for larger cache

### Performance Optimizations
- **Caching**: Redis for frequently accessed data (5-minute TTL)
- **Indexing**: MongoDB indexes on query patterns
- **Batching**: Batch NLP processing for efficiency
- **Connection Pooling**: Reuse database connections

## Reliability & Fault Tolerance

### Error Handling
- Retry logic with exponential backoff
- Dead letter queues for failed messages
- Graceful degradation when services unavailable
- Comprehensive logging for debugging

### Monitoring
- Health check endpoints
- Connection status tracking
- Error rate monitoring
- Performance metrics

### Data Consistency
- Idempotent operations where possible
- Timestamp-based conflict resolution
- Eventual consistency model

## Security Considerations

### API Security
- API key authentication for external APIs
- CORS configuration for frontend
- Rate limiting per client
- Input validation with Pydantic

### Data Security
- Environment variables for secrets
- No hardcoded credentials
- Secure WebSocket connections (WSS in production)

### Infrastructure Security
- MongoDB authentication
- Redis password protection
- Kafka ACLs (in production)

## Deployment Architecture

### Development
- All services on localhost
- Single machine deployment
- File-based logging

### Production (Recommended)
- Containerized services (Docker)
- Kubernetes orchestration
- Managed databases (MongoDB Atlas, Redis Cloud)
- Managed Kafka (Confluent Cloud, AWS MSK)
- CDN for frontend
- Centralized logging (ELK stack)
- Monitoring (Prometheus + Grafana)

## Technology Choices

### Why FastAPI?
- Native async support
- Automatic API documentation
- Type hints and validation
- High performance

### Why Kafka?
- High throughput
- Durable message storage
- Scalable partitioning
- Decouples producers/consumers

### Why MongoDB?
- Flexible schema for evolving data
- Rich query language
- Good performance for time-series
- Easy horizontal scaling

### Why Redis?
- Extremely fast in-memory operations
- Native sorted sets for leaderboards
- TTL support for caching
- Pub/sub for real-time features

### Why React?
- Component-based architecture
- Large ecosystem
- Virtual DOM for performance
- WebSocket integration

## Future Enhancements

### Short Term
- User authentication and personalization
- Email/SMS notifications for anomalies
- Export data to CSV/JSON
- Historical trend comparison

### Medium Term
- Machine learning for trend prediction
- Collaborative filtering for recommendations
- Multi-language support
- Mobile app

### Long Term
- Real-time streaming analytics
- Graph database for artist relationships
- Advanced visualization (3D charts)
- API for third-party integrations

## Performance Benchmarks

### Expected Throughput
- API requests: 1000 req/s per instance
- Kafka messages: 10,000 msg/s per partition
- MongoDB writes: 5,000 writes/s
- Redis operations: 100,000 ops/s

### Latency Targets
- API response: < 100ms (p95)
- WebSocket message: < 50ms
- Trend score update: < 1s
- Anomaly detection: < 5s

## Maintenance

### Regular Tasks
- Monitor API rate limits
- Review and dismiss old anomalies
- Archive old trend data
- Update NLP models
- Rotate logs

### Backup Strategy
- MongoDB: Daily automated backups
- Redis: RDB snapshots
- Configuration: Version control

## Troubleshooting

### Common Issues
1. **Kafka connection failed**: Check Kafka is running and ports are open
2. **MongoDB connection timeout**: Verify MongoDB service status
3. **Redis connection refused**: Ensure Redis is running
4. **API rate limit exceeded**: Reduce ingestion frequency
5. **WebSocket disconnects**: Check network stability and heartbeat

### Debug Mode
Enable debug logging in `.env`:
```
DEBUG=True
LOG_LEVEL=DEBUG
```

## Conclusion

This architecture provides a solid foundation for a scalable, real-time music trend intelligence system. The modular design allows for easy extension and maintenance, while the event-driven approach ensures loose coupling between components.
