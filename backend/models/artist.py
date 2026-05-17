from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class SourceType(str, Enum):
    """Data source types."""
    SPOTIFY = "spotify"
    REDDIT = "reddit"
    YOUTUBE = "youtube"


class Artist(BaseModel):
    """Artist data model."""
    id: Optional[str] = Field(None, description="MongoDB ObjectId")
    name: str = Field(..., description="Artist name")
    spotify_id: Optional[str] = Field(None, description="Spotify artist ID")
    popularity: float = Field(0.0, ge=0.0, le=100.0, description="Spotify popularity score")
    genres: List[str] = Field(default_factory=list, description="Associated genres")
    followers: int = Field(0, ge=0, description="Follower count")

    # Trend metrics
    reddit_mentions: int = Field(0, ge=0, description="Reddit mention count")
    youtube_mentions: int = Field(0, ge=0, description="YouTube mention count")
    sentiment_score: float = Field(0.0, ge=-1.0, le=1.0, description="Average sentiment score")
    trend_score: float = Field(0.0, ge=0.0, le=100.0, description="Calculated trend score")
    growth_velocity: float = Field(0.0, description="Rate of growth")

    # Metadata
    keywords: List[str] = Field(default_factory=list, description="Associated keywords")
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Taylor Swift",
                "spotify_id": "06HL4z0CvFAxyc27GXpf02",
                "popularity": 95.0,
                "genres": ["pop", "country"],
                "followers": 50000000,
                "reddit_mentions": 1250,
                "youtube_mentions": 3400,
                "sentiment_score": 0.75,
                "trend_score": 87.5,
                "growth_velocity": 12.3,
                "keywords": ["album", "tour", "new single"]
            }
        }


class ArtistCreate(BaseModel):
    """Schema for creating a new artist."""
    name: str
    spotify_id: Optional[str] = None
    popularity: float = 0.0
    genres: List[str] = Field(default_factory=list)
    followers: int = 0


class ArtistUpdate(BaseModel):
    """Schema for updating artist data."""
    popularity: Optional[float] = None
    followers: Optional[int] = None
    reddit_mentions: Optional[int] = None
    youtube_mentions: Optional[int] = None
    sentiment_score: Optional[float] = None
    trend_score: Optional[float] = None
    growth_velocity: Optional[float] = None
    keywords: Optional[List[str]] = None


class ArtistResponse(BaseModel):
    """API response schema for artist data."""
    id: str
    name: str
    spotify_id: Optional[str]
    popularity: float
    genres: List[str]
    trend_score: float
    sentiment_score: float
    reddit_mentions: int
    youtube_mentions: int
    rank: Optional[int] = None
    change: Optional[str] = None  # "up", "down", "same", "new"
