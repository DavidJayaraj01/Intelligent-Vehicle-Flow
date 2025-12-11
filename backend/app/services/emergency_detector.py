"""Emergency Vehicle Detection Service using YOLOv8"""

import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
import time
from ultralytics import YOLO


class EmergencyVehicleDetector:
    """Detect emergency vehicles (ambulance, fire truck, police car) in videos/images"""
    
    def __init__(self, model_path: str = '../best_emergency_model.pt'):
        """Initialize the emergency vehicle detector
        
        Args:
            model_path: Path to the YOLOv8 model file
        """
        # Check if model exists, try parent directory if not found
        if not Path(model_path).exists():
            model_path = str(Path(__file__).parent.parent.parent / 'best_emergency_model.pt')
        
        self.model = YOLO(model_path)
        self.emergency_classes = {
            0: 'ambulance',
            1: 'fire_truck', 
            2: 'police_car'
        }
        
        # Colors for each class (BGR format)
        self.class_colors = {
            0: (0, 255, 255),    # Yellow for ambulance
            1: (0, 69, 255),     # Orange for fire truck
            2: (255, 0, 0)       # Blue for police car
        }
        
        self.detections_history: List[Dict] = []
        
    def process_video(self, video_path: str, output_path: str) -> Dict:
        """Process video for emergency vehicle detection
        
        Args:
            video_path: Path to input video
            output_path: Path to save output video
            
        Returns:
            Dictionary with detection statistics and results
        """
        start_time = time.time()
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Setup video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Detection statistics
        detection_counts = {cls: 0 for cls in self.emergency_classes.values()}
        frame_detections = []
        max_confidence = {cls: 0.0 for cls in self.emergency_classes.values()}
        
        frame_num = 0
        
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_num += 1
                
                # Run detection with lower confidence threshold
                results = self.model(frame, conf=0.1, verbose=False)
                
                # Process detections
                current_frame_detections = []
                
                if len(results) > 0 and results[0].boxes is not None:
                    boxes = results[0].boxes
                    
                    for box in boxes:
                        # Get box coordinates
                        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                        confidence = float(box.conf[0])
                        class_id = int(box.cls[0])
                        
                        if class_id in self.emergency_classes:
                            class_name = self.emergency_classes[class_id]
                            
                            # Update statistics
                            detection_counts[class_name] += 1
                            max_confidence[class_name] = max(max_confidence[class_name], confidence)
                            
                            # Store detection info
                            detection_info = {
                                'frame': frame_num,
                                'class': class_name,
                                'confidence': confidence,
                                'bbox': [x1, y1, x2, y2]
                            }
                            current_frame_detections.append(detection_info)
                            
                            # Draw bounding box
                            color = self.class_colors[class_id]
                            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
                            
                            # Draw label with background
                            label = f"{class_name.replace('_', ' ').title()}: {confidence:.2f}"
                            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                            
                            # Label background
                            cv2.rectangle(frame, 
                                        (x1, y1 - label_size[1] - 10),
                                        (x1 + label_size[0] + 10, y1),
                                        color, -1)
                            
                            # Label text
                            cv2.putText(frame, label,
                                      (x1 + 5, y1 - 5),
                                      cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                                      (255, 255, 255), 2)
                
                frame_detections.append(current_frame_detections)
                
                # Draw info panel
                frame = self._draw_info_panel(frame, detection_counts, frame_num, total_frames)
                
                # Write frame
                out.write(frame)
                
        finally:
            cap.release()
            out.release()
        
        processing_time = time.time() - start_time
        
        # Calculate final statistics
        total_detections = sum(detection_counts.values())
        frames_with_detections = sum(1 for fd in frame_detections if len(fd) > 0)
        
        return {
            'detection_counts': detection_counts,
            'total_detections': total_detections,
            'frames_with_detections': frames_with_detections,
            'total_frames': total_frames,
            'max_confidence': max_confidence,
            'processing_time': processing_time,
            'detections_by_frame': frame_detections
        }
    
    def process_image(self, image_path: str, output_path: str) -> Dict:
        """Process image for emergency vehicle detection
        
        Args:
            image_path: Path to input image
            output_path: Path to save output image
            
        Returns:
            Dictionary with detection results
        """
        start_time = time.time()
        
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Run detection with lower confidence threshold
        results = self.model(image, conf=0.1, verbose=False)
        
        # Process detections
        detections = []
        detection_counts = {cls: 0 for cls in self.emergency_classes.values()}
        
        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            
            for box in boxes:
                # Get box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                
                if class_id in self.emergency_classes:
                    class_name = self.emergency_classes[class_id]
                    detection_counts[class_name] += 1
                    
                    # Store detection
                    detections.append({
                        'class': class_name,
                        'confidence': confidence,
                        'bbox': [x1, y1, x2, y2]
                    })
                    
                    # Draw bounding box
                    color = self.class_colors[class_id]
                    cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)
                    
                    # Draw label
                    label = f"{class_name.replace('_', ' ').title()}: {confidence:.2f}"
                    label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)
                    
                    cv2.rectangle(image,
                                (x1, y1 - label_size[1] - 10),
                                (x1 + label_size[0] + 10, y1),
                                color, -1)
                    
                    cv2.putText(image, label,
                              (x1 + 5, y1 - 5),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                              (255, 255, 255), 2)
        
        # Draw summary panel
        image = self._draw_summary_panel(image, detection_counts, len(detections))
        
        # Save output
        cv2.imwrite(output_path, image)
        
        processing_time = time.time() - start_time
        
        return {
            'detections': detections,
            'detection_counts': detection_counts,
            'total_detections': len(detections),
            'processing_time': processing_time
        }
    
    def _draw_info_panel(self, frame: np.ndarray, detection_counts: Dict,
                        current_frame: int, total_frames: int) -> np.ndarray:
        """Draw information panel on frame"""
        h, w = frame.shape[:2]
        panel_height = 140
        
        # Create semi-transparent overlay
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (450, panel_height), (0, 0, 0), -1)
        frame = cv2.addWeighted(overlay, 0.7, frame, 0.3, 0)
        
        y_offset = 35
        
        # Title
        cv2.putText(frame, "EMERGENCY VEHICLE DETECTION",
                   (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                   (0, 255, 255), 2)
        
        y_offset += 30
        
        # Detection counts
        for class_name, count in detection_counts.items():
            display_name = class_name.replace('_', ' ').title()
            text = f"{display_name}: {count}"
            
            # Get color for this class
            class_id = [k for k, v in self.emergency_classes.items() if v == class_name][0]
            color = self.class_colors[class_id]
            
            cv2.putText(frame, text, (20, y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            y_offset += 25
        
        # Frame info
        progress = (current_frame / total_frames) * 100
        cv2.putText(frame, f"Frame: {current_frame}/{total_frames} ({progress:.1f}%)",
                   (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                   (200, 200, 200), 1)
        
        return frame
    
    def _draw_summary_panel(self, image: np.ndarray, detection_counts: Dict,
                           total: int) -> np.ndarray:
        """Draw summary panel on image"""
        h, w = image.shape[:2]
        panel_height = 140
        
        # Create semi-transparent overlay
        overlay = image.copy()
        cv2.rectangle(overlay, (10, 10), (450, panel_height), (0, 0, 0), -1)
        image = cv2.addWeighted(overlay, 0.7, image, 0.3, 0)
        
        y_offset = 35
        
        # Title
        cv2.putText(image, "EMERGENCY VEHICLE DETECTION",
                   (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                   (0, 255, 255), 2)
        
        y_offset += 30
        
        # Total detections
        cv2.putText(image, f"Total Detections: {total}",
                   (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                   (255, 255, 255), 2)
        y_offset += 30
        
        # Individual counts
        for class_name, count in detection_counts.items():
            if count > 0:
                display_name = class_name.replace('_', ' ').title()
                class_id = [k for k, v in self.emergency_classes.items() if v == class_name][0]
                color = self.class_colors[class_id]
                
                cv2.putText(image, f"  {display_name}: {count}",
                           (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                           color, 2)
                y_offset += 25
        
        return image
