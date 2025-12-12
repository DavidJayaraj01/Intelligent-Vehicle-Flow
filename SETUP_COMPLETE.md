# YouTube Live Detection Setup - Complete ✅

## Overview
Your intelligent vehicle flow system is now configured with YOLOv8 detection for YouTube live streams.

## System Configuration

### Backend (Port 8000)
- **YOLOv8 Model**: `yolov8n.pt` from Ultralytics
- **Detection Service**: `backend/app/services/youtube_live_detector.py`
- **YouTube URL**: https://www.youtube.com/watch?v=6dp-bvQ7RWo
- **API Endpoints**:
  - `POST /api/live-stream/start` - Start detection
  - `POST /api/live-stream/stop` - Stop detection
  - `GET /api/live-stream/status` - Get status
  - `WS /api/live-stream/ws` - WebSocket for real-time frames
  - `GET /api/reports/summary/today` - Today's summary
  - `GET /api/reports/download/csv` - Download CSV report
  - `GET /api/reports/download/json` - Download JSON report

### Frontend (Port 3001)
- **Main Page**: Dashboard with Camera 1 (cam01)
- **Live Detection Display**: Canvas-based rendering with YOLOv8 annotations
- **Real-time Stats**: Vehicle count, queue time, vehicle types
- **Download Reports**: CSV/JSON export from Reports page

## Vehicle Detection Features

### 1. YOLOv8 Detection
- **Model**: YOLOv8 Nano (fast, accurate)
- **Classes Detected**:
  - Car (class 2)
  - Motorcycle (class 3)
  - Bus (class 5)
  - Truck (class 7)

### 2. Queue Time Calculation
- **Gate Lines**: 
  - Entry Line: 30% of frame height (green line)
  - Exit Line: 75% of frame height (red line)
- **Method**: Tracks vehicles crossing both lines
- **Output**: Time difference between entry and exit

### 3. Vehicle Tracking
- **Tracker**: ByteTrack algorithm
- **Persistent IDs**: Each vehicle gets unique ID
- **Track History**: Stores vehicle path for queue analysis

## Database Storage

### VehicleEvent Model
```python
- id: Unique identifier
- camera_id: "cam01" or "live_stream_01"
- track_id: Vehicle unique ID from tracker
- class_: Vehicle type (car, truck, etc.)
- confidence: Detection confidence (0-1)
- bbox: Bounding box {x, y, width, height}
- timestamp: Detection time
- dwell_seconds: Queue time calculated from gate lines
```

## How to Use

### 1. Start the System
Both servers should already be running:
- Backend: http://localhost:8000
- Frontend: http://localhost:3001

### 2. Access Dashboard
1. Open browser to http://localhost:3001
2. Click "Dashboard" in sidebar
3. You'll see "Camera 1 - YouTube Live Detection"

### 3. Start Live Detection
1. Click "Start Live Detection" button
2. System will:
   - Extract YouTube stream URL using yt-dlp
   - Connect to live stream
   - Initialize YOLOv8 model
   - Start WebSocket for real-time frames
3. You'll see:
   - Live video with detection boxes
   - Vehicle IDs and types labeled
   - Green/red gate lines for queue measurement
   - Real-time statistics below video

### 4. View Analytics
- **Dashboard**: Real-time KPIs and vehicle breakdown
- **Analytics Page**: Charts and trends with 10-second refresh
- **Reports Page**: Download CSV/JSON reports with detection data

## Troubleshooting

### Frontend Errors: ✅ FIXED
- Fixed TypeScript error in ReportsEnhanced.tsx (percent undefined)
- All components now compile without errors

### Backend Errors: ✅ FIXED
- Replaced non-existent Detection/Metric models with VehicleEvent
- Updated all database queries to use correct model
- Fixed field mappings (vehicle_type → class_, bbox coordinates)

### yt_dlp Import Warning
- This is only a Pylance linting warning
- Package IS installed and working correctly
- No action needed - backend runs fine

## Video Display in Dashboard

The system displays the YouTube live stream in Camera 1 (cam01) with:
- **Canvas rendering**: Real-time frame display
- **YOLOv8 annotations**: Bounding boxes, IDs, vehicle types
- **Gate lines**: Visual queue measurement lines
- **Detection stats**: Live counters for vehicles, queue time, types

### Embed URL
The system uses: `https://www.youtube.com/watch?v=6dp-bvQ7RWo`
- Stream URL extracted automatically with yt-dlp
- No need for iframe - direct video processing
- Better performance and control

## API Testing

Test the endpoints:

```bash
# Start detection
curl -X POST http://localhost:8000/api/live-stream/start \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=6dp-bvQ7RWo"}'

# Check status
curl http://localhost:8000/api/live-stream/status

# Get today's summary
curl http://localhost:8000/api/reports/summary/today

# Download CSV report
curl "http://localhost:8000/api/reports/download/csv?start_date=2025-12-12T00:00:00&end_date=2025-12-12T23:59:59" \
  -o detections.csv
```

## System Status: ✅ ALL READY

- ✅ YOLOv8 model configured
- ✅ YouTube live stream URL set
- ✅ Queue time calculation implemented
- ✅ Vehicle type detection active
- ✅ Dashboard Camera 1 configured
- ✅ Frontend errors fixed
- ✅ Backend models corrected
- ✅ Database schema updated
- ✅ WebSocket streaming enabled
- ✅ Report downloads working

## Next Steps

1. **Open Dashboard**: http://localhost:3001
2. **Click "Start Live Detection"**
3. **Watch Real-time Detection**
4. **Download Reports** from Reports page

Everything is ready to use! 🎉
