import { Layers, Database, Zap, Cloud, Network, Server } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

export default function Architecture() {
  const systemArchitecture = `┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │   Mobile     │  │   Admin      │     │
│  │   (React)    │  │   Client     │  │   Dashboard  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (FastAPI)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐    ┌────────▼────────┐   ┌──────▼──────┐
│   Video      │    │   Analytics     │   │   Alert     │
│   Processing │    │   Engine        │   │   System    │
│   Service    │    └────────┬────────┘   └──────┬──────┘
└───────┬──────┘             │                   │
        │                    │                   │
┌───────▼──────┐    ┌────────▼────────┐   ┌──────▼──────┐
│   YOLOv8     │    │   PostgreSQL    │   │   Redis     │
│   Inference  │    │   Database      │   │   Cache     │
└───────┬──────┘    └─────────────────┘   └─────────────┘
        │
┌───────▼──────┐
│   WebSocket  │
│   Streaming  │
└──────────────┘`;

  const dataFlowDiagram = `Camera Feed → Preprocessor → YOLOv8 Detector → Tracker → Analytics
                    │              │              │           │
                    ├─ Deglare     ├─ Detection   ├─ ID      ├─ Queue Analysis
                    ├─ Denoise     ├─ Bounding    ├─ Track   ├─ Emergency Check
                    ├─ Gamma Fix   └─ Box         └─ State   ├─ Accident Detect
                    └─ Enhance                                └─ Metrics Compute
                                                                    │
                                                                    ▼
                                                            WebSocket → Client`;

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
          <Layers className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">System Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          Technical <span className="gradient-text">Architecture</span>
        </h1>
        <p className="text-lg text-slate-600">
          Comprehensive system architecture and technical design overview
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">System Overview</h2>
        <p className="text-slate-700 mb-4">
          The Vehicle Flow Analyzer is built on a modern microservices architecture with clear separation
          of concerns. The system consists of multiple specialized services that communicate through
          well-defined APIs and message queues.
        </p>
        <CodeBlock code={systemArchitecture} language="architecture" />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Backend Architecture</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Core Components</h3>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-slate-900 mb-1">FastAPI Application Server</h4>
              <p className="text-slate-600 text-sm mb-2">
                High-performance async API server handling HTTP requests, WebSocket connections,
                and orchestrating backend services.
              </p>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• RESTful API endpoints for all operations</li>
                <li>• WebSocket server for real-time metrics streaming</li>
                <li>• Request validation and error handling</li>
                <li>• API documentation with Swagger/OpenAPI</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-slate-900 mb-1">Video Processing Pipeline</h4>
              <p className="text-slate-600 text-sm mb-2">
                Multi-stage video processing pipeline with frame extraction, preprocessing,
                and inference optimization.
              </p>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• Frame extraction from live streams and video files</li>
                <li>• Advanced preprocessing (deglare, denoise, gamma correction)</li>
                <li>• Batch processing for optimal GPU utilization</li>
                <li>• Frame rate adaptation based on system load</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-slate-900 mb-1">YOLOv8 Detection Engine</h4>
              <p className="text-slate-600 text-sm mb-2">
                State-of-the-art object detection using YOLOv8 with custom training for vehicle
                classification and tracking.
              </p>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• Real-time vehicle detection with 95%+ accuracy</li>
                <li>• Multi-class vehicle classification</li>
                <li>• Model optimization for edge deployment</li>
                <li>• GPU acceleration support (CUDA/TensorRT)</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-slate-900 mb-1">Analytics & Intelligence Engine</h4>
              <p className="text-slate-600 text-sm mb-2">
                Advanced analytics engine processing detection data to generate insights,
                predictions, and alerts.
              </p>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• Queue time calculation and analysis</li>
                <li>• Emergency vehicle detection algorithms</li>
                <li>• Accident detection logic</li>
                <li>• Traffic pattern recognition and forecasting</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Data Flow Pipeline</h3>
        <CodeBlock code={dataFlowDiagram} language="pipeline" />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Frontend Architecture</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-700 mb-4">
            Modern React 19 application with TypeScript, leveraging the latest web technologies
            for a responsive and performant user experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Component Architecture</h4>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• Functional components with React Hooks</li>
                <li>• Context API for global state management</li>
                <li>• Custom hooks for business logic</li>
                <li>• Lazy loading and code splitting</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Data Management</h4>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• WebSocket client for real-time updates</li>
                <li>• RESTful API integration</li>
                <li>• Optimistic UI updates</li>
                <li>• Client-side caching strategies</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded p-4">
              <h4 className="font-semibold text-slate-900 mb-2">UI/UX Design</h4>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• Material-UI component library</li>
                <li>• Tailwind CSS for custom styling</li>
                <li>• Responsive design patterns</li>
                <li>• Accessibility compliance (WCAG 2.1)</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Performance</h4>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• Vite for lightning-fast builds</li>
                <li>• Virtual scrolling for large lists</li>
                <li>• Memoization and render optimization</li>
                <li>• Progressive Web App (PWA) support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Database Architecture</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">PostgreSQL Data Model</h3>
            <p className="text-slate-700 mb-4">
              Relational database schema optimized for time-series data and analytics queries.
            </p>
            <div className="bg-slate-50 rounded p-4 text-sm font-mono text-slate-700">
              <div className="mb-3">
                <strong>vehicles</strong>
                <br />
                ├─ id (UUID, PK)
                <br />
                ├─ tracking_id (VARCHAR)
                <br />
                ├─ vehicle_type (VARCHAR)
                <br />
                ├─ camera_id (VARCHAR)
                <br />
                ├─ first_seen (TIMESTAMP)
                <br />
                └─ last_seen (TIMESTAMP)
              </div>
              <div className="mb-3">
                <strong>queue_metrics</strong>
                <br />
                ├─ id (UUID, PK)
                <br />
                ├─ lane_id (VARCHAR)
                <br />
                ├─ queue_length (INTEGER)
                <br />
                ├─ avg_wait_time (FLOAT)
                <br />
                ├─ timestamp (TIMESTAMP)
                <br />
                └─ camera_id (VARCHAR)
              </div>
              <div>
                <strong>alerts</strong>
                <br />
                ├─ id (UUID, PK)
                <br />
                ├─ alert_type (VARCHAR)
                <br />
                ├─ severity (VARCHAR)
                <br />
                ├─ description (TEXT)
                <br />
                ├─ vehicle_id (UUID, FK)
                <br />
                └─ created_at (TIMESTAMP)
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Redis Caching Layer</h3>
            <p className="text-slate-700 mb-3">
              High-performance caching for real-time metrics and session management.
            </p>
            <ul className="text-slate-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Real-time metrics cache with 5-second TTL</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Active vehicle tracking data</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>WebSocket connection state management</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Rate limiting and API throttling</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Real-time Event Streaming</h2>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 p-6">
          <p className="text-slate-700 mb-4">
            WebSocket-based real-time communication for sub-second latency dashboard updates
            and instant alert delivery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Event Types</h4>
              <ul className="text-slate-600 space-y-1">
                <li>• Vehicle detection events</li>
                <li>• Queue metric updates</li>
                <li>• Emergency vehicle alerts</li>
                <li>• Accident notifications</li>
                <li>• System health status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Performance Metrics</h4>
              <ul className="text-slate-600 space-y-1">
                <li>• Average latency: 50ms</li>
                <li>• Message throughput: 10K/sec</li>
                <li>• Connection concurrency: 1000+</li>
                <li>• Automatic reconnection</li>
                <li>• Message ordering guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Multi-Camera Pipeline</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-slate-700 mb-4">
            Scalable architecture supporting simultaneous processing of multiple camera feeds
            with intelligent resource allocation and load balancing.
          </p>
          <ul className="text-slate-700 space-y-3">
            <li className="flex items-start">
              <span className="font-semibold w-40 flex-shrink-0">Camera Registration:</span>
              <span>Dynamic camera addition/removal without system restart</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold w-40 flex-shrink-0">Load Balancing:</span>
              <span>Automatic distribution of camera streams across processing nodes</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold w-40 flex-shrink-0">Failover:</span>
              <span>Automatic failover to backup streams on connection loss</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold w-40 flex-shrink-0">Synchronization:</span>
              <span>Cross-camera vehicle tracking with timestamp synchronization</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
