# Deploy Data Ingestion Service on Railway

## Overview
Your Railway MongoDB is only accessible from within Railway's network. To populate the database, you need to deploy the ingestion service ON Railway itself.

## Step-by-Step Instructions

### 1. Open Railway Dashboard
Go to: https://railway.app/dashboard

### 2. Open Your Project
Find and click on your "music-trend-intelligence" project

### 3. Create New Service
1. Click the **"+ New"** button in your project
2. Select **"GitHub Repo"**
3. Choose your repository: **prabs1812/music-trend-intelligence**
4. Railway will create a new service

### 4. Configure the Ingestion Service

#### A. Set Root Directory
1. Click on the new service
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Set it to: `backend`
5. Click **"Update"**

#### B. Set Start Command
1. Still in **"Settings"** tab
2. Find **"Start Command"** or **"Custom Start Command"**
3. Set it to: `python run_ingestion_lastfm.py`
4. Click **"Update"**

#### C. Set Service Name (Optional but Recommended)
1. In **"Settings"** tab
2. Find **"Service Name"**
3. Rename it to: `ingestion-service`
4. Click **"Update"**

### 5. Add Environment Variables

Go to the **"Variables"** tab and add these variables:

**Required Variables:**
```
MONGODB_URL=${{MongoDB.MONGO_URL}}
MONGODB_DB_NAME=music_trends
LASTFM_API_KEY=f397512084da71f79348d1c12f2254cd
MUSICBRAINZ_USER_AGENT=MusicTrendIntelligence/1.0 ( shuklaprabal18@gmail.com )
```

**Rate Limiting:**
```
LASTFM_RATE_LIMIT=5
MUSICBRAINZ_RATE_LIMIT=1
INGESTION_INTERVAL_SECONDS=300
```

**Optional (for better logging):**
```
LOG_LEVEL=INFO
ENVIRONMENT=production
DEBUG=False
```

**Note:** The `${{MongoDB.MONGO_URL}}` syntax tells Railway to use the MongoDB connection URL from your linked MongoDB service.

### 6. Link MongoDB Service
1. In the ingestion service, click **"Settings"** tab
2. Scroll to **"Service Variables"** or **"Linked Services"**
3. Make sure your MongoDB service is linked
4. If not, click **"+ Add Service"** and select your MongoDB

### 7. Deploy
1. After adding all variables, Railway will automatically trigger a deployment
2. Or click **"Deploy"** button if needed
3. Watch the deployment logs in the **"Deployments"** tab

### 8. Monitor the Ingestion

#### Check Logs:
1. Click on the ingestion service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View logs to see:
   - "Starting Music Trend Intelligence - Data Ingestion Service"
   - "MongoDB connected for ingestion"
   - "Starting ingestion cycle (Last.fm + MusicBrainz + Reddit)"
   - "Processed X Last.fm/MusicBrainz events"
   - "Saved X artists to MongoDB"

#### Expected Log Output:
```
============================================================
Starting Music Trend Intelligence - Data Ingestion Service
APIs: Last.fm + MusicBrainz
============================================================
Starting ingestion orchestrator (interval: 300s)
Using Last.fm + MusicBrainz APIs
MongoDB connected for ingestion
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

### 9. Verify Data Population

After a few minutes, check if data is being populated:

**Option A: Via API**
```bash
curl https://music-trend-intelligence-production-293f.up.railway.app/api/v1/trends/artists
```

**Option B: Via Frontend**
Open: https://remarkable-passion-production-cf6d.up.railway.app/

You should see:
- Trending artists list populated
- Genre charts with data
- Real music trend information

### 10. Cost Considerations

The ingestion service will run continuously and fetch data every 5 minutes (300 seconds).

**Railway Free Tier**: $5/month credit
- Backend API: ~$2/month
- Frontend: ~$1/month
- MongoDB: ~$1/month
- **Ingestion Service: ~$1/month**
- **Total: ~$5/month (covered by free credit)**

If you want to reduce costs, you can:
1. Increase `INGESTION_INTERVAL_SECONDS` to 600 (10 minutes) or 900 (15 minutes)
2. Stop the ingestion service after initial population (but data will become stale)
3. Run ingestion only during certain hours

## Troubleshooting

### Issue: Service fails to start
- Check logs for error messages
- Verify all environment variables are set correctly
- Make sure MongoDB service is linked

### Issue: "No module named 'backend'"
- Verify Root Directory is set to `backend`
- Check that Start Command is `python run_ingestion_lastfm.py` (not `python -m backend.run_ingestion_lastfm`)

### Issue: MongoDB connection failed
- Verify `MONGODB_URL=${{MongoDB.MONGO_URL}}` is set correctly
- Check that MongoDB service is linked to ingestion service
- Ensure MongoDB service is running

### Issue: Last.fm API errors
- Verify `LASTFM_API_KEY` is set correctly
- Check Last.fm API rate limits (5 requests per second)

## Alternative: One-Time Population

If you don't want a continuously running ingestion service, you can:

1. Deploy the ingestion service as described above
2. Let it run for 1-2 cycles (10-20 minutes) to populate initial data
3. Stop or delete the ingestion service
4. Your database will have data, but it won't update automatically

To stop the service:
1. Go to ingestion service in Railway
2. Click **"Settings"**
3. Scroll down and click **"Remove Service"** or pause deployments

---

## Summary

✅ Deploy ingestion service on Railway (not locally)
✅ Use same GitHub repo with different start command
✅ Link to MongoDB service using `${{MongoDB.MONGO_URL}}`
✅ Monitor logs to verify data is being fetched
✅ Check frontend dashboard to see populated data

**Your music trend intelligence system will be fully operational once the ingestion service starts populating data!** 🎉
