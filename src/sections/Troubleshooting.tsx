import CodeBlock from '../components/CodeBlock';

export default function Troubleshooting() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Troubleshooting</h1>
      <p className="text-slate-600 mb-8">
        Common issues and their solutions
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Model Loading Issues</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">YOLO Model Not Loading</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <CodeBlock
            code={`FileNotFoundError: [Errno 2] No such file or directory: './weights/yolov8n.pt'`}
            language="error"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solution</h4>
          <p className="text-slate-700 mb-3">
            Model weights are not included in the repository. Download them first:
          </p>
          <CodeBlock
            code={`# Download YOLOv8 weights
cd weights
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt

# Or use the download script
python scripts/download_weights.py`}
            language="bash"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">CUDA Out of Memory</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <CodeBlock
            code={`RuntimeError: CUDA out of memory. Tried to allocate 256.00 MiB`}
            language="error"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solutions</h4>
          <ol className="list-decimal list-inside text-slate-700 space-y-2 mb-3">
            <li>Reduce batch size in configuration</li>
            <li>Use a smaller model (yolov8n instead of yolov8m)</li>
            <li>Enable half-precision (FP16) inference</li>
            <li>Fall back to CPU inference</li>
          </ol>
          <CodeBlock
            code={`# In .env file
BATCH_SIZE=8  # Reduce from 16
HALF_PRECISION=true
# Or use CPU
YOLO_DEVICE=cpu`}
            language="env"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Model Version Mismatch</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <CodeBlock
            code={`AssertionError: Model version mismatch. Expected 8.0.x, got 7.0.x`}
            language="error"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solution</h4>
          <p className="text-slate-700 mb-3">
            Update Ultralytics package to the correct version:
          </p>
          <CodeBlock
            code={`pip install ultralytics==8.0.0 --upgrade`}
            language="bash"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Database Connection Issues</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Redis Connection Failed</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <CodeBlock
            code={`redis.exceptions.ConnectionError: Error connecting to Redis`}
            language="error"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solutions</h4>
          <ol className="list-decimal list-inside text-slate-700 space-y-2">
            <li>
              <strong>Check if Redis is running:</strong>
              <CodeBlock
                code={`# Check Redis status
redis-cli ping
# Expected: PONG

# If not running (macOS/Linux)
brew services start redis  # macOS
sudo systemctl start redis  # Linux

# Docker
docker-compose up -d redis`}
                language="bash"
              />
            </li>
            <li>
              <strong>Verify connection string in .env:</strong>
              <CodeBlock
                code={`REDIS_URL=redis://localhost:6379/0`}
                language="env"
              />
            </li>
          </ol>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">PostgreSQL Connection Refused</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <CodeBlock
            code={`psycopg2.OperationalError: could not connect to server: Connection refused`}
            language="error"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solutions</h4>
          <ol className="list-decimal list-inside text-slate-700 space-y-2">
            <li>
              <strong>Verify PostgreSQL is running:</strong>
              <CodeBlock
                code={`# Check status
pg_isready
# Expected: accepting connections

# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux`}
                language="bash"
              />
            </li>
            <li>
              <strong>Check database exists:</strong>
              <CodeBlock
                code={`psql postgres
\\l  # List databases
# If database doesn't exist:
CREATE DATABASE vehicle_flow_db;`}
                language="bash"
              />
            </li>
          </ol>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Database Migration Failed</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <CodeBlock
            code={`alembic.util.exc.CommandError: Can't locate revision identified by 'xxxxx'`}
            language="error"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solution</h4>
          <CodeBlock
            code={`# Reset migrations and reinitialize
python scripts/init_db.py --reset
python scripts/migrate_db.py`}
            language="bash"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">WebSocket Issues</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">WebSocket Not Updating</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <p className="text-slate-700 mb-3">
            Dashboard not receiving real-time updates despite WebSocket connection being established.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solutions</h4>
          <ol className="list-decimal list-inside text-slate-700 space-y-2">
            <li>
              <strong>Check WebSocket URL configuration:</strong>
              <CodeBlock
                code={`# Frontend .env
VITE_WS_URL=ws://localhost:8000/ws
# For HTTPS, use wss://
VITE_WS_URL=wss://yourdomain.com/ws`}
                language="env"
              />
            </li>
            <li>
              <strong>Verify backend is broadcasting metrics:</strong>
              <CodeBlock
                code={`# In backend .env
ENABLE_REAL_TIME_METRICS=true
METRICS_BROADCAST_INTERVAL=1`}
                language="env"
              />
            </li>
            <li>
              <strong>Check browser console for WebSocket errors</strong>
            </li>
          </ol>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">WebSocket Connection Drops</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <p className="text-slate-700 mb-3">
            WebSocket connection keeps disconnecting and reconnecting.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solutions</h4>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li>Increase WebSocket timeout in backend configuration</li>
            <li>Check network stability and firewall settings</li>
            <li>Enable WebSocket keepalive/heartbeat</li>
            <li>Check proxy/load balancer WebSocket support</li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Video Processing Issues</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Video Frame Parsing Errors</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <CodeBlock
            code={`cv2.error: OpenCV(4.8.1) error: (-215:Assertion failed) in function 'cvtColor'`}
            language="error"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solutions</h4>
          <ol className="list-decimal list-inside text-slate-700 space-y-2">
            <li>Verify video codec is supported (H.264, H.265)</li>
            <li>Re-encode video with compatible codec:
              <CodeBlock
                code={`ffmpeg -i input.mp4 -c:v libx264 -preset fast output.mp4`}
                language="bash"
              />
            </li>
            <li>Check file is not corrupted</li>
            <li>Ensure OpenCV is installed with video codecs:
              <CodeBlock
                code={`pip install opencv-python-headless==4.8.1.78`}
                language="bash"
              />
            </li>
          </ol>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Slow Video Processing</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <p className="text-slate-700 mb-3">
            Video processing taking significantly longer than video duration.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solutions</h4>
          <ul className="list-disc list-inside text-slate-700 space-y-2">
            <li>Enable GPU acceleration (CUDA)</li>
            <li>Reduce target FPS or enable frame skipping</li>
            <li>Use smaller YOLO model (yolov8n)</li>
            <li>Enable FP16 half-precision</li>
            <li>Increase batch size if GPU memory allows</li>
          </ul>
          <CodeBlock
            code={`# Optimize configuration
YOLO_DEVICE=cuda
HALF_PRECISION=true
FRAME_SKIP=2  # Process every 2nd frame
BATCH_SIZE=32`}
            language="env"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Night-time Detection Problems</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Poor Detection in Dark Conditions</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <p className="text-slate-700 mb-3">
            Vehicle detection accuracy drops significantly during night-time or low-light conditions.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solutions</h4>
          <ol className="list-decimal list-inside text-slate-700 space-y-2">
            <li>
              <strong>Enable night-time enhancements:</strong>
              <CodeBlock
                code={`# In .env
ENABLE_DEGLARE=true
ENABLE_DENOISE=true
ENABLE_GAMMA_CORRECTION=true
GAMMA_VALUE=1.5  # Increase for darker videos
NIGHT_MODE_AUTO=true`}
                language="env"
              />
            </li>
            <li>
              <strong>Adjust CLAHE parameters:</strong>
              <CodeBlock
                code={`CLAHE_CLIP_LIMIT=3.0  # Increase for more enhancement
CLAHE_TILE_SIZE=8`}
                language="env"
              />
            </li>
            <li>Lower confidence threshold for night-time videos</li>
            <li>Use model trained on night-time dataset</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Headlight Glare Issues</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <p className="text-slate-700 mb-3">
            Vehicle headlights causing detection failures or false positives.
          </p>

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solution</h4>
          <CodeBlock
            code={`# Enable advanced deglare
ENABLE_DEGLARE=true
# Adjust deglare sensitivity (0.0-1.0)
DEGLARE_SENSITIVITY=0.8`}
            language="env"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Docker Issues</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Container Won't Start</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Solutions</h4>
          <CodeBlock
            code={`# Check container logs
docker-compose logs backend

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check port conflicts
netstat -an | grep 8000`}
            language="bash"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Permission Denied Errors</h3>

          <h4 className="font-semibold text-slate-900 mb-2">Problem</h4>
          <CodeBlock
            code={`PermissionError: [Errno 13] Permission denied: '/app/uploads'`}
            language="error"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Solution</h4>
          <CodeBlock
            code={`# Fix volume permissions
sudo chown -R $USER:$USER ./uploads ./outputs ./logs

# Or add user to docker group
sudo usermod -aG docker $USER`}
            language="bash"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Additional Help</h2>
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Still having issues?</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Check the <a href="#faq" className="underline">FAQ section</a></li>
            <li>• Enable debug logging: <code className="bg-blue-100 px-2 py-0.5 rounded">LOG_LEVEL=DEBUG</code></li>
            <li>• Run health check: <code className="bg-blue-100 px-2 py-0.5 rounded">python scripts/health_check.py</code></li>
            <li>• Check GitHub Issues for similar problems</li>
            <li>• Join our Discord community for support</li>
            <li>• Create a GitHub issue with logs and system info</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
