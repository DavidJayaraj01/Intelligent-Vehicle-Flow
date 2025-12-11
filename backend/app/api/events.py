from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import logging

from app.database import get_db
from app.models.vehicle_event import VehicleEvent
from app.schemas.event import EventBatchRequest, VehicleEventResponse, VehicleEventCreate
from app.services.websocket_manager import ws_manager
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=dict)
async def ingest_events(
    batch: EventBatchRequest,
    db: Session = Depends(get_db)
):
    """
    Ingest a batch of vehicle events from a camera.
    
    - **camera_id**: Camera identifier
    - **events**: List of vehicle event data
    
    Returns the number of events created.
    """
    try:
        created_events = []
        
        for event_data in batch.events:
            # Create VehicleEvent instance
            db_event = VehicleEvent(
                camera_id=event_data.camera_id,
                track_id=event_data.track_id,
                class_=event_data.class_,
                timestamp=event_data.timestamp,
                enter_time=event_data.enter_time,
                exit_time=event_data.exit_time,
                dwell_seconds=event_data.dwell_seconds,
                lane_id=event_data.lane_id,
                bbox=event_data.bbox,
                confidence=event_data.confidence
            )
            db.add(db_event)
            created_events.append(db_event)
        
        # Commit all events
        db.commit()
        
        logger.info(f"Ingested {len(created_events)} events from camera {batch.camera_id}")
        
        # Publish to Redis
        try:
            redis_client.publish("events_ingested", {
                "camera_id": batch.camera_id,
                "event_count": len(created_events),
                "timestamp": datetime.utcnow().isoformat()
            })
        except Exception as e:
            logger.error(f"Failed to publish to Redis: {e}")
        
        # Broadcast via WebSocket
        try:
            await ws_manager.broadcast({
                "type": "events_ingested",
                "camera_id": batch.camera_id,
                "event_count": len(created_events),
                "timestamp": datetime.utcnow().isoformat()
            })
        except Exception as e:
            logger.error(f"Failed to broadcast via WebSocket: {e}")
        
        return {
            "status": "success",
            "message": f"Successfully ingested {len(created_events)} events",
            "events_created": len(created_events),
            "camera_id": batch.camera_id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error ingesting events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest events: {str(e)}"
        )


@router.get("/", response_model=List[VehicleEventResponse])
async def get_events(
    camera_id: str = None,
    limit: int = 100,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get recent vehicle events with optional filtering.
    
    - **camera_id**: Optional camera filter
    - **limit**: Maximum number of events to return (default 100)
    - **skip**: Number of events to skip (pagination)
    """
    try:
        query = db.query(VehicleEvent)
        
        if camera_id:
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        events = query.order_by(VehicleEvent.timestamp.desc()).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(events)} events")
        return events
        
    except Exception as e:
        logger.error(f"Error retrieving events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve events: {str(e)}"
        )
