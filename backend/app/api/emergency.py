"""Emergency Vehicle Detection API Endpoints"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import tempfile
import shutil
from typing import Dict
import os
import base64
import uuid

from app.services.emergency_detector import EmergencyVehicleDetector

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


@router.post("/detect")
async def detect_emergency(file: UploadFile = File(...)) -> Dict:
    """
    Process uploaded video or image for emergency vehicle detection
    
    Args:
        file: Uploaded video or image file
        
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
