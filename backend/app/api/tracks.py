from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.database import get_db
from app.models.vehicle_event import VehicleEvent
from app.schemas.event import VehicleEventResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tracks", tags=["tracks"])


@router.get("/", response_model=List[VehicleEventResponse])
async def get_track(
    track_id: str = Query(..., description="Vehicle track ID to retrieve"),
    camera_id: Optional[str] = Query(None, description="Optional camera filter"),
    db: Session = Depends(get_db)
):
    """
    Get all events for a specific vehicle track, ordered by timestamp.
    Used for track replay and visualization.
    
    - **track_id**: Unique tracking ID (required)
    - **camera_id**: Optional camera filter
    
    Returns ordered list of events with bounding box coordinates.
    """
    try:
        # Build query
        query = db.query(VehicleEvent).filter(VehicleEvent.track_id == track_id)
        
        if camera_id:
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        # Order by timestamp for replay
        events = query.order_by(VehicleEvent.timestamp.asc()).all()
        
        if not events:
            logger.warning(f"No events found for track_id: {track_id}")
            raise HTTPException(
                status_code=404,
                detail=f"No events found for track ID: {track_id}"
            )
        
        logger.info(f"Retrieved {len(events)} events for track {track_id}")
        return events
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving track: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve track: {str(e)}"
        )


@router.get("/list", response_model=List[dict])
async def list_tracks(
    camera_id: Optional[str] = Query(None, description="Filter by camera ID"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of tracks"),
    db: Session = Depends(get_db)
):
    """
    List available track IDs with basic information.
    
    - **camera_id**: Optional camera filter
    - **limit**: Maximum number of tracks to return
    """
    try:
        query = db.query(
            VehicleEvent.track_id,
            VehicleEvent.camera_id,
            VehicleEvent.class_,
            func.count(VehicleEvent.id).label("event_count"),
            func.min(VehicleEvent.timestamp).label("first_seen"),
            func.max(VehicleEvent.timestamp).label("last_seen")
        )
        
        if camera_id:
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        tracks = query.group_by(
            VehicleEvent.track_id,
            VehicleEvent.camera_id,
            VehicleEvent.class_
        ).order_by(
            func.max(VehicleEvent.timestamp).desc()
        ).limit(limit).all()
        
        result = [
            {
                "track_id": t.track_id,
                "camera_id": t.camera_id,
                "class": t.class_,
                "event_count": t.event_count,
                "first_seen": t.first_seen.isoformat() if t.first_seen else None,
                "last_seen": t.last_seen.isoformat() if t.last_seen else None
            }
            for t in tracks
        ]
        
        logger.info(f"Retrieved {len(result)} tracks")
        return result
        
    except Exception as e:
        logger.error(f"Error listing tracks: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list tracks: {str(e)}"
        )


# Import func for SQL functions
from sqlalchemy import func
