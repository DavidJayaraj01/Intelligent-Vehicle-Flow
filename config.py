"""
Configuration file for Vehicle Queue Detection System
Adjust these parameters based on your setup
"""

# Video Source Configuration
# For webcam, use 0, 1, 2, etc.
# For video file, use the file path: 'videos/traffic.mp4'
VIDEO_SOURCE = 0

# YOLOv8 Model Configuration
# Options: 'yolov8n.pt' (nano - fastest), 'yolov8s.pt' (small), 
#          'yolov8m.pt' (medium), 'yolov8l.pt' (large), 'yolov8x.pt' (extra large)
MODEL_PATH = 'yolov8n.pt'

# Boundary Lines Configuration (as percentage of frame height)
# These define the queue area
ENTRY_LINE_POSITION = 0.4  # 40% from top (first line - where vehicles enter)
EXIT_LINE_POSITION = 0.7   # 70% from top (second line - where vehicles exit)

# Tracking Configuration
TRACK_HISTORY_LENGTH = 30  # Number of points to keep in track history
CONFIDENCE_THRESHOLD = 0.3  # Minimum confidence for detection

# Vehicle Classes to Detect (COCO dataset class IDs)
# 2: car, 3: motorcycle, 5: bus, 7: truck
VEHICLE_CLASSES = [2, 3, 5, 7]

# Display Configuration
SHOW_TRACK_LINES = True  # Show the path of each vehicle
SHOW_INFO_PANEL = True   # Show statistics panel
SAVE_OUTPUT_VIDEO = False  # Save the processed video
OUTPUT_VIDEO_PATH = 'output_queue_detection.mp4'

# Colors (BGR format)
ENTRY_LINE_COLOR = (0, 255, 0)  # Green
EXIT_LINE_COLOR = (0, 0, 255)   # Red
TEXT_COLOR = (255, 255, 255)    # White
PANEL_BG_COLOR = (0, 0, 0)      # Black
