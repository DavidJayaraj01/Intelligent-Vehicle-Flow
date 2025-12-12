# YouTube Live Stream Vehicle Detection - Implementation Guide

## Overview
This implementation adds real-time vehicle detection from YouTube live streams with comprehensive analytics and reporting capabilities.

## Features Implemented

### 1. YouTube Live Stream Processing
- **File**: `backend/app/services/youtube_live_detector.py`
- Extracts video stream from YouTube using `yt-dlp`
- Processes frames in real-time with YOLOv8
- ByteTrack algorithm for vehicle tracking with unique IDs
- Virtual gate lines for queue time calculation

### 2. Real-time WebSocket Communication
- **File**: `backend/app/api/live_stream.py`
- WebSocket endpoint: `/api/v1/live-stream/ws`
- Streams annotated video frames and detection data
- Real-time statistics updates
- Background processing for database storage

### 3. Live Analytics Dashboard
- **File**: `frontend/src/pages/AnalyticsLive.tsx`
- **Route**: `/analytics-live`
- Live video feed with detection overlays
- Real-time statistics panel
- Vehicle type distribution charts
- Detection timeline graphs
- Current detections table

### 4. Enhanced Reports with Downloads
- **File**: `frontend/src/pages/ReportsEnhanced.tsx`
- **Route**: `/reports-enhanced`
- Daily and weekly summaries
- CSV export for raw data
- JSON export for analytics
- Interactive charts and visualizations

### 5. Reports API
- **File**: `backend/app/api/reports.py`
- Generate custom reports by date range
- Download CSV: `/api/v1/reports/download/csv`
- Download JSON: `/api/v1/reports/download/json`
- Today's summary: `/api/v1/reports/summary/today`
- Weekly summary: `/api/v1/reports/summary/week`

## API Endpoints

### Live Stream Endpoints
```
POST   /api/v1/live-stream/start       - Start YouTube live stream detection
POST   /api/v1/live-stream/stop        - Stop live stream
GET    /api/v1/live-stream/status      - Get stream status
WS     /api/v1/live-stream/ws          - WebSocket for real-time updates
GET    /api/v1/live-stream/statistics/realtime - Get real-time stats
POST   /api/v1/live-stream/statistics/reset    - Reset statistics
```

### Reports Endpoints
```
POST   /api/v1/reports/generate        - Generate custom report
GET    /api/v1/reports/download/csv    - Download CSV report
GET    /api/v1/reports/download/json   - Download JSON report
GET    /api/v1/reports/summary/today   - Today's summary
GET    /api/v1/reports/summary/week    - Weekly summary
```

## How to Use

### 1. Start the Backend
```powershell
cd backend
..\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend
```powershell
cd frontend
npm run dev
```

### 3. Access the Live Analytics
1. Navigate to `http://localhost:3000/analytics-live`
2. Click "Start Live Detection"
3. Watch real-time vehicle detection with:
   - Bounding boxes with vehicle IDs
   - Vehicle type classification (car, truck, bus, motorcycle)
   - Queue time calculation
   - Entry/Exit line tracking

### 4. View Reports
1. Navigate to `http://localhost:3000/reports-enhanced`
2. Select date range
3. Download reports as CSV or JSON
4. View daily/weekly analytics charts

## Detection Features

### Vehicle Tracking
- **Unique IDs**: Each vehicle assigned a persistent ID across frames
- **Vehicle Types**: car, motorcycle, bus, truck (COCO classes 2, 3, 5, 7)
- **Confidence Scores**: Detection confidence for each vehicle
- **Bounding Boxes**: Precise location tracking

### Queue Analysis
- **Entry Line**: Detects when vehicles enter the queue zone
- **Exit Line**: Detects when vehicles exit the queue zone
- **Queue Time**: Calculates time spent between entry and exit
- **Current Queue Length**: Real-time count of vehicles in queue
- **Average Queue Time**: Statistical analysis of wait times

### Real-time Statistics
- Total vehicles detected
- Vehicles by type breakdown
- Current queue length
- Average queue time
- Tracked vehicles count
- Frame processing rate

