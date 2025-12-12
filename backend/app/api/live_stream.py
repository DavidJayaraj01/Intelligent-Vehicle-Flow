"""
YouTube Live Stream Detection API
Endpoints for real-time vehicle detection from YouTube live streams
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import cv2
import numpy as np
import logging
import base64
from datetime import datetime
import json

from app.services.youtube_live_detector import YouTubeLiveDetector
from app.database import get_db
from app.models.vehicle_event import VehicleEvent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/live-stream", tags=["live-stream"])

# Global detector instance
live_detector: Optional[YouTubeLiveDetector] = None
active_connections: List[WebSocket] = []


class LiveStreamConfig(BaseModel):
    youtube_url: str
    camera_id: str = "live_stream_01"
    save_to_database: bool = True


class LiveStreamStatus(BaseModel):
    is_running: bool
    frame_count: int
    statistics: Dict[str, Any]
    youtube_url: Optional[str] = None


@router.post("/start")
async def start_live_stream(config: LiveStreamConfig, background_tasks: BackgroundTasks):
    """
    Start YouTube live stream detection
    
    Args:
        config: Stream configuration with YouTube URL
        
    Returns:
        Status of stream start
    """
    global live_detector
    
    try:
        # Initialize detector if not exists
        if live_detector is None:
            live_detector = YouTubeLiveDetector(model_path='yolov8n.pt')
        
        # Stop existing stream if running
        if live_detector.is_running:
            live_detector.stop_stream()
            await asyncio.sleep(1)
        
        # Reset statistics
        live_detector.reset_statistics()
        
        # Start new stream
        success = live_detector.start_stream(config.youtube_url)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to start YouTube stream")
        
        # Start background processing
        background_tasks.add_task(process_stream_background, config.save_to_database)
        
        return {
            "status": "started",
            "message": "Live stream detection started successfully",
            "youtube_url": config.youtube_url,
            "camera_id": config.camera_id
        }
        
    except Exception as e:
        logger.error(f"Error starting live stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop")
async def stop_live_stream():
    """Stop YouTube live stream detection"""
    global live_detector
    
    if live_detector and live_detector.is_running:
        live_detector.stop_stream()
        return {
            "status": "stopped",
            "message": "Live stream detection stopped",
            "final_statistics": live_detector.get_statistics()
        }
    
    return {
        "status": "not_running",
        "message": "No active stream to stop"
    }


@router.get("/status")
async def get_stream_status() -> LiveStreamStatus:
    """Get current live stream status and statistics"""
    global live_detector
    
    if live_detector is None:
        return LiveStreamStatus(
            is_running=False,
            frame_count=0,
            statistics={}
        )
    
    stats = live_detector.get_statistics()
    
    return LiveStreamStatus(
        is_running=stats['is_running'],
        frame_count=stats['frame_count'],
        statistics=stats
    )


@router.websocket("/ws")
async def websocket_live_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time detection data and frames
    Sends both annotated frames and detection data
    """
    global live_detector, active_connections
    
    await websocket.accept()
    active_connections.append(websocket)
    logger.info("WebSocket client connected to live stream")
    
    frame_count = 0
    
    try:
        while True:
            if live_detector and live_detector.is_running:
                # Get frame from stream
                ret, frame = live_detector.get_frame()
                
                if ret and frame is not None:
                    # Process frame
                    annotated_frame, detection_data = await live_detector.process_frame(frame)
                    
                    # Encode frame to JPEG
                    _, buffer = cv2.imencode('.jpg', annotated_frame, 
                                            [cv2.IMWRITE_JPEG_QUALITY, 80])
                    frame_base64 = base64.b64encode(buffer).decode('utf-8')
                    
                    frame_count += 1
                    if frame_count % 30 == 0:  # Log every 30 frames
                        logger.info(f"Sending frame {frame_count} with {len(detection_data.get('detections', []))} detections")
                    
                    # Send data to client
                    await websocket.send_json({
                        'type': 'detection_update',
                        'frame': frame_base64,
                        'data': detection_data,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                    
                    # Control frame rate (send ~10 FPS to reduce bandwidth)
                    await asyncio.sleep(0.1)
                else:
                    logger.warning("Failed to read frame from stream")
                    # Stream ended or error
                    await websocket.send_json({
                        'type': 'stream_ended',
                        'message': 'Stream ended or connection lost'
                    })
                    break
            else:
                # No active stream, send status
                logger.info("No active stream running, waiting...")
                await websocket.send_json({
                    'type': 'status',
                    'is_running': False,
                    'message': 'No active stream'
                })
                await asyncio.sleep(1)
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from live stream (sent {frame_count} frames)")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)


async def process_stream_background(save_to_database: bool):
    """
    Background task to process stream and save to database
    
    Args:
        save_to_database: Whether to save detections to database
    """
    global live_detector
    
    logger.info("Started background stream processing")
    
    batch_size = 30  # Save to DB every 30 detections
    detection_batch = []
    
    try:
        while live_detector and live_detector.is_running:
            ret, frame = live_detector.get_frame()
            
            if ret and frame is not None:
                # Process frame
                _, detection_data = await live_detector.process_frame(frame)
                
                # Save to database if enabled
                if save_to_database and detection_data['detections']:
                    detection_batch.extend(detection_data['detections'])
                    
                    # Save batch to database
                    if len(detection_batch) >= batch_size:
                        await save_detections_to_db(detection_batch)
                        detection_batch = []
                
                # Broadcast to WebSocket clients
                await broadcast_to_clients(detection_data)
                
                # Small delay to prevent overwhelming
                await asyncio.sleep(0.05)
            else:
                # Stream ended
                logger.info("Stream ended in background processor")
                break
                
        # Save remaining detections
        if detection_batch and save_to_database:
            await save_detections_to_db(detection_batch)
            
    except Exception as e:
        logger.error(f"Error in background stream processing: {e}")
    finally:
        logger.info("Background stream processing ended")


async def save_detections_to_db(detections: List[Dict[str, Any]]):
    """Save detection batch to database"""
    try:
        db = next(get_db())
        
        for det in detections:
            vehicle_event = VehicleEvent(
                camera_id="live_stream_01",
                class_=det['type'],
                confidence=float(det['confidence']),
                bbox={
                    'x': det['bbox'][0],
                    'y': det['bbox'][1],
                    'width': det['bbox'][2] - det['bbox'][0],
                    'height': det['bbox'][3] - det['bbox'][1]
                },
                track_id=str(det['id']),
                timestamp=datetime.utcnow(),
                dwell_seconds=det.get('queue_time', 0)
            )
            db.add(vehicle_event)
        
        db.commit()
        logger.info(f"Saved {len(detections)} detections to database")
        
    except Exception as e:
        logger.error(f"Error saving detections to database: {e}")
        db.rollback()
    finally:
        db.close()


async def broadcast_to_clients(data: Dict[str, Any]):
    """Broadcast detection data to all connected WebSocket clients"""
    global active_connections
    
    disconnected = []
    
    for connection in active_connections:
        try:
            await connection.send_json({
                'type': 'detection_update',
                'data': data
            })
        except Exception:
            disconnected.append(connection)
    
    # Remove disconnected clients
    for conn in disconnected:
        active_connections.remove(conn)


@router.get("/statistics/realtime")
async def get_realtime_statistics():
    """Get real-time analytics and statistics"""
    global live_detector
    
    if not live_detector:
        raise HTTPException(status_code=404, detail="No live detector initialized")
    
    stats = live_detector.get_statistics()
    
    # Calculate additional metrics
    vehicles_by_type = dict(stats['vehicles_by_type'])
    
    return {
        "current_statistics": stats,
        "breakdown": {
            "vehicles_by_type": vehicles_by_type,
            "total_tracked": stats['tracked_vehicles'],
            "current_queue": stats['current_queue_length'],
            "average_queue_time": stats['avg_queue_time']
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/statistics/reset")
async def reset_statistics():
    """Reset all statistics and tracking data"""
    global live_detector
    
    if live_detector:
        live_detector.reset_statistics()
        return {
            "status": "reset",
            "message": "Statistics reset successfully"
        }
    
    raise HTTPException(status_code=404, detail="No live detector initialized")
