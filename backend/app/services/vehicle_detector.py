"""
Vehicle Detection Service using Ultralytics YOLO11 model
Handles model loading, inference, and detection processing
"""
import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import sys
import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import logging
import time

logger = logging.getLogger(__name__)

# Try to import Ultralytics YOLO
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
    logger.info("Ultralytics YOLO imported successfully")
except ImportError as e:
    logger.error(f"Ultralytics YOLO not available: {e}")
    YOLO_AVAILABLE = False


class VehicleDetector:
    """
    Vehicle detection service using Ultralytics YOLO11 model.
    """
    
    def __init__(self, model_path: Optional[str] = None, confidence_threshold: float = 0.25):
        """
        Initialize the vehicle detector.
        
        Args:
            model_path: Path to the YOLO model weights
            confidence_threshold: Minimum confidence for detections
        """
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = 0.45
        self.model = None
        self.model_loaded = False
        
        # Vehicle class IDs (COCO dataset)
        # 1: bicycle, 2: car, 3: motorcycle, 5: bus, 6: train, 7: truck
        self.vehicle_class_ids = [1, 2, 3, 5, 6, 7]
        
        # Auto-load model from default path if not specified
        if model_path is None:
            # Try different possible locations for YOLO models
            possible_paths = [
                Path(__file__).resolve().parents[2] / "yolov8l.pt",  # backend/yolov8l.pt
                Path(__file__).resolve().parents[3] / "yolov8l.pt",  # project_root/yolov8l.pt
                Path(__file__).resolve().parents[2] / "weights" / "yolov8l.pt",  # backend/weights/yolov8l.pt
            ]
            
            for path in possible_paths:
                if path.exists():
                    model_path = str(path)
                    logger.info(f"Found model at: {model_path}")
                    break
            
            if model_path is None:
                # Default to yolov8l.pt (will download if not exists)
                model_path = "yolov8l.pt"
                logger.info("Using YOLOv8l model (will download if needed)")
        
        if YOLO_AVAILABLE:
            self.load_model(model_path)
        else:
            logger.warning("YOLO not available - will use simulated detections")
    
    def load_model(self, model_path: str) -> bool:
        """
        Load the Ultralytics YOLO model from file.
        
        Args:
            model_path: Path to model weights
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not YOLO_AVAILABLE:
            logger.error("Ultralytics YOLO not available")
            return False
            
        try:
            # Load model (will auto-download if model_path is like 'yolov8l.pt')
            logger.info(f"Loading YOLO model: {model_path}")
            
            # Check if it's a file path or model name
            path_obj = Path(model_path)
            if not path_obj.exists() and not path_obj.suffix == '.pt':
                logger.warning(f"Model file not found: {model_path}, falling back to yolov8l.pt")
                model_path = 'yolov8l.pt'
            
            self.model = YOLO(model_path)
            
            self.model_loaded = True
            logger.info(f"✅ YOLO model loaded successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}", exc_info=True)
            self.model_loaded = False
            return False
    
    def detect(self, image: np.ndarray) -> List[Dict]:
        """
        Run detection on an image using Ultralytics YOLO11.
        
        Args:
            image: Input image as numpy array (BGR format)
            
        Returns:
            List of detections with format:
            [{
                'class': str,
                'confidence': float,
                'bbox': [x1, y1, x2, y2],
                'center': [cx, cy]
            }]
        """
        if not self.model_loaded or self.model is None:
            logger.warning("Model not loaded, using simulated detections")
            return self._simulate_detections(image)
        
        try:
            # Run YOLO detection on vehicle classes only
            results = self.model(
                image, 
                classes=self.vehicle_class_ids,
                conf=self.confidence_threshold,
                iou=self.iou_threshold,
                verbose=False
            )
            
            detections = []
            
            # Process results
            if results[0].boxes is not None and len(results[0].boxes) > 0:
                boxes = results[0].boxes.xyxy.cpu().numpy()
                class_indices = results[0].boxes.cls.int().cpu().tolist()
                confidences = results[0].boxes.conf.cpu().tolist()
                class_names = results[0].names  # Get class names from model
                
                # Loop through detections
                for box, class_idx, conf in zip(boxes, class_indices, confidences):
                    x1, y1, x2, y2 = map(int, box)
                    class_name = class_names[class_idx]
                    
                    # Calculate center
                    cx = int((x1 + x2) / 2)
                    cy = int((y1 + y2) / 2)
                    
                    detection = {
                        'class': class_name,
                        'confidence': round(conf, 4),
                        'bbox': [x1, y1, x2, y2],
                        'center': [cx, cy]
                    }
                    detections.append(detection)
            
            logger.info(f"Detected {len(detections)} vehicles")
            return detections
                
        except Exception as e:
            logger.error(f"Detection error: {e}", exc_info=True)
            return []
    
    def detect_from_file(self, image_path: str) -> List[Dict]:
        """
        Run detection on an image file.
        
        Args:
            image_path: Path to image file
            
        Returns:
            List of detections
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Failed to load image: {image_path}")
                return []
            return self.detect(image)
        except Exception as e:
            logger.error(f"Error processing image file: {e}")
            return []
    
    def _simulate_detections(self, image: np.ndarray) -> List[Dict]:
        """
        Simulate detections for testing when model is not available.
        """
        import random
        
        logger.warning("⚠️  Using simulated detections - model not loaded!")
        
        height, width = image.shape[:2]
        num_detections = random.randint(1, 4)
        
        detections = []
        for _ in range(num_detections):
            x1 = random.randint(0, width - 100)
            y1 = random.randint(0, height - 100)
            x2 = x1 + random.randint(60, 150)
            y2 = y1 + random.randint(80, 200)
            
            detection = {
                'class': random.choice(['car', 'truck', 'bus', 'motorcycle']),
                'confidence': round(random.uniform(0.75, 0.95), 4),
                'bbox': [x1, y1, x2, y2],
                'center': [(x1 + x2) // 2, (y1 + y2) // 2]
            }
            detections.append(detection)
        
        return detections
    
    def draw_detections(self, image: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """
        Draw bounding boxes on image.
        
        Args:
            image: Input image
            detections: List of detections
            
        Returns:
            Image with drawn detections
        """
        output = image.copy()
        
        colors = {
            'car': (59, 130, 246),         # Blue
            'truck': (239, 68, 68),        # Red
            'bus': (245, 158, 11),         # Orange
            'motorcycle': (16, 185, 129),  # Green
            'bicycle': (34, 211, 238),     # Cyan
            'person': (139, 92, 246),      # Purple
        }
        
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            color = colors.get(det['class'], (255, 255, 255))
            
            # Draw bounding box
            cv2.rectangle(output, (x1, y1), (x2, y2), color, 3)
            
            # Draw label background
            label = f"{det['class']} {det['confidence']:.2f}"
            (text_width, text_height), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2
            )
            cv2.rectangle(
                output, 
                (x1, y1 - text_height - baseline - 10), 
                (x1 + text_width + 10, y1), 
                color, 
                -1
            )
            
            # Draw label text
            cv2.putText(
                output, 
                label, 
                (x1 + 5, y1 - 5), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                0.7, 
                (255, 255, 255), 
                2
            )
            
            # Draw center point
            cx, cy = det['center']
            cv2.circle(output, (cx, cy), 5, color, -1)
        
        return output


# Global detector instance
detector = None


def get_detector(model_path: Optional[str] = None) -> VehicleDetector:
    """
    Get or create the global detector instance.
    
    Args:
        model_path: Path to model weights (optional)
        
    Returns:
        VehicleDetector instance
    """
    global detector
    
    if detector is None:
        detector = VehicleDetector(model_path)
    
    return detector