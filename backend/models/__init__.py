"""Data models for the Music Trend Intelligence System."""

from backend.models.artist import (
    Artist,
    ArtistCreate,
    ArtistUpdate,
    ArtistResponse,
    SourceType,
)
from backend.models.genre import (
    Genre,
    GenreCreate,
    GenreUpdate,
    GenreResponse,
    GenreTrendData,
)
from backend.models.trend import (
    Trend,
    TrendCreate,
    TrendResponse,
    TrendSummary,
    EngagementMetrics,
)
from backend.models.anomaly import (
    Anomaly,
    AnomalyCreate,
    AnomalyResponse,
    AnomalyUpdate,
    AlertLevel,
    AnomalyType,
)
from backend.models.comment import (
    Comment,
    CommentCreate,
    CommentResponse,
)

__all__ = [
    # Artist
    "Artist",
    "ArtistCreate",
    "ArtistUpdate",
    "ArtistResponse",
    "SourceType",
    # Genre
    "Genre",
    "GenreCreate",
    "GenreUpdate",
    "GenreResponse",
    "GenreTrendData",
    # Trend
    "Trend",
    "TrendCreate",
    "TrendResponse",
    "TrendSummary",
    "EngagementMetrics",
    # Anomaly
    "Anomaly",
    "AnomalyCreate",
    "AnomalyResponse",
    "AnomalyUpdate",
    "AlertLevel",
    "AnomalyType",
    # Comment
    "Comment",
    "CommentCreate",
    "CommentResponse",
]
