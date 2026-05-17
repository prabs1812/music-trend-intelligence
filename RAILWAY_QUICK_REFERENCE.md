# 🚀 Quick Railway Setup Reference

## Backend Service Configuration

### Environment Variables (Copy-Paste Ready)

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
LASTFM_API_KEY=f397512084da71f79348d1c12f2254cd
MUSICBRAINZ_USER_AGENT=MusicTrendIntelligence/1.0 ( shuklaprabal18@gmail.com )
INGESTION_INTERVAL_SECONDS=300
LASTFM_RATE_LIMIT=5
MUSICBRAINZ_RATE_LIMIT=1
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

**After deploying frontend, update CORS_ORIGINS to:**
```env
CORS_ORIGINS=https://your-frontend.up.railway.app,http://localhost:3000,http://localhost:5173
```

---

## Frontend Service Configuration

### Root Directory
```
frontend
```

### Dockerfile Path
```
frontend/Dockerfile
```

### Environment Variables
```env
VITE_API_URL=https://your-backend.up.railway.app/api/v1
```

---

## Deployment Checklist

### ✅ Before Deployment
- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] Have API keys ready

### ✅ Backend Setup
- [ ] Create new Railway project from GitHub
- [ ] Add MongoDB database
- [ ] Add Redis database
- [ ] Configure environment variables
- [ ] Generate domain for backend
- [ ] Test health endpoint: `/health`

### ✅ Frontend Setup
- [ ] Add new service in same project
- [ ] Set root directory to `frontend`
- [ ] Set Dockerfile path to `frontend/Dockerfile`
- [ ] Add `VITE_API_URL` environment variable
- [ ] Generate domain for frontend

### ✅ Final Steps
- [ ] Update backend CORS with frontend URL
- [ ] Test frontend in browser
- [ ] Run data ingestion (locally or as service)
- [ ] Verify data is loading

---

## Quick Commands

### Push to GitHub
```bash
git add .
git commit -m "Railway deployment ready"
git push origin main
```

### Test Backend Locally
```bash
cd backend
python -m backend.services.api.main
```

### Test Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

### Run Data Ingestion
```bash
cd backend
python run_ingestion_lastfm.py
```

---

## Important URLs

After deployment, save these:

- **Frontend**: https://________.up.railway.app
- **Backend**: https://________.up.railway.app
- **API Docs**: https://________.up.railway.app/docs
- **Health Check**: https://________.up.railway.app/health

---

## Troubleshooting Quick Fixes

### Backend won't start
```bash
# Check Railway logs
# Verify MongoDB URL format: ${{MongoDB.MONGO_URL}}
# Verify Redis variables are set
```

### Frontend can't connect
```bash
# Check VITE_API_URL is correct
# Update CORS_ORIGINS in backend
# Check browser console for errors
```

### No data showing
```bash
# Run ingestion locally first
cd backend
python run_ingestion_lastfm.py
```

---

## Cost Optimization Tips

1. **Use Free Tier**: $5/month credit covers testing
2. **Scale Down**: Reduce resources if not needed
3. **Monitor Usage**: Check Railway dashboard regularly
4. **Optimize Queries**: Use Redis caching effectively
5. **Skip Kafka**: Not needed for Railway deployment

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: Check Railway logs first
