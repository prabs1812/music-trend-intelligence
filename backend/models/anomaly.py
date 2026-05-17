from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class AlertLevel(str, Enum):
    """Anomaly alert severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AnomalyType(str, Enum):
    """Types of anomalies detected."""
    SPIKE = "spike"
    DROP = "drop"
    SENTIMENT_SHIFT = "sentiment_shift"
    UNUSUAL_PATTERN = "unusual_pattern"


class Anomaly(BaseModel):
    """Anomaly detection data model."""
    id: Optional[str] = Field(None, description="MongoDB ObjectId")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Artist information
    artist_name: str = Field(..., description="Artist name")
    artist_id: Optional[str] = Field(None, description="Artist MongoDB ID")

    # Anomaly details
    anomaly_type: AnomalyType = Field(..., description="Type of anomaly")
    alert_level: AlertLevel = Field(..., description="Severity level")
    metric: str = Field(..., description="Metric that triggered anomaly (e.g., 'mentions', 'engagement')")

    # Statistical data
    current_value: float = Field(..., description="Current metric value")
    expected_value: float = Field(..., description="Expected/baseline value")
    z_score: float = Field(..., description="Z-score of the anomaly")
    deviation_percentage: float = Field(..., description="Percentage deviation from expected")

    # Context
    description: str = Field(..., description="Human-readable description")
    source: Optional[str] = Field(None, description="Primary data source")

    # Status
    acknowledged: bool = Field(False, description="Whether anomaly has been acknowledged")
    dismissed: bool = Field(False, description="Whether anomaly has been dismissed")

    # Metadata
    detection_method: str = Field(..., description="Method used to detect (z_score, isolation_forest, etc.)")
    additional_data: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        json_schema_extra = {
            "example": {
                "artist_name": "Olivia Rodrigo",
                "anomaly_type": "spike",
                "alert_level": "high",
                "metric": "reddit_mentions",
                "current_value": 2500.0,
                "expected_value": 450.0,
                "z_score": 4.2,
                "deviation_percentage": 455.6,
                "description": "Sudden spike in Reddit mentions (455.6% above baseline)",
                "detection_method": "z_score"
            }
        }


class AnomalyCreate(BaseModel):
    """Schema for creating a new anomaly."""
    artist_name: str
    anomaly_type: AnomalyType
    alert_level: AlertLevel
    metric: str
    current_value: float
    expected_value: float
    z_score: float
    deviation_percentage: float
    description: str
    detection_method: str
    source: Optional[str] = None
    additional_data: Dict[str, Any] = Field(default_factory=dict)


class AnomalyResponse(BaseModel):
    """API response schema for anomaly data."""
    id: str
    timestamp: datetime
    artist_name: str
    anomaly_type: str
    alert_level: str
    metric: str
    current_value: float
    expected_value: float
    deviation_percentage: float
    description: str
    acknowledged: bool
    dismissed: bool


class AnomalyUpdate(BaseModel):
    """Schema for updating anomaly status."""
    acknowledged: Optional[bool] = None
    dismissed: Optional[bool] = None