## Data Flow

```
YouTube Live Stream
    ↓
yt-dlp (extracts stream URL)
    ↓
OpenCV VideoCapture
    ↓
YOLOv8 Detection + ByteTrack
    ↓
Queue Analysis (Gate Lines)
    ↓
WebSocket → Frontend (real-time display)
    ↓
Database Storage (for reports)
```

## Configuration

### YouTube URL
The YouTube live stream URL is configured in:
```typescript
// frontend/src/pages/AnalyticsLive.tsx
const YOUTUBE_LIVE_URL = 'https://www.youtube.com/watch?v=6dp-bvQ7RWo';
```

### Gate Lines
Queue detection lines can be adjusted in:
```python
# backend/app/services/youtube_live_detector.py
self.line1_y = int(frame_height * 0.30)  # Entry line (30% from top)
self.line2_y = int(frame_height * 0.75)  # Exit line (75% from top)
```

### Model Selection
Change YOLOv8 model for different performance/accuracy:
```python
# backend/app/services/youtube_live_detector.py
def __init__(self, model_path: str = 'yolov8n.pt'):  # n=nano, s=small, m=medium, l=large
```

## Database Schema

Detection data is stored in the `Detection` model:
- `id`: Primary key
- `camera_id`: Camera identifier
- `vehicle_type`: Type of vehicle (car, truck, etc.)
- `confidence`: Detection confidence score
- `bbox_x1, bbox_y1, bbox_x2, bbox_y2`: Bounding box coordinates
- `track_id`: Unique tracking ID
- `timestamp`: Detection timestamp

## Performance Optimization

### Frame Rate Control
WebSocket sends ~10 FPS to reduce bandwidth:
```python
await asyncio.sleep(0.1)  # Adjust for different frame rates
```

### Batch Database Updates
Detections saved in batches of 30:
```python
batch_size = 30  # Adjust for performance vs data freshness
```

### JPEG Compression
Frames encoded with 80% quality:
```python
cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
```

## Troubleshooting

### Stream Won't Start
1. Check YouTube URL is valid and live
2. Verify `yt-dlp` is installed: `pip install yt-dlp`
3. Check network connectivity
4. Review backend logs for errors

### WebSocket Connection Failed
1. Verify backend is running on port 8000
2. Check CORS configuration in backend
3. Ensure WebSocket URL is correct in frontend

### No Detections
1. Verify YOLOv8 model is downloaded (yolov8n.pt)
2. Check if stream contains vehicles
3. Adjust confidence threshold if needed

## Dependencies Added

### Backend
- `yt-dlp>=2023.0.0` - YouTube stream extraction

### Already Included
- `ultralytics` - YOLOv8 detection
- `opencv-python` - Video processing
- `websockets` - Real-time communication
- `fastapi` - API framework

## Future Enhancements

1. **PDF Report Generation** - Add PDF export capability
2. **Multiple Stream Support** - Monitor multiple cameras simultaneously
3. **Alert System** - Notifications for long queue times
4. **Historical Playback** - Review past detection recordings
5. **Advanced Analytics** - Machine learning for traffic prediction

## Routes Summary

- `/analytics-live` - Live stream detection and analytics
- `/reports-enhanced` - Enhanced reports with downloads
- `/analytics` - Original business intelligence analytics
- `/reports` - Original reports page

## Testing

### Test Live Stream
```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# In another terminal, test WebSocket
curl -X POST http://localhost:8000/api/v1/live-stream/start \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=6dp-bvQ7RWo"}'
```

### Test Reports
```bash
# Get today's summary
curl http://localhost:8000/api/v1/reports/summary/today

# Download CSV
curl "http://localhost:8000/api/v1/reports/download/csv?start_date=2024-12-01T00:00:00Z&end_date=2024-12-12T23:59:59Z" -o report.csv
```

## Support

For issues or questions, check:
1. Backend logs: Terminal running uvicorn
2. Frontend console: Browser developer tools
3. Network tab: WebSocket connections
4. API documentation: http://localhost:8000/docs
