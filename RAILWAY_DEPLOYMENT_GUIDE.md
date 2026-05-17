# 🚀 Railway Deployment Guide - Music Trend Intelligence

This guide will walk you through deploying your Music Trend Intelligence system to Railway.app.

## 📋 Prerequisites

1. **GitHub Account** - https://github.com
2. **Railway Account** - https://railway.app (sign up with GitHub)
3. **Your API Keys**:
   - Last.fm API Key: `f397512084da71f79348d1c12f2254cd`
   - MusicBrainz User Agent: `MusicTrendIntelligence/1.0 ( shuklaprabal18@gmail.com )`

---

## 🎯 Step 1: Push Code to GitHub

```bash
cd C:\Users\shukl\music-trend-intelligence

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Ready for Railway deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/music-trend-intelligence.git
git branch -M main
git push -u origin main
```

---

## 🎯 Step 2: Deploy Backend to Railway

### 2.1 Create New Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `music-trend-intelligence` repository
5. Railway will detect the Dockerfile automatically

### 2.2 Add MongoDB Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add MongoDB"**
3. Railway will automatically create a MongoDB instance
4. Note: The connection URL will be available as `${{MongoDB.MONGO_URL}}`

### 2.3 Add Redis Database

1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. Railway will automatically create a Redis instance
4. Note: Connection details will be available as variables

### 2.4 Configure Backend Environment Variables

In your **backend service** settings, add these environment variables:

**Click on your backend service → Variables tab → Add these:**

```env
# Application
APP_NAME=Music Trend Intelligence System
APP_VERSION=1.0.0
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO

# API Server
API_HOST=0.0.0.0

# MongoDB (Railway auto-fills this)
MONGODB_URL=${{MongoDB.MONGO_URL}}
MONGODB_DB_NAME=music_trends
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=1

# Redis (Railway auto-fills these)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_DB=0
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
REDIS_MAX_CONNECTIONS=10

# Kafka (leave as localhost - not needed for Railway)
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# API Credentials
LASTFM_API_KEY=f397512084da71f79348d1c12f2254cd
MUSICBRAINZ_USER_AGENT=MusicTrendIntelligence/1.0 ( shuklaprabal18@gmail.com )

# Data Ingestion
INGESTION_INTERVAL_SECONDS=300
LASTFM_RATE_LIMIT=5
MUSICBRAINZ_RATE_LIMIT=1

# Analytics
TREND_SCORE_UPDATE_INTERVAL=600
ANOMALY_DETECTION_THRESHOLD=3.0
ANOMALY_SPIKE_THRESHOLD=2.0

# Cache TTL
CACHE_TTL_TRENDING_ARTISTS=300
CACHE_TTL_GENRES=300
CACHE_TTL_ANALYTICS=180

# NLP Models
SENTIMENT_MODEL=distilbert-base-uncased-finetuned-sst-2-english
SPACY_MODEL=en_core_web_sm

# CORS (update after deploying frontend)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_METHODS=*
CORS_ALLOW_HEADERS=*

# WebSocket
WS_HEARTBEAT_INTERVAL=30
WS_MAX_CONNECTIONS=100
```

### 2.5 Deploy Backend

1. Railway will automatically deploy after you add variables
2. Wait for deployment to complete (check the logs)
3. Once deployed, click **"Settings"** → **"Generate Domain"**
4. Copy your backend URL (e.g., `https://music-backend-production.up.railway.app`)

---

## 🎯 Step 3: Deploy Frontend to Railway

### 3.1 Create Frontend Service

1. In the same Railway project, click **"+ New"**
2. Select **"GitHub Repo"** → Choose your repository again
3. Railway will create a second service

### 3.2 Configure Frontend Build

1. Click on the new service → **"Settings"**
2. Under **"Build"**, set:
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `frontend/Dockerfile`

### 3.3 Configure Frontend Environment Variables

In the **frontend service** settings, add:

```env
# Replace with your actual backend URL from Step 2.5
VITE_API_URL=https://your-backend-url.up.railway.app/api/v1
```

**Example:**
```env
VITE_API_URL=https://music-backend-production.up.railway.app/api/v1
```

### 3.4 Deploy Frontend

