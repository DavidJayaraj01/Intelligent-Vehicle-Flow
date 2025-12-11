# Vehicle Flow Analyzer - Backend

FastAPI-based backend service for vehicle detection, tracking, and traffic analysis.

## 🏗️ Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection & session
│   ├── api/                 # API route handlers
│   │   ├── events.py       # Vehicle event ingestion
│   │   ├── metrics.py      # Traffic metrics & analytics
│   │   ├── tracks.py       # Vehicle tracking
│   │   ├── actions.py      # Operator actions
│   │   ├── detection.py    # General detection endpoints
│   │   ├── queue.py        # Queue detection service
│   │   └── emergency.py    # Emergency vehicle detection
│   ├── models/             # SQLAlchemy database models
│   │   ├── vehicle_event.py
│   │   ├── operator_action.py
│   │   ├── camera.py
│   │   ├── analytics.py
│   │   └── user.py
│   ├── schemas/            # Pydantic validation schemas
│   │   ├── event.py
│   │   ├── metrics.py
│   │   └── action.py
│   ├── services/           # Business logic & ML services
│   │   ├── detector.py             # Base detection service
│   │   ├── queue_detector.py      # Queue detection with YOLOv8
│   │   ├── emergency_detector.py  # Emergency vehicle detection
│   │   ├── vehicle_detector.py    # General vehicle detection
│   │   ├── classifier.py          # Vehicle classification
│   │   ├── decision_engine.py     # AI decision making
│   │   ├── metrics_service.py     # Metrics aggregation
│   │   └── websocket_manager.py   # WebSocket handling
│   └── core/               # Core utilities
│       └── redis_client.py
├── outputs/                # Processed media files
│   ├── queue/             # Queue detection outputs
│   └── emergency/         # Emergency detection outputs
├── scripts/               # Utility scripts
│   ├── generate_detections.py
│   └── seed_data.py
├── tests/                 # Unit tests
├── weights/              # Model weights
│   ├── yolo/
│   ├── efficientnet/
│   └── enlightening/
├── Dockerfile
├── requirements.txt
└── .env
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 15
- Redis 7
- CUDA-capable GPU (optional, for faster inference)

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Download model weights**
   - Place `yolov8n.pt` in the backend directory
   - Place `best_emergency_model.pt` in the parent directory
   - Ensure custom weights are in `weights/` subdirectories

### Configuration

Edit `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vehicleflow

# Redis Cache
REDIS_URL=redis://localhost:6379/0

# Security
API_KEY_SECRET=your-secret-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:3000,http://frontend:3000

# Model Paths (optional)
YOLO_MODEL_PATH=yolov8n.pt
EMERGENCY_MODEL_PATH=../best_emergency_model.pt
```

### Running the Server

#### Development Mode
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Using Docker
```bash
docker build -t vehicle-flow-backend .
docker run -p 8000:8000 --env-file .env vehicle-flow-backend
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Service health status
- `GET /` - API information

### Events
- `POST /api/v1/events/` - Ingest vehicle events batch
- `GET /api/v1/events/` - Retrieve vehicle events
  - Query params: `camera_id`, `limit`, `skip`

### Metrics
- `GET /api/v1/metrics/` - Get aggregated traffic metrics
  - Query params: `camera_id`, `from_time`, `to_time`, `interval`
- `GET /api/v1/metrics/timeseries` - Get time-series data
  - Query params: `metric_name`, `camera_id`, `from_time`, `to_time`, `interval`

### Tracking
- `GET /api/v1/tracks/` - Get vehicle track details
  - Query params: `track_id`, `camera_id`
- `GET /api/v1/tracks/list` - List all tracks
  - Query params: `camera_id`, `from_time`, `to_time`, `limit`

### Actions
- `POST /api/v1/actions/` - Create operator action
- `GET /api/v1/actions/` - Get actions history
- `GET /api/v1/actions/stats` - Get action statistics

### Queue Detection
- `POST /api/v1/queue/detect` - Process video/image for queue detection
  - Upload file: video (mp4, avi, mov) or image (jpg, png)
  - Returns: statistics, wait times, vehicle counts, output file
- `GET /api/v1/queue/outputs/{filename}` - Retrieve processed output
- `GET /api/v1/queue/health` - Queue service health check

### Emergency Vehicle Detection
- `POST /api/v1/emergency/detect` - Detect emergency vehicles
  - Upload file: video or image
  - Detects: ambulances, fire trucks, police cars
  - Returns: detection counts, confidence scores, annotated output
- `GET /api/v1/emergency/outputs/{filename}` - Retrieve processed video
- `GET /api/v1/emergency/health` - Emergency service health check

### WebSocket
- `WS /ws/metrics` - Real-time metrics and event streaming
  - Message types: `events_ingested`, `recommendation`, `action_requested`, `kpi_update`

## 🧠 ML Services

### Queue Detector (`queue_detector.py`)

Detects and tracks vehicles crossing entry/exit lines to measure queue wait times.

**Features:**
- Multi-object tracking with ByteTrack
- Entry/exit line crossing detection
- Wait time calculation
- Vehicle classification (car, truck, bus, motorcycle)
- Visual output with annotations

**Usage:**
```python
from app.services.queue_detector import VehicleQueueDetector

