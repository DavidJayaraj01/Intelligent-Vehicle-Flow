# Quick Start Guide - YouTube Live Detection

## Prerequisites Installed ✅
- Python virtual environment created
- Backend dependencies installed (FastAPI, YOLOv8, etc.)
- Frontend dependencies installed (React, Vite, etc.)
- yt-dlp package installed

## Start the Application

### 1. Start Backend Server
```powershell
cd "c:\Users\Jerwin titus\Desktop\analyt\Intelligent-Vehicle-Flow-\backend"
..\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### 2. Start Frontend Development Server
```powershell
# In a new terminal
cd "c:\Users\Jerwin titus\Desktop\analyt\Intelligent-Vehicle-Flow-\frontend"
npm run dev
```

Frontend will be available at: http://localhost:3000

## Access the New Features

### Live Stream Analytics
1. Open browser: http://localhost:3000/analytics-live
2. Click "Start Live Detection" button
3. Watch real-time vehicle detection with:
   - Live video feed with bounding boxes
   - Vehicle IDs and types
   - Queue time calculations
   - Real-time statistics
   - Detection timeline charts

### Enhanced Reports
1. Open browser: http://localhost:3000/reports-enhanced
2. View today's summary and weekly trends
3. Select date range for custom reports
4. Download reports:
   - Click "Download CSV" for Excel-compatible data
   - Click "Download JSON" for structured analytics

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Features

### YouTube Live Stream
- **URL**: https://www.youtube.com/watch?v=6dp-bvQ7RWo
- **Detection Model**: YOLOv8 (nano version for speed)
- **Tracking**: ByteTrack algorithm
- **Vehicle Types**: Car, Truck, Bus, Motorcycle
- **Queue Analysis**: Entry/Exit line detection

### Real-time Updates via WebSocket
- Frame rate: ~10 FPS (optimized for bandwidth)
- Detection data sent every 0.1 seconds
- Statistics updated in real-time
- Automatic reconnection on disconnect

### Reports & Analytics
- **Daily Summary**: Today's vehicle detections
- **Weekly Summary**: 7-day trends and statistics
- **CSV Export**: Raw detection data with timestamps
- **JSON Export**: Structured analytics data
- **Charts**: Line charts, bar charts, pie charts

## Verify Installation

### Check Backend Health
```powershell
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Vehicle Flow Analyzer API",
  "version": "1.0.0",
  "timestamp": "2024-12-12T..."
}
```

### Check Live Stream Endpoint
```powershell
curl http://localhost:8000/api/v1/live-stream/status
```

### Check Reports Endpoint
```powershell
curl http://localhost:8000/api/v1/reports/summary/today
```

## Files Created/Modified

### Backend Files
✅ `backend/app/services/youtube_live_detector.py` - Live stream processor
✅ `backend/app/api/live_stream.py` - Live stream API endpoints
✅ `backend/app/api/reports.py` - Reports API endpoints
✅ `backend/app/main.py` - Added new routers
✅ `backend/requirements.txt` - Added yt-dlp dependency
✅ `backend/.env` - Created environment configuration

### Frontend Files
✅ `frontend/src/pages/AnalyticsLive.tsx` - Live stream analytics page
✅ `frontend/src/pages/ReportsEnhanced.tsx` - Enhanced reports page
✅ `frontend/src/App.tsx` - Added new routes

### Documentation
✅ `YOUTUBE_LIVE_DETECTION.md` - Complete implementation guide
✅ `QUICK_START.md` - This file

## Navigation Menu

The Sidebar component provides navigation to:
- 📊 Dashboard
- 📤 Upload
- 🚗 Queue Detection
- 🚨 Emergency Detection
- 📈 Analytics (original)
- 🎥 Analytics Live (new)
- 📄 Reports (original)
- 📊 Reports Enhanced (new)

## Default Routes
- `/` - Dashboard
- `/analytics-live` - **NEW** Live stream detection
- `/reports-enhanced` - **NEW** Enhanced reports with downloads

## Troubleshooting

### Backend Won't Start
- Check if port 8000 is available
- Verify virtual environment is activated
- Check all dependencies are installed

### Frontend Won't Start
- Run `npm install` if packages are missing
- Check if port 3000 is available
- Clear node_modules and reinstall if needed

### Live Stream Won't Connect
1. Check backend is running
2. Verify WebSocket URL in frontend matches backend
3. Check browser console for errors
4. Ensure CORS is configured correctly

### No Detections Appearing
1. Verify YOLOv8 model file exists (yolov8n.pt)
2. Check YouTube URL is valid and live
3. Review backend logs for processing errors
4. Ensure internet connection is stable

## Performance Notes

- **First Detection**: May take 10-30 seconds to initialize
- **Frame Processing**: ~10 FPS for real-time display
- **Database Updates**: Batched every 30 detections
- **Memory Usage**: Depends on stream quality and detection count

## What Happens When You Click "Start Live Detection"

1. Frontend sends POST request to `/api/v1/live-stream/start`
2. Backend uses yt-dlp to extract YouTube stream URL
3. OpenCV VideoCapture opens the stream
4. YOLOv8 processes each frame:
   - Detects vehicles (cars, trucks, buses, motorcycles)
   - Assigns unique tracking IDs using ByteTrack
   - Draws bounding boxes and labels
5. Gate line logic tracks vehicles:
   - Entry line at 30% from top
   - Exit line at 75% from top
   - Calculates queue time between lines
6. WebSocket streams:
   - Annotated video frames (JPEG, 80% quality)
   - Detection data (JSON)
   - Statistics updates
7. Frontend displays:
   - Live video feed on canvas
   - Real-time statistics panel
   - Detection timeline chart
   - Vehicle type distribution
   - Current detections table
8. Background task saves to database every 30 detections

## Next Steps

1. **Start both servers** (backend and frontend)
2. **Open `/analytics-live`** in your browser
3. **Click "Start Live Detection"**
4. **Watch the magic happen!** 🎉

## Support

- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Backend Logs: Check terminal running uvicorn
- Frontend Logs: Browser Developer Console (F12)
