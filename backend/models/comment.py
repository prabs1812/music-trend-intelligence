from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from backend.models.artist import SourceType


class Comment(BaseModel):
    """Comment/text data model for NLP processing."""
    id: Optional[str] = Field(None, description="MongoDB ObjectId")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Source information
    source: SourceType = Field(..., description="Data source")
    source_id: str = Field(..., description="Source-specific ID")
    source_url: Optional[str] = Field(None, description="URL to original content")

    # Content
    text: str = Field(..., description="Comment or post text")
    author: Optional[str] = Field(None, description="Author username")

    # NLP Analysis results
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0, description="Sentiment score")
    sentiment_label: Optional[str] = Field(None, description="positive/negative/neutral")
    keywords: List[str] = Field(default_factory=list, description="Extracted keywords")
    entities: List[str] = Field(default_factory=list, description="Named entities (artists, etc.)")

    # Artist associations
    mentioned_artists: List[str] = Field(default_factory=list, description="Artists mentioned in text")

    # Engagement
    upvotes: int = Field(0, ge=0)
    replies: int = Field(0, ge=0)

    # Processing status
    processed: bool = Field(False, description="Whether NLP processing is complete")
    processing_error: Optional[str] = Field(None, description="Error message if processing failed")

    class Config:
        json_schema_extra = {
            "example": {
                "source": "reddit",
                "source_id": "abc123xyz",
                "text": "Just listened to the new Taylor Swift album and it's absolutely amazing!",
                "author": "music_lover_42",
                "sentiment_score": 0.92,
                "sentiment_label": "positive",
                "keywords": ["listened", "album", "amazing"],
                "entities": ["Taylor Swift"],
                "mentioned_artists": ["Taylor Swift"],
                "upvotes": 245,
                "replies": 18,
                "processed": True
            }
        }


class CommentCreate(BaseModel):
    """Schema for creating a new comment."""
    source: SourceType
    source_id: str
    text: str
    author: Optional[str] = None
    source_url: Optional[str] = None
    upvotes: int = 0
    replies: int = 0


class CommentResponse(BaseModel):
    """API response schema for comment data."""
    id: str
    timestamp: datetime
    source: str
    text: str
    sentiment_score: Optional[float]
    sentiment_label: Optional[str]
    mentioned_artists: List[str]
    keywords: List[str]
