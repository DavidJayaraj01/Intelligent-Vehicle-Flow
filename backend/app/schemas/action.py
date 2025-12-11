from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any


class OperatorActionCreate(BaseModel):
    """Schema for creating a new operator action"""
    operator_id: str = Field(..., description="Operator identifier")
    action_type: str = Field(..., description="Type of action (e.g., extend_green_light, trigger_alert)")
    params: Optional[Dict[str, Any]] = Field(None, description="Additional action parameters")
    camera_id: Optional[str] = Field(None, description="Camera ID associated with action")
    
    class Config:
        json_schema_extra = {
            "example": {
                "operator_id": "operator_001",
                "action_type": "extend_green_light",
                "params": {"duration_seconds": 30, "reason": "heavy_traffic"},
                "camera_id": "cam01"
            }
        }


class OperatorActionResponse(BaseModel):
    """Schema for operator action response with database fields"""
    id: int
    operator_id: str
    action_type: str
    params: Optional[Dict[str, Any]]
    camera_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class RecommendedAction(BaseModel):
    """Schema for AI-recommended actions"""
    type: str = Field(..., description="Recommended action type")
    description: str = Field(..., description="Human-readable description")
    params: Dict[str, Any] = Field(default_factory=dict, description="Suggested parameters")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    camera_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "extend_green_light",
                "description": "Heavy traffic detected. Consider extending green light duration.",
                "params": {"duration_seconds": 30},
                "confidence": 0.85,
                "camera_id": "cam01"
            }
        }
