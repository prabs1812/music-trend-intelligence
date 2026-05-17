"""Analytics API routes."""

from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime, timedelta
from backend.database.mongodb import get_mongodb
from backend.utils.logger import app_logger

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/sentiment")
async def get_sentiment_trends(
    hours: int = Query(24, ge=1, le=168, description="Time range in hours")
):
    """Get sentiment trends over time."""
    try:
        db = await get_mongodb()

        time_threshold = datetime.utcnow() - timedelta(hours=hours)

        # Aggregate sentiment by time buckets
        pipeline = [
            {"$match": {
                "timestamp": {"$gte": time_threshold},
                "sentiment_score": {"$ne": None}
            }},
            {"$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d %H:00",
                        "date": "$timestamp"
                    }
                },
                "avg_sentiment": {"$avg": "$sentiment_score"},
                "positive_count": {
                    "$sum": {"$cond": [{"$gt": ["$sentiment_score", 0.3]}, 1, 0]}
                },
                "negative_count": {
                    "$sum": {"$cond": [{"$lt": ["$sentiment_score", -0.3]}, 1, 0]}
                },
                "neutral_count": {
                    "$sum": {"$cond": [
                        {"$and": [
                            {"$gte": ["$sentiment_score", -0.3]},
                            {"$lte": ["$sentiment_score", 0.3]}
                        ]}, 1, 0
                    ]}
                },
                "total_count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]

        results = await db.comments.aggregate(pipeline).to_list(length=None)

        data_points = []
        for result in results:
            data_points.append({
                "timestamp": result["_id"],
                "avg_sentiment": round(result["avg_sentiment"], 3),
                "positive_count": result["positive_count"],
                "negative_count": result["negative_count"],
                "neutral_count": result["neutral_count"],
                "total_count": result["total_count"]
            })

        return {
            "time_range_hours": hours,
            "data_points": data_points
        }

    except Exception as e:
        app_logger.error(f"Error fetching sentiment trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sentiment trends")


@router.get("/anomalies")
async def get_anomalies(
    limit: int = Query(20, ge=1, le=100, description="Number of anomalies"),
    dismissed: bool = Query(False, description="Include dismissed anomalies")
):
    """Get recent anomalies."""
    try:
        db = await get_mongodb()

        query = {}
        if not dismissed:
            query["dismissed"] = False

        anomalies = await db.anomalies.find(query).sort("timestamp", -1).limit(limit).to_list(length=limit)

        result = []
        for anomaly in anomalies:
            result.append({
                "id": str(anomaly["_id"]),
                "timestamp": anomaly["timestamp"].isoformat(),
                "artist_name": anomaly["artist_name"],
                "anomaly_type": anomaly["anomaly_type"],
                "alert_level": anomaly["alert_level"],
                "metric": anomaly["metric"],
                "current_value": anomaly["current_value"],
                "expected_value": anomaly["expected_value"],
                "deviation_percentage": anomaly["deviation_percentage"],
                "description": anomaly["description"],
                "acknowledged": anomaly.get("acknowledged", False),
                "dismissed": anomaly.get("dismissed", False)
            })

        return result

    except Exception as e:
        app_logger.error(f"Error fetching anomalies: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch anomalies")


@router.post("/anomalies/{anomaly_id}/acknowledge")
async def acknowledge_anomaly(anomaly_id: str):
    """Mark an anomaly as acknowledged."""
    try:
        db = await get_mongodb()

        from bson import ObjectId
        if not ObjectId.is_valid(anomaly_id):
            raise HTTPException(status_code=400, detail="Invalid anomaly ID")

        result = await db.anomalies.update_one(
            {"_id": ObjectId(anomaly_id)},
            {"$set": {"acknowledged": True}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Anomaly not found")

        return {"status": "acknowledged"}

    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error acknowledging anomaly: {e}")
        raise HTTPException(status_code=500, detail="Failed to acknowledge anomaly")


@router.post("/anomalies/{anomaly_id}/dismiss")
async def dismiss_anomaly(anomaly_id: str):
    """Dismiss an anomaly."""
    try:
        db = await get_mongodb()

        from bson import ObjectId
        if not ObjectId.is_valid(anomaly_id):
            raise HTTPException(status_code=400, detail="Invalid anomaly ID")

        result = await db.anomalies.update_one(
            {"_id": ObjectId(anomaly_id)},
            {"$set": {"dismissed": True}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Anomaly not found")

        return {"status": "dismissed"}

    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error dismissing anomaly: {e}")
        raise HTTPException(status_code=500, detail="Failed to dismiss anomaly")


@router.get("/engagement")
async def get_engagement_metrics(
    hours: int = Query(24, ge=1, le=168, description="Time range in hours")
):
    """Get engagement metrics over time."""
    try:
        db = await get_mongodb()

        time_threshold = datetime.utcnow() - timedelta(hours=hours)

        # Aggregate engagement by source
        pipeline = [
            {"$match": {"timestamp": {"$gte": time_threshold}}},
            {"$group": {
                "_id": "$source",
                "total_views": {"$sum": "$engagement.views"},
                "total_likes": {"$sum": "$engagement.likes"},
                "total_comments": {"$sum": "$engagement.comments"},
                "avg_engagement": {"$avg": {
                    "$add": [
                        "$engagement.views",
                        {"$multiply": ["$engagement.likes", 10]},
                        {"$multiply": ["$engagement.comments", 5]}
                    ]
                }}
            }}
        ]

        results = await db.trends.aggregate(pipeline).to_list(length=None)

        by_source = {}
        for result in results:
            by_source[result["_id"]] = {
                "total_views": result.get("total_views", 0),
                "total_likes": result.get("total_likes", 0),
                "total_comments": result.get("total_comments", 0),
                "avg_engagement": round(result.get("avg_engagement", 0), 2)
            }

        return {
            "time_range_hours": hours,
            "by_source": by_source
        }

    except Exception as e:
        app_logger.error(f"Error fetching engagement metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch engagement metrics")
