# Vehicle Queue Detection System

Real-time vehicle detection and queue time calculation using YOLOv8.

## Features

- **Real-time vehicle detection** using YOLOv8
- **Automatic vehicle tracking** with unique IDs assigned to each vehicle
- **Queue time calculation** between two boundary lines
- **Live statistics** showing total vehicles, queue length, and average wait time
- **Visual tracking** with colored bounding boxes and path trails
- **Support for multiple vehicle types**: cars, motorcycles, buses, trucks

## Setup

A virtual environment has been created and all dependencies are installed.

### Installed Packages
- ultralytics (YOLOv8)
- opencv-python
- numpy
- scipy

## Usage

### Run with Webcam

```bash
.venv\Scripts\python.exe vehicle_queue_detection.py
```

### Run with Video File

Edit `vehicle_queue_detection.py` and change:
```python
detector = VehicleQueueDetector(
    model_path='yolov8n.pt',
    video_source='path/to/your/video.mp4'  # Change this line
)
```

## How It Works

1. **Two Boundary Lines**: The system defines two horizontal lines:
   - **Entry Line (Green)**: Top boundary where vehicles enter the queue
   - **Exit Line (Red)**: Bottom boundary where vehicles exit the queue

2. **Vehicle Tracking**: Each detected vehicle gets a unique ID that persists throughout the video

3. **Queue Time Calculation**: 
   - When a vehicle crosses the entry line, the timestamp is recorded
   - When the same vehicle crosses the exit line, the queue time is calculated
   - Queue time = Exit time - Entry time

4. **Real-time Display**:
   - Bounding boxes with vehicle IDs
   - Current queue time (updating in real-time)
   - Track history showing vehicle path
   - Statistics panel with overall metrics

## Configuration

Edit `config.py` to customize:
- Video source (webcam or file)
- YOLOv8 model size (nano, small, medium, large)
- Boundary line positions
- Vehicle classes to detect
- Display options

## Controls

- **'q'**: Quit the application
- **'s'**: Save current frame as image

## Adjusting Boundary Lines

The default boundary lines are set at:
- Entry line: 40% from top of frame
- Exit line: 70% from top of frame

To adjust, edit in `vehicle_queue_detection.py`:
```python
self.line1_y = int(self.frame_height * 0.4)  # Change 0.4 to desired position
self.line2_y = int(self.frame_height * 0.7)  # Change 0.7 to desired position
```

Or use the values in `config.py`.

## Model Information

The script uses YOLOv8n (nano) by default, which will be downloaded automatically on first run (~6MB). 

For better accuracy but slower speed, you can use:
- `yolov8s.pt` - Small (~22MB)
- `yolov8m.pt` - Medium (~52MB)
- `yolov8l.pt` - Large (~87MB)
- `yolov8x.pt` - Extra Large (~131MB)

## Output Statistics

The system displays:
- Total vehicles detected
- Vehicles currently in queue
- Vehicles that completed the queue
- Average queue time
- Individual queue times for each vehicle

## Troubleshooting

**Camera not found:**
- Try changing `video_source` to 1, 2, etc. if you have multiple cameras

**Poor detection:**
- Use a larger YOLOv8 model (yolov8s.pt or yolov8m.pt)
- Ensure good lighting conditions
- Adjust camera angle to get clear view of vehicles

**Slow performance:**
- Use a smaller model (yolov8n.pt)
- Reduce video resolution
- Process every Nth frame instead of all frames
