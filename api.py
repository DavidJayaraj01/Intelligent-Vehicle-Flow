"""
FastAPI Integration for All-Day Vehicle Detection
This module provides REST API endpoints for vehicle detection
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import tempfile
import os
from typing import Optional
import logging

from classifier import WeatherClsasifier
from detector import TPHYolov5
from enlighten import EnlightenModel

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Vehicle Detection API",
    description="All-Day Vehicle Detection Service - Day/Night Detection with YOLO",
    version="1.0.0"
)

# Global models (loaded once at startup)
detector = None
classifier = None
enlighten_model = None

# Configuration
DEVICE = "cpu"  # Change to "cuda" if GPU available
YOLO_WEIGHTS = "weights/yolo/best.pt"
IMG_SIZE = 1536
CONF_THRESH = 0.25
IOU_THRESH = 0.45


@app.on_event("startup")
async def startup_event():
    """Initialize models on API startup"""
    global detector, classifier, enlighten_model
    
    try:
        logger.info("Loading models...")
        detector = TPHYolov5(
            weights=YOLO_WEIGHTS,
            img_size=IMG_SIZE,
            device=DEVICE,
            half=False
        )
        classifier = WeatherClsasifier(device=DEVICE)
        enlighten_model = EnlightenModel(device=DEVICE)
        logger.info("✓ Models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on API shutdown"""
    logger.info("Shutting down API...")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Vehicle Detection API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check with model status"""
    models_loaded = detector is not None and classifier is not None
    return {
        "status": "healthy" if models_loaded else "unhealthy",
        "models_loaded": models_loaded,
        "device": DEVICE
    }


@app.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    """
    Detect vehicles in a single image
    
    Args:
        file: Image file (jpg, png)
    
    Returns:
        {
            "status": "day" | "night",
            "detections": {
                "person": count,
                "bicycle": count,
                "car": count,
                "motorcycle": count,
                "bus": count,
                "truck": count
            },
            "total_objects": int,
            "bounding_boxes": [
                {"class": "car", "confidence": 0.95, "x1": 100, "y1": 200, "x2": 300, "y2": 400},
                ...
            ]
        }
    """
    try:
        # Read uploaded file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Classify day/night
        status = classifier.infer(image)
        
        # Run detection
        results, det = detector.infer(
            image,
            conf_thresh=CONF_THRESH,
            iou_thresh=IOU_THRESH
        )
        
        # Format bounding boxes
        bounding_boxes = []
        class_names = detector.classes
        
        if det is not None and len(det) > 0:
            det_array = det if isinstance(det, np.ndarray) else det.cpu().numpy()
            for detection in det_array:
                x1, y1, x2, y2, conf, class_id = detection
                bounding_boxes.append({
                    "class": class_names[int(class_id)],
                    "confidence": float(conf),
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2)
                })
        
        # Count total detections
        total_objects = sum(v for k, v in results.items() 
                          if isinstance(v, (int, float)) and k != 'status')
        
        return {
            "status": status,
            "detections": {k: v for k, v in results.items() 
                         if isinstance(v, (int, float))},
            "total_objects": total_objects,
            "bounding_boxes": bounding_boxes
        }
    
    except Exception as e:
        logger.error(f"Error in detect_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-with-visualization")
async def detect_image_with_viz(file: UploadFile = File(...)):
    """
    Detect vehicles and return annotated image
    
    Returns:
        Image with bounding boxes and labels drawn
    """
    try:
        # Read uploaded file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Classify day/night
        status = classifier.infer(image)
        
        # Run detection
        results, det = detector.infer(
            image,
            conf_thresh=CONF_THRESH,
            iou_thresh=IOU_THRESH
        )
        
        # Visualize detections
        visualized = detector.visualize(image, det, hide_labels=False, hide_conf=False)
        
        # Add status text
        cv2.putText(visualized, f"Status: {status}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Encode to bytes
        success, buffer = cv2.imencode('.jpg', visualized)
        if not success:
            raise HTTPException(status_code=500, detail="Could not encode image")
        
        return {
            "status": status,
            "detections": {k: v for k, v in results.items() 
                         if isinstance(v, (int, float))},
            "image": buffer.tobytes().hex()  # Base64 would be better in production
        }
    
    except Exception as e:
        logger.error(f"Error in detect_image_with_viz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-batch")
async def detect_batch(files: list[UploadFile] = File(...)):
    """
    Detect vehicles in multiple images
    
    Args:
        files: List of image files
    
    Returns:
        List of detections for each image
    """
    results_list = []
    
    try:
        for i, file in enumerate(files):
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                results_list.append({
                    "filename": file.filename,
                    "error": "Invalid image format"
                })
                continue
            
            # Classify and detect
            status = classifier.infer(image)
            results, det = detector.infer(image, conf_thresh=CONF_THRESH, iou_thresh=IOU_THRESH)
            
            total_objects = sum(v for k, v in results.items() 
                              if isinstance(v, (int, float)) and k != 'status')
            
            results_list.append({
                "filename": file.filename,
                "status": status,
                "detections": {k: v for k, v in results.items() 
                             if isinstance(v, (int, float))},
                "total_objects": total_objects
            })
        
        return {
            "total_files": len(files),
            "processed": len(results_list),
            "results": results_list
        }
    
    except Exception as e:
        logger.error(f"Error in detect_batch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/info")
async def get_info():
    """Get API and model information"""
    return {
        "service": "All-Day Vehicle Detection API",
        "version": "1.0.0",
        "device": DEVICE,
        "model_config": {
            "yolo_weights": YOLO_WEIGHTS,
            "image_size": IMG_SIZE,
            "confidence_threshold": CONF_THRESH,
            "iou_threshold": IOU_THRESH
        },
        "supported_classes": [
            "person", "bicycle", "car", "motorcycle", "bus", "truck"
        ],
        "endpoints": {
            "POST /detect": "Detect objects in single image",
            "POST /detect-with-visualization": "Detect and return annotated image",
            "POST /detect-batch": "Detect objects in multiple images",
            "GET /health": "Health check",
            "GET /info": "Get API information"
        }
    }


# Example usage documentation
"""
EXAMPLE USAGE:

1. Single Image Detection:
   curl -X POST "http://localhost:8000/detect" -F "file=@image.jpg"

2. With Visualization:
   curl -X POST "http://localhost:8000/detect-with-visualization" -F "file=@image.jpg"

3. Batch Detection:
   curl -X POST "http://localhost:8000/detect-batch" -F "file=@image1.jpg" -F "file=@image2.jpg"

4. Health Check:
   curl "http://localhost:8000/health"

5. Get Info:
   curl "http://localhost:8000/info"

RESPONSE EXAMPLE:
{
    "status": "day",
    "detections": {
        "person": 2,
        "bicycle": 0,
        "car": 5,
        "motorcycle": 1,
        "bus": 0,
        "truck": 1
    },
    "total_objects": 9,
    "bounding_boxes": [
        {
            "class": "car",
            "confidence": 0.95,
            "x1": 100,
            "y1": 200,
            "x2": 300,
            "y2": 400
        }
    ]
}
"""

if __name__ == "__main__":
    import uvicorn
    
    # Run with: python api.py
    # Or: uvicorn api:app --reload --host 0.0.0.0 --port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
