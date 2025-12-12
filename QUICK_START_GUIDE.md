# 🚀 Quick Start Guide - YouTube Live Detection

## ✅ System Status
- **Frontend**: Running on http://localhost:3001
- **Backend**: Running on http://localhost:8000
- **YOLOv8 Model**: Configured and ready
- **YouTube Stream**: https://www.youtube.com/watch?v=6dp-bvQ7RWo
- **All Errors**: FIXED ✅

## 🎯 3 Simple Steps to Start

### Step 1: Open Dashboard
```
http://localhost:3001
```

### Step 2: Click "Start Live Detection"
- Button is in the top-right corner
- Green "LIVE" indicator will appear
- Wait 3-5 seconds for stream to connect

### Step 3: Watch Real-Time Detection!
You'll see:
- 📹 Live YouTube video from Camera 1
- 🎯 YOLOv8 detection boxes around vehicles
- 🏷️ Vehicle types (car, truck, bus, motorcycle)
- 🔢 Unique ID for each vehicle
- 📊 Queue time calculation
- 📈 Real-time statistics

## 📊 What You'll See

### Dashboard Display
```
┌─────────────────────────────────────────┐
│  🎥 YouTube Live Detection Feed         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │     [Vehicle Detection Video]    │  │
│  │     with YOLOv8 annotations      │  │
│  │     - Bounding boxes             │  │
│  │     - Vehicle IDs                │  │
│  │     - Types (car, truck, etc)    │  │
│  │     - Gate lines (green/red)     │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  📊 Stats:                              │
│  • Total Vehicles: 45                   │
│  • Queue Length: 3                      │
│  • Avg Queue Time: 12.5s                │
│  • Tracked: 42                          │
└─────────────────────────────────────────┘
```

## 🎨 Detection Features

### Vehicle Types Detected
- 🚗 **Car** (most common)
- 🏍️ **Motorcycle** (bikes, scooters)
- 🚌 **Bus** (public transport)
- 🚛 **Truck** (delivery, cargo)

### Queue Time Calculation
```
┌─────────────────┐
│   Video Frame   │
├─────────────────┤
│                 │ ← Top
│                 │
│ ═══════════════ │ ← Entry Line (30%, green)
│      ↓          │
│   [Vehicle]     │   Time starts when
│      ↓          │   vehicle crosses
│ ═══════════════ │ ← Exit Line (75%, red)
│                 │   Time ends here
│                 │   Queue time = difference
└─────────────────┘
```

## 📥 Download Reports

### Navigate to Reports Page
1. Click "Reports" in sidebar
2. Select date range
3. Click "Download CSV Report" or "Download JSON Report"

### Report Contents
- All vehicle detections
- Vehicle IDs and types
- Timestamps
- Queue times
- Bounding box coordinates

## 🔧 Fixed Issues

### ✅ Frontend Errors
- **Fixed**: TypeScript error in ReportsEnhanced.tsx
- **Fixed**: Camera selection (now using cam01)
- **Status**: No compilation errors

### ✅ Backend Errors  
- **Fixed**: Detection/Metric model imports
- **Fixed**: Database queries use VehicleEvent
- **Fixed**: Field mappings (class_, bbox, dwell_seconds)
- **Status**: Backend running smoothly

## 🎮 Controls

### Start Detection
```javascript
POST /api/live-stream/start
{
  "youtube_url": "https://www.youtube.com/watch?v=6dp-bvQ7RWo"
}
```

### Stop Detection
```javascript
POST /api/live-stream/stop
```

### Check Status
```javascript
GET /api/live-stream/status
```

## 📱 Pages Available

### 1. Dashboard (Main)
- Live video with YOLOv8 detection
- Real-time KPIs
- Vehicle type breakdown
- Camera 1 feed

### 2. Analytics
- Auto-refreshing charts
- Vehicle type pie chart
- Weekly trends
- Real-time statistics

### 3. Reports
- Today's summary
- CSV/JSON downloads
- Date range selection
- Historical data

## 🚨 Important Notes

### YOLOv8 Model
- **File**: `backend/yolov8n.pt`
- **Type**: Nano (fast, efficient)
- **Classes**: 80 COCO classes (we use 4 vehicle types)
- **FPS**: ~30 on CPU, faster on GPU

### YouTube Stream
- **URL**: https://www.youtube.com/watch?v=6dp-bvQ7RWo
- **Extraction**: Automatic with yt-dlp
- **Format**: Best quality MP4
- **Refresh**: Auto-reconnects on error

### Database
- **Model**: VehicleEvent (PostgreSQL)
- **Batch Size**: Saves every 30 detections
- **Fields**: ID, type, confidence, bbox, queue time
- **Camera ID**: "cam01" for YouTube live stream

## 🎯 Success Indicators

When everything works, you'll see:
1. ✅ Green "LIVE" badge in dashboard
2. ✅ Video playing with colored boxes
3. ✅ Vehicle IDs incrementing
4. ✅ Statistics updating in real-time
5. ✅ Type breakdown showing counts
6. ✅ Queue times being calculated

## 🔍 Troubleshooting

### Video Not Loading?
- Check backend is running (port 8000)
- Check YouTube URL is accessible
- Wait 10-15 seconds for stream extraction
- Check browser console for errors

### No Detections?
- Ensure vehicles are visible in frame
- Check YOLOv8 model file exists
- Verify backend logs for errors
- Try stopping and restarting

### WebSocket Errors?
- Check WebSocket URL: ws://localhost:8000/api/live-stream/ws
- Ensure no firewall blocking
- Check browser console

## 🎉 You're All Set!

Everything is configured and ready. Just:
1. Open http://localhost:3001
2. Click "Start Live Detection"  
3. Watch the magic happen! ✨

The system will automatically:
- Extract YouTube stream URL
- Initialize YOLOv8 model
- Detect vehicles in real-time
- Calculate queue times
- Update analytics
- Save to database

Enjoy your intelligent vehicle flow system! 🚗🚛🏍️🚌
