"""
YouTube Live Stream Vehicle Detection Service
Real-time detection from YouTube live streams with tracking and queue analysis
"""

import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict
import time
from typing import Dict, List, Tuple, Optional, Any
import asyncio
import threading
import logging
from datetime import datetime
import yt_dlp

logger = logging.getLogger(__name__)


class YouTubeLiveDetector:
    """Real-time vehicle detection from YouTube live streams"""
    
    def __init__(self, model_path: str = 'yolov8n.pt'):
        """
        Initialize the YouTube live detector
        
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
        
        # Vehicle class mapping (COCO dataset)
        self.vehicle_classes = {
            2: 'car',
            3: 'motorcycle', 
            5: 'bus',
            7: 'truck'
        }
        
        # Stream control
        self.is_running = False
        self.cap = None
        self.frame_count = 0
        self.fps = 30
        
        # Analytics data
        self.detection_stats = {
            'total_vehicles': 0,
            'vehicles_by_type': defaultdict(int),
            'current_queue_length': 0,
            'avg_queue_time': 0,
            'detections_per_minute': 0,
            'last_update': None
        }
        
        # Colors for visualization
        self.colors = self._generate_colors(100)
        
    def _generate_colors(self, num_colors: int) -> List[Tuple[int, int, int]]:
        """Generate distinct colors for different vehicle IDs"""
        np.random.seed(42)
        colors = []
        for _ in range(num_colors):
            colors.append(tuple(map(int, np.random.randint(0, 255, 3))))
        return colors
    
    def get_youtube_stream_url(self, youtube_url: str) -> Optional[str]:
        """
        Extract direct stream URL from YouTube live video
        
        Args:
            youtube_url: YouTube video/live stream URL
            
        Returns:
            Direct stream URL or None if failed
        """
        try:
            ydl_opts = {
                'format': 'best[ext=mp4]/best',
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                if info and 'url' in info:
                    return info['url']
                elif info and 'formats' in info:
                    # Get best quality stream
                    formats = [f for f in info['formats'] if f.get('vcodec') != 'none']
                    if formats:
                        return formats[-1]['url']
            
            logger.error("Could not extract stream URL from YouTube")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting YouTube stream URL: {e}")
            return None
    
    def _setup_lines(self, frame_height: int, frame_width: int):
        """Setup boundary lines based on frame dimensions"""
        self.frame_width = frame_width
        self.frame_height = frame_height
        
        # Define two boundary lines (horizontal lines)
        self.line1_y = int(frame_height * 0.30)  # Entry line
        self.line2_y = int(frame_height * 0.75)  # Exit line
        
    def _check_line_crossing(self, track_id: int, center_y: int, 
                            prev_center_y: int, center_x: int):
        """Check if vehicle crossed any boundary line"""
        tolerance = 15
        
        # Check Line 1 crossing (entry line)
        if track_id not in self.line1_crossed:
            if prev_center_y < self.line1_y and center_y >= self.line1_y:
                self.line1_crossed.add(track_id)
                self.vehicle_entry_time[track_id] = time.time()
                logger.info(f"Vehicle {track_id} entered queue")
                
        # Check Line 2 crossing (exit line)
        if track_id not in self.line2_crossed:
            if prev_center_y < self.line2_y and center_y >= self.line2_y:
                self.line2_crossed.add(track_id)
                self.vehicle_exit_time[track_id] = time.time()
                
                # Calculate queue time
                if track_id in self.vehicle_entry_time:
                    queue_time = (self.vehicle_exit_time[track_id] - 
                                self.vehicle_entry_time[track_id])
                    self.vehicle_queue_time[track_id] = queue_time
                    logger.info(f"Vehicle {track_id} exited queue. Time: {queue_time:.2f}s")
    
    def _draw_annotations(self, frame: np.ndarray, boxes, track_ids, classes, confidences):
        """Draw bounding boxes and tracking information on frame"""
        # Draw boundary lines
        cv2.line(frame, (0, self.line1_y), (self.frame_width, self.line1_y), 
                (0, 255, 0), 2)
        cv2.putText(frame, 'Entry Line', (10, self.line1_y - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        cv2.line(frame, (0, self.line2_y), (self.frame_width, self.line2_y), 
                (0, 0, 255), 2)
        cv2.putText(frame, 'Exit Line', (10, self.line2_y - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        # Draw detections
        for box, track_id, cls, conf in zip(boxes, track_ids, classes, confidences):
            x1, y1, x2, y2 = map(int, box)
            color = self.colors[track_id % len(self.colors)]
            
            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # Get vehicle type
            vehicle_type = self.vehicle_classes.get(int(cls), 'vehicle')
            
            # Prepare label
            label = f"ID:{track_id} {vehicle_type} {conf:.2f}"
            
            # Add queue time if available
            if track_id in self.vehicle_queue_time:
                queue_time = self.vehicle_queue_time[track_id]
                label += f" | Queue: {queue_time:.1f}s"
            
            # Draw label background
            (label_width, label_height), _ = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(frame, (x1, y1 - label_height - 10), 
                         (x1 + label_width, y1), color, -1)
            
            # Draw label text
            cv2.putText(frame, label, (x1, y1 - 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Draw statistics overlay
        self._draw_stats_overlay(frame)
        
        return frame
    
    def _draw_stats_overlay(self, frame: np.ndarray):
        """Draw real-time statistics on frame"""
        overlay_height = 150
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (400, overlay_height), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Statistics text
        stats = [
            f"Total Vehicles: {self.detection_stats['total_vehicles']}",
            f"Queue Length: {self.detection_stats['current_queue_length']}",
            f"Avg Queue Time: {self.detection_stats['avg_queue_time']:.1f}s",
            f"Cars: {self.detection_stats['vehicles_by_type']['car']}",
            f"Trucks: {self.detection_stats['vehicles_by_type']['truck']}",
        ]
        
        y_offset = 25
        for i, stat in enumerate(stats):
            cv2.putText(frame, stat, (10, y_offset + i * 25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    def _update_analytics(self):
        """Update analytics statistics"""
        # Current queue length (vehicles between lines)
        queue_vehicles = set()
        for track_id in self.vehicle_data.keys():
            if track_id in self.line1_crossed and track_id not in self.line2_crossed:
                queue_vehicles.add(track_id)
        
        self.detection_stats['current_queue_length'] = len(queue_vehicles)
        
        # Average queue time
        if self.vehicle_queue_time:
            avg_time = sum(self.vehicle_queue_time.values()) / len(self.vehicle_queue_time)
            self.detection_stats['avg_queue_time'] = avg_time
        
        # Total unique vehicles
        self.detection_stats['total_vehicles'] = len(self.vehicle_data)
        
        self.detection_stats['last_update'] = datetime.utcnow().isoformat()
    
    async def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Process a single frame with YOLO detection and tracking
        
        Args:
            frame: Input frame
            
        Returns:
            Annotated frame and detection data
        """
        if not hasattr(self, 'frame_width'):
            self._setup_lines(frame.shape[0], frame.shape[1])
        
        # Run YOLOv8 tracking
        results = self.model.track(
            frame,
            persist=True,
            tracker="bytetrack.yaml",
            classes=list(self.vehicle_classes.keys()),
            verbose=False
        )
        
        boxes = []
        track_ids = []
        classes = []
        confidences = []
        detections = []
        
        if results and results[0].boxes is not None and results[0].boxes.id is not None:
            boxes_data = results[0].boxes.xyxy.cpu().numpy()
            track_ids_data = results[0].boxes.id.cpu().numpy().astype(int)
            classes_data = results[0].boxes.cls.cpu().numpy().astype(int)
            confidences_data = results[0].boxes.conf.cpu().numpy()
            
            for box, track_id, cls, conf in zip(boxes_data, track_ids_data, 
                                                classes_data, confidences_data):
                boxes.append(box)
                track_ids.append(track_id)
                classes.append(cls)
                confidences.append(conf)
                
                # Calculate center point
                center_x = int((box[0] + box[2]) / 2)
                center_y = int((box[1] + box[3]) / 2)
                
                # Store vehicle data
                if track_id not in self.vehicle_data:
                    vehicle_type = self.vehicle_classes.get(int(cls), 'vehicle')
                    self.vehicle_data[track_id] = {
                        'type': vehicle_type,
                        'first_seen': time.time(),
                        'confidence': float(conf)
                    }
                    self.detection_stats['vehicles_by_type'][vehicle_type] += 1
                
                # Track history
                track = self.track_history[track_id]
                track.append((center_x, center_y))
                if len(track) > 30:
                    track.pop(0)
                
                # Check line crossing
                if len(track) > 1:
                    prev_center_y = track[-2][1]
                    self._check_line_crossing(track_id, center_y, prev_center_y, center_x)
                
                # Prepare detection data for frontend
                detection_data = {
                    'id': int(track_id),
                    'type': self.vehicle_classes.get(int(cls), 'vehicle'),
                    'confidence': float(conf),
                    'bbox': [float(x) for x in box],
                    'center': [center_x, center_y],
                    'in_queue': track_id in self.line1_crossed and track_id not in self.line2_crossed,
                    'queue_time': self.vehicle_queue_time.get(track_id, 0)
                }
                detections.append(detection_data)
        
        # Draw annotations
        annotated_frame = self._draw_annotations(frame, boxes, track_ids, classes, confidences)
        
        # Update analytics
        self._update_analytics()
        
        # Prepare output data
        output_data = {
            'frame_number': self.frame_count,
            'timestamp': datetime.utcnow().isoformat(),
            'detections': detections,
            'statistics': dict(self.detection_stats),
            'queue_times': {int(k): float(v) for k, v in self.vehicle_queue_time.items()}
        }
        
        self.frame_count += 1
        
        return annotated_frame, output_data
    
    def start_stream(self, youtube_url: str) -> bool:
        """
        Start processing YouTube live stream
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            True if stream started successfully
        """
        try:
            # Get stream URL
            stream_url = self.get_youtube_stream_url(youtube_url)
            if not stream_url:
                logger.error("Failed to get stream URL")
                return False
            
            # Open video capture
            self.cap = cv2.VideoCapture(stream_url)
            
            if not self.cap.isOpened():
                logger.error("Failed to open video stream")
                return False
            
            # Get stream properties
            self.fps = int(self.cap.get(cv2.CAP_PROP_FPS)) or 30
            
            self.is_running = True
            self.frame_count = 0
            
            logger.info(f"Started YouTube live stream processing at {self.fps} FPS")
            return True
            
        except Exception as e:
            logger.error(f"Error starting stream: {e}")
            return False
    
    def stop_stream(self):
        """Stop processing stream"""
        self.is_running = False
        if self.cap:
            self.cap.release()
            self.cap = None
        logger.info("Stopped YouTube live stream processing")
    
    def get_frame(self) -> Optional[Tuple[bool, np.ndarray]]:
        """Get next frame from stream"""
        if self.cap and self.is_running:
            return self.cap.read()
        return None, None
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get current detection statistics"""
        return {
            **dict(self.detection_stats),
            'is_running': self.is_running,
            'frame_count': self.frame_count,
            'tracked_vehicles': len(self.vehicle_data)
        }
    
    def reset_statistics(self):
        """Reset all tracking and statistics"""
        self.track_history = defaultdict(list)
        self.vehicle_entry_time = {}
        self.vehicle_exit_time = {}
        self.vehicle_queue_time = {}
        self.line1_crossed = set()
        self.line2_crossed = set()
        self.vehicle_data = {}
        self.frame_count = 0
        
        self.detection_stats = {
            'total_vehicles': 0,
            'vehicles_by_type': defaultdict(int),
            'current_queue_length': 0,
            'avg_queue_time': 0,
            'detections_per_minute': 0,
            'last_update': None
        }
