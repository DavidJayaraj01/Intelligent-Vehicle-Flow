"""
Real-time Vehicle Detection and Queue Time Calculation using YOLOv8
Tracks vehicles crossing two boundary lines and calculates waiting time
"""

import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict
import time
from datetime import datetime


class VehicleQueueDetector:
    def __init__(self, model_path='yolov8n.pt', video_source=0):
        """
        Initialize the vehicle queue detector
        
        Args:
            model_path: Path to YOLOv8 model (downloads automatically if not exists)
            video_source: Video file path or camera index (0 for webcam)
        """
        # Load YOLOv8 model
        self.model = YOLO(model_path)
        
        # Video capture
        self.cap = cv2.VideoCapture(video_source)
        
        # Get video properties
        self.frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))
        
        # Try to load custom line positions, otherwise use defaults
        try:
            from line_config import ENTRY_LINE_Y, EXIT_LINE_Y
            self.line1_y = ENTRY_LINE_Y
            self.line2_y = EXIT_LINE_Y
            print("✓ Loaded custom line positions from line_config.py")
        except ImportError:
            # Define two boundary lines (horizontal lines)
            # Line 1: Entry line (upper line)
            self.line1_y = int(self.frame_height * 0.25)  # 25% from top
            # Line 2: Exit line (lower line)
            self.line2_y = int(self.frame_height * 0.85)  # 85% from top
            print("⚠ Using default line positions. Run setup_lines.py to customize.")
        
        # Tracking data structures
        self.track_history = defaultdict(list)  # Track paths
        self.vehicle_entry_time = {}  # Vehicle ID -> entry timestamp
        self.vehicle_exit_time = {}  # Vehicle ID -> exit timestamp
        self.vehicle_queue_time = {}  # Vehicle ID -> queue time in seconds
        self.line1_crossed = set()  # IDs that crossed line 1
        self.line2_crossed = set()  # IDs that crossed line 2
        self.vehicle_data = {}  # Vehicle ID -> {class, last_y, status}
        self.recent_crossings = []  # Recent line crossings for visualization
        
        # Colors
        self.colors = self._generate_colors(100)
        
        # Vehicle class IDs (COCO dataset)
        self.vehicle_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck
        
    def _generate_colors(self, num_colors):
        """Generate distinct colors for different vehicle IDs"""
        np.random.seed(42)
        colors = []
        for _ in range(num_colors):
            colors.append(tuple(map(int, np.random.randint(0, 255, 3))))
        return colors
    
    def _check_line_crossing(self, track_id, center_y, prev_center_y, center_x):
        """
        Check if vehicle crossed any boundary line
        
        Args:
            track_id: Vehicle tracking ID
            center_y: Current Y position of vehicle center
            prev_center_y: Previous Y position of vehicle center
            center_x: X position for visualization
        """
        tolerance = 15  # Pixel tolerance for line crossing
        
        # Check Line 1 crossing (entry line) - downward movement
        if track_id not in self.line1_crossed:
            if (prev_center_y < self.line1_y - tolerance and center_y >= self.line1_y - tolerance) or \
               (prev_center_y <= self.line1_y and center_y > self.line1_y):
                self.line1_crossed.add(track_id)
                self.vehicle_entry_time[track_id] = time.time()
                self.recent_crossings.append({'x': center_x, 'line': 1, 'time': time.time()})
                vehicle_type = self.vehicle_data.get(track_id, {}).get('class', 'Vehicle')
                print(f"✓ {vehicle_type} ID:{track_id} ENTERED queue (Y:{prev_center_y:.0f}→{center_y:.0f})")
        
        # Check Line 2 crossing (exit line) - downward movement  
        if track_id not in self.line2_crossed:
            if (prev_center_y < self.line2_y - tolerance and center_y >= self.line2_y - tolerance) or \
               (prev_center_y <= self.line2_y and center_y > self.line2_y):
                self.line2_crossed.add(track_id)
                self.vehicle_exit_time[track_id] = time.time()
                self.recent_crossings.append({'x': center_x, 'line': 2, 'time': time.time()})
                
                vehicle_type = self.vehicle_data.get(track_id, {}).get('class', 'Vehicle')
                
                # Calculate queue time if vehicle crossed both lines
                if track_id in self.vehicle_entry_time:
                    queue_time = self.vehicle_exit_time[track_id] - self.vehicle_entry_time[track_id]
                    self.vehicle_queue_time[track_id] = queue_time
                    print(f"★ {vehicle_type} ID:{track_id} COMPLETED - QUEUE TIME: {queue_time:.2f}s (Y:{prev_center_y:.0f}→{center_y:.0f})")
                else:
                    print(f"⚠ {vehicle_type} ID:{track_id} crossed exit line (started in queue zone)")
    
    def _draw_boundaries(self, frame):
        """Draw the two boundary lines on the frame with crossing indicators"""
        current_time = time.time()
        
        # Draw zone between lines
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, self.line1_y), (self.frame_width, self.line2_y), (255, 255, 0), -1)
        cv2.addWeighted(overlay, 0.1, frame, 0.9, 0, frame)
        
        # Line 1 (Entry) - Green
        cv2.line(frame, (0, self.line1_y), (self.frame_width, self.line1_y), 
                 (0, 255, 0), 4)
        cv2.putText(frame, f"ENTRY (Y={self.line1_y})", (10, self.line1_y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Line 2 (Exit) - Red
        cv2.line(frame, (0, self.line2_y), (self.frame_width, self.line2_y), 
                 (0, 0, 255), 4)
        cv2.putText(frame, f"EXIT (Y={self.line2_y})", (10, self.line2_y + 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        # Draw recent crossing markers (fade over 2 seconds)
        self.recent_crossings = [c for c in self.recent_crossings if current_time - c['time'] < 2.0]
        for crossing in self.recent_crossings:
            alpha = 1.0 - (current_time - crossing['time']) / 2.0
            color = (0, 255, 0) if crossing['line'] == 1 else (0, 0, 255)
            y = self.line1_y if crossing['line'] == 1 else self.line2_y
            size = int(15 * alpha)
            cv2.circle(frame, (crossing['x'], y), size, color, -1)
            cv2.circle(frame, (crossing['x'], y), size + 5, (255, 255, 255), 2)
    
    def _draw_info_panel(self, frame):
        """Draw information panel with statistics"""
        # Semi-transparent background
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (450, 180), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Border
        cv2.rectangle(frame, (10, 10), (450, 180), (0, 255, 0), 2)
        
        # Statistics
        total_vehicles = len(self.line1_crossed)
        completed_vehicles = len(self.vehicle_queue_time)
        in_queue = len(self.line1_crossed - self.line2_crossed)
        
        avg_queue_time = 0
        if self.vehicle_queue_time:
            avg_queue_time = sum(self.vehicle_queue_time.values()) / len(self.vehicle_queue_time)
        
        # Title
        cv2.putText(frame, "QUEUE STATISTICS", 
                    (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # Display text with better formatting
        y_offset = 60
        cv2.putText(frame, f"Total Vehicles: {total_vehicles}", 
                    (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        y_offset += 30
        cv2.putText(frame, f"Currently in Queue: {in_queue}", 
                    (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 2)
        y_offset += 30
        cv2.putText(frame, f"Completed Queue: {completed_vehicles}", 
                    (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        y_offset += 30
        cv2.putText(frame, f"Avg Wait Time: {avg_queue_time:.2f}s", 
                    (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2)
    
    def process_frame(self, frame):
        """
        Process a single frame: detect, track, and calculate queue times
        
        Args:
            frame: Input video frame
            
        Returns:
            Annotated frame
        """
        # Run YOLOv8 tracking on the frame with ByteTrack for better ID persistence
        results = self.model.track(
            frame, 
            persist=True, 
            tracker="bytetrack.yaml",
            classes=self.vehicle_classes, 
            verbose=False,
            conf=0.3,  # Confidence threshold
            iou=0.5    # IOU threshold for tracking
        )
        
        # Draw boundary lines
        self._draw_boundaries(frame)
        
        # Process detections
        if results[0].boxes is not None and results[0].boxes.id is not None:
            boxes = results[0].boxes.xywh.cpu()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            confidences = results[0].boxes.conf.cpu().tolist()
            classes = results[0].boxes.cls.int().cpu().tolist()
            
            for box, track_id, conf, cls in zip(boxes, track_ids, confidences, classes):
                x, y, w, h = box
                center_x, center_y = int(x), int(y)
                
                # Store vehicle class data
                class_names = {2: 'Car', 3: 'Motorcycle', 5: 'Bus', 7: 'Truck'}
                vehicle_class = class_names.get(cls, 'Vehicle')
                if track_id not in self.vehicle_data:
                    self.vehicle_data[track_id] = {'class': vehicle_class, 'first_seen': time.time()}
                self.vehicle_data[track_id]['last_y'] = center_y
                
                # Get previous position
                track = self.track_history[track_id]
                prev_center_y = track[-1][1] if track else center_y
                
                # Update track history
                track.append((center_x, center_y))
                if len(track) > 30:  # Keep last 30 points
                    track.pop(0)
                
                # Check line crossing
                self._check_line_crossing(track_id, center_y, prev_center_y, center_x)
                
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
                
                # Add queue status and time
                status = ""
                if track_id in self.vehicle_queue_time:
                    # Completed queue
                    queue_time = self.vehicle_queue_time[track_id]
                    status = f" WAIT:{queue_time:.1f}s"
                elif track_id in self.vehicle_entry_time and track_id not in self.vehicle_exit_time:
                    # Currently in queue
                    current_time = time.time() - self.vehicle_entry_time[track_id]
                    status = f" IN-Q:{current_time:.1f}s"
                elif track_id not in self.line1_crossed:
                    status = " [Before Entry]"
                
                label += status
                
                # Draw label background with better visibility
                font_scale = 0.6
                font_thickness = 2
                (label_w, label_h), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
                
                # Add padding
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
                           cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), font_thickness)
        
        # Draw info panel
        self._draw_info_panel(frame)
        
        return frame
    
    def run(self):
        """Main loop to process video stream"""
        print("Starting vehicle queue detection...")
        print(f"Video resolution: {self.frame_width}x{self.frame_height}")
        print(f"Entry line at Y={self.line1_y} ({(self.line1_y/self.frame_height)*100:.1f}%)")
        print(f"Exit line at Y={self.line2_y} ({(self.line2_y/self.frame_height)*100:.1f}%)")
        print(f"Queue zone height: {self.line2_y - self.line1_y}px")
        print("="*60)
        print("CONTROLS:")
        print("  'q' = Quit and show statistics")
        print("  's' = Save current frame")
        print("  'd' = Toggle debug mode (show vehicle positions)")
        print("="*60)
        
        frame_count = 0
        debug_mode = False
        
        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("End of video or cannot read frame")
                break
            
            # Process frame
            annotated_frame = self.process_frame(frame)
            
            # Display frame
            cv2.imshow('Vehicle Queue Detection', annotated_frame)
            
            # Handle key press
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                # Save current frame
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"queue_detection_{timestamp}.jpg"
                cv2.imwrite(filename, annotated_frame)
                print(f"Frame saved as {filename}")
            elif key == ord('d'):
                debug_mode = not debug_mode
                print(f"Debug mode: {'ON' if debug_mode else 'OFF'}")
            
            # Debug output every 30 frames
            if debug_mode and frame_count % 30 == 0:
                print(f"\n[Frame {frame_count}] Active vehicles: {len(self.track_history)}")
                print(f"  In queue zone: {len(self.line1_crossed - self.line2_crossed)}")
                print(f"  Completed: {len(self.vehicle_queue_time)}")
            
            frame_count += 1
        
        # Cleanup
        self.cap.release()
        cv2.destroyAllWindows()
        
        # Print final statistics
        print("\n" + "="*70)
        print("FINAL STATISTICS")
        print("="*70)
        print(f"Total vehicles detected: {len(self.line1_crossed)}")
        print(f"Vehicles entered queue: {len(self.line1_crossed)}")
        print(f"Vehicles exited queue: {len(self.line2_crossed)}")
        print(f"Vehicles COMPLETED (crossed both lines): {len(self.vehicle_queue_time)}")
        print(f"Vehicles still in queue zone: {len(self.line1_crossed - self.line2_crossed)}")
        
        if self.vehicle_queue_time:
            print("\n" + "="*70)
            print("QUEUE TIMES FOR EACH VEHICLE:")
            print("="*70)
            for vid, qtime in sorted(self.vehicle_queue_time.items()):
                vtype = self.vehicle_data.get(vid, {}).get('class', 'Vehicle')
                print(f"  {vtype:12} ID:{vid:4d} - Queue Time: {qtime:6.2f} seconds")
            
            avg_time = sum(self.vehicle_queue_time.values()) / len(self.vehicle_queue_time)
            max_time = max(self.vehicle_queue_time.values())
            min_time = min(self.vehicle_queue_time.values())
            
            print("\n" + "="*70)
            print("SUMMARY:")
            print(f"  Average queue time: {avg_time:.2f} seconds")
            print(f"  Maximum queue time: {max_time:.2f} seconds")
            print(f"  Minimum queue time: {min_time:.2f} seconds")
            print("="*70)
        else:
            print("\n⚠ WARNING: No vehicles completed the full queue!")
            print("   This means no vehicle crossed BOTH entry and exit lines.")
            print("   Run setup_lines.py to reposition the boundary lines.")
            print("="*70)


def main():
    """Main function"""
    # You can change these parameters:
    # - For webcam: video_source=0
    # - For video file: video_source='path/to/video.mp4'
    # - For different model size: model_path='yolov8s.pt' (s, m, l, x for larger models)
    
    detector = VehicleQueueDetector(
        model_path='yolov8n.pt',  # Nano model (fastest, downloads automatically)
        video_source='video.mp4'  # Use uploaded video file
    )
    
    detector.run()


if __name__ == "__main__":
    main()
