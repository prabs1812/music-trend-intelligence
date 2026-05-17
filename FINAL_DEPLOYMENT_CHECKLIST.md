# 🚀 FINAL RAILWAY DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment Status

### Code Status
- ✅ Dockerfile fixed (spaCy model installs correctly)
- ✅ railway.json fixed (no multi-region config)
- ✅ Backend made Kafka optional
- ✅ Frontend configured for production
- ✅ All changes committed and pushed to GitHub

### Current Git Status
```
Branch: main
Status: Up to date with origin/main
All changes pushed: YES
```

---

## 📋 BACKEND DEPLOYMENT STEPS

### Step 1: Railway Project Setup
1. ✅ Go to https://railway.app
2. ✅ Sign in with GitHub
3. ✅ Create "New Project" → "Deploy from GitHub repo"
4. ✅ Select: `music-trend-intelligence` repository

### Step 2: Add Databases
1. ✅ Click "+ New" → Database → **Add MongoDB**
2. ✅ Click "+ New" → Database → **Add Redis**

You should now have 3 services:
- Backend (music-trend-intelligence)
- MongoDB
- Redis

### Step 3: Configure Backend Environment Variables

**Click on Backend Service → Variables Tab → Raw Editor**

**COPY AND PASTE THIS ENTIRE BLOCK:**

```env
APP_NAME=Music Trend Intelligence System
APP_VERSION=1.0.0
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO
API_HOST=0.0.0.0
MONGODB_URL=${{MongoDB.MONGO_URL}}
MONGODB_DB_NAME=music_trends
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=1
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_DB=0
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
REDIS_MAX_CONNECTIONS=10
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_CONSUMER_GROUP=music-trend-consumers
KAFKA_AUTO_OFFSET_RESET=earliest
KAFKA_ENABLE_AUTO_COMMIT=True
KAFKA_TOPIC_SPOTIFY=spotify_events
KAFKA_TOPIC_REDDIT=reddit_events
KAFKA_TOPIC_YOUTUBE=youtube_events
KAFKA_TOPIC_PROCESSED=processed_trends
LASTFM_API_KEY=f397512084da71f79348d1c12f2254cd
MUSICBRAINZ_USER_AGENT=MusicTrendIntelligence/1.0 ( shuklaprabal18@gmail.com )
INGESTION_INTERVAL_SECONDS=300
LASTFM_RATE_LIMIT=5
MUSICBRAINZ_RATE_LIMIT=1
REDDIT_RATE_LIMIT=60
TREND_SCORE_UPDATE_INTERVAL=600
ANOMALY_DETECTION_THRESHOLD=3.0
ANOMALY_SPIKE_THRESHOLD=2.0
CACHE_TTL_TRENDING_ARTISTS=300
CACHE_TTL_GENRES=300
CACHE_TTL_ANALYTICS=180
SENTIMENT_MODEL=distilbert-base-uncased-finetuned-sst-2-english
SPACY_MODEL=en_core_web_sm
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_METHODS=*
CORS_ALLOW_HEADERS=*
WS_HEARTBEAT_INTERVAL=30
WS_MAX_CONNECTIONS=100
```

**Important Notes:**
- `${{MongoDB.MONGO_URL}}` - Railway auto-fills this
- `${{Redis.REDIS_HOST}}`, `${{Redis.REDIS_PORT}}`, `${{Redis.REDIS_PASSWORD}}` - Railway auto-fills these
- We'll update `CORS_ORIGINS` after deploying frontend

### Step 4: Deploy Backend

1. ✅ Click "Deploy" or wait for auto-deploy
2. ✅ Monitor "Deploy Logs" - should take 3-5 minutes
3. ✅ Wait for green checkmark "Active" status

**Expected logs:**
```
✅ Building Docker image
✅ Installing Python dependencies
✅ Installing spaCy model
✅ Starting application
✅ MongoDB connected
✅ Redis connected
✅ Kafka connection failed (EXPECTED - optional)
✅ Application started successfully!
```

### Step 5: Generate Backend Domain

1. ✅ Click on Backend Service → **Settings** tab
2. ✅ Scroll to **"Networking"** section
3. ✅ Click **"Generate Domain"**
4. ✅ Enter port: **8000**
5. ✅ Copy your backend URL (e.g., `https://music-trend-intelligence-production.up.railway.app`)

### Step 6: Test Backend

Open these URLs in browser:

**Health Check:**
```
https://your-backend-url.up.railway.app/health
```
Expected: `{"status": "healthy", "mongodb": true, "redis": true}`