detector = VehicleQueueDetector(model_path='yolov8n.pt')
result = detector.process_video('input.mp4', 'output.mp4')
```

### Emergency Vehicle Detector (`emergency_detector.py`)

Specialized detector for emergency vehicles.

**Classes:**
- Ambulance
- Fire Truck
- Police Car

**Usage:**
```python
from app.services.emergency_detector import EmergencyVehicleDetector

detector = EmergencyVehicleDetector(model_path='best_emergency_model.pt')
result = detector.process_video('input.mp4', 'output.mp4')
```

### Decision Engine (`decision_engine.py`)

Analyzes traffic metrics and generates recommendations.

**Recommendations:**
- Extend green light time
- Trigger congestion alert
- Optimize traffic flow
- Emergency vehicle priority

## 🗄️ Database Models

### VehicleEvent
```python
- id: Primary key
- camera_id: Camera identifier
- track_id: Unique vehicle track ID
- class_: Vehicle type (car, truck, bus, bike)
- timestamp: Detection timestamp
- enter_time: Queue entry time
- exit_time: Queue exit time
- dwell_seconds: Time in frame
- lane_id: Lane identifier
- bbox: Bounding box coordinates (JSON)
- confidence: Detection confidence (0-1)
- embedding: Feature vector (optional)
```

### OperatorAction
```python
- id: Primary key
- operator_id: Operator identifier
- action_type: Type of action
- params: Action parameters (JSON)
- camera_id: Related camera
- status: pending/executed/failed
- executed_at: Execution timestamp
```

## 🧪 Testing

### Run All Tests
```bash
pytest
```

### Run Specific Tests
```bash
pytest tests/test_api.py
pytest tests/test_database_connection.py
```

### Test Coverage
```bash
pytest --cov=app tests/
```

### Test Detection Endpoint
```bash
python test_detection_quick.py
```

## 📊 Database Schema

Initialize the database:
```bash
cd ../database
python setup_database.py
```

This creates:
- `vehicle_events` table
- `operator_actions` table
- `cameras` table
- `metrics_aggregated` table
- `system_alerts` table
- `recommendations` table

## 🔧 Utility Scripts

### Seed Test Data
```bash
python scripts/seed_data.py
```

### Generate Detections
```bash
python scripts/generate_detections.py --video path/to/video.mp4
```

### Test Model Integration
```bash
python test_model_integration.py
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t vehicle-flow-backend .
```

### Run Container
```bash
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name backend \
  vehicle-flow-backend
```

### Using Docker Compose
```bash
cd ..
docker-compose up backend
```

## 📝 Logging

Logs are configured in `main.py`:
- **Level**: INFO
- **Format**: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`
- **Output**: Console

## 🔐 Security

- API key authentication via `X-API-Key` header
- CORS configuration for allowed origins
- PostgreSQL connection pooling with SSL support
- Redis connection security

## ⚡ Performance Optimization

- **Redis Caching**: Frequent metrics cached for 60 seconds
- **Database Indexing**: Optimized indexes on common query fields
- **Connection Pooling**: SQLAlchemy pool_size=10, max_overflow=20
- **Batch Processing**: Event ingestion supports batch operations
- **Async Operations**: WebSocket and background tasks use asyncio

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
python tests/test_database_connection.py
```

### Model Loading Errors
- Ensure model files exist in correct paths
- Check CUDA availability: `torch.cuda.is_available()`
- Verify model file integrity

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping
```

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

## 📚 Dependencies

Key packages:
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlalchemy** - ORM
- **psycopg2-binary** - PostgreSQL adapter
- **redis** - Redis client
- **ultralytics** - YOLOv8
- **opencv-python** - Computer vision
- **torch** - Deep learning framework
- **numpy** - Numerical computing
- **pydantic** - Data validation

Full list in `requirements.txt`

## 🔄 API Versioning

Current API version: **v1**

Base path: `/api/v1/`

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

---

**For frontend integration, see [Frontend README](../frontend/README.md)**
