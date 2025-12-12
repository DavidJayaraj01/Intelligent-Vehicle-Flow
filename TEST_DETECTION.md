# YOLOv8 Detection Test Guide

## System Status ✅
- ✅ YOLOv8 model exists: `backend/yolov8n.pt`
- ✅ Backend detection service ready
- ✅ Frontend canvas display configured
- ✅ WebSocket streaming enabled

## What You Should See

### 1. Before Starting Detection
- YouTube video playing normally
- Overlay message with instructions
- "Start Live Detection" button

### 2. Click "Start Live Detection"
**Immediately:**
- Loading spinner appears: "Starting YOLOv8 Detection..."
- Button changes to "Stop Stream"
- Green "LIVE" badge appears

**After 5-10 seconds:**
- YouTube iframe disappears
- Canvas shows processed video with:
  - **Green line** across top (Entry Line - 30% height)
  - **Red line** across bottom (Exit Line - 75% height)
  - **Colored boxes** around each vehicle
  - **Labels** showing: `ID:1 car 0.95 | Queue: 2.3s`
  - **Stats overlay** in top-left corner

### 3. Detection Annotations

Each detected vehicle shows:
```
┌─────────────────────────┐
│ ID:5 car 0.92          │ ← Label with vehicle info
└─────────────────────────┘
  ↑
  Colored bounding box
```

**Vehicle Types Detected:**
- `car` - Cars, sedans, SUVs
- `truck` - Pickup trucks, delivery trucks
- `bus` - Buses, coaches
- `motorcycle` - Bikes, scooters

**Queue Time Calculation:**
1. Vehicle crosses green line → Start timer
2. Vehicle crosses red line → Stop timer
3. Display: `Queue: X.Xs`

### 4. Real-time Stats

**Below video:**
- Total Vehicles: 15
- Queue Length: 3
- Avg Queue Time: 8.5s
- Tracked: 15

**On frame (top-left):**
```
Total Vehicles: 15
Queue Length: 3
Avg Queue Time: 8.5s
Cars: 10
Trucks: 5
```

## Testing Steps

### Test 1: Start Detection
1. Open http://localhost:3001
2. Click Dashboard
3. YouTube video should be playing
4. Click "Start Live Detection"
5. Wait 10 seconds
6. You should see annotated frames

**Expected Console Output:**
```
Starting live stream with URL: https://www.youtube.com/watch?v=6dp-bvQ7RWo
Start stream response: {status: 'started', message: '...'}
Connecting to WebSocket: ws://localhost:8000/api/v1/live-stream/ws
Live stream WebSocket connected successfully
Received WebSocket message: detection_update
```

### Test 2: Verify Detections
**Look for:**
- [ ] Green entry line visible
- [ ] Red exit line visible
- [ ] Bounding boxes around vehicles
- [ ] Vehicle IDs incrementing (1, 2, 3...)
- [ ] Vehicle types labeled correctly
- [ ] Queue times appearing after crossing lines
- [ ] Stats updating in real-time

### Test 3: Check Backend Processing
**Backend Terminal Should Show:**
```
INFO:     Started YouTube live stream processing at 30 FPS
INFO:     Vehicle 1 entered queue
INFO:     Vehicle 1 exited queue. Time: 12.45s
INFO:     WebSocket client connected to live stream
```

## Troubleshooting

### Issue: Canvas stays black
**Check:**
1. Browser console - any errors?
2. Backend terminal - is it processing frames?
3. Network tab - is WebSocket connected?

**Solution:**
```bash
# Restart backend
cd backend
..\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Issue: No bounding boxes
**Possible causes:**
1. No vehicles in current frame
2. YOLOv8 confidence threshold too high
3. Stream quality too low

**Check backend logs:**
```
# Should see detections
INFO:     Processing frame 150
INFO:     Detected 3 vehicles: [car, car, truck]
```

### Issue: Queue times not showing
**Cause:** Vehicles haven't crossed both lines yet

**Wait for:**
- Vehicle to cross green line (entry)
- Same vehicle to cross red line (exit)
- Queue time will then appear

### Issue: WebSocket not connecting
**Check:**
1. Backend running on port 8000?
2. Frontend connecting to correct URL?
3. CORS enabled?

**Test manually:**
```bash
# Terminal 1: Start stream
curl -X POST http://localhost:8000/api/v1/live-stream/start \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=6dp-bvQ7RWo"}'

# Terminal 2: Check status
curl http://localhost:8000/api/v1/live-stream/status
```

## Expected Behavior

### Frame Processing
- **Input:** Raw YouTube video frame
- **Processing:** 
  1. YOLOv8 detects vehicles
  2. ByteTrack assigns persistent IDs
  3. Check line crossings
  4. Calculate queue times
  5. Draw annotations
- **Output:** Annotated frame with all overlays

### Annotation Details
```python
# Each frame shows:
- Entry Line: Green horizontal line at y=height*0.3
- Exit Line: Red horizontal line at y=height*0.75
- Bounding Boxes: Colored rectangles around vehicles
- Labels: "ID:X type conf | Queue: Xs"
- Stats Overlay: Black semi-transparent box with statistics
```

### Performance
- **Backend:** ~30 FPS processing
- **WebSocket:** ~10 FPS streaming (bandwidth optimization)
- **Latency:** 1-2 seconds delay from live stream

## Success Criteria ✅

You'll know it's working when you see:
1. ✅ Video disappears, canvas appears
2. ✅ Green and red lines drawn
3. ✅ Colored boxes around moving vehicles
4. ✅ Vehicle IDs and types labeled
5. ✅ Queue times calculated and displayed
6. ✅ Stats updating every second
7. ✅ Console shows "detection_update" messages

## Next Steps

Once detection is working:
1. Check Analytics page - should show real-time data
2. Check Reports page - download CSV/JSON
3. Test stopping and restarting detection
4. Try different times of day (different traffic)

## Still Having Issues?

Check the detailed logs:

**Frontend (Browser Console):**
- Look for WebSocket errors
- Check for frame loading errors
- Verify data structure

**Backend (Terminal):**
- Look for YOLOv8 initialization
- Check for frame processing logs
- Verify WebSocket connections

**Network (Browser DevTools):**
- WebSocket tab should show connected
- Messages flowing every 100ms
- Frame data in base64 format

The system is fully configured - the YOLOv8 detection with entry/exit lines and queue time calculation should work automatically! 🎯