**API Docs:**
```
https://your-backend-url.up.railway.app/docs
```
Expected: Swagger UI documentation

**Root:**
```
https://your-backend-url.up.railway.app/
```
Expected: `{"name": "Music Trend Intelligence System", "version": "1.0.0", "status": "running"}`

---

## 🎨 FRONTEND DEPLOYMENT STEPS

### Step 7: Add Frontend Service

1. ✅ In same Railway project, click **"+ New"**
2. ✅ Select **"GitHub Repo"** → Choose `music-trend-intelligence` again
3. ✅ Railway creates a second service

### Step 8: Configure Frontend Build

1. ✅ Click on Frontend Service → **Settings** tab
2. ✅ Under **"Build"**, set:
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `frontend/Dockerfile`

### Step 9: Configure Frontend Environment Variables

**Click on Frontend Service → Variables Tab**

Add this variable:
```env
VITE_API_URL=https://your-backend-url.up.railway.app/api/v1
```

**Replace `your-backend-url` with your actual backend URL from Step 5!**

Example:
```env
VITE_API_URL=https://music-trend-intelligence-production.up.railway.app/api/v1
```

### Step 10: Deploy Frontend

1. ✅ Click "Deploy" or wait for auto-deploy
2. ✅ Monitor logs - should take 2-3 minutes
3. ✅ Wait for green checkmark

### Step 11: Generate Frontend Domain

1. ✅ Click on Frontend Service → **Settings** tab
2. ✅ Scroll to **"Networking"** section
3. ✅ Click **"Generate Domain"**
4. ✅ Enter port: **80** (nginx serves on port 80)
5. ✅ Copy your frontend URL

---

## 🔄 FINAL STEP: Update CORS

### Step 12: Update Backend CORS Settings

1. ✅ Go back to **Backend Service** → **Variables** tab
2. ✅ Find `CORS_ORIGINS` variable
3. ✅ Update it to include your frontend URL:

```env
CORS_ORIGINS=https://your-frontend-url.up.railway.app,http://localhost:3000,http://localhost:5173
```

Example:
```env
CORS_ORIGINS=https://music-frontend-production.up.railway.app,http://localhost:3000,http://localhost:5173
```

4. ✅ Save (Railway will auto-redeploy backend)

---

## 🎉 SUCCESS VERIFICATION

### Test Your Live Application

1. **Open Frontend URL** in browser
2. **You should see:**
   - Music Trend Intelligence dashboard
   - Loading spinner initially
   - Dashboard with charts and data (after data ingestion)

### If No Data Shows

Run data ingestion locally to populate the database:

```bash
cd C:\Users\shukl\music-trend-intelligence\backend

# Update .env with Railway MongoDB URL (copy from Railway dashboard)
# Then run:
python run_ingestion_lastfm.py
```

Wait 2-3 minutes, then refresh your frontend!

---

## 📊 Your Live URLs

After deployment, you'll have:

- **Frontend**: `https://your-frontend.up.railway.app`
- **Backend API**: `https://your-backend.up.railway.app`
- **API Docs**: `https://your-backend.up.railway.app/docs`
- **Health Check**: `https://your-backend.up.railway.app/health`

---

## 🐛 Troubleshooting

### Backend Won't Deploy
- ✅ Check Deploy Logs for errors
- ✅ Verify all environment variables are set
- ✅ Ensure MongoDB and Redis services are running
- ✅ Check `${{MongoDB.MONGO_URL}}` syntax is correct

### Frontend Can't Connect
- ✅ Verify `VITE_API_URL` is set correctly
- ✅ Check CORS settings in backend include frontend URL
- ✅ Open browser console (F12) for errors

### No Data Showing
- ✅ Backend is running but database is empty
- ✅ Run `python run_ingestion_lastfm.py` locally
- ✅ Wait 2-3 minutes for data to populate

---

## 💰 Cost

**Railway Free Tier**: $5/month credit
- Backend: ~$3/month
- MongoDB: ~$1/month
- Redis: ~$0.50/month
- Frontend: ~$0.50/month
- **Total: ~$5/month (FREE with credit)**

---

## ✅ DEPLOYMENT READY!

All configurations are correct. You can now:

1. **Deploy Backend** (Steps 1-6)
2. **Test Backend** (Step 6)
3. **Deploy Frontend** (Steps 7-11)
4. **Update CORS** (Step 12)
5. **Populate Data** (Run ingestion script)

**Everything is configured and ready to go! 🚀**
