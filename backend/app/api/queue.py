"""Queue Detection API Endpoints"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import tempfile
import shutil
from typing import Dict
import os
import base64
import uuid

from app.services.queue_detector import VehicleQueueDetector

router = APIRouter(prefix="/queue", tags=["queue"])

# Initialize detector (lazy loading)
detector = None

# Create output directory for processed files
OUTPUT_DIR = Path("outputs/queue")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def get_detector():
    """Get or initialize detector instance"""
    global detector
    if detector is None:
        model_path = os.getenv('YOLO_MODEL_PATH', 'yolov8n.pt')
        detector = VehicleQueueDetector(model_path=model_path)
    return detector


@router.post("/detect")
async def detect_queue(file: UploadFile = File(...)) -> Dict:
    """
    Process uploaded video or image for queue detection
    
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
    
    # Create temp directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_dir_path = Path(temp_dir)
        
        # Save uploaded file
        input_path = temp_dir_path / f"input{file_ext}"
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Determine output path
        is_video = file_ext in {'.mp4', '.avi', '.mov'}
        output_ext = '.mp4' if is_video else '.jpg'
        
        # Generate unique filename for output
        unique_id = str(uuid.uuid4())
        output_filename = f"queue_result_{unique_id}{output_ext}"
        output_path = OUTPUT_DIR / output_filename
        
        try:
            # Get detector instance
            queue_detector = get_detector()
            
            # Process file
            if is_video:
                result = queue_detector.process_video(
                    str(input_path),
                    str(output_path)
                )
            else:
                result = queue_detector.process_image(
                    str(input_path),
                    str(output_path)
                )
            
            # For videos, use file URL; for images, use base64
            if is_video:
                # Just return the file path for videos (too large for base64)
                result['output_file'] = output_filename
                result['output_path'] = f"/api/v1/queue/outputs/{output_filename}"
                result['is_video'] = True
            else:
                # For images, encode as base64
                with open(output_path, 'rb') as f:
                    file_data = f.read()
                    base64_data = base64.b64encode(file_data).decode('utf-8')
                result['output_base64'] = base64_data
                result['is_video'] = False
            
            return result
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing file: {str(e)}"
            )


@router.get("/outputs/{filename}")
async def get_output_file(filename: str):
    """Serve processed output files"""
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine media type based on file extension
    media_type = "video/mp4" if filename.endswith('.mp4') else "image/jpeg"
    
    return FileResponse(
        file_path,
        media_type=media_type,
        headers={
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600"
        }
    )


@router.get("/health")
async def health_check() -> Dict:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "queue_detection",
        "model_loaded": detector is not None
    }
