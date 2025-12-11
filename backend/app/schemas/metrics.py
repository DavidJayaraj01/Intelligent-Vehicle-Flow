from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class MetricsQuery(BaseModel):
    """Schema for metrics query parameters"""
    camera_id: Optional[str] = Field(None, description="Filter by camera ID")
    from_time: datetime = Field(..., description="Start time for metrics")
    to_time: datetime = Field(..., description="End time for metrics")
    interval: int = Field(1, ge=1, le=60, description="Time interval in minutes")


class MetricsResponse(BaseModel):
    """Schema for aggregated metrics response"""
    camera_id: Optional[str] = Field(None, description="Camera ID (if filtered)")
    from_time: datetime
    to_time: datetime
    total_events: int = Field(..., description="Total number of events")
    vehicles_per_min: float = Field(..., description="Average vehicles per minute")
    avg_dwell_time: float = Field(..., description="Average dwell time in seconds")
    queue_length: int = Field(..., description="Estimated queue length")
    class_distribution: dict = Field(default_factory=dict, description="Vehicle class counts")
    
    class Config:
        json_schema_extra = {
            "example": {
                "camera_id": "cam01",
                "from_time": "2025-12-11T10:00:00Z",
                "to_time": "2025-12-11T11:00:00Z",
                "total_events": 150,
                "vehicles_per_min": 2.5,
                "avg_dwell_time": 45.3,
                "queue_length": 8,
                "class_distribution": {"car": 120, "truck": 20, "bus": 5, "bike": 5}
            }
        }


class TimeSeriesPoint(BaseModel):
    """Schema for a single time series data point"""
    timestamp: datetime
    value: float


class MetricsTimeSeriesResponse(BaseModel):
    """Schema for time series metrics data"""
    camera_id: Optional[str] = None
    metric_name: str = Field(..., description="Name of the metric (e.g., 'vehicles_per_min')")
    data_points: List[TimeSeriesPoint] = Field(..., description="Time series data")
    
    class Config:
        json_schema_extra = {
            "example": {
                "camera_id": "cam01",
                "metric_name": "vehicles_per_min",
                "data_points": [
                    {"timestamp": "2025-12-11T10:00:00Z", "value": 2.5},
                    {"timestamp": "2025-12-11T10:01:00Z", "value": 3.2}
                ]
            }
        }