1. Railway will automatically deploy
2. Once deployed, go to **"Settings"** → **"Generate Domain"**
3. Copy your frontend URL (e.g., `https://music-frontend-production.up.railway.app`)

---

## 🎯 Step 4: Update CORS Settings

Now that you have your frontend URL, update the backend CORS settings:

1. Go to your **backend service** in Railway
2. Click **"Variables"**
3. Update the `CORS_ORIGINS` variable:

```env
CORS_ORIGINS=https://your-frontend-url.up.railway.app,http://localhost:3000,http://localhost:5173
```

**Example:**
```env
CORS_ORIGINS=https://music-frontend-production.up.railway.app,http://localhost:3000,http://localhost:5173
```

4. Save and redeploy (Railway will auto-redeploy)

---

## 🎯 Step 5: Test Your Deployment

1. Open your frontend URL in a browser
2. You should see the Music Trend Intelligence dashboard
3. Check that data is loading (it may take a few minutes for initial data)

---

## 🔧 Running Data Ingestion

Your backend is now running, but you need to start data ingestion. You have two options:

### Option A: Run Ingestion Locally (Recommended for Testing)

```bash
cd C:\Users\shukl\music-trend-intelligence\backend

# Update .env with Railway MongoDB and Redis URLs
# Copy them from Railway dashboard

# Run ingestion
python run_ingestion_lastfm.py
```

### Option B: Deploy Ingestion as Separate Railway Service

1. Create a new service in Railway
2. Use the same repository
3. Set **Start Command** to: `python backend/run_ingestion_lastfm.py`
4. Use the same environment variables as backend

---

## 📊 Monitoring Your Deployment

### Check Backend Health

Visit: `https://your-backend-url.up.railway.app/health`

You should see:
```json
{
  "status": "healthy",
  "mongodb": true,
  "redis": true,
  "kafka_producer": false,
  "kafka_consumer": false,
  "websocket_connections": 0
}
```

Note: Kafka being `false` is expected and normal for Railway deployment.

### Check API Documentation

Visit: `https://your-backend-url.up.railway.app/docs`

This shows all available API endpoints.

### View Logs

In Railway dashboard:
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View real-time logs

---

## 💰 Cost Estimate

**Railway Free Tier:**
- $5 credit/month (no credit card required)
- Enough for testing and small projects

**After Free Tier (~$10-15/month):**
- Backend API: ~$5/month
- MongoDB: ~$5/month
- Redis: ~$3/month
- Frontend: ~$2/month

**Total: ~$15/month for full production deployment**

---

## 🐛 Troubleshooting

### Backend Won't Start

1. Check logs in Railway dashboard
2. Verify all environment variables are set
3. Make sure MongoDB and Redis are linked
4. Check that `MONGODB_URL` uses the Railway variable syntax: `${{MongoDB.MONGO_URL}}`

### Frontend Can't Connect to Backend

1. Verify `VITE_API_URL` is set correctly in frontend
2. Check CORS settings in backend
3. Make sure backend is deployed and healthy
4. Check browser console for errors

### No Data Showing

1. Data ingestion needs to run separately
2. Run `python backend/run_ingestion_lastfm.py` locally first
3. Or deploy ingestion as a separate Railway service
4. Check MongoDB has data: use Railway's MongoDB dashboard

### MongoDB Connection Issues

1. Make sure you're using `${{MongoDB.MONGO_URL}}` syntax
2. Check MongoDB service is running in Railway
3. Verify the services are in the same project

---

## 🎉 Success!

Your Music Trend Intelligence system is now live on Railway!

**Your URLs:**
- Frontend: `https://your-frontend.up.railway.app`
- Backend API: `https://your-backend.up.railway.app`
- API Docs: `https://your-backend.up.railway.app/docs`

---

## 📝 Next Steps

1. **Custom Domain**: Add your own domain in Railway settings
2. **Monitoring**: Set up Railway's monitoring and alerts
3. **Scaling**: Adjust resources in Railway settings if needed
4. **Continuous Deployment**: Push to GitHub to auto-deploy updates
5. **Data Ingestion**: Set up automated ingestion (cron job or separate service)

---

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs for detailed error messages

---

**Congratulations! Your music trend intelligence system is now running in the cloud! 🎵🚀**
