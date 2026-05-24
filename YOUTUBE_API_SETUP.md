# 🎬 YouTube API Integration - Final Steps

## ✅ What's Been Done

1. **Local Configuration** ✅
   - Added YouTube API key to local `.env` file
   - Updated orchestrator to import youtube_fetcher
   - Implemented fetch_youtube_data method
   - Integrated YouTube fetching into ingestion cycle

2. **Code Deployed** ✅
   - Committed changes to GitHub
   - Pushed to main branch (commit fb957d0)
   - Railway will auto-deploy backend changes

## 🔧 Critical Step: Add API Key to Railway

**You MUST do this manually in Railway dashboard:**

### Step-by-Step Instructions:

1. **Go to Railway Dashboard**
   - Open: https://railway.app/dashboard
   - Find your project: `music-trend-intelligence`

2. **Open Ingestion Service**
   - Click on the **ingestion service** (the one running `run_ingestion_lastfm.py`)

3. **Add Environment Variable**
   - Click **"Variables"** tab
   - Click **"+ New Variable"**
   - Add:
     ```
     YOUTUBE_API_KEY=AIzaSyD2z8sST652Vs1avcPwwKo_HNF1TNpOO3g
     ```
   - Click **"Add"**

4. **Service Will Auto-Restart**
   - Railway will automatically restart the ingestion service
   - Wait 1-2 minutes for restart

5. **Verify in Logs**
   - Go to **"Deployments"** tab
   - Click latest deployment
   - Look for logs showing:
     - "Starting YouTube data fetch"
     - "Fetched YouTube data for X artists"
     - "Updated X artists with YouTube data"

---

## 📊 What Will Happen

**After Adding API Key:**

1. **Next Ingestion Cycle (5 minutes)**
   - Fetches Last.fm artists (30 artists)
   - Takes top 10 artists
   - Searches YouTube for each artist
   - Finds 5 videos per artist
   - Stores youtube_mentions count

2. **Data Updates**
   - `youtube_mentions` field will change from 0 to 1-5
   - Artists with more videos = higher mentions
   - Updates every 5 minutes

3. **Dashboard Shows**
   - YouTube mention counts on artist cards
   - Real engagement data
   - Video presence indicators

---

## 🎯 Expected Results

**Before:**
```json
{
  "name": "Taylor Swift",
  "youtube_mentions": 0
}
```

**After (10-15 minutes):**
```json
{
  "name": "Taylor Swift",
  "youtube_mentions": 5
}
```

---

## ⚠️ Important Notes

**API Quota Limits:**
- YouTube API has daily quota limits
- We're limiting to 10 artists per cycle
- 5 videos per artist
- This conserves your quota

**Why Only 10 Artists:**
- YouTube API quota is limited (10,000 units/day)
- Each search = 100 units
- Each video stats call = 1 unit
- 10 artists × (100 + 5) = 1,050 units per cycle
- ~9 cycles per day = safe within quota

**If You Want More:**
- Increase artist limit in code (line: `artist_names[:10]`)
- But watch your quota usage
- Check: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

---

## 🔍 Verification Steps

**After 10-15 minutes:**

1. **Check API Response**
   ```bash
   curl "https://music-trend-intelligence-production-293f.up.railway.app/api/v1/trends/artists?limit=5"
   ```
   
   Look for `youtube_mentions` > 0

2. **Check Dashboard**
   - Open: https://remarkable-passion-production-cf6d.up.railway.app/artists
   - Look at artist cards
   - Should show YouTube mention counts

3. **Check Railway Logs**
   - Look for "Fetched YouTube data for X artists"
   - Should see artist names and video counts

---

## 🚨 Troubleshooting

**If youtube_mentions still shows 0:**

1. **Check Railway Variables**
   - Verify YOUTUBE_API_KEY is set correctly
   - No extra spaces or quotes

2. **Check Logs for Errors**
   - "YouTube API key not configured" = key not set
   - "quotaExceeded" = daily limit reached
   - "invalid API key" = key is wrong

3. **Verify API Key is Valid**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Check key is enabled
   - YouTube Data API v3 is enabled

---

## ✅ Next Steps

1. **Add YouTube API key to Railway** (do this now)
2. **Wait 10-15 minutes** for ingestion cycle
3. **Verify youtube_mentions > 0** in API response
4. **Check dashboard** to see updated data

---

**Once this is working, you'll have real YouTube engagement data flowing into your dashboard!** 🎬

Do you want me to help with anything else while we wait for the deployment?
