import CodeBlock from '../components/CodeBlock';

export default function Configuration() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Configuration</h1>
      <p className="text-slate-600 mb-8">
        Complete configuration reference for all environment variables and settings
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Backend Environment Variables</h2>
        <p className="text-slate-700 mb-4">
          Configure <code className="bg-slate-100 px-2 py-1 rounded text-sm">backend/.env</code>
        </p>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Database Configuration</h3>
            <CodeBlock
              code={`# PostgreSQL Connection
DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_flow_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
DATABASE_ECHO=false

# Redis Connection
REDIS_URL=redis://localhost:6379/0
REDIS_MAX_CONNECTIONS=50`}
              language="env"
            />
            <div className="mt-3 text-sm text-slate-600">
              <p className="mb-2"><strong>DATABASE_URL:</strong> PostgreSQL connection string</p>
              <p className="mb-2"><strong>DATABASE_POOL_SIZE:</strong> Connection pool size (default: 20)</p>
              <p className="mb-2"><strong>REDIS_URL:</strong> Redis connection string for caching</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">API Server Configuration</h3>
            <CodeBlock
              code={`# Server Settings
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
RELOAD=true

# Security
SECRET_KEY=your-super-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
CORS_ORIGINS=["http://localhost:5173", "https://yourdomain.com"]
CORS_ALLOW_CREDENTIALS=true`}
              language="env"
            />
            <div className="mt-3 text-sm text-slate-600">
              <p className="mb-2"><strong>API_HOST:</strong> Server bind address (0.0.0.0 for all interfaces)</p>
              <p className="mb-2"><strong>API_WORKERS:</strong> Number of Uvicorn worker processes</p>
              <p className="mb-2"><strong>SECRET_KEY:</strong> JWT signing key (must be kept secret)</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Model Configuration</h3>
            <CodeBlock
              code={`# YOLO Model Settings
YOLO_MODEL_PATH=./weights/yolov8n.pt
YOLO_CONFIDENCE=0.5
YOLO_IOU_THRESHOLD=0.45
YOLO_DEVICE=cuda  # or 'cpu'

# Model Performance
BATCH_SIZE=16
MAX_DET=300
HALF_PRECISION=true  # FP16 for GPU acceleration

# Emergency Vehicle Detection
EMERGENCY_MODEL_PATH=./weights/efficientnet_emergency.pth
EMERGENCY_CONFIDENCE=0.7

# Accident Detection
ACCIDENT_MODEL_PATH=./weights/accident_detection.pth
ACCIDENT_THRESHOLD=0.6`}
              language="env"
            />
            <div className="mt-3 text-sm text-slate-600">
              <p className="mb-2"><strong>YOLO_MODEL_PATH:</strong> Path to YOLOv8 model weights</p>
              <p className="mb-2"><strong>YOLO_CONFIDENCE:</strong> Detection confidence threshold (0.0-1.0)</p>
              <p className="mb-2"><strong>YOLO_DEVICE:</strong> Inference device (cuda/cpu)</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Video Processing</h3>
            <CodeBlock
              code={`# Frame Processing
TARGET_FPS=30
FRAME_SKIP=0  # Process every Nth frame (0 = no skip)
FRAME_BUFFER_SIZE=100

# Image Preprocessing
ENABLE_DEGLARE=true
ENABLE_DENOISE=true
ENABLE_GAMMA_CORRECTION=true
GAMMA_VALUE=1.2

# Night Mode Enhancement
NIGHT_MODE_AUTO=true
NIGHT_MODE_THRESHOLD=50  # Brightness threshold
CLAHE_CLIP_LIMIT=2.0
CLAHE_TILE_SIZE=8`}
              language="env"
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Analytics & Caching</h3>
            <CodeBlock
              code={`# Queue Analysis
QUEUE_TIME_WINDOW=300  # seconds
MIN_QUEUE_LENGTH=3
QUEUE_UPDATE_INTERVAL=5  # seconds

# Caching
CACHE_TTL=300  # seconds
CACHE_ENABLED=true

# Metrics
METRICS_RETENTION_DAYS=90
ENABLE_REAL_TIME_METRICS=true
METRICS_BROADCAST_INTERVAL=1  # seconds`}
              language="env"
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Logging & Monitoring</h3>
            <CodeBlock
              code={`# Logging
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FORMAT=json
LOG_FILE=./logs/app.log
LOG_ROTATION=10MB
LOG_RETENTION=30  # days

# Monitoring
ENABLE_METRICS=true
PROMETHEUS_PORT=9090
HEALTH_CHECK_INTERVAL=30  # seconds`}
              language="env"
            />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Frontend Environment Variables</h2>
        <p className="text-slate-700 mb-4">
          Configure <code className="bg-slate-100 px-2 py-1 rounded text-sm">frontend/.env</code>
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <CodeBlock
            code={`# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws

# Application Settings
VITE_APP_TITLE=Vehicle Flow Analyzer
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true

# Map Configuration (if using maps)
VITE_MAPBOX_TOKEN=your-mapbox-token-here

# Performance
VITE_WS_RECONNECT_INTERVAL=3000  # milliseconds
VITE_API_TIMEOUT=30000  # milliseconds
VITE_POLLING_INTERVAL=5000  # milliseconds (fallback if WS fails)`}
            language="env"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Docker Configuration</h2>
        <p className="text-slate-700 mb-4">
          Configure <code className="bg-slate-100 px-2 py-1 rounded text-sm">docker-compose.yml</code>
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <CodeBlock
            code={`version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://\${DB_USER}:\${DB_PASSWORD}@db:5432/\${DB_NAME}
      REDIS_URL: redis://redis:6379/0
    volumes:
      - ./weights:/app/weights
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000

  db:
    image: postgres:15.4-alpine
    environment:
      POSTGRES_DB: \${DB_NAME}
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.2-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:`}
            language="yaml"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Production Configuration Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Security</h3>
            <ul className="space-y-2 text-green-800 text-sm">
              <li>• Use strong, randomly generated SECRET_KEY</li>
              <li>• Enable HTTPS/TLS in production</li>
              <li>• Restrict CORS origins to trusted domains</li>
              <li>• Use environment-specific credentials</li>
              <li>• Enable database connection encryption</li>
              <li>• Implement rate limiting</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Performance</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Enable GPU acceleration (CUDA)</li>
              <li>• Use FP16 half-precision inference</li>
              <li>• Configure appropriate worker count</li>
              <li>• Set optimal database pool size</li>
              <li>• Enable Redis caching</li>
              <li>• Configure CDN for static assets</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">Reliability</h3>
            <ul className="space-y-2 text-amber-800 text-sm">
              <li>• Set up database backups</li>
              <li>• Configure health check endpoints</li>
              <li>• Enable logging and monitoring</li>
              <li>• Set resource limits in Docker</li>
              <li>• Implement automatic restarts</li>
              <li>• Use managed cloud services</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">Scalability</h3>
            <ul className="space-y-2 text-purple-800 text-sm">
              <li>• Use horizontal scaling for workers</li>
              <li>• Implement load balancing</li>
              <li>• Configure auto-scaling policies</li>
              <li>• Use message queues for async tasks</li>
              <li>• Optimize database queries</li>
              <li>• Implement caching strategies</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
