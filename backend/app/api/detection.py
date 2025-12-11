from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import cv2
import numpy as np
from app.services.vehicle_detector import get_detector
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/detect", tags=["Detection"])


@router.post("/image")
async def detect_vehicles_in_image(
    file: UploadFile = File(...),
    confidence: float = Query(0.5, ge=0.0, le=1.0),
    draw_boxes: bool = Query(False)  # Default to False for JSON response
):
    """
    Detect vehicles in an uploaded image.
    
    Args:
        file: Image file (JPG, PNG, etc.)
        confidence: Minimum confidence threshold (0.0 to 1.0)
        draw_boxes: Whether to return image with drawn bounding boxes
        
    Returns:
        JSON with detections or annotated image
    """
    import time
    start_time = time.time()
    
    try:
        # Read image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Get detector
        detector = get_detector()
        detector.confidence_threshold = confidence
        
        # Run detection
        detections = detector.detect(image)
        
        processing_time = time.time() - start_time
        
        processing_time = time.time() - start_time
        
        if draw_boxes:
            # Draw detections on image
            output_image = detector.draw_detections(image, detections)
            
            # Encode image to bytes
            _, buffer = cv2.imencode('.jpg', output_image)
            io_buf = io.BytesIO(buffer)
            
            return StreamingResponse(
                io_buf,
                media_type="image/jpeg",
                headers={
                    "X-Detections-Count": str(len(detections)),
                    "X-Processing-Time": str(processing_time)
                }
            )
        else:
            # Return JSON response with proper format
            return {
                "detections": [
                    {
                        "bbox": det["bbox"],
                        "confidence": det["confidence"],
                        "class": det["class"]
                    }
                    for det in detections
                ],
                "count": len(detections),
                "processing_time": round(processing_time, 2),
                "image_size": [image.shape[1], image.shape[0]]
            }
            
    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/video-frame")
async def detect_vehicles_in_frame(
    file: UploadFile = File(...),
    camera_id: str = Query(...),
    track_id_prefix: Optional[str] = Query(None)
):
    """
    Detect vehicles in a video frame and create event entries.
    
    Args:
        file: Video frame image
        camera_id: Camera identifier
        track_id_prefix: Optional prefix for track IDs
        
    Returns:
        Detections and created events
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Run detection
        detector = get_detector()
        detections = detector.detect(image)
        
        # Create events from detections
        from app.database import SessionLocal
        from app.models.vehicle_event import VehicleEvent
        from datetime import datetime
        
        db = SessionLocal()
        events = []
        
        try:
            for idx, det in enumerate(detections):
                track_id = f"{track_id_prefix or camera_id}_track_{idx}_{int(datetime.utcnow().timestamp())}"
                
                event = VehicleEvent(
                    camera_id=camera_id,
                    track_id=track_id,
                    class_=det['class'],
                    timestamp=datetime.utcnow(),
                    bbox=det['bbox'],
                    confidence=det['confidence']
                )
                db.add(event)
                events.append({
                    "track_id": track_id,
                    "class": det['class'],
                    "confidence": det['confidence'],
                    "bbox": det['bbox']
                })
            
            db.commit()
            logger.info(f"Created {len(events)} events for camera {camera_id}")
            
        finally:
            db.close()
        
        return {
            "detections": detections,
            "events_created": len(events),
            "camera_id": camera_id
        }
        
    except Exception as e:
        logger.error(f"Frame detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model-info")
async def get_model_info():
    """
    Get information about the loaded detection model.
    
    Returns:
        Model information and status
    """
    detector = get_detector()
    
    return {
        "model_loaded": detector.model_loaded,
        "model_type": getattr(detector, 'model_type', 'simulated'),
        "confidence_threshold": detector.confidence_threshold,
        "supported_classes": detector.class_names,
        "status": "ready" if detector.model_loaded else "using_simulated_data"
    }


@router.post("/load-model")
async def load_detection_model(model_path: str):
    """
    Load a YOLO model from file path.
    
    Args:
        model_path: Path to model weights file
        
    Returns:
        Load status
    """
    try:
        detector = get_detector()
        success = detector.load_model(model_path)
        
        if success:
            return {
                "status": "success",
                "message": f"Model loaded from {model_path}",
                "model_type": detector.model_type
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to load model. Check logs for details."
            )
            
    except Exception as e:
        logger.error(f"Model loading error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
