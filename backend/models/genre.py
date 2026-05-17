from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Genre(BaseModel):
    """Genre data model."""
    id: Optional[str] = Field(None, description="MongoDB ObjectId")
    name: str = Field(..., description="Genre name")
    popularity: float = Field(0.0, ge=0.0, le=100.0, description="Current popularity score")
    growth_rate: float = Field(0.0, description="Growth rate percentage")

    # Metrics
    artist_count: int = Field(0, ge=0, description="Number of artists in this genre")
    trending_artists: List[str] = Field(default_factory=list, description="Top trending artist names")
    total_mentions: int = Field(0, ge=0, description="Total mentions across all sources")

    # Time series data
    popularity_history: List[float] = Field(default_factory=list, description="Historical popularity scores")
    timestamps: List[datetime] = Field(default_factory=list, description="Timestamps for history")

    # Metadata
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "pop",
                "popularity": 85.5,
                "growth_rate": 5.2,
                "artist_count": 150,
                "trending_artists": ["Taylor Swift", "Ariana Grande", "Ed Sheeran"],
                "total_mentions": 5420
            }
        }


class GenreCreate(BaseModel):
    """Schema for creating a new genre."""
    name: str
    popularity: float = 0.0


class GenreUpdate(BaseModel):
    """Schema for updating genre data."""
    popularity: Optional[float] = None
    growth_rate: Optional[float] = None
    artist_count: Optional[int] = None
    trending_artists: Optional[List[str]] = None
    total_mentions: Optional[int] = None


class GenreResponse(BaseModel):
    """API response schema for genre data."""
    id: str
    name: str
    popularity: float
    growth_rate: float
    artist_count: int
    trending_artists: List[str]
    total_mentions: int


class GenreTrendData(BaseModel):
    """Time series data for genre trends."""
    genre: str
    data_points: List[dict]  # [{timestamp, popularity}]
