# Railway Ingestion Service - Quick Setup Card

## Service Configuration

**Root Directory:**
```
backend
```

**Start Command:**
```
python run_ingestion_lastfm.py
```

**Service Name (optional):**
```
ingestion-service
```

---

## Environment Variables to Add

Copy and paste these into Railway's Variables tab:

### Database Connection
```
MONGODB_URL=${{MongoDB.MONGO_URL}}
MONGODB_DB_NAME=music_trends
```

### API Keys
```
LASTFM_API_KEY=f397512084da71f79348d1c12f2254cd
MUSICBRAINZ_USER_AGENT=MusicTrendIntelligence/1.0 ( shuklaprabal18@gmail.com )
```

### Rate Limits
```
LASTFM_RATE_LIMIT=5
MUSICBRAINZ_RATE_LIMIT=1
INGESTION_INTERVAL_SECONDS=300
```

### Optional (Logging)
```
LOG_LEVEL=INFO
ENVIRONMENT=production
DEBUG=False
```

---

## Expected Log Output (Success)

After deployment, you should see logs like:

```
============================================================
Starting Music Trend Intelligence - Data Ingestion Service
APIs: Last.fm + MusicBrainz
============================================================
Starting ingestion orchestrator (interval: 300s)
Using Last.fm + MusicBrainz APIs
Connecting to MongoDB at mongodb://mongo:***@caboose.proxy.rlwy.net:49953
MongoDB indexes created successfully
Successfully connected to MongoDB database: music_trends
MongoDB connected for ingestion
Kafka connection failed (running without Kafka): NoBrokersAvailable
============================================================
Starting ingestion cycle (Last.fm + MusicBrainz + Reddit)
============================================================
Starting Last.fm data fetch
Processed 30 Last.fm/MusicBrainz events
Saved 30 artists to MongoDB
Starting genre data fetch
Saved 15 genres to MongoDB
============================================================
Ingestion cycle completed in XX.XXs
Total events processed: 45
============================================================
Waiting 300s until next cycle...
```

---

## Verification Commands

After 5-10 minutes, verify data is populated:

**Check Artists:**
```bash
curl https://music-trend-intelligence-production-293f.up.railway.app/api/v1/trends/artists
```

**Check Genres:**
```bash
curl https://music-trend-intelligence-production-293f.up.railway.app/api/v1/trends/genres
```

**Open Dashboard:**
```
https://remarkable-passion-production-cf6d.up.railway.app/
```

---

## Troubleshooting

**If logs show "No module named 'backend'":**
- Root Directory must be set to `backend` (not empty, not `/backend`)

**If logs show MongoDB connection error:**
- Verify `MONGODB_URL=${{MongoDB.MONGO_URL}}` (with double curly braces)
- Check MongoDB service is linked in Settings → Service Variables

**If logs show Last.fm API error:**
- Verify `LASTFM_API_KEY` is set correctly (no quotes needed)

**If service keeps restarting:**
- Check deployment logs for specific error messages
- Verify Python dependencies are installed (Railway does this automatically)
