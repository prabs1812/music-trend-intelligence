# Setup Guide

This guide provides detailed step-by-step instructions for setting up the Music Trend Intelligence System on your local machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the System](#running-the-system)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Python 3.9+**
   - Download from: https://www.python.org/downloads/
   - Verify: `python --version`

2. **Node.js 16+**
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

3. **MongoDB 5.0+**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

4. **Redis 6.0+**
   - Windows: https://github.com/microsoftarchive/redis/releases
   - Or use Docker: `docker run -d -p 6379:6379 --name redis redis:latest`

5. **Apache Kafka 3.0+**
   - Download from: https://kafka.apache.org/downloads
   - Extract to a convenient location (e.g., `C:\kafka`)

### API Keys

You'll need API credentials from:

1. **Spotify Developer**
   - Go to: https://developer.spotify.com/dashboard
   - Create an app
   - Note your Client ID and Client Secret

2. **Reddit API**
   - Go to: https://www.reddit.com/prefs/apps
   - Create an app (script type)
   - Note your Client ID and Client Secret

3. **YouTube Data API**
   - Go to: https://console.cloud.google.com/
   - Create a project
   - Enable YouTube Data API v3
   - Create credentials (API Key)

## System Requirements

### Minimum Requirements
- CPU: 4 cores
- RAM: 8 GB
- Storage: 20 GB free space
- OS: Windows 10/11, macOS 10.15+, or Linux

### Recommended Requirements
- CPU: 8 cores
- RAM: 16 GB
- Storage: 50 GB SSD
- OS: Windows 11 or Ubuntu 20.04+

## Installation Steps

### Step 1: Clone/Navigate to Project

```bash
cd C:\Users\shukl\music-trend-intelligence
```

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

**Note**: Installing transformers and torch may take several minutes.

### Step 3: Frontend Setup

```bash
cd ..\frontend

# Install dependencies
npm install

# This will install React, Vite, Tailwind CSS, and other dependencies
```

### Step 4: MongoDB Setup

#### Option A: Local Installation

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows (as Administrator):
   net start MongoDB
   
   # Linux:
   sudo systemctl start mongod
   
   # Mac:
   brew services start mongodb-community
   ```

3. Verify connection:
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

#### Option B: Docker

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

### Step 5: Redis Setup

#### Option A: Local Installation

1. Install Redis
2. Start Redis server:
   ```bash
   # Windows:
   redis-server
   
   # Linux:
   sudo systemctl start redis
   
   # Mac:
   brew services start redis
   ```

3. Verify connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

#### Option B: Docker

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest
```

### Step 6: Kafka Setup

1. **Extract Kafka** (if not already done):
   ```bash
   # Extract to C:\kafka (Windows) or /opt/kafka (Linux)
   ```

2. **Start Zookeeper**:
   ```bash
   # Windows:
   cd C:\kafka
   bin\windows\zookeeper-server-start.bat config\zookeeper.properties
   
   # Linux/Mac:
   cd /opt/kafka
   bin/zookeeper-server-start.sh config/zookeeper.properties
   ```

3. **Start Kafka** (in a new terminal):
   ```bash
   # Windows:
   cd C:\kafka
   bin\windows\kafka-server-start.bat config\server.properties
   
   # Linux/Mac:
   cd /opt/kafka
   bin/kafka-server-start.sh config/server.properties
   ```

4. **Create Topics** (in a new terminal):
   ```bash
   # Windows:
   cd C:\kafka
   bin\windows\kafka-topics.bat --create --topic spotify_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   bin\windows\kafka-topics.bat --create --topic reddit_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   bin\windows\kafka-topics.bat --create --topic youtube_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   bin\windows\kafka-topics.bat --create --topic processed_trends --bootstrap-server localhost:9092 --partitions 5 --replication-factor 1
   
   # Linux/Mac:
   cd /opt/kafka
   bin/kafka-topics.sh --create --topic spotify_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   bin/kafka-topics.sh --create --topic reddit_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   bin/kafka-topics.sh --create --topic youtube_events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
   bin/kafka-topics.sh --create --topic processed_trends --bootstrap-server localhost:9092 --partitions 5 --replication-factor 1
   ```

5. **Verify Topics**:
   ```bash
   # Windows:
   bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
   
   # Linux/Mac:
   bin/kafka-topics.sh --list --bootstrap-server localhost:9092
   ```

## Configuration

### Backend Configuration

1. **Copy environment template**:
   ```bash
   cd backend
   copy .env.example .env  # Windows
   cp .env.example .env    # Linux/Mac
   ```

2. **Edit `.env` file** with your API credentials:
   ```env
   # Spotify API
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   
   # Reddit API
   REDDIT_CLIENT_ID=your_reddit_client_id_here
   REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
   
   # YouTube API
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

3. **Verify other settings** (usually defaults are fine):
   - MongoDB URL: `mongodb://localhost:27017`
   - Redis host: `localhost`
   - Kafka bootstrap servers: `localhost:9092`

### Frontend Configuration

Create `frontend/.env` (optional):
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000
```

## Running the System

### Start Infrastructure Services

Ensure these are running:
1. ✅ MongoDB
2. ✅ Redis
3. ✅ Zookeeper
4. ✅ Kafka

### Start Backend Services

Open **3 separate terminals** for backend services:

**Terminal 1: FastAPI Server**
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
python -m backend.services.api.main
```

**Terminal 2: Kafka Consumer**
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
python -m backend.services.kafka_consumer.consumer
```

**Terminal 3: Data Ingestion**
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
python -m backend.services.ingestion.orchestrator
```

### Start Frontend

Open a **4th terminal**:
```bash
cd frontend
npm run dev
```

## Verification

### 1. Check Services

Visit these URLs in your browser:

- **Frontend Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 2. Verify Data Flow

1. Check backend logs for successful API fetches
2. Monitor Kafka topics for messages
3. Check MongoDB for stored data
4. Verify Redis cache is populated
5. Confirm dashboard shows data

### 3. Test WebSocket Connection

In the dashboard, check for:
- Green "Connected" indicator
- Real-time updates appearing

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Windows - Find process using port 8000:
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

#### 2. MongoDB Connection Failed

**Error**: `ServerSelectionTimeoutError`

**Solution**:
- Verify MongoDB is running: `mongosh`
- Check MongoDB logs
- Ensure port 27017 is not blocked by firewall

#### 3. Redis Connection Refused

**Error**: `ConnectionRefusedError`

**Solution**:
- Verify Redis is running: `redis-cli ping`
- Check Redis is listening on port 6379
- Try restarting Redis service

#### 4. Kafka Connection Error

**Error**: `NoBrokersAvailable`

**Solution**:
- Ensure Zookeeper is running first
- Then start Kafka
- Verify Kafka is listening: `telnet localhost 9092`
- Check Kafka logs in `kafka/logs/`

#### 5. API Rate Limit Exceeded

**Error**: `429 Too Many Requests`

**Solution**:
- Increase `INGESTION_INTERVAL_SECONDS` in `.env`
- Reduce number of API calls
- Wait for rate limit to reset

#### 6. Module Not Found Error

**Error**: `ModuleNotFoundError: No module named 'X'`

**Solution**:
```bash
# Ensure virtual environment is activated
pip install -r requirements.txt

# If specific module missing:
pip install <module_name>
```

#### 7. spaCy Model Not Found

**Error**: `Can't find model 'en_core_web_sm'`

**Solution**:
```bash
python -m spacy download en_core_web_sm
```

#### 8. Frontend Build Errors

**Error**: Various npm errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm cache clean
npm cache clean --force
npm install
```

### Logs Location

- **Backend**: `backend/logs/`
- **Kafka**: `kafka/logs/`
- **MongoDB**: Check MongoDB data directory
- **Frontend**: Browser console (F12)

### Getting Help

1. Check logs for detailed error messages
2. Verify all prerequisites are installed
3. Ensure all services are running
4. Check firewall settings
5. Review API credentials

## Next Steps

After successful setup:

1. **Explore the Dashboard**: Navigate through different visualizations
2. **Monitor Anomalies**: Check for detected anomalies
3. **Test API Endpoints**: Use the Swagger UI at `/docs`
4. **Customize Configuration**: Adjust settings in `.env`
5. **Add More Data Sources**: Extend the ingestion layer

## Production Deployment

For production deployment, consider:

1. **Containerization**: Use Docker and Docker Compose
2. **Orchestration**: Deploy with Kubernetes
3. **Managed Services**: Use cloud-managed databases
4. **Security**: Implement authentication and HTTPS
5. **Monitoring**: Add Prometheus and Grafana
6. **Scaling**: Configure auto-scaling policies

See `ARCHITECTURE.md` for more details on production deployment.

## Support

For issues or questions:
- Check the troubleshooting section
- Review logs for error details
- Open an issue on GitHub
- Consult API documentation

---

**Congratulations!** Your Music Trend Intelligence System should now be up and running. 🎉
