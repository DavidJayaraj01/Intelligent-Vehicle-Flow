"""Queue Detection API Endpoints"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Request
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pathlib import Path
import tempfile
import shutil
from typing import Dict, Optional
import os
import base64
import uuid
import json
from datetime import datetime

from app.services.queue_detector import VehicleQueueDetector
from app.database import get_db
from app.models.vehicle_event import VehicleEvent

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


def _save_queue_detections_to_db(db: Session, results: Dict, output_filename: str):
    """Save queue detection results to database"""
    try:
        camera_id = f"queue_upload_{uuid.uuid4().hex[:8]}"
        current_time = datetime.utcnow()
        
        # Extract statistics from nested structure
        statistics = results.get('statistics', {})
        
        # Metadata to include file references
        metadata = {
            'output_file': output_filename,
            'output_path': f"outputs/queue/{output_filename}",
            'total_vehicles': statistics.get('totalVehicles', 0),
            'avg_wait_time': statistics.get('avgWaitTime', 0)
        }
        
        # Save vehicle queue data if available
        vehicle_details = statistics.get('vehicleDetails', [])
        if vehicle_details:
            for vehicle in vehicle_details:
                event = VehicleEvent(
                    camera_id=camera_id,
                    track_id=f"queue_{vehicle.get('id', uuid.uuid4().hex[:8])}",
                    class_=vehicle.get('type', 'vehicle'),
                    timestamp=current_time,
                    dwell_seconds=float(vehicle.get('queueTime', 0)),
                    lane_id='queue_detection',
                    confidence=0.9,
                    bbox=metadata,
                )
                db.add(event)
        
        db.commit()
        print(f"✅ Saved queue detections to database. Output file: {output_filename}")
    except Exception as e:
        db.rollback()
        print(f"❌ Error saving queue detections to database: {e}")


@router.post("/detect")
async def detect_queue(
    file: UploadFile = File(...), 
    entry_line: Optional[str] = Form(None),
    exit_line: Optional[str] = Form(None),
    db: Session = Depends(get_db)
) -> Dict:
    """
    Process uploaded video or image for queue detection
    
    Args:
        file: Uploaded video or image file
        entry_line: JSON string with entry line configuration {orientation, position}
        exit_line: JSON string with exit line configuration {orientation, position}
        
    Returns:
        Detection results with statistics
    """
    # Parse line configurations
    entry_line_config = None
    exit_line_config = None
    
    try:
        if entry_line:
            entry_line_config = json.loads(entry_line)
        if exit_line:
            exit_line_config = json.loads(exit_line)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid line configuration JSON: {str(e)}"
        )
    
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
            
            # Process file with custom line configuration
            if is_video:
                result = queue_detector.process_video(
                    str(input_path),
                    str(output_path),
                    entry_line=entry_line_config,
                    exit_line=exit_line_config
                )
            else:
                result = queue_detector.process_image(
                    str(input_path),
                    str(output_path),
                    entry_line=entry_line_config,
                    exit_line=exit_line_config
                )
            
            # Verify output file was created and is valid
            if not output_path.exists():
                raise HTTPException(status_code=500, detail="Output file was not created")
            
            if output_path.stat().st_size == 0:
                raise HTTPException(status_code=500, detail="Output file is empty")
            
            # Save results to database
            _save_queue_detections_to_db(db, result, output_filename)
            
            # Prepare response in format expected by frontend
            response = {
                'statistics': result.get('statistics', {}),
                'processing_time': result.get('processing_time', 0),
                'is_video': is_video,
            }
            
            # For videos, use file URL; for images, use base64
            if is_video:
                response['output_file'] = output_filename
                response['output_path'] = f"/api/v1/queue/outputs/{output_filename}"
                print(f"✅ Video processed successfully: {output_filename} ({output_path.stat().st_size / (1024*1024):.2f} MB)")
            else:
                # For images, encode as base64
                with open(output_path, 'rb') as f:
                    file_data = f.read()
                    base64_data = base64.b64encode(file_data).decode('utf-8')
                response['output_base64'] = base64_data
            
            return response
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing file: {str(e)}"
            )


@router.head("/outputs/{filename}")
@router.get("/outputs/{filename}")
async def get_output_file(filename: str, request: Request):
    """Serve processed output files with streaming support"""
    try:
        file_path = OUTPUT_DIR / filename
        
        # Security check - prevent directory traversal
        if not file_path.resolve().is_relative_to(OUTPUT_DIR.resolve()):
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"File not found: {filename}")
        
        # Check if file is readable and not empty
        if not file_path.is_file() or file_path.stat().st_size == 0:
            raise HTTPException(status_code=404, detail="File is empty or not accessible")
        
        # Determine media type based on file extension
        media_type = "video/mp4" if filename.endswith('.mp4') else "image/jpeg"
        
        return FileResponse(
            path=str(file_path.absolute()),
            media_type=media_type,
            filename=filename,
            headers={
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Content-Disposition": f"inline; filename={filename}",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Expose-Headers": "Content-Length, Content-Range"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")


@router.get("/health")
async def health_check() -> Dict:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "queue_detection",
        "model_loaded": detector is not None
    }


@router.post("/detect-youtube")
async def detect_queue_youtube(youtube_url: str, duration: int = 10) -> Dict:
    """
    Analyze YouTube live stream for queue detection
    
    Args:
        youtube_url: YouTube video/stream URL
        duration: Duration in seconds to analyze (default 10)
        
    Returns:
        Detection results with statistics
    """
    import yt_dlp
    
    try:
        # Create temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = Path(temp_dir)
            video_path = temp_dir_path / "stream.mp4"
            
            # Download video segment using yt-dlp
            ydl_opts = {
                'format': 'best[ext=mp4]',
                'outtmpl': str(video_path),
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([youtube_url])
            
            if not video_path.exists():
                raise HTTPException(status_code=400, detail="Failed to download video")
            
            # Generate output path
            unique_id = str(uuid.uuid4())
            output_filename = f"queue_youtube_{unique_id}.mp4"
            output_path = OUTPUT_DIR / output_filename
            
            # Get detector and process
            queue_detector = get_detector()
            result = queue_detector.process_video(
                str(video_path),
                str(output_path)
            )
            
            # Add output path to response
            result['is_video'] = True
            result['output_path'] = f"/api/v1/queue/output/{output_filename}"
            
            return result
            
    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=400, detail=f"YouTube download failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

