import { Rocket, Download, Database, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

export default function QuickStart() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
          <Rocket className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700">Quick Start Guide</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          Get Started in <span className="gradient-text">Minutes</span>
        </h1>
        <p className="text-lg text-slate-600">
          Follow these simple steps to set up and run the Vehicle Flow Analyzer platform
        </p>
      </div>

      {/* Prerequisites */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 rounded-r-xl shadow-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-2">Prerequisites</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white rounded-full text-sm text-blue-800">Docker</span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-blue-800">Docker Compose</span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-blue-800">Git</span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-blue-800">Python 3.11+</span>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-blue-800">Node.js 18+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1 */}
      <section className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
            <h2 className="text-2xl font-bold text-white">Clone the Repository</h2>
          </div>
        </div>
        <div className="p-6">
          <CodeBlock
            code={`git clone https://github.com/your-org/vehicle-flow-analyzer.git
cd vehicle-flow-analyzer`}
            language="bash"
          />
        </div>
      </section>

      {/* Step 2 */}
      <section className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold">2</div>
            <h2 className="text-2xl font-bold text-white">Environment Configuration</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Backend Environment
            </h3>
            <CodeBlock
              code={`cd backend
cp .env.example .env`}
              language="bash"
            />
            <p className="text-slate-700 mb-4 mt-4">Edit <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">backend/.env</code>:</p>
            <CodeBlock
              code={`# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vehicle_flow_db
REDIS_URL=redis://localhost:6379/0

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-secret-key-here

# Model Configuration
YOLO_MODEL_PATH=./weights/yolov8n.pt
CONFIDENCE_THRESHOLD=0.5

# Redis Cache
CACHE_TTL=300`}
              language="env"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
              Frontend Environment
            </h3>
            <CodeBlock
              code={`cd ../frontend
cp .env.example .env`}
              language="bash"
            />
            <p className="text-slate-700 mb-4 mt-4">Edit <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">frontend/.env</code>:</p>
            <CodeBlock
              code={`VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_TITLE=Vehicle Flow Analyzer`}
              language="env"
            />
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 font-bold">3</div>
            <h2 className="text-2xl font-bold text-white">Docker Setup (Recommended)</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-700 mb-4">
            The easiest way to run the entire stack:
          </p>
          <CodeBlock
            code={`# From the project root
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f`}
            language="bash"
          />
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-4 mt-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-900 text-sm">
                This will start all services: Backend API, Frontend, PostgreSQL, Redis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4 */}
      <section className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold">4</div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Download Model Weights
              <Download className="w-5 h-5" />
            </h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-700 mb-4">
            Download the pre-trained YOLOv8 model weights:
          </p>
          <CodeBlock
            code={`cd weights
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt

# Or download custom trained models
# wget https://your-storage-url/custom-yolov8.pt`}
            language="bash"
          />
        </div>
      </section>

      {/* Step 5 */}
      <section className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold">5</div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Initialize Database
              <Database className="w-5 h-5" />
            </h2>
          </div>
        </div>
        <div className="p-6">
          <CodeBlock
            code={`# Run database migrations
cd backend
python scripts/init_db.py

# Seed sample data (optional)
python scripts/seed_data.py`}
            language="bash"
          />
        </div>
      </section>

      {/* Access URLs */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Play className="w-6 h-6 text-blue-600" />
          Access the Application
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-slate-200 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-slate-900 mb-1">Web Dashboard</p>
            <p className="text-slate-600 text-sm mb-3">Main application interface</p>
            <p className="text-blue-600 text-sm font-mono break-all">localhost:5173</p>
          </a>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-slate-200 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-slate-900 mb-1">API Documentation</p>
            <p className="text-slate-600 text-sm mb-3">Interactive Swagger UI</p>
            <p className="text-purple-600 text-sm font-mono break-all">localhost:8000/docs</p>
          </a>

          <a
            href="http://localhost:8000/health"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-slate-200 group sm:col-span-2 lg:col-span-1"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-slate-900 mb-1">Health Check</p>
            <p className="text-slate-600 text-sm mb-3">Server status endpoint</p>
            <p className="text-green-600 text-sm font-mono break-all">localhost:8000/health</p>
          </a>
        </div>
      </section>

      {/* Success Message */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-bold mb-2">Success!</p>
            <p className="text-green-50">
              Your Vehicle Flow Analyzer platform is now running. Access the dashboard to start monitoring traffic and analyzing vehicle flow patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
