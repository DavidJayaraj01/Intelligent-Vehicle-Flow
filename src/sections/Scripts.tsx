import CodeBlock from '../components/CodeBlock';

export default function Scripts() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Scripts</h1>
      <p className="text-slate-600 mb-8">
        Utility scripts for setup, maintenance, and data management
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Database Scripts</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/init_db.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Initialize database schema and create all necessary tables.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`cd backend
python scripts/init_db.py

# With custom database URL
python scripts/init_db.py --db-url postgresql://user:pass@localhost/dbname

# Force reset (drops all tables)
python scripts/init_db.py --reset`}
            language="bash"
          />

          <div className="bg-amber-50 border-l-4 border-amber-600 p-4 mt-4">
            <p className="text-amber-900 text-sm">
              <strong>Warning:</strong> Using --reset will delete all existing data
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/seed_data.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Populate database with sample data for testing and development.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`python scripts/seed_data.py

# Seed specific data types
python scripts/seed_data.py --vehicles --cameras --lanes

# Custom number of records
python scripts/seed_data.py --vehicles 1000 --cameras 10`}
            language="bash"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Generated Data</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• 100 sample vehicle records with tracking IDs</li>
            <li>• 5 camera configurations</li>
            <li>• 15 lane definitions</li>
            <li>• 50 historical queue metrics</li>
            <li>• 20 sample alerts</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/migrate_db.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Run database migrations to update schema.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`# Run all pending migrations
python scripts/migrate_db.py

# Run specific migration
python scripts/migrate_db.py --version 003

# Rollback last migration
python scripts/migrate_db.py --rollback`}
            language="bash"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Model & Training Scripts</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/train_model.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Train custom YOLOv8 model on your dataset.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`# Train with default settings
python scripts/train_model.py --data ./data/vehicles.yaml

# Custom training parameters
python scripts/train_model.py \\
  --data ./data/vehicles.yaml \\
  --epochs 100 \\
  --batch 16 \\
  --img 640 \\
  --model yolov8s.pt \\
  --device cuda:0

# Resume training
python scripts/train_model.py --resume ./runs/train/exp/weights/last.pt`}
            language="bash"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Training Parameters</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Parameter</th>
                  <th className="px-4 py-2 text-left font-semibold">Description</th>
                  <th className="px-4 py-2 text-left font-semibold">Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-2 font-mono">--epochs</td>
                  <td className="px-4 py-2 text-slate-600">Number of training epochs</td>
                  <td className="px-4 py-2 text-slate-600">100</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">--batch</td>
                  <td className="px-4 py-2 text-slate-600">Batch size</td>
                  <td className="px-4 py-2 text-slate-600">16</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">--img</td>
                  <td className="px-4 py-2 text-slate-600">Image size (pixels)</td>
                  <td className="px-4 py-2 text-slate-600">640</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">--device</td>
                  <td className="px-4 py-2 text-slate-600">Training device</td>
                  <td className="px-4 py-2 text-slate-600">cuda:0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/download_weights.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Download pre-trained model weights.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`# Download all models
python scripts/download_weights.py

# Download specific model
python scripts/download_weights.py --model yolov8n

# Available models:
# - yolov8n (nano, ~6MB)
# - yolov8s (small, ~22MB)
# - yolov8m (medium, ~50MB)
# - efficientnet (emergency vehicle classifier)
# - accident-detection`}
            language="bash"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/evaluate_model.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Evaluate model performance on test dataset.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`python scripts/evaluate_model.py \\
  --model ./weights/yolov8n.pt \\
  --data ./data/test/ \\
  --output ./evaluation_results.json`}
            language="bash"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Processing Scripts</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/process_video.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Process video file with detection and tracking.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`# Basic processing
python scripts/process_video.py --input video.mp4

# With custom settings
python scripts/process_video.py \\
  --input video.mp4 \\
  --output annotated_video.mp4 \\
  --model ./weights/yolov8s.pt \\
  --confidence 0.6 \\
  --save-frames \\
  --enable-tracking

# Process multiple videos
python scripts/process_video.py --input-dir ./videos/ --output-dir ./processed/`}
            language="bash"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/extract_frames.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Extract frames from video for training data preparation.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`python scripts/extract_frames.py \\
  --video ./data/videos/traffic.mp4 \\
  --output ./data/frames/ \\
  --fps 5 \\
  --quality 95`}
            language="bash"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/preprocess_images.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Apply preprocessing (deglare, denoise, gamma correction) to images.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`python scripts/preprocess_images.py \\
  --input ./raw_images/ \\
  --output ./processed_images/ \\
  --deglare \\
  --denoise \\
  --gamma 1.2`}
            language="bash"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Maintenance Scripts</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/cleanup.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Clean up old files and logs.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`# Remove files older than 30 days
python scripts/cleanup.py --days 30

# Clean specific directories
python scripts/cleanup.py --uploads --outputs --logs

# Dry run (show what would be deleted)
python scripts/cleanup.py --days 30 --dry-run`}
            language="bash"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/backup_db.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Create database backup.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`# Create backup
python scripts/backup_db.py --output ./backups/

# Restore from backup
python scripts/backup_db.py --restore ./backups/backup_20241211.sql`}
            language="bash"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">scripts/health_check.py</code>
          </h3>
          <p className="text-slate-700 mb-4">
            Check system health and component status.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2">Usage</h4>
          <CodeBlock
            code={`python scripts/health_check.py

# Output example:
# ✓ Database: Connected
# ✓ Redis: Connected
# ✓ API Server: Running (http://localhost:8000)
# ✓ Model Weights: Found (yolov8n.pt, efficientnet_emergency.pth)
# ✓ Disk Space: 45.2 GB available
# ✗ GPU: CUDA not available`}
            language="bash"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">NPM Scripts (Frontend)</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h4 className="font-semibold text-slate-900 mb-3">Available Commands</h4>
          <CodeBlock
            code={`# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Generate API client from OpenAPI spec
npm run generate-api`}
            language="bash"
          />
        </div>
      </section>
    </div>
  );
}
