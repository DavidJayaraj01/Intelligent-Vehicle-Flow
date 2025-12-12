from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import subprocess
import tempfile
import os
import cv2
import time
from datetime import datetime, timezone
from app.services.vehicle_detector import get_detector
from app.database import get_db
from app.models.vehicle_event import VehicleEvent
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/live", tags=["Live Stream"])

class YouTubeStreamRequest(BaseModel):
    url: str
    duration: int = 20  # Duration in seconds to analyze
    camera_id: str = "CAM01"  # Camera ID for database storage

@router.post("/analyze")
async def analyze_youtube_stream(request: YouTubeStreamRequest, db: Session = Depends(get_db)):
    """
    Analyze a YouTube live stream for vehicle detection.
    Gets the stream URL, processes frames, and stores detections in database.
    """
    start_time = time.time()
    analysis_timestamp = datetime.now(timezone.utc)
    
    try:
        # Get stream URL using yt-dlp
        logger.info(f"Getting stream URL from YouTube: {request.url}")
        cmd_get_url = [
            'yt-dlp',
            '-f', 'best[ext=mp4]/best',
            '--get-url',
            '--no-playlist',
            request.url
        ]
        
        result_url = subprocess.run(cmd_get_url, capture_output=True, text=True, timeout=30)
        
        if result_url.returncode != 0:
            logger.error(f"yt-dlp error getting URL: {result_url.stderr}")
            raise HTTPException(status_code=400, detail="Failed to get stream URL")
        
        stream_url = result_url.stdout.strip()
        logger.info(f"Got stream URL, opening with OpenCV...")
        
        # Open stream directly with OpenCV
        cap = cv2.VideoCapture(stream_url)
        
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open stream URL")
        
        # Analyze video with YOLO
        detector = get_detector()
        
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        max_frames_to_process = int(fps * request.duration)  # Only process duration seconds
        
        vehicle_counts = {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0, 'bicycle': 0}
        all_detections = []
        frames_processed = 0
        events_saved = 0
        
        # Process frames
        frame_interval = max(1, int(fps / 2))  # Process 2 frames per second
        frame_count = 0
        
        while frame_count < max_frames_to_process:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % frame_interval == 0:
                frame_timestamp = analysis_timestamp
                detections = detector.detect(frame)
                
                for detection in detections:
                    class_name = detection['class'].lower()
                    confidence = detection['confidence']
                    
                    if class_name in vehicle_counts:
                        vehicle_counts[class_name] += 1
                        
                    bbox = detection['bbox']
                    all_detections.append({
                        'class': class_name,
                        'confidence': confidence,
                        'bbox': bbox,
                        'frame': frames_processed
                    })
                    
                    # Save detection to database
                    try:
                        track_id = f"LIVE_{request.camera_id}_{uuid.uuid4().hex[:8]}"
                        event = VehicleEvent(
                            camera_id=request.camera_id,
                            track_id=track_id,
                            class_=class_name,
                            timestamp=frame_timestamp,
                            enter_time=frame_timestamp,
                            bbox={
                                'x': bbox[0],
                                'y': bbox[1],
                                'width': bbox[2] - bbox[0],
                                'height': bbox[3] - bbox[1]
                            },
                            confidence=confidence
                        )
                        db.add(event)
                        events_saved += 1
                    except Exception as e:
                        logger.error(f"Error saving event: {e}")
                
                # Commit events for this frame
                try:
                    db.commit()
                except Exception as e:
                    logger.error(f"Error committing events: {e}")
                    db.rollback()
                
                frames_processed += 1
            
            frame_count += 1
        
        cap.release()
        
        processing_time = time.time() - start_time
        total_vehicles = sum(vehicle_counts.values())
        
        logger.info(f"Analyzed {frames_processed} frames from live stream")
        logger.info(f"Vehicle counts: {vehicle_counts}")
        logger.info(f"Saved {events_saved} events to database")
        
        return {
            'success': True,
            'total_vehicles': total_vehicles,
            'vehicle_counts': vehicle_counts,
            'frames_processed': frames_processed,
            'events_saved': events_saved,
            'duration_seconds': request.duration,
            'processing_time': processing_time,
            'detections': all_detections[:100]  # Limit to first 100 detections
        }
        
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Stream access timeout")
    except Exception as e:
        logger.error(f"Error analyzing stream: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error analyzing stream: {str(e)}")
    finally:
        # Cleanup - no temp file needed with direct stream approach
        pass
