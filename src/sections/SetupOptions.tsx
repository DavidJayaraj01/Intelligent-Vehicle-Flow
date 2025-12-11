import CodeBlock from '../components/CodeBlock';

export default function SetupOptions() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Setup Options</h1>
      <p className="text-slate-600 mb-8">
        Multiple deployment strategies for different use cases
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Option 1: Docker Compose (Recommended)</h2>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 p-6 mb-4">
          <p className="text-slate-700 mb-3">
            <strong>Best for:</strong> Production deployments, teams, and quick setup
          </p>
          <p className="text-slate-600 text-sm">
            Complete stack with all services containerized, orchestrated, and ready to scale.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Prerequisites</h3>
        <ul className="list-disc list-inside text-slate-700 mb-4 space-y-1">
          <li>Docker 24.0+</li>
          <li>Docker Compose 2.23+</li>
          <li>8GB RAM minimum</li>
          <li>NVIDIA GPU (optional, for enhanced performance)</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Setup Steps</h3>
        <CodeBlock
          code={`# 1. Clone repository
git clone https://github.com/your-org/vehicle-flow-analyzer.git
cd vehicle-flow-analyzer

# 2. Configure environment
cp .env.example .env

# 3. Build and start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend python scripts/init_db.py

# 5. Check service health
docker-compose ps`}
          language="bash"
        />

        <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-6">Docker Compose Configuration</h3>
        <CodeBlock
          code={`version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/vehicle_flow
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./weights:/app/weights
      - ./uploads:/app/uploads
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000

  db:
    image: postgres:15.4
    environment:
      - POSTGRES_DB=vehicle_flow
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:`}
          language="yaml"
        />

        <div className="bg-green-50 border-l-4 border-green-600 p-4 mt-4">
          <p className="text-green-900 text-sm font-semibold mb-1">Advantages</p>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• Complete isolation and reproducibility</li>
            <li>• Easy scaling and load balancing</li>
            <li>• Simplified dependency management</li>
            <li>• Production-ready configuration</li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Option 2: Manual Local Development</h2>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 p-6 mb-4">
          <p className="text-slate-700 mb-3">
            <strong>Best for:</strong> Active development, debugging, and customization
          </p>
          <p className="text-slate-600 text-sm">
            Run services individually for maximum control and debugging capabilities.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Prerequisites</h3>
        <ul className="list-disc list-inside text-slate-700 mb-4 space-y-1">
          <li>Python 3.11+</li>
          <li>Node.js 18+ and npm</li>
          <li>PostgreSQL 15+</li>
          <li>Redis 7+</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Backend Setup</h3>
        <CodeBlock
          code={`cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your local database credentials

# Initialize database
python scripts/init_db.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`}
          language="bash"
        />

        <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-6">Frontend Setup</h3>
        <CodeBlock
          code={`cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev`}
          language="bash"
        />

        <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-6">Database Setup</h3>
        <CodeBlock
          code={`# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
psql postgres
CREATE DATABASE vehicle_flow_db;
CREATE USER vfa_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vehicle_flow_db TO vfa_user;

# Install Redis (macOS)
brew install redis
brew services start redis`}
          language="bash"
        />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Option 3: Production Deployment</h2>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100 p-6 mb-4">
          <p className="text-slate-700 mb-3">
            <strong>Best for:</strong> Cloud deployment with high availability and scalability
          </p>
          <p className="text-slate-600 text-sm">
            Deploy to cloud platforms with managed services and auto-scaling.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Cloud Platform Options</h3>

        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900 mb-2">AWS Deployment</h4>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• ECS/Fargate for container orchestration</li>
              <li>• RDS PostgreSQL for database</li>
              <li>• ElastiCache Redis for caching</li>
              <li>• ALB for load balancing</li>
              <li>• CloudFront for CDN</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Google Cloud Deployment</h4>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• Cloud Run for serverless containers</li>
              <li>• Cloud SQL for PostgreSQL</li>
              <li>• Memorystore for Redis</li>
              <li>• Cloud Load Balancing</li>
              <li>• Cloud CDN</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Render Deployment (Easiest)</h4>
            <ul className="text-slate-600 text-sm space-y-1">
              <li>• Native Docker support</li>
              <li>• Managed PostgreSQL</li>
              <li>• Managed Redis</li>
              <li>• Auto-scaling and SSL included</li>
              <li>• Simple dashboard and CLI</li>
            </ul>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Render Deployment Steps</h3>
        <CodeBlock
          code={`# 1. Install Render CLI
npm install -g @render/cli

# 2. Login to Render
render login

# 3. Create render.yaml in project root
# (See configuration section)

# 4. Deploy
render deploy

# 5. Set environment variables via dashboard
# Navigate to each service and add environment variables

# 6. Monitor deployment
render logs -f`}
          language="bash"
        />

        <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-6">Production Checklist</h3>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <ul className="space-y-2 text-slate-700 text-sm">
            <li className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <span>Set strong SECRET_KEY in environment variables</span>
            </li>
            <li className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <span>Configure database backups and replication</span>
            </li>
            <li className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <span>Enable SSL/TLS certificates</span>
            </li>
            <li className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <span>Set up monitoring and alerting</span>
            </li>
            <li className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <span>Configure CDN for static assets</span>
            </li>
            <li className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <span>Implement rate limiting and DDoS protection</span>
            </li>
            <li className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <span>Set up CI/CD pipeline</span>
            </li>
            <li className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <span>Configure logging aggregation</span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Comparison Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Feature</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Docker Compose</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Manual Local</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Production Cloud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              <tr>
                <td className="px-4 py-3 text-slate-700">Setup Time</td>
                <td className="px-4 py-3 text-center text-green-600">5-10 min</td>
                <td className="px-4 py-3 text-center text-amber-600">30-60 min</td>
                <td className="px-4 py-3 text-center text-amber-600">1-2 hours</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Isolation</td>
                <td className="px-4 py-3 text-center text-green-600">Excellent</td>
                <td className="px-4 py-3 text-center text-slate-500">None</td>
                <td className="px-4 py-3 text-center text-green-600">Excellent</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Debugging</td>
                <td className="px-4 py-3 text-center text-slate-500">Moderate</td>
                <td className="px-4 py-3 text-center text-green-600">Easy</td>
                <td className="px-4 py-3 text-center text-slate-500">Moderate</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Scalability</td>
                <td className="px-4 py-3 text-center text-amber-600">Limited</td>
                <td className="px-4 py-3 text-center text-red-600">None</td>
                <td className="px-4 py-3 text-center text-green-600">Excellent</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Cost</td>
                <td className="px-4 py-3 text-center text-green-600">Free</td>
                <td className="px-4 py-3 text-center text-green-600">Free</td>
                <td className="px-4 py-3 text-center text-amber-600">$$-$$$</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Production Ready</td>
                <td className="px-4 py-3 text-center text-amber-600">Partial</td>
                <td className="px-4 py-3 text-center text-red-600">No</td>
                <td className="px-4 py-3 text-center text-green-600">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
