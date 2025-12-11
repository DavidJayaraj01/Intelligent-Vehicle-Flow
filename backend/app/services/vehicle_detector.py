"""
Vehicle Detection Service using TPH-YOLOv5 model
Handles model loading, inference, and detection processing
"""
import sys
import os
import cv2
import numpy as np
import torch
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import logging
import time

# Add TPHYolov5 to path
ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(ROOT / "TPHYolov5"))

logger = logging.getLogger(__name__)

# Try to import TPH-YOLOv5 components
try:
    from models.experimental import attempt_load
    from utils.general import non_max_suppression, scale_coords, check_img_size
    from utils.torch_utils import select_device
    from utils.augmentations import letterbox
    TPH_YOLO_AVAILABLE = True
    logger.info("TPH-YOLOv5 modules imported successfully")
except ImportError as e:
    logger.error(f"TPH-YOLOv5 not available: {e}")
    TPH_YOLO_AVAILABLE = False


class VehicleDetector:
    """
    Vehicle detection service using TPH-YOLOv5 model.
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
        self.device = None
        self.img_size = 640
        self.stride = 32
        
        # Vehicle class names (COCO dataset classes)
        self.class_names = {
            2: 'car',
            3: 'motorcycle', 
            5: 'bus',
            7: 'truck',
            1: 'bicycle',
            0: 'person'
        }
        
        # Auto-load model from default path if not specified
        if model_path is None:
            backend_weights = Path(__file__).resolve().parents[2] / "weights" / "yolo" / "best.pt"
            root_weights = ROOT / "weights" / "yolo" / "best.pt"
            
            if backend_weights.exists():
                model_path = str(backend_weights)
                logger.info(f"Found model at: {model_path}")
            elif root_weights.exists():
                model_path = str(root_weights)
                logger.info(f"Found model at: {model_path}")
        
        if model_path and TPH_YOLO_AVAILABLE:
            self.load_model(model_path)
        else:
            logger.warning("Model not loaded - will use simulated detections")
    
    def load_model(self, model_path: str) -> bool:
        """
        Load the TPH-YOLOv5 model from file.
        
        Args:
            model_path: Path to model weights
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not TPH_YOLO_AVAILABLE:
            logger.error("TPH-YOLOv5 modules not available")
            return False
            
        try:
            # Select device
            self.device = select_device('')  # '' for auto-selection
            logger.info(f"Using device: {self.device}")
            
            # Load model
            logger.info(f"Loading model from: {model_path}")
            self.model = attempt_load(model_path, map_location=self.device)
            self.stride = int(self.model.stride.max())
            self.img_size = check_img_size(self.img_size, s=self.stride)
            
            # Set model to eval mode
            self.model.eval()
            
            # Warmup
            if self.device.type != 'cpu':
                self.model(torch.zeros(1, 3, self.img_size, self.img_size).to(self.device).type_as(next(self.model.parameters())))
            
            self.model_loaded = True
            logger.info(f"✅ Model loaded successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}", exc_info=True)
            self.model_loaded = False
            return False
    
    def detect(self, image: np.ndarray) -> List[Dict]:
        """
        Run detection on an image using TPH-YOLOv5.
        
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
            # Preprocess image
            img, ratio, (dw, dh) = self._preprocess_image(image)
            img = torch.from_numpy(img).to(self.device)
            img = img.float()
            img /= 255.0
            
            if img.ndimension() == 3:
                img = img.unsqueeze(0)
            
            # Inference
            with torch.no_grad():
                pred = self.model(img, augment=False)[0]
            
            # NMS
            pred = non_max_suppression(
                pred, 
                self.confidence_threshold, 
                self.iou_threshold,
                classes=None,
                agnostic=False
            )[0]
            
            detections = []
            
            if pred is not None and len(pred):
                # Rescale boxes to original image
                pred[:, :4] = scale_coords(img.shape[2:], pred[:, :4], image.shape).round()
                
                # Process detections
                for *xyxy, conf, cls in pred:
                    x1, y1, x2, y2 = [int(c) for c in xyxy]
                    class_id = int(cls)
                    confidence = float(conf)
                    
                    # Get class name
                    class_name = self.class_names.get(class_id, f'class_{class_id}')
                    
                    # Calculate center
                    cx = int((x1 + x2) / 2)
                    cy = int((y1 + y2) / 2)
                    
                    detection = {
                        'class': class_name,
                        'confidence': round(confidence, 4),
                        'bbox': [x1, y1, x2, y2],
                        'center': [cx, cy]
                    }
                    detections.append(detection)
            
            logger.info(f"Detected {len(detections)} vehicles")
            return detections
                
        except Exception as e:
            logger.error(f"Detection error: {e}", exc_info=True)
            return []
    
    def _preprocess_image(self, img: np.ndarray) -> Tuple[np.ndarray, float, Tuple[int, int]]:
        """
        Preprocess image for model inference.
        
        Args:
            img: Input image (BGR)
            
        Returns:
            Preprocessed image, ratio, padding
        """
        # Letterbox
        img_resized = letterbox(img, self.img_size, stride=self.stride, auto=True)[0]
        
        # Convert BGR to RGB
        img_resized = img_resized[:, :, ::-1].transpose(2, 0, 1)
        img_resized = np.ascontiguousarray(img_resized)
        
        # Calculate ratio and padding
        ratio = min(self.img_size / img.shape[0], self.img_size / img.shape[1])
        dw = (self.img_size - img.shape[1] * ratio) / 2
        dh = (self.img_size - img.shape[0] * ratio) / 2
        
        return img_resized, ratio, (int(dw), int(dh))
    
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
