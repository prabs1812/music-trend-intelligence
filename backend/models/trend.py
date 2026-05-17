from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from backend.models.artist import SourceType


class EngagementMetrics(BaseModel):
    """Engagement metrics from various sources."""
    views: int = Field(0, ge=0)
    likes: int = Field(0, ge=0)
    comments: int = Field(0, ge=0)
    shares: int = Field(0, ge=0)
    upvotes: int = Field(0, ge=0)
    downvotes: int = Field(0, ge=0)


class Trend(BaseModel):
    """Trend event data model."""
    id: Optional[str] = Field(None, description="MongoDB ObjectId")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Artist information
    artist_name: str = Field(..., description="Artist name")
    artist_id: Optional[str] = Field(None, description="Artist MongoDB ID")

    # Source information
    source: SourceType = Field(..., description="Data source")
    source_id: Optional[str] = Field(None, description="Source-specific ID (e.g., Reddit post ID)")

    # Engagement metrics
    engagement: EngagementMetrics = Field(default_factory=EngagementMetrics)

    # Content
    title: Optional[str] = Field(None, description="Post/video title")
    content: Optional[str] = Field(None, description="Post content or description")
    url: Optional[str] = Field(None, description="Source URL")

    # Analysis results
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    sentiment_label: Optional[str] = Field(None, description="positive/negative/neutral")
    keywords: List[str] = Field(default_factory=list)

    # Metadata
    raw_data: Dict[str, Any] = Field(default_factory=dict, description="Raw API response")
    processed: bool = Field(False, description="Whether NLP processing is complete")

    class Config:
        json_schema_extra = {
            "example": {
                "artist_name": "Drake",
                "source": "reddit",
                "engagement": {
                    "upvotes": 1250,
                    "comments": 340
                },
                "title": "Drake's new album is fire!",
                "sentiment_score": 0.85,
                "sentiment_label": "positive",
                "keywords": ["album", "fire", "new release"]
            }
        }


class TrendCreate(BaseModel):
    """Schema for creating a new trend event."""
    artist_name: str
    source: SourceType
    engagement: EngagementMetrics
    title: Optional[str] = None
    content: Optional[str] = None
    url: Optional[str] = None
    raw_data: Dict[str, Any] = Field(default_factory=dict)


class TrendResponse(BaseModel):
    """API response schema for trend data."""
    id: str
    timestamp: datetime
    artist_name: str
    source: str
    engagement: EngagementMetrics
    sentiment_score: Optional[float]
    sentiment_label: Optional[str]


class TrendSummary(BaseModel):
    """Aggregated trend summary."""
    artist_name: str
    total_mentions: int
    sources: Dict[str, int]  # {source: count}
    avg_sentiment: float
    total_engagement: EngagementMetrics
    time_period: str
