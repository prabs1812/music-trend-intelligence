# 🎯 QUICK REFERENCE - Music Trend Intelligence System

## 🔗 Important URLs

**Live Dashboard**: https://remarkable-passion-production-cf6d.up.railway.app/  
**API Base**: https://remarkable-passion-production-cf6d.up.railway.app/api/v1  
**API Docs**: https://remarkable-passion-production-cf6d.up.railway.app/docs  
**Health Check**: https://remarkable-passion-production-cf6d.up.railway.app/health  

---

## 📊 Current Status (Before Fixes)

| Component | Status | Issue |
|-----------|--------|-------|
| Backend API | ✅ Working | None |
| Frontend | ❌ Broken | Wrong API URL |
| Database | ✅ Working | 30 artists stored |
| Ingestion | ❌ Not Running | Not deployed |
| Redis | ⚠️ Optional | Not connected |
| Kafka | ⚠️ Optional | Not connected |

---

## 🔧 What I Fixed

### 1. Frontend Configuration ✅
**Files Changed**:
- `frontend/.env`
- `frontend/.env.production`

**Change**: Updated API URL from wrong backend to correct one

### 2. Ingestion Service ✅
**Files Created**:
- `Dockerfile.ingestion` - Docker container for ingestion
- `railway.ingestion.json` - Railway config
- `run_ingestion.py` - Entry point script
- `DEPLOYMENT_FIX_GUIDE.md` - Detailed deployment instructions

---

## ⚡ Quick Deploy Commands

### Deploy Frontend Fix
```bash
cd /c/Users/shukl/music-trend-intelligence

# Commit changes
git add frontend/.env frontend/.env.production
git commit -m "Fix: Update frontend API URL to correct backend"
git push

# Railway will auto-deploy (3-5 minutes)
```

### Test After Frontend Deploy
```bash
# Open in browser
https://remarkable-passion-production-cf6d.up.railway.app/

# Should see working dashboard with 30 artists
```

---

## 📋 Railway Ingestion Service Setup

**Quick Steps**:
1. Railway Dashboard → New Service
2. Select your GitHub repo
3. Name: `music-trend-ingestion`
4. Dockerfile: `Dockerfile.ingestion`
5. Add environment variables (copy from backend service):
   - `MONGODB_URL`
   - `LASTFM_API_KEY`
   - `YOUTUBE_API_KEY`
   - `MUSICBRAINZ_USER_AGENT`
   - `INGESTION_INTERVAL_SECONDS=300`
6. Link MongoDB service
7. Deploy

**Expected Result**: Data updates every 5 minutes

---

## 🧪 Quick Tests

### Test 1: Backend Health
```bash
curl https://remarkable-passion-production-cf6d.up.railway.app/health
```
Expected: `{"status":"healthy","mongodb":true,...}`

### Test 2: Get Artists
```bash
curl https://remarkable-passion-production-cf6d.up.railway.app/api/v1/trends/artists?limit=5
```
Expected: Array of 5 artists with data

### Test 3: System Stats
```bash
curl https://remarkable-passion-production-cf6d.up.railway.app/api/v1/stats
```
Expected: `{"total_artists":30,"total_trends":0,...}`

---

## 📈 What to Expect After Fixes

### Immediately (Frontend Deploy)
- ✅ Dashboard loads
- ✅ Shows 30 artists
- ✅ All pages work
- ✅ No more blank page

### After 5 Minutes (Ingestion Running)
- ✅ Data starts updating
- ✅ Trend scores recalculated
- ✅ New data every 5 minutes

### After 30 Minutes
- ✅ Anomalies detected
- ✅ Historical trends
- ✅ Growth velocity tracking

---

## 🐛 Troubleshooting

**Frontend still blank?**
- Hard refresh: Ctrl+Shift+R
- Check browser console (F12)
- Verify Railway deployment succeeded

**No data updating?**
- Check ingestion service logs in Railway
- Verify environment variables set
- Check MongoDB connection

**API errors?**
- Check backend service logs
- Verify MongoDB is running
- Test health endpoint

---

## 📞 Support

**Documentation**:
- Full guide: `DEPLOYMENT_FIX_GUIDE.md`
- Architecture: `docs/ARCHITECTURE.md`
- API docs: `docs/API_DOCUMENTATION.md`

**Logs Location**:
- Railway Dashboard → Service → Logs tab

---

## ✅ Success Checklist

- [ ] Frontend redeployed to Railway
- [ ] Dashboard loads at https://remarkable-passion-production-cf6d.up.railway.app/
- [ ] Shows 30 artists with data
- [ ] Ingestion service created in Railway
- [ ] Ingestion logs show successful cycles
- [ ] Database stats increasing over time

---

**Last Updated**: May 25, 2026  
**Status**: Fixes ready, awaiting deployment
