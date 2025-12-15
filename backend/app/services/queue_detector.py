"""
Vehicle Queue Detection Service
Adapted from vehicle_queue_detection.py for API integration
"""

import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict
import time
from pathlib import Path
import tempfile
from typing import Dict, List, Tuple, Optional


class VehicleQueueDetector:
    """Vehicle queue detection and time calculation using YOLOv8"""
    
    def __init__(self, model_path: str = 'yolov8n.pt'):
        """
        Initialize the vehicle queue detector
        
        Args:
            model_path: Path to YOLOv8 model
        """
        self.model = YOLO(model_path)
        
        # Tracking data structures
        self.track_history = defaultdict(list)
        self.vehicle_entry_time = {}
        self.vehicle_exit_time = {}
        self.vehicle_queue_time = {}
        self.line1_crossed = set()
        self.line2_crossed = set()
        self.vehicle_data = {}
        
        # Frame tracking for time calculation
        self.current_frame = 0
        self.fps = 30  # default FPS, will be updated from video
        
        # Line configuration
        self.entry_line_orientation = 'horizontal'
        self.exit_line_orientation = 'horizontal'
        self.entry_line_position = 25  # percentage
        self.exit_line_position = 85  # percentage
        
        # Vehicle class IDs (COCO dataset)
        self.vehicle_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck
        
        # Colors for visualization
        self.colors = self._generate_colors(100)
        
    def _generate_colors(self, num_colors: int) -> List[Tuple[int, int, int]]:
        """Generate distinct colors for different vehicle IDs"""
        np.random.seed(42)
        colors = []
        for _ in range(num_colors):
            colors.append(tuple(map(int, np.random.randint(0, 255, 3))))
        return colors
    
    def reset(self):
        """Reset all tracking data for new video/image processing"""
        self.track_history = defaultdict(list)
        self.vehicle_entry_time = {}
        self.vehicle_exit_time = {}
        self.vehicle_queue_time = {}
        self.line1_crossed = set()
        self.line2_crossed = set()
        self.vehicle_data = {}
        self.current_frame = 0
        # Reset frame dimensions to force line recalculation
        if hasattr(self, 'frame_width'):
            delattr(self, 'frame_width')
        if hasattr(self, 'frame_height'):
            delattr(self, 'frame_height')
    
    def _setup_lines(self, frame_height: int, frame_width: int, entry_line=None, exit_line=None):
        """
        Setup boundary lines based on frame dimensions and custom line configuration
        
        Args:
            frame_height: Height of the frame
            frame_width: Width of the frame
            entry_line: Dict with {orientation: 'horizontal'|'vertical', position: percentage}
            exit_line: Dict with {orientation: 'horizontal'|'vertical', position: percentage}
        """
        self.frame_width = frame_width
        self.frame_height = frame_height
        
        # Configure entry line
        if entry_line:
            self.entry_line_orientation = entry_line.get('orientation', 'horizontal')
            self.entry_line_position = entry_line.get('position', 25)
        
        # Configure exit line
        if exit_line:
            self.exit_line_orientation = exit_line.get('orientation', 'horizontal')
            self.exit_line_position = exit_line.get('position', 85)
        
        # Calculate line coordinates based on orientation and position
        if self.entry_line_orientation == 'horizontal':
            self.line1_y = int(frame_height * (self.entry_line_position / 100))
            self.line1_x = None
        else:  # vertical
            self.line1_x = int(frame_width * (self.entry_line_position / 100))
            self.line1_y = None
        
        if self.exit_line_orientation == 'horizontal':
            self.line2_y = int(frame_height * (self.exit_line_position / 100))
            self.line2_x = None
        else:  # vertical
            self.line2_x = int(frame_width * (self.exit_line_position / 100))
            self.line2_y = None
        
    def _check_line_crossing(self, track_id: int, center_y: int, 
                            prev_center_y: int, center_x: int, prev_center_x: int = None):
        """
        Check if vehicle crossed any boundary line
        
        Args:
            track_id: Unique vehicle ID
            center_y: Current Y position
            prev_center_y: Previous Y position
            center_x: Current X position
            prev_center_x: Previous X position
        """
        tolerance = 15
        
        # Check entry line crossing
        if track_id not in self.line1_crossed:
            crossed = False
            
            if self.entry_line_orientation == 'horizontal':
                # Horizontal line - check Y position crossing
                if (prev_center_y < self.line1_y - tolerance and 
                    center_y >= self.line1_y - tolerance) or \
                   (prev_center_y <= self.line1_y and center_y > self.line1_y):
                    crossed = True
            else:  # vertical
                # Vertical line - check X position crossing
                if prev_center_x is not None:
                    if (prev_center_x < self.line1_x - tolerance and 
                        center_x >= self.line1_x - tolerance) or \
                       (prev_center_x <= self.line1_x and center_x > self.line1_x):
                        crossed = True
            
            if crossed:
                self.line1_crossed.add(track_id)
                self.vehicle_entry_time[track_id] = self.current_frame
                
        # Check exit line crossing
        if track_id not in self.line2_crossed:
            crossed = False
            
            if self.exit_line_orientation == 'horizontal':
                # Horizontal line - check Y position crossing
                if (prev_center_y < self.line2_y - tolerance and 
                    center_y >= self.line2_y - tolerance) or \
                   (prev_center_y <= self.line2_y and center_y > self.line2_y):
                    crossed = True
            else:  # vertical
                # Vertical line - check X position crossing
                if prev_center_x is not None:
                    if (prev_center_x < self.line2_x - tolerance and 
                        center_x >= self.line2_x - tolerance) or \
                       (prev_center_x <= self.line2_x and center_x > self.line2_x):
                        crossed = True
            
            if crossed:
                self.line2_crossed.add(track_id)
                self.vehicle_exit_time[track_id] = self.current_frame
                
                # Calculate queue time if vehicle crossed both lines
                if track_id in self.vehicle_entry_time:
                    frame_diff = self.vehicle_exit_time[track_id] - self.vehicle_entry_time[track_id]
                    queue_time = frame_diff / self.fps  # Convert frames to seconds
                    self.vehicle_queue_time[track_id] = queue_time
                    print(f"🚗 Vehicle {track_id}: Entry frame={self.vehicle_entry_time[track_id]}, Exit frame={self.vehicle_exit_time[track_id]}, Frames={frame_diff}, FPS={self.fps:.1f}, Wait time={queue_time:.1f}s")
    
    def _draw_boundaries(self, frame: np.ndarray) -> np.ndarray:
        """Draw the two boundary lines on the frame"""
        # Draw zone between lines based on orientations
        overlay = frame.copy()
        
        if self.entry_line_orientation == 'horizontal' and self.exit_line_orientation == 'horizontal':
            # Both horizontal - draw rectangle between Y coordinates
            y1 = min(self.line1_y, self.line2_y)
            y2 = max(self.line1_y, self.line2_y)
            cv2.rectangle(overlay, (0, y1), (self.frame_width, y2), (255, 255, 0), -1)
        elif self.entry_line_orientation == 'vertical' and self.exit_line_orientation == 'vertical':
            # Both vertical - draw rectangle between X coordinates
            x1 = min(self.line1_x, self.line2_x)
            x2 = max(self.line1_x, self.line2_x)
            cv2.rectangle(overlay, (x1, 0), (x2, self.frame_height), (255, 255, 0), -1)
        else:
            # Mixed orientations - draw two separate zones
            if self.entry_line_orientation == 'horizontal':
                cv2.rectangle(overlay, (0, self.line1_y - 5), 
                            (self.frame_width, self.line1_y + 5), (255, 255, 0), -1)
            else:
                cv2.rectangle(overlay, (self.line1_x - 5, 0), 
                            (self.line1_x + 5, self.frame_height), (255, 255, 0), -1)
            
            if self.exit_line_orientation == 'horizontal':
                cv2.rectangle(overlay, (0, self.line2_y - 5), 
                            (self.frame_width, self.line2_y + 5), (255, 255, 0), -1)
            else:
                cv2.rectangle(overlay, (self.line2_x - 5, 0), 
                            (self.line2_x + 5, self.frame_height), (255, 255, 0), -1)
        
        cv2.addWeighted(overlay, 0.1, frame, 0.9, 0, frame)
        
        # Draw entry line (Line 1) - Green
        if self.entry_line_orientation == 'horizontal':
            cv2.line(frame, (0, self.line1_y), (self.frame_width, self.line1_y),
                    (0, 255, 0), 4)
            cv2.putText(frame, f"ENTRY (Y={self.line1_y})", (10, self.line1_y - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        else:  # vertical
            cv2.line(frame, (self.line1_x, 0), (self.line1_x, self.frame_height),
                    (0, 255, 0), 4)
            cv2.putText(frame, f"ENTRY (X={self.line1_x})", (self.line1_x + 10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Draw exit line (Line 2) - Red
        if self.exit_line_orientation == 'horizontal':
            cv2.line(frame, (0, self.line2_y), (self.frame_width, self.line2_y),
                    (0, 0, 255), 4)
            cv2.putText(frame, f"EXIT (Y={self.line2_y})", (10, self.line2_y + 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        else:  # vertical
            cv2.line(frame, (self.line2_x, 0), (self.line2_x, self.frame_height),
                    (0, 0, 255), 4)
            cv2.putText(frame, f"EXIT (X={self.line2_x})", (self.line2_x + 10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        return frame
    
    def _draw_info_panel(self, frame: np.ndarray) -> np.ndarray:
        """Draw information panel with statistics"""
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (450, 180), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        cv2.rectangle(frame, (10, 10), (450, 180), (0, 255, 0), 2)
        
        total_vehicles = len(self.line1_crossed)
        completed_vehicles = len(self.vehicle_queue_time)
        in_queue = len(self.line1_crossed - self.line2_crossed)
        
        avg_queue_time = 0
        if self.vehicle_queue_time:
            avg_queue_time = sum(self.vehicle_queue_time.values()) / len(self.vehicle_queue_time)
        
        cv2.putText(frame, "QUEUE STATISTICS", (20, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        y_offset = 60
        cv2.putText(frame, f"Total Vehicles: {total_vehicles}", (20, y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        y_offset += 30
        cv2.putText(frame, f"Currently in Queue: {in_queue}", (20, y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 2)
        y_offset += 30
        cv2.putText(frame, f"Completed Queue: {completed_vehicles}", (20, y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        y_offset += 30
        cv2.putText(frame, f"Avg Wait Time: {avg_queue_time:.2f}s", (20, y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2)
        
        return frame
    
    def process_frame(self, frame: np.ndarray) -> np.ndarray:
        """Process a single frame"""
        if not hasattr(self, 'frame_width'):
            self._setup_lines(frame.shape[0], frame.shape[1])
        
        # Run YOLOv8 tracking
        results = self.model.track(
            frame,
            persist=True,
            tracker="bytetrack.yaml",
            classes=self.vehicle_classes,
            verbose=False,
            conf=0.3,
            iou=0.5
        )
        
        # Draw boundary lines
        frame = self._draw_boundaries(frame)
        
        # Process detections
        if results[0].boxes is not None and results[0].boxes.id is not None:
            boxes = results[0].boxes.xywh.cpu()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            classes = results[0].boxes.cls.int().cpu().tolist()
            
            class_names = {2: 'Car', 3: 'Motorcycle', 5: 'Bus', 7: 'Truck'}
            
            for box, track_id, cls in zip(boxes, track_ids, classes):
                x, y, w, h = box
                center_x, center_y = int(x), int(y)
                
                vehicle_class = class_names.get(cls, 'Vehicle')
                if track_id not in self.vehicle_data:
                    self.vehicle_data[track_id] = {
                        'class': vehicle_class,
                        'first_seen': time.time()
                    }
                self.vehicle_data[track_id]['last_y'] = center_y
                self.vehicle_data[track_id]['last_x'] = center_x
                
                # Get previous position
                track = self.track_history[track_id]
                prev_center_y = track[-1][1] if track else center_y
                prev_center_x = track[-1][0] if track else center_x
                
                # Update track history
                track.append((center_x, center_y))
                if len(track) > 30:
                    track.pop(0)
                
                # Check line crossing
                self._check_line_crossing(track_id, center_y, prev_center_y, center_x, prev_center_x)
                
                # Draw bounding box
                x1 = int(center_x - w / 2)
                y1 = int(center_y - h / 2)
                x2 = int(center_x + w / 2)
                y2 = int(center_y + h / 2)
                
                color = self.colors[track_id % len(self.colors)]
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                
                # Draw tracking line
                points = np.array(track, dtype=np.int32).reshape((-1, 1, 2))
                cv2.polylines(frame, [points], isClosed=False, color=color, thickness=2)
                
                # Prepare label
                label = f"ID:{track_id} {vehicle_class}"
                
                if track_id in self.vehicle_queue_time:
                    queue_time = self.vehicle_queue_time[track_id]
                    label += f" WAIT:{queue_time:.1f}s"
                elif track_id in self.vehicle_entry_time and track_id not in self.vehicle_exit_time:
                    frame_diff = self.current_frame - self.vehicle_entry_time[track_id]
                    current_time = frame_diff / self.fps
                    label += f" IN-Q:{current_time:.1f}s"
                
                # Draw label
                font_scale = 0.6
                font_thickness = 2
                (label_w, label_h), baseline = cv2.getTextSize(
                    label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
                
                padding = 5
                cv2.rectangle(frame,
                            (x1, y1 - label_h - baseline - padding * 2),
                            (x1 + label_w + padding * 2, y1),
                            color, -1)
                cv2.rectangle(frame,
                            (x1, y1 - label_h - baseline - padding * 2),
                            (x1 + label_w + padding * 2, y1),
                            (255, 255, 255), 1)
                
                cv2.putText(frame, label, (x1 + padding, y1 - padding - baseline),
                          cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), 
                          font_thickness)
        
        # Draw info panel
        frame = self._draw_info_panel(frame)
        
        return frame
    
    def process_video(self, video_path: str, output_path: Optional[str] = None, 
                     entry_line: dict = None, exit_line: dict = None) -> Dict:
        """
        Process entire video file
        
        Args:
            video_path: Path to input video
            output_path: Optional path for output video
            entry_line: Dict with {orientation, position} for entry line
            exit_line: Dict with {orientation, position} for exit line
            
        Returns:
            Dictionary with statistics
        """
        # Reset tracking data for new video
        self.reset()
        
        cap = cv2.VideoCapture(video_path)
        out = None
        
        try:
            # Get video FPS
            self.fps = cap.get(cv2.CAP_PROP_FPS) or 30
            
            # Get first frame to set up lines with custom configuration
            ret, first_frame = cap.read()
            if ret:
                self._setup_lines(first_frame.shape[0], first_frame.shape[1], entry_line, exit_line)
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Reset to beginning
            
            if output_path:
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                
                # Try multiple codecs for better browser compatibility
                codecs = ['avc1', 'H264', 'X264', 'mp4v']
                for codec in codecs:
                    try:
                        fourcc = cv2.VideoWriter_fourcc(*codec)
                        out = cv2.VideoWriter(output_path, fourcc, self.fps, (width, height))
                        if out.isOpened():
                            break
                    except:
                        continue
                
                if not out or not out.isOpened():
                    # Fallback to mp4v
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    out = cv2.VideoWriter(output_path, fourcc, self.fps, (width, height))
            
            start_time = time.time()
            self.current_frame = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                    
                annotated_frame = self.process_frame(frame)
                self.current_frame += 1
                
                if output_path and out is not None:
                    out.write(annotated_frame)
            
            processing_time = time.time() - start_time
            
            return self._get_statistics(processing_time)
        
        finally:
            # Ensure resources are properly released
            if cap is not None:
                cap.release()
            if out is not None:
                out.release()
            # Small delay to ensure Windows releases file handles
            time.sleep(0.1)
    
    def process_image(self, image_path: str, output_path: Optional[str] = None,
                     entry_line: dict = None, exit_line: dict = None) -> Dict:
        """
        Process single image
        
        Args:
            image_path: Path to input image
            output_path: Optional path for output image
            entry_line: Dict with {orientation, position} for entry line
            exit_line: Dict with {orientation, position} for exit line
            
        Returns:
            Dictionary with statistics
        """
        # Reset tracking data for new image
        self.reset()
        
        start_time = time.time()
        
        frame = cv2.imread(image_path)
        
        # Setup lines with custom configuration
        self._setup_lines(frame.shape[0], frame.shape[1], entry_line, exit_line)
        
        annotated_frame = self.process_frame(frame)
        
        if output_path:
            cv2.imwrite(output_path, annotated_frame)
        
        processing_time = time.time() - start_time
        
        return self._get_statistics(processing_time)
    
    def _get_statistics(self, processing_time: float) -> Dict:
        """Get detection statistics"""
        
        total_vehicles = len(self.line1_crossed)
        completed_vehicles = len(self.vehicle_queue_time)
        in_queue = len(self.line1_crossed - self.line2_crossed)
        
        avg_queue_time = 0
        max_queue_time = 0
        min_queue_time = 0
        
        if self.vehicle_queue_time:
            avg_queue_time = sum(self.vehicle_queue_time.values()) / len(self.vehicle_queue_time)
            max_queue_time = max(self.vehicle_queue_time.values())
            min_queue_time = min(self.vehicle_queue_time.values())
        
        vehicle_details = []
        for vid, qtime in sorted(self.vehicle_queue_time.items()):
            vtype = self.vehicle_data.get(vid, {}).get('class', 'Vehicle')
            vehicle_details.append({
                'id': vid,
                'type': vtype,
                'queueTime': qtime
            })
        
        return {
            'statistics': {
                'totalVehicles': total_vehicles,
                'currentlyInQueue': in_queue,
                'completedQueue': completed_vehicles,
                'avgWaitTime': avg_queue_time,
                'maxWaitTime': max_queue_time,
                'minWaitTime': min_queue_time,
                'vehicleDetails': vehicle_details
            },
            'processing_time': processing_time
        }
