# How to Fix All Missing Data Issues

## Current Status
✅ **Working**: 30 artists with trend scores and genres  
❌ **Missing**: Photos, Anomalies, Sentiment, Real-time updates

---

## Solution 1: Fix Artist Photos

### Problem
The API response doesn't include `image_url` field.

### Root Cause
The Last.fm ingestion service (`orchestrator_lastfm.py`) fetches images but they may not be saved properly to the database.

### Fix Steps
1. **Verify Last.fm API is returning images**:
   - Check if Last.fm API response includes image URLs
   - The code already extracts images in `_get_artist_image()` method

2. **Ensure images are saved to MongoDB**:
   - The code saves `image_url` to the artists collection
   - Need to verify the Railway ingestion service is running

3. **Check the API endpoint**:
   - The `/api/v1/trends/artists` endpoint should include `image_url`
   - May need to update the API response to include this field

### Quick Fix
Run the ingestion service on Railway to populate images:
```bash
# The ingestion service should run automatically on Railway
# Check Railway logs to verify it's running every 5 minutes
```

---

## Solution 2: Enable Anomaly Detection

### Problem
`total_anomalies: 0` - No anomalies detected

### Root Cause
The anomaly detection service isn't running or hasn't analyzed enough data yet.

### Fix Steps
1. **Verify anomaly detector is running**:
   - Check `backend/services/analytics/anomaly_detector.py`
   - Should run after trend scoring

2. **Requires historical data**:
   - Anomalies are detected by comparing current vs historical trends
   - Need at least 2-3 ingestion cycles (10-15 minutes) to detect patterns

3. **Check detection thresholds**:
   - `ANOMALY_DETECTION_THRESHOLD: 3.0` (Z-score)
   - `ANOMALY_SPIKE_THRESHOLD: 2.0`
   - May need to lower thresholds to detect more anomalies

### Quick Fix
The anomaly detector should run automatically. Wait 15-20 minutes for enough data to accumulate, then anomalies will appear.

---

## Solution 3: Add Sentiment Analysis

### Problem
`sentiment_score: 0`, `reddit_mentions: 0`

### Root Cause
Reddit API integration isn't active - requires Reddit API credentials.

### Fix Steps
1. **Get Reddit API credentials**:
   - Go to https://www.reddit.com/prefs/apps
   - Create an app to get `client_id` and `client_secret`

2. **Add to Railway environment variables**:
   ```
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   REDDIT_USER_AGENT=MusicTrendBot/1.0
   ```

3. **Enable Reddit ingestion**:
   - The `orchestrator_lastfm.py` includes Reddit fetching
   - Once credentials are added, it will fetch Reddit posts
   - NLP service will analyze sentiment

### Alternative (Without Reddit API)
Use mock sentiment data for demonstration:
- Create a script to generate random sentiment scores
- Update existing artists with mock sentiment data

---

## Solution 4: Enable Real-time Updates

### Problem
`websocket_connections: 0` - No WebSocket connections

### Root Cause
WebSocket server may not be running or frontend can't connect.

### Fix Steps
1. **Verify WebSocket server is running**:
   - Backend has WebSocket endpoints: `/ws/trends`, `/ws/anomalies`, `/ws/dashboard`
   - Check Railway logs to verify WebSocket server started

2. **Check frontend WebSocket connection**:
   - Frontend uses `websocket.js` service
   - May need to update WebSocket URL for Railway

3. **Update WebSocket URL**:
   ```javascript
   // frontend/src/services/websocket.js
   const WS_URL = 'wss://music-trend-intelligence-production-293f.up.railway.app'
   ```

### Quick Fix
WebSocket connections require the backend WebSocket server to be running. This should be automatic when the FastAPI app starts.

---

## Recommended Action Plan

### Immediate (5 minutes)
1. ✅ **Fix text visibility** - DONE
2. **Refresh browser** at http://localhost:3001
3. **Verify data is now readable**

### Short Term (15-30 minutes)
1. **Check Railway logs** to verify ingestion service is running
2. **Wait for anomaly detection** - needs 2-3 cycles (15 minutes)
3. **Verify artist images** are being fetched and saved

### Optional (If you want full features)
1. **Add Reddit API credentials** to Railway environment
2. **Enable WebSocket** by verifying backend WebSocket server
3. **Run ingestion manually** to populate all data immediately

---

## Quick Test Commands

### Check if images are in database
```bash
curl -s https://music-trend-intelligence-production-293f.up.railway.app/api/v1/trends/artists?limit=1 | grep image_url
```

### Check anomalies
```bash
curl -s https://music-trend-intelligence-production-293f.up.railway.app/api/v1/analytics/anomalies?limit=5
```

### Check WebSocket health
```bash
curl -s https://music-trend-intelligence-production-293f.up.railway.app/health
```

---

## Summary

**Easiest fixes (no code changes needed):**
1. ✅ Text visibility - DONE
2. ⏳ Anomalies - Wait 15 minutes for data
3. ⏳ Artist photos - Check if ingestion is running

**Requires configuration:**
1. Reddit API - Need credentials
2. WebSocket - May need URL update

**Would you like me to:**
- Check Railway logs to see what's running?
- Add Reddit API credentials?
- Fix WebSocket connections?
- Create a script to populate mock data for testing?
