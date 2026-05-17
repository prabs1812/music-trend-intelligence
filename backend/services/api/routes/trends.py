"""Trends API routes."""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from backend.database.mongodb import get_mongodb
from backend.database.redis_client import get_redis
from backend.services.analytics.trend_scorer import trend_scorer
from backend.models.trend import TrendResponse, TrendSummary
from backend.utils.logger import app_logger
from backend.utils.config import settings

router = APIRouter(prefix="/trends", tags=["trends"])


@router.get("/artists", response_model=List[dict])
async def get_trending_artists(
    limit: int = Query(20, ge=1, le=100, description="Number of artists to return"),
    time_range: str = Query("24h", description="Time range: 1h, 6h, 24h, 7d")
):
    """Get top trending artists."""
    try:
        artists = await trend_scorer.get_top_trending_artists(limit=limit)

        if not artists:
            # Fallback to database
            db = await get_mongodb()
            artist_docs = await db.artists.find({}).sort("trend_score", -1).limit(limit).to_list(length=limit)

            artists = []
            for i, doc in enumerate(artist_docs):
                artists.append({
                    "rank": i + 1,
                    "id": str(doc["_id"]),
                    "name": doc["name"],
                    "trend_score": doc.get("trend_score", 0),
                    "sentiment_score": doc.get("sentiment_score", 0),
                    "popularity": doc.get("popularity", 0),
                    "reddit_mentions": doc.get("reddit_mentions", 0),
                    "youtube_mentions": doc.get("youtube_mentions", 0),
                    "growth_velocity": doc.get("growth_velocity", 0),
                    "genres": doc.get("genres", [])
                })

        return artists

    except Exception as e:
        app_logger.error(f"Error fetching trending artists: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trending artists")


@router.get("/genres", response_model=List[dict])
async def get_trending_genres(
    limit: int = Query(10, ge=1, le=50, description="Number of genres to return")
):
    """Get trending genres."""
    try:
        db = await get_mongodb()
        genres = await db.genres.find({}).sort("popularity", -1).limit(limit).to_list(length=limit)

        result = []
        for i, genre in enumerate(genres):
            result.append({
                "rank": i + 1,
                "id": str(genre["_id"]),
                "name": genre["name"],
                "popularity": genre.get("popularity", 0),
                "growth_rate": genre.get("growth_rate", 0),
                "artist_count": genre.get("artist_count", 0),
                "trending_artists": genre.get("trending_artists", [])[:5]
            })

        return result

    except Exception as e:
        app_logger.error(f"Error fetching trending genres: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trending genres")


@router.get("/history")
async def get_trend_history(
    artist_name: Optional[str] = Query(None, description="Filter by artist name"),
    hours: int = Query(24, ge=1, le=168, description="Hours of history to fetch")
):
    """Get historical trend data."""
    try:
        db = await get_mongodb()

        time_threshold = datetime.utcnow() - timedelta(hours=hours)
        query = {"timestamp": {"$gte": time_threshold}}

        if artist_name:
            query["artist_name"] = artist_name

        trends = await db.trends.find(query).sort("timestamp", -1).limit(1000).to_list(length=1000)

        result = []
        for trend in trends:
            result.append({
                "id": str(trend["_id"]),
                "timestamp": trend["timestamp"].isoformat(),
                "artist_name": trend["artist_name"],
                "source": trend["source"],
                "engagement": trend.get("engagement", {}),
                "sentiment_score": trend.get("sentiment_score"),
                "sentiment_label": trend.get("sentiment_label")
            })

        return result

    except Exception as e:
        app_logger.error(f"Error fetching trend history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trend history")


@router.get("/summary")
async def get_trends_summary(
    hours: int = Query(24, ge=1, le=168, description="Time range in hours")
):
    """Get aggregated trends summary."""
    try:
        db = await get_mongodb()

        time_threshold = datetime.utcnow() - timedelta(hours=hours)

        # Aggregate trends by source
        pipeline = [
            {"$match": {"timestamp": {"$gte": time_threshold}}},
            {"$group": {
                "_id": "$source",
                "count": {"$sum": 1},
                "avg_sentiment": {"$avg": "$sentiment_score"}
            }}
        ]

        source_stats = await db.trends.aggregate(pipeline).to_list(length=None)

        # Get total artists tracked
        total_artists = await db.artists.count_documents({})

        # Get total trends
        total_trends = await db.trends.count_documents({"timestamp": {"$gte": time_threshold}})

        return {
            "time_range_hours": hours,
            "total_artists": total_artists,
            "total_trends": total_trends,
            "by_source": {stat["_id"]: {
                "count": stat["count"],
                "avg_sentiment": round(stat.get("avg_sentiment", 0), 2)
            } for stat in source_stats}
        }

    except Exception as e:
        app_logger.error(f"Error fetching trends summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trends summary")
