# Live Stream Troubleshooting Guide

## Issue: Live video not visible in dashboard

### Changes Made:
1. ✅ Fixed canvas rendering with proper scaling
2. ✅ Added error handling and console logging
3. ✅ Improved WebSocket connection with detailed logs
4. ✅ Added 1-second delay before connecting WebSocket

### How to Test:

#### Step 1: Open Browser Console
1. Open http://localhost:3001
2. Press F12 to open Developer Tools
3. Go to Console tab

#### Step 2: Start Live Detection
1. Click "Start Live Detection" button
2. Watch the console for messages:
   ```
   Starting live stream with URL: https://www.youtube.com/watch?v=6dp-bvQ7RWo
   Start stream response: {status: 'started', ...}
   Connecting to WebSocket: ws://localhost:8000/api/v1/live-stream/ws
   Live stream WebSocket connected successfully
   Received WebSocket message: detection_update
   ```

#### Step 3: Check for Errors

**Common Issues:**

1. **"Failed to start stream"**
   - Backend not running
   - Solution: Check terminal where uvicorn is running

2. **"WebSocket connection error"**
   - Backend WebSocket not responding
   - Solution: Check backend logs for errors

3. **"yt_dlp error"**
   - YouTube URL extraction failed
   - Check backend logs for: `Error extracting YouTube stream URL`

4. **Canvas is black/empty**
   - Frames not being received
   - Check console for: `Received WebSocket message: detection_update`
   - If not receiving messages, backend may not be processing frames

### Backend Verification:

Test backend endpoints manually:

```bash
# Test if backend is running
curl http://localhost:8000/api/v1/health

# Start live stream manually
curl -X POST http://localhost:8000/api/v1/live-stream/start \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=6dp-bvQ7RWo"}'

# Check stream status
curl http://localhost:8000/api/v1/live-stream/status
```

### Check Backend Logs:

Look for these messages in uvicorn terminal:
```
INFO: Started YouTube live stream processing at 30 FPS
INFO: Vehicle 1 entered queue
INFO: WebSocket client connected to live stream
```

### Frontend Console Commands:

Test in browser console:
```javascript
// Check if API URL is correct
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');

// Test fetch
fetch('http://localhost:8000/api/v1/live-stream/status')
  .then(r => r.json())
  .then(d => console.log('Status:', d));

// Test WebSocket
const ws = new WebSocket('ws://localhost:8000/api/v1/live-stream/ws');
ws.onopen = () => console.log('WS Connected');
ws.onmessage = (e) => console.log('WS Message:', JSON.parse(e.data));
ws.onerror = (e) => console.log('WS Error:', e);
```

### What Should Happen:

1. **After clicking "Start Live Detection":**
   - Button changes to "Stop Stream"
   - Green "LIVE" indicator appears
   - Console shows: "Starting live stream..."
   - Backend processes YouTube URL (takes 5-10 seconds)

2. **When stream starts:**
   - Console shows: "WebSocket connected successfully"
   - Canvas displays video frames with:
     - Green line at top (Entry Line)
     - Red line at bottom (Exit Line)
     - Colored boxes around vehicles
     - Vehicle IDs and types

3. **Real-time updates:**
   - Stats below video update every second
   - Total Vehicles count increases
   - Queue Length shows vehicles between lines
   - Vehicle types breakdown updates

### Still Not Working?

Check these:

1. **Backend Terminal** - Look for errors starting with "ERROR:"
2. **Browser Console** - Check Network tab for failed requests
3. **WebSocket** - In Network tab, filter by "WS" to see WebSocket connection
4. **Canvas Element** - Inspect the canvas element, check if width/height are set

### Expected Console Output:

```
Starting live stream with URL: https://www.youtube.com/watch?v=6dp-bvQ7RWo
Start stream response: {status: 'started', message: 'Live stream detection started...'}
Connecting to WebSocket: ws://localhost:8000/api/v1/live-stream/ws
Live stream WebSocket connected successfully
Received WebSocket message: detection_update
Received WebSocket message: detection_update
Received WebSocket message: detection_update
... (repeats every ~100ms)
```

### Quick Fix Checklist:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3001
- [ ] Browser console open (F12)
- [ ] No CORS errors in console
- [ ] yt-dlp package installed in backend venv
- [ ] yolov8n.pt model file exists in backend folder
- [ ] YouTube URL is accessible

### File Locations:

- Frontend: `frontend/src/components/Dashboard.tsx` (lines 113-189)
- Backend: `backend/app/api/live_stream.py` (WebSocket at line 131)
- Detector: `backend/app/services/youtube_live_detector.py`

### Need More Help?

Copy the console output and backend terminal logs to diagnose the specific issue.
