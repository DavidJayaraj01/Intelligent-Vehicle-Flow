# FastAPI Backend Integration Guide

## Quick Start

### 1. Install FastAPI
```bash
pip install fastapi uvicorn python-multipart
```

### 2. Run the API Server
```bash
# Option 1: Direct Python
python api.py

# Option 2: Uvicorn with auto-reload (development)
uvicorn api:app --reload --host 0.0.0.0 --port 8000

# Option 3: Uvicorn production (no reload)
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

### 3. Test the API

Visit interactive docs: **http://localhost:8000/docs**

Or use curl:
```bash
curl -X POST "http://localhost:8000/detect" -F "file=@test_image.jpg"
```

---

## API Endpoints

### 1. **Health Check**
```
GET /health
```
Check if API and models are running

**Response:**
```json
{
    "status": "healthy",
    "models_loaded": true,
    "device": "cpu"
}
```

---

### 2. **Single Image Detection**
```
POST /detect
Content-Type: multipart/form-data
```
Detect vehicles in a single image

**Request:**
```bash
curl -X POST "http://localhost:8000/detect" \
  -F "file=@image.jpg"
```

**Response:**
```json
{
    "status": "day",
    "detections": {
        "person": 2,
        "bicycle": 0,
        "car": 5,
        "motorcycle": 1,
        "bus": 0,
        "truck": 1
    },
    "total_objects": 9,
    "bounding_boxes": [
        {
            "class": "car",
            "confidence": 0.95,
            "x1": 100,
            "y1": 200,
            "x2": 300,
            "y2": 400
        },
        {
            "class": "person",
            "confidence": 0.87,
            "x1": 500,
            "y1": 150,
            "x2": 550,
            "y2": 300
        }
    ]
}
```

---

### 3. **Image Detection with Visualization**
```
POST /detect-with-visualization
Content-Type: multipart/form-data
```
Detect vehicles and return annotated image with bounding boxes

**Request:**
```bash
curl -X POST "http://localhost:8000/detect-with-visualization" \
  -F "file=@image.jpg" \
  --output result.jpg
```

**Response:**
```json
{
    "status": "day",
    "detections": {
        "person": 2,
        "car": 5,
        ...
    },
    "image": "ffd8ffe000..."  // Hex-encoded image bytes
}
```

---

### 4. **Batch Image Detection**
```
POST /detect-batch
Content-Type: multipart/form-data
```
Detect vehicles in multiple images at once

**Request:**
```bash
curl -X POST "http://localhost:8000/detect-batch" \
  -F "file=@image1.jpg" \
  -F "file=@image2.jpg" \
  -F "file=@image3.jpg"
```

**Response:**
```json
{
    "total_files": 3,
    "processed": 3,
    "results": [
        {
            "filename": "image1.jpg",
            "status": "day",
            "detections": {
                "person": 2,
                "car": 5,
                "truck": 1
            },
            "total_objects": 8
        },
        {
            "filename": "image2.jpg",
            "status": "night",
            "detections": {
                "car": 3,
                "motorcycle": 2
            },
            "total_objects": 5
        }
    ]
}
```

---

### 5. **API Info**
```
GET /info
```
Get API configuration and available classes

**Response:**
```json
{
    "service": "All-Day Vehicle Detection API",
    "version": "1.0.0",
    "device": "cpu",
    "model_config": {
        "yolo_weights": "weights/yolo/best.pt",
        "image_size": 1536,
        "confidence_threshold": 0.25,
        "iou_threshold": 0.45
    },
    "supported_classes": [
        "person",
        "bicycle",
        "car",
        "motorcycle",
        "bus",
        "truck"
    ]
}
```

---

## Configuration

Edit `api.py` to change settings:

```python
DEVICE = "cpu"              # Change to "cuda" for GPU
YOLO_WEIGHTS = "weights/yolo/best.pt"
IMG_SIZE = 1536             # Input image size
CONF_THRESH = 0.25          # Confidence threshold
IOU_THRESH = 0.45           # IOU threshold for NMS
```

---

## Python Client Example

```python
import requests
import json

API_URL = "http://localhost:8000"

# Single image detection
with open("image.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post(f"{API_URL}/detect", files=files)
    
result = response.json()
print(f"Status: {result['status']}")
print(f"Detections: {result['detections']}")
print(f"Total objects: {result['total_objects']}")

for box in result['bounding_boxes']:
    print(f"  - {box['class']}: confidence {box['confidence']:.2f}")
```

---

## JavaScript/Node.js Client Example

```javascript
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:8000';

async function detectImage(imagePath) {
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    
    try {
        const response = await axios.post(
            `${API_URL}/detect`,
            form,
            { headers: form.getHeaders() }
        );
        
        console.log('Status:', response.data.status);
        console.log('Detections:', response.data.detections);
        console.log('Bounding boxes:', response.data.bounding_boxes);
        
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

detectImage('image.jpg');
```

---

## Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install fastapi uvicorn python-multipart

COPY . .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t vehicle-detection-api .
docker run -p 8000:8000 vehicle-detection-api
```

---

## Production Deployment

### Using Gunicorn + Uvicorn
```bash
pip install gunicorn
gunicorn api:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Error Handling

**Invalid Image Format (400):**
```json
{
    "detail": "Invalid image format"
}
```

**Server Error (500):**
```json
{
    "detail": "Error message details"
}
```

---

## Performance Tips

1. **Use GPU** - Change `DEVICE = "cuda"` for real-time processing
2. **Batch Processing** - Use `/detect-batch` for multiple images
3. **Image Size** - Reduce `IMG_SIZE` for faster inference (trade-off accuracy)
4. **Multiple Workers** - Use `--workers 4` with Gunicorn

---

## Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Single image
curl -X POST http://localhost:8000/detect -F "file=@test.jpg"

# Batch images
curl -X POST http://localhost:8000/detect-batch \
  -F "file=@img1.jpg" \
  -F "file=@img2.jpg"

# Get info
curl http://localhost:8000/info

# Interactive docs
# Open in browser: http://localhost:8000/docs
```

---

## Next Steps

1. Run `python api.py` or `uvicorn api:app --reload`
2. Visit `http://localhost:8000/docs` for interactive API testing
3. Integrate with your frontend/mobile app
4. Deploy to production using Docker or cloud platform
