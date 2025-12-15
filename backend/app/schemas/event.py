from pydantic import BaseModel, Field, field_serializer
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from decimal import Decimal


class VehicleEventBase(BaseModel):
    """Base schema for vehicle event data"""
    camera_id: str = Field(..., description="Camera identifier")
    track_id: str = Field(..., description="Unique tracking ID for the vehicle")
    class_: str = Field(..., alias="class", description="Vehicle class (car, truck, bus, bike)")
    timestamp: datetime = Field(..., description="Event timestamp")
    enter_time: Optional[datetime] = Field(None, description="Time vehicle entered frame")
    exit_time: Optional[datetime] = Field(None, description="Time vehicle exited frame")
    dwell_seconds: Optional[float] = Field(None, description="Time spent in frame (seconds)")
    lane_id: Optional[str] = Field(None, description="Lane identifier")
    bbox: Optional[Dict[str, Union[float, int, str]]] = Field(None, description="Bounding box coordinates and metadata")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score")
    
    @field_serializer('dwell_seconds', 'confidence')
    def serialize_decimal(self, value: Optional[Union[Decimal, float]]) -> Optional[float]:
        """Convert Decimal to float for JSON serialization"""
        if value is None:
            return None
        return float(value)
    
    class Config:
        populate_by_name = True


class VehicleEventCreate(VehicleEventBase):
    """Schema for creating a new vehicle event"""
    pass


class VehicleEventResponse(VehicleEventBase):
    """Schema for vehicle event response with database fields"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True


class EventBatchRequest(BaseModel):
    """Schema for batch event ingestion"""
    camera_id: str = Field(..., description="Camera identifier for all events")
    events: List[VehicleEventCreate] = Field(..., description="List of vehicle events")
    
    class Config:
        json_schema_extra = {
            "example": {
                "camera_id": "cam01",
                "events": [
                    {
                        "camera_id": "cam01",
                        "track_id": "track_001",
                        "class": "car",
                        "timestamp": "2025-12-11T10:30:00Z",
                        "confidence": 0.95,
                        "bbox": {"x": 100, "y": 200, "width": 80, "height": 120}
                    }
                ]
            }
        }
