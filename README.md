# Music Trend Intelligence & Analytics System

A production-style Near Real-Time Music Trend Intelligence & Analytics System that collects, processes, and analyzes music trends from Spotify, Reddit, and YouTube using modern scalable architecture.

![System Status](https://img.shields.io/badge/status-active-success)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![React](https://img.shields.io/badge/react-18.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

- **Real-Time Data Ingestion**: Collects music data from Spotify, Reddit, and YouTube APIs
- **Event-Driven Architecture**: Kafka-based event streaming for scalable data processing
- **NLP Analysis**: Sentiment analysis, keyword extraction, and entity detection using HuggingFace and spaCy
- **Trend Scoring**: Weighted algorithm combining multiple metrics to rank trending artists
- **Anomaly Detection**: Statistical methods (Z-score, Isolation Forest) to detect unusual patterns
- **Live Dashboard**: React-based dashboard with real-time WebSocket updates
- **Redis Caching**: Fast in-memory operations for leaderboards and analytics
- **MongoDB Storage**: Flexible schema for evolving data models

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Dashboard                           │
│                    (WebSocket + REST Client)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                             │
│              (REST APIs + WebSocket Server)                      │
└──────┬──────────────────────┬──────────────────────────────────┘
       │                      │
       ↓                      ↓
┌─────────────┐        ┌─────────────┐
│   MongoDB   │        │    Redis    │
│  (Storage)  │        │  (Cache)    │
└─────────────┘        └─────────────┘
       ↑                      ↑
       │                      │
┌──────┴──────────────────────┴───────────────────────────────────┐
│                    Kafka Consumer Service                        │
│         (Consumes events, triggers processing)                   │
└──────┬──────────────────────┬──────────────────────────────────┘
       │                      │
       ↓                      ↓
┌─────────────────┐    ┌─────────────────┐
│  NLP Processor  │    │ Trend Scoring   │
│   (Sentiment,   │    │    Engine       │
│   Keywords)     │    │  (Weighted      │
└─────────────────┘    │   Algorithm)    │
                       └─────────────────┘
```

## 🚀 Tech Stack

### Backend
- **Python 3.9+**
- **FastAPI** - Modern async web framework
- **Kafka** - Event streaming platform
- **Redis** - In-memory data store
- **MongoDB** - NoSQL database
- **HuggingFace Transformers** - NLP models
- **spaCy** - Advanced NLP
- **Scikit-learn** - Machine learning

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

## 📋 Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- Apache Kafka 3.0+
- Redis 6.0+
- MongoDB 5.0+
- API Keys for:
  - Spotify Developer Account
  - Reddit API
  - YouTube Data API v3

## 🛠️ Installation

### 1. Clone the Repository

```bash
cd C:/Users/shukl/music-trend-intelligence
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy environment file
copy .env.example .env

# Edit .env and add your API keys
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Infrastructure Setup

#### Start MongoDB
```bash
# Windows (if installed as service):
net start MongoDB

# Or using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Start Redis
```bash
# Windows (if installed):
redis-server

# Or using Docker:
docker run -d -p 6379:6379 --name redis redis:latest
```

#### Start Kafka
```bash
# Start Zookeeper
bin\windows\zookeeper-server-start.bat config\zookeeper.properties

# Start Kafka (in new terminal)
bin\windows\kafka-server-start.bat config\server.properties

# Create topics (in new terminal)
bin\windows\kafka-topics.bat --create --topic spotify_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic reddit_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic youtube_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic processed_trends --bootstrap-server localhost:9092 --partitions 5 --replication-factor 1
```

## 🎮 Usage

### Start Backend Services

```bash
cd backend

# Terminal 1: Start FastAPI server
python -m backend.services.api.main

# Terminal 2: Start Kafka consumer
python -m backend.services.kafka_consumer.consumer

# Terminal 3: Start data ingestion
python -m backend.services.ingestion.orchestrator
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Access the dashboard at: http://localhost:3000

API documentation: http://localhost:8000/docs

## 📊 API Endpoints

### Trends
- `GET /api/v1/trends/artists` - Get trending artists
- `GET /api/v1/trends/genres` - Get trending genres
- `GET /api/v1/trends/history` - Get historical trends
- `GET /api/v1/trends/summary` - Get trends summary

### Artists
- `GET /api/v1/artists/{id}` - Get artist details
- `GET /api/v1/artists/` - Search artists
- `GET /api/v1/artists/{id}/trends` - Get artist trend history

### Analytics
- `GET /api/v1/analytics/sentiment` - Get sentiment trends
- `GET /api/v1/analytics/anomalies` - Get anomalies
- `POST /api/v1/analytics/anomalies/{id}/acknowledge` - Acknowledge anomaly
- `POST /api/v1/analytics/anomalies/{id}/dismiss` - Dismiss anomaly
- `GET /api/v1/analytics/engagement` - Get engagement metrics

### WebSocket
- `WS /ws/trends` - Real-time trend updates
- `WS /ws/anomalies` - Real-time anomaly alerts
- `WS /ws/dashboard` - Combined dashboard feed

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📈 Trend Scoring Algorithm

```python
trend_score = (
    0.30 * normalized_spotify_popularity +
    0.25 * normalized_reddit_mentions +
    0.25 * normalized_youtube_engagement +
    0.15 * sentiment_score +
    0.05 * growth_velocity
)
```

## 🔍 Anomaly Detection Methods

1. **Z-Score Detection**: Identifies outliers > 3 standard deviations
2. **Spike Detection**: Detects sudden increases > 200%
3. **Sentiment Shift**: Identifies significant sentiment changes
4. **Isolation Forest**: Unsupervised ML for complex patterns

## 🎨 Dashboard Features

- **Trending Artists**: Top 20 artists with real-time rankings
- **Genre Trends**: Popularity and growth rates by genre
- **Sentiment Analysis**: Positive/negative/neutral distribution
- **Anomaly Alerts**: Real-time alerts with severity levels
- **Engagement Metrics**: Views, likes, comments by source

## 🔧 Configuration

Edit `backend/.env` to configure:

- API credentials
- Database connections
- Kafka settings
- Rate limits
- Cache TTL
- NLP models

## 📝 Project Structure

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🤝 Contributing

This is a portfolio project. Feel free to fork and adapt for your own use.

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

Built as a portfolio project demonstrating:
- Microservices architecture
- Event-driven design
- Real-time analytics
- NLP/ML integration
- Modern full-stack development

## 🙏 Acknowledgments

- Spotify Web API
- Reddit API
- YouTube Data API
- HuggingFace Transformers
- Apache Kafka
- FastAPI
- React

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Note**: This system is designed for educational and portfolio purposes. Ensure compliance with API terms of service and rate limits when using in production.
