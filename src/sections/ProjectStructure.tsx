import CodeBlock from '../components/CodeBlock';

export default function ProjectStructure() {
  const projectTree = `vehicle-flow-analyzer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── detect.py   # Detection endpoints
│   │   │   │   │   ├── queue.py    # Queue analysis endpoints
│   │   │   │   │   ├── emergency.py # Emergency detection
│   │   │   │   │   ├── analytics.py # Analytics endpoints
│   │   │   │   │   └── alerts.py   # Alert management
│   │   │   │   └── router.py
│   │   │   └── websocket.py        # WebSocket handlers
│   │   ├── core/
│   │   │   ├── config.py           # Configuration management
│   │   │   ├── security.py         # Authentication & security
│   │   │   └── logging.py          # Logging configuration
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── vehicle.py          # Vehicle data models
│   │   │   ├── queue.py            # Queue metrics models
│   │   │   └── alert.py            # Alert models
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── detection.py        # Detection request/response schemas
│   │   │   ├── queue.py            # Queue analysis schemas
│   │   │   └── alert.py            # Alert schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── detection.py        # YOLO detection service
│   │   │   ├── tracking.py         # Vehicle tracking service
│   │   │   ├── queue_analyzer.py   # Queue analysis logic
│   │   │   ├── emergency.py        # Emergency vehicle detection
│   │   │   ├── accident.py         # Accident detection
│   │   │   └── preprocessing.py    # Image preprocessing
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── session.py          # Database session management
│   │   │   ├── base.py             # SQLAlchemy base
│   │   │   └── repositories/       # Data access layer
│   │   └── utils/
│   │       ├── video.py            # Video processing utilities
│   │       ├── image.py            # Image processing utilities
│   │       └── metrics.py          # Metrics calculation
│   ├── scripts/
│   │   ├── init_db.py              # Database initialization
│   │   ├── seed_data.py            # Sample data seeding
│   │   └── train_model.py          # Model training scripts
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   ├── test_detection.py
│   │   └── test_queue.py
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── MetricsCard.tsx
│   │   │   │   ├── CameraFeed.tsx
│   │   │   │   └── QueueChart.tsx
│   │   │   ├── Alerts/
│   │   │   │   ├── AlertList.tsx
│   │   │   │   └── AlertModal.tsx
│   │   │   ├── Analytics/
│   │   │   │   ├── TrafficChart.tsx
│   │   │   │   └── ReportGenerator.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Cameras.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts     # WebSocket hook
│   │   │   ├── useMetrics.ts       # Metrics data hook
│   │   │   └── useAlerts.ts        # Alerts hook
│   │   ├── services/
│   │   │   ├── api.ts              # API client
│   │   │   └── websocket.ts        # WebSocket client
│   │   ├── utils/
│   │   │   ├── formatters.ts       # Data formatting
│   │   │   └── validators.ts       # Input validation
│   │   ├── types/
│   │   │   ├── vehicle.ts
│   │   │   ├── metrics.ts
│   │   │   └── alert.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_indexes.sql
│   │   └── 003_add_alerts.sql
│   └── init.sql                    # Database initialization
│
├── weights/
│   ├── yolov8n.pt                  # YOLOv8 nano model
│   ├── yolov8s.pt                  # YOLOv8 small model
│   ├── efficientnet_emergency.pth  # Emergency vehicle classifier
│   └── accident_detection.pth      # Accident detection model
│
├── EfficientNet/
│   ├── model.py                    # EfficientNet architecture
│   ├── train.py                    # Training script
│   └── inference.py                # Inference utilities
│
├── TPHYolov5/
│   ├── models/
│   ├── utils/
│   └── detect.py                   # TPH-YOLOv5 detection
│
├── uploads/                        # User uploaded videos
├── outputs/                        # Processed videos with annotations
├── logs/                           # Application logs
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── LICENSE`;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Structure</h1>
      <p className="text-slate-600 mb-8">
        Complete directory structure and file organization
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Directory Tree</h2>
        <CodeBlock code={projectTree} language="tree" />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Backend Structure</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">backend/app/api/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              Contains all API route handlers and endpoints. Organized by API version (v1, v2) for
              backward compatibility.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• <strong>endpoints/</strong> - Individual endpoint handlers for each feature</li>
              <li>• <strong>websocket.py</strong> - Real-time WebSocket connections</li>
              <li>• <strong>router.py</strong> - Main API router configuration</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">backend/app/services/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              Core business logic and AI services. Each service is responsible for a specific
              domain of functionality.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• <strong>detection.py</strong> - YOLOv8 inference and vehicle detection</li>
              <li>• <strong>tracking.py</strong> - Multi-object tracking with DeepSORT</li>
              <li>• <strong>queue_analyzer.py</strong> - Queue metrics calculation</li>
              <li>• <strong>emergency.py</strong> - Emergency vehicle classification</li>
              <li>• <strong>preprocessing.py</strong> - Image enhancement pipeline</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">backend/app/models/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              SQLAlchemy ORM models representing database tables and relationships.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• <strong>vehicle.py</strong> - Vehicle records and tracking history</li>
              <li>• <strong>queue.py</strong> - Queue metrics and lane statistics</li>
              <li>• <strong>alert.py</strong> - Alert records and notifications</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">backend/app/schemas/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              Pydantic schemas for request/response validation and serialization.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• Request validation and type checking</li>
              <li>• Response serialization and formatting</li>
              <li>• API documentation generation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Frontend Structure</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">frontend/src/components/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              Reusable React components organized by feature and functionality.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• <strong>Dashboard/</strong> - Real-time monitoring components</li>
              <li>• <strong>Alerts/</strong> - Alert display and management UI</li>
              <li>• <strong>Analytics/</strong> - Charts and data visualization</li>
              <li>• <strong>common/</strong> - Shared UI components</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">frontend/src/hooks/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              Custom React hooks for state management and side effects.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• <strong>useWebSocket.ts</strong> - WebSocket connection management</li>
              <li>• <strong>useMetrics.ts</strong> - Real-time metrics data</li>
              <li>• <strong>useAlerts.ts</strong> - Alert subscription and handling</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">frontend/src/services/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              API and WebSocket client implementations for backend communication.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• <strong>api.ts</strong> - REST API client with Axios</li>
              <li>• <strong>websocket.ts</strong> - WebSocket client wrapper</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Model Directories</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">weights/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              Pre-trained model weights for all AI components. Models should be downloaded
              separately and placed in this directory.
            </p>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• <strong>yolov8n.pt</strong> - Lightweight model for edge deployment (~6MB)</li>
              <li>• <strong>yolov8s.pt</strong> - Balanced accuracy/speed model (~22MB)</li>
              <li>• <strong>efficientnet_emergency.pth</strong> - Emergency vehicle classifier</li>
              <li>• <strong>accident_detection.pth</strong> - Accident detection CNN</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">EfficientNet/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              EfficientNet model architecture and training code for emergency vehicle classification.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">TPHYolov5/</code>
            </h3>
            <p className="text-slate-700 mb-3">
              TPH-YOLOv5 implementation for detecting small vehicles and pedestrians in crowded scenes.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Directories</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">uploads/</code>
            </h3>
            <p className="text-slate-700">
              User-uploaded video files waiting for processing. Files are automatically moved to
              outputs/ after processing completes.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">outputs/</code>
            </h3>
            <p className="text-slate-700">
              Processed videos with annotated bounding boxes, tracking IDs, and detection metadata.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">logs/</code>
            </h3>
            <p className="text-slate-700">
              Application logs, error traces, and performance metrics. Logs are automatically
              rotated based on size and retention policies.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Configuration Files</h2>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-900">File</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-900">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-6 py-4 font-mono text-slate-900">docker-compose.yml</td>
                <td className="px-6 py-4 text-slate-600">Multi-container orchestration</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-slate-900">.env.example</td>
                <td className="px-6 py-4 text-slate-600">Environment variable template</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-slate-900">requirements.txt</td>
                <td className="px-6 py-4 text-slate-600">Python dependencies</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-slate-900">package.json</td>
                <td className="px-6 py-4 text-slate-600">Node.js dependencies</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-slate-900">tsconfig.json</td>
                <td className="px-6 py-4 text-slate-600">TypeScript configuration</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-slate-900">vite.config.ts</td>
                <td className="px-6 py-4 text-slate-600">Vite build configuration</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
