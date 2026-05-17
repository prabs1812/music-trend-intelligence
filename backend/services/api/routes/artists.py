"""Artists API routes."""

from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Optional
from datetime import datetime
from backend.database.mongodb import get_mongodb
from backend.models.artist import ArtistResponse
from backend.utils.logger import app_logger

router = APIRouter(prefix="/artists", tags=["artists"])


@router.get("/{artist_id}", response_model=dict)
async def get_artist(
    artist_id: str = Path(..., description="Artist ID")
):
    """Get detailed information about a specific artist."""
    try:
        db = await get_mongodb()

        from bson import ObjectId
        if not ObjectId.is_valid(artist_id):
            raise HTTPException(status_code=400, detail="Invalid artist ID")

        artist = await db.artists.find_one({"_id": ObjectId(artist_id)})

        if not artist:
            raise HTTPException(status_code=404, detail="Artist not found")

        return {
            "id": str(artist["_id"]),
            "name": artist["name"],
            "spotify_id": artist.get("spotify_id"),
            "popularity": artist.get("popularity", 0),
            "genres": artist.get("genres", []),
            "followers": artist.get("followers", 0),
            "trend_score": artist.get("trend_score", 0),
            "sentiment_score": artist.get("sentiment_score", 0),
            "reddit_mentions": artist.get("reddit_mentions", 0),
            "youtube_mentions": artist.get("youtube_mentions", 0),
            "growth_velocity": artist.get("growth_velocity", 0),
            "keywords": artist.get("keywords", []),
            "last_updated": artist.get("last_updated", datetime.utcnow()).isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error fetching artist: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch artist")


@router.get("/", response_model=List[dict])
async def search_artists(
    query: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Number of results")
):
    """Search for artists by name."""
    try:
        db = await get_mongodb()

        # Case-insensitive regex search
        artists = await db.artists.find({
            "name": {"$regex": query, "$options": "i"}
        }).limit(limit).to_list(length=limit)

        result = []
        for artist in artists:
            result.append({
                "id": str(artist["_id"]),
                "name": artist["name"],
                "trend_score": artist.get("trend_score", 0),
                "popularity": artist.get("popularity", 0),
                "genres": artist.get("genres", [])
            })

        return result

    except Exception as e:
        app_logger.error(f"Error searching artists: {e}")
        raise HTTPException(status_code=500, detail="Failed to search artists")


@router.get("/{artist_id}/trends")
async def get_artist_trends(
    artist_id: str = Path(..., description="Artist ID"),
    limit: int = Query(50, ge=1, le=200, description="Number of trends")
):
    """Get trend history for a specific artist."""
    try:
        db = await get_mongodb()

        from bson import ObjectId
        if not ObjectId.is_valid(artist_id):
            raise HTTPException(status_code=400, detail="Invalid artist ID")

        artist = await db.artists.find_one({"_id": ObjectId(artist_id)})
        if not artist:
            raise HTTPException(status_code=404, detail="Artist not found")

        artist_name = artist["name"]

        trends = await db.trends.find({
            "artist_name": artist_name
        }).sort("timestamp", -1).limit(limit).to_list(length=limit)

        result = []
        for trend in trends:
            result.append({
                "id": str(trend["_id"]),
                "timestamp": trend["timestamp"].isoformat(),
                "source": trend["source"],
                "engagement": trend.get("engagement", {}),
                "sentiment_score": trend.get("sentiment_score"),
                "title": trend.get("title")
            })

        return result

    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error fetching artist trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch artist trends")
