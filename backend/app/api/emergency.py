"""Emergency Vehicle Detection API Endpoints"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import tempfile
import shutil
from typing import Dict
import os
import base64
import uuid
from datetime import datetime

from app.services.emergency_detector import EmergencyVehicleDetector
from app.database import get_db
from app.models.vehicle_event import VehicleEvent

router = APIRouter(prefix="/emergency", tags=["emergency"])

# Initialize detector (lazy loading)
detector = None

# Create output directory for processed files
OUTPUT_DIR = Path("outputs/emergency")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def get_detector():
    """Get or initialize detector instance"""
    global detector
    if detector is None:
        # Use model from parent directory
        model_path = os.getenv('EMERGENCY_MODEL_PATH', str(Path(__file__).parent.parent.parent.parent / 'best_emergency_model.pt'))
        detector = EmergencyVehicleDetector(model_path=model_path)
    return detector


def _save_emergency_detections_to_db(db: Session, results: Dict, output_filename: str, original_filename: str):
    """Save emergency vehicle detections to database"""
    try:
        camera_id = f"emergency_upload_{uuid.uuid4().hex[:8]}"
        current_time = datetime.utcnow()
        
        # Get detections from results
        if 'detections_by_frame' in results:
            # Video processing
            for frame_detections in results['detections_by_frame']:
                for detection in frame_detections:
                    # bbox is a list [x1, y1, x2, y2], convert to dict with metadata
                    bbox_list = detection.get('bbox', [])
                    if bbox_list and len(bbox_list) == 4:
                        bbox_dict = {
                            'x': bbox_list[0],
                            'y': bbox_list[1],
                            'x2': bbox_list[2],
                            'y2': bbox_list[3],
                            'width': bbox_list[2] - bbox_list[0],
                            'height': bbox_list[3] - bbox_list[1],
                            'output_file': output_filename,
                            'original_file': original_filename,
                            'output_path': f"outputs/emergency/{output_filename}",
                            'frame': detection.get('frame')
                        }
                    else:
                        bbox_dict = {
                            'output_file': output_filename,
                            'original_file': original_filename,
                            'output_path': f"outputs/emergency/{output_filename}"
                        }
                    
                    event = VehicleEvent(
                        camera_id=camera_id,
                        track_id=f"emergency_{detection.get('class')}_{uuid.uuid4().hex[:8]}",
                        class_=detection.get('class', 'unknown'),
                        timestamp=current_time,
                        bbox=bbox_dict,
                        confidence=detection.get('confidence', 0.0),
                        lane_id='emergency_detection',
                    )
                    db.add(event)
        elif 'detections' in results:
            # Image processing
            for detection in results['detections']:
                # bbox is a list [x1, y1, x2, y2], convert to dict with metadata
                bbox_list = detection.get('bbox', [])
                if bbox_list and len(bbox_list) == 4:
                    bbox_dict = {
                        'x': bbox_list[0],
                        'y': bbox_list[1],
                        'x2': bbox_list[2],
                        'y2': bbox_list[3],
                        'width': bbox_list[2] - bbox_list[0],
                        'height': bbox_list[3] - bbox_list[1],
                        'output_file': output_filename,
                        'original_file': original_filename,
                        'output_path': f"outputs/emergency/{output_filename}"
                    }
                else:
                    bbox_dict = {
                        'output_file': output_filename,
                        'original_file': original_filename,
                        'output_path': f"outputs/emergency/{output_filename}"
                    }
                    
                event = VehicleEvent(
                    camera_id=camera_id,
                    track_id=f"emergency_{detection.get('class')}_{uuid.uuid4().hex[:8]}",
                    class_=detection.get('class', 'unknown'),
                    timestamp=current_time,
                    bbox=bbox_dict,
                    confidence=detection.get('confidence', 0.0),
                    lane_id='emergency_detection',
                )
                db.add(event)
        
        db.commit()
        print(f"✅ Saved emergency detections to database. Output file: {output_filename}")
    except Exception as e:
        db.rollback()
        print(f"❌ Error saving emergency detections to database: {e}")



@router.post("/detect")
async def detect_emergency(file: UploadFile = File(...), db: Session = Depends(get_db)) -> Dict:
    """
    Process uploaded video or image for emergency vehicle detection
    
    Args:
        file: Uploaded video or image file
        db: Database session
        
    Returns:
        Detection results with statistics
    """
    # Validate file type
    allowed_extensions = {'.mp4', '.avi', '.mov', '.jpg', '.jpeg', '.png'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (max 500MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 500 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 500MB limit"
        )
    
    # Determine if video or image
    is_video = file_ext in {'.mp4', '.avi', '.mov'}
    
    # Create temp file for input
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_input:
        shutil.copyfileobj(file.file, temp_input)
        temp_input_path = temp_input.name
    
    try:
        # Generate unique filename for output
        output_filename = f"emergency_result_{uuid.uuid4().hex[:16]}{'.mp4' if is_video else file_ext}"
        output_path = str(OUTPUT_DIR / output_filename)
        
        # Get detector and process
        det = get_detector()
        
        if is_video:
            # Process video
            results = det.process_video(temp_input_path, output_path)
            
            # Save detections to database
            _save_emergency_detections_to_db(db, results, output_filename, file.filename)
            
            # Return video URL and statistics
            return {
                'success': True,
                'isVideo': True,
                'videoUrl': f"/api/v1/emergency/outputs/{output_filename}",
                'statistics': {
                    'detectionCounts': results['detection_counts'],
                    'totalDetections': results['total_detections'],
                    'framesWithDetections': results['frames_with_detections'],
                    'totalFrames': results['total_frames'],
                    'maxConfidence': results['max_confidence']
                },
                'processingTime': round(results['processing_time'], 2)
            }
        else:
            # Process image
            results = det.process_image(temp_input_path, output_path)
            
            # Save detections to database
            _save_emergency_detections_to_db(db, results, output_filename, file.filename)
            
            # Read processed image and encode to base64
            with open(output_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            return {
                'success': True,
                'isVideo': False,
                'imageData': f"data:image/jpeg;base64,{image_data}",
                'statistics': {
                    'detections': results['detections'],
                    'detectionCounts': results['detection_counts'],
                    'totalDetections': results['total_detections']
                },
                'processingTime': round(results['processing_time'], 2)
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )
    finally:
        # Cleanup temp input file
        if os.path.exists(temp_input_path):
            os.unlink(temp_input_path)


@router.get("/outputs/{filename}")
async def get_output_video(filename: str):
    """
    Serve processed output video
    
    Args:
        filename: Name of the output file
        
    Returns:
        Video file
    """
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        headers={
            "Content-Disposition": f"inline; filename={filename}",
            "Accept-Ranges": "bytes",
            "Cache-Control": "no-cache"
        }
    )


@router.get("/health")
async def health_check():
    """Check if emergency detection service is healthy"""
    try:
        det = get_detector()
        return {
            "status": "healthy",
            "service": "emergency_detection",
            "model_loaded": det.model is not None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
