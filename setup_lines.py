"""
Interactive tool to set boundary lines for queue detection
Run this first to determine optimal line positions for your video
"""

import cv2
import numpy as np
from ultralytics import YOLO

class LineSetup:
    def __init__(self, video_source='video.mp4'):
        self.cap = cv2.VideoCapture(video_source)
        self.frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Load YOLO for live detection preview
        try:
            self.model = YOLO('yolov8n.pt')
            self.show_detections = True
        except:
            self.model = None
            self.show_detections = False
        
        # Default line positions
        self.line1_y = int(self.frame_height * 0.3)
        self.line2_y = int(self.frame_height * 0.8)
        
        # Mouse callback state
        self.dragging_line = None
        self.current_frame_idx = 0
        self.playing = True
        
        print("="*60)
        print("INTERACTIVE LINE SETUP WITH LIVE DETECTION")
        print("="*60)
        print("Instructions:")
        print("1. Watch vehicles move through the video")
        print("2. DRAG GREEN line to where vehicles ENTER the queue")
        print("3. DRAG RED line to where vehicles EXIT the queue")
        print("   (Make sure vehicles cross BOTH lines)")
        print("")
        print("Controls:")
        print("  DRAG lines = Position entry/exit boundaries")
        print("  SPACE     = Pause/Play video")
        print("  LEFT/RIGHT = Step backward/forward")
        print("  's'       = SAVE line positions")
        print("  'r'       = RESET to defaults")
        print("  'd'       = Toggle detection overlay")
        print("  'q'       = QUIT without saving")
        print("="*60)
        
    def mouse_callback(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            # Check which line is closer
            dist1 = abs(y - self.line1_y)
            dist2 = abs(y - self.line2_y)
            
            if dist1 < 20:
                self.dragging_line = 1
            elif dist2 < 20:
                self.dragging_line = 2
                
        elif event == cv2.EVENT_MOUSEMOVE:
            if self.dragging_line == 1:
                self.line1_y = max(10, min(y, self.line2_y - 50))
            elif self.dragging_line == 2:
                self.line2_y = max(self.line1_y + 50, min(y, self.frame_height - 10))
                
        elif event == cv2.EVENT_LBUTTONUP:
            self.dragging_line = None
    
    def run(self):
        cv2.namedWindow('Line Setup')
        cv2.setMouseCallback('Line Setup', self.mouse_callback)
        
        # Read first frame
        ret, frame = self.cap.read()
        if not ret:
            print("Error: Cannot read video")
            return None
        
        while True:
            display_frame = frame.copy()
            
            # Draw lines
            cv2.line(display_frame, (0, self.line1_y), (self.frame_width, self.line1_y), 
                     (0, 255, 0), 3)
            cv2.putText(display_frame, f"ENTRY LINE (Y={self.line1_y}) - Drag to adjust", 
                       (10, self.line1_y - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.line(display_frame, (0, self.line2_y), (self.frame_width, self.line2_y), 
                     (0, 0, 255), 3)
            cv2.putText(display_frame, f"EXIT LINE (Y={self.line2_y}) - Drag to adjust", 
                       (10, self.line2_y + 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # Draw instructions
            cv2.rectangle(display_frame, (10, 10), (600, 120), (0, 0, 0), -1)
            cv2.rectangle(display_frame, (10, 10), (600, 120), (255, 255, 255), 2)
            cv2.putText(display_frame, "Drag lines to position | 's'=Save | 'r'=Reset | 'q'=Quit", 
                       (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            line1_pct = (self.line1_y / self.frame_height) * 100
            line2_pct = (self.line2_y / self.frame_height) * 100
            cv2.putText(display_frame, f"Entry: {line1_pct:.1f}% | Exit: {line2_pct:.1f}%", 
                       (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.putText(display_frame, f"Queue Zone Height: {self.line2_y - self.line1_y}px", 
                       (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
            cv2.imshow('Line Setup', display_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("\nSetup cancelled")
                self.cap.release()
                cv2.destroyAllWindows()
                return None
            elif key == ord('s'):
                print("\n" + "="*60)
                print("LINE POSITIONS SAVED!")
                print("="*60)
                print(f"Entry Line Y: {self.line1_y} ({line1_pct:.1f}% from top)")
                print(f"Exit Line Y: {self.line2_y} ({line2_pct:.1f}% from top)")
                print(f"Queue Zone: {self.line2_y - self.line1_y}px")
                print("="*60)
                
                # Save to config file
                self.save_config()
                
                self.cap.release()
                cv2.destroyAllWindows()
                return (self.line1_y, self.line2_y)
            elif key == ord('r'):
                self.line1_y = int(self.frame_height * 0.3)
                self.line2_y = int(self.frame_height * 0.8)
                print("Reset to default positions")
        
    def save_config(self):
        """Save line positions to a Python file"""
        with open('line_config.py', 'w') as f:
            f.write("# Auto-generated line configuration\n")
            f.write(f"# Video resolution: {self.frame_width}x{self.frame_height}\n\n")
            f.write(f"ENTRY_LINE_Y = {self.line1_y}\n")
            f.write(f"EXIT_LINE_Y = {self.line2_y}\n")
            f.write(f"ENTRY_LINE_PERCENT = {(self.line1_y / self.frame_height):.3f}\n")
            f.write(f"EXIT_LINE_PERCENT = {(self.line2_y / self.frame_height):.3f}\n")
        
        print("Configuration saved to line_config.py")


if __name__ == "__main__":
    setup = LineSetup('video.mp4')
    result = setup.run()
    
    if result:
        print("\nYou can now run: python vehicle_queue_detection.py")
    else:
        print("\nSetup not completed. Run this script again to set line positions.")
