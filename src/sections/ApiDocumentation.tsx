import CodeBlock from '../components/CodeBlock';

export default function ApiDocumentation() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">API Documentation</h1>
      <p className="text-slate-600 mb-8">
        Complete REST API reference with examples and response formats
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
        <p className="text-blue-900 text-sm">
          <strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:8000/api/v1</code>
        </p>
        <p className="text-blue-900 text-sm mt-2">
          <strong>Interactive Docs:</strong> <a href="http://localhost:8000/docs" className="underline">http://localhost:8000/docs</a>
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Vehicle Detection Endpoints</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold mr-3">POST</span>
            <code className="text-slate-900 font-mono">/detect/video</code>
          </div>
          <p className="text-slate-700 mb-4">Process video file and detect vehicles</p>

          <h4 className="font-semibold text-slate-900 mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "video_file": "multipart/form-data",
  "camera_id": "CAM-001",
  "enable_tracking": true,
  "confidence_threshold": 0.5
}`}
            language="json"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "camera_id": "CAM-001",
  "total_frames": 1800,
  "estimated_time": 45,
  "created_at": "2024-12-11T10:30:00Z"
}`}
            language="json"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">cURL Example</h4>
          <CodeBlock
            code={`curl -X POST "http://localhost:8000/api/v1/detect/video" \\
  -H "Content-Type: multipart/form-data" \\
  -F "video_file=@/path/to/video.mp4" \\
  -F "camera_id=CAM-001" \\
  -F "enable_tracking=true"`}
            language="bash"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold mr-3">GET</span>
            <code className="text-slate-900 font-mono">/detect/job/{'{job_id}'}</code>
          </div>
          <p className="text-slate-700 mb-4">Get detection job status and results</p>

          <h4 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": 100,
  "results": {
    "total_vehicles": 127,
    "vehicle_types": {
      "car": 89,
      "truck": 22,
      "bus": 8,
      "motorcycle": 8
    },
    "output_video_url": "/outputs/CAM-001_annotated.mp4",
    "detections": [
      {
        "frame": 120,
        "timestamp": 4.0,
        "vehicles": [
          {
            "id": 1,
            "type": "car",
            "confidence": 0.92,
            "bbox": [100, 200, 250, 350],
            "speed": 45.2
          }
        ]
      }
    ]
  },
  "processing_time": 42.5
}`}
            language="json"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Queue Analysis Endpoints</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold mr-3">POST</span>
            <code className="text-slate-900 font-mono">/queue/analyze</code>
          </div>
          <p className="text-slate-700 mb-4">Analyze queue metrics for a camera feed</p>

          <h4 className="font-semibold text-slate-900 mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "camera_id": "CAM-001",
  "lane_ids": ["LANE-1", "LANE-2", "LANE-3"],
  "time_window": 300
}`}
            language="json"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "camera_id": "CAM-001",
  "timestamp": "2024-12-11T10:35:00Z",
  "lanes": [
    {
      "lane_id": "LANE-1",
      "queue_length": 12,
      "avg_wait_time": 145.3,
      "service_rate": 0.25,
      "vehicles_processed": 48,
      "status": "congested"
    },
    {
      "lane_id": "LANE-2",
      "queue_length": 5,
      "avg_wait_time": 62.1,
      "service_rate": 0.45,
      "vehicles_processed": 67,
      "status": "normal"
    }
  ],
  "total_vehicles": 115,
  "avg_queue_length": 8.5,
  "recommendation": "Open additional lane"
}`}
            language="json"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold mr-3">GET</span>
            <code className="text-slate-900 font-mono">/queue/metrics</code>
          </div>
          <p className="text-slate-700 mb-4">Get real-time queue metrics</p>

          <h4 className="font-semibold text-slate-900 mb-2">Query Parameters</h4>
          <ul className="text-slate-600 text-sm space-y-1 mb-4">
            <li>• <code className="bg-slate-100 px-2 py-0.5 rounded">camera_id</code> (optional): Filter by camera</li>
            <li>• <code className="bg-slate-100 px-2 py-0.5 rounded">lane_id</code> (optional): Filter by lane</li>
            <li>• <code className="bg-slate-100 px-2 py-0.5 rounded">from</code> (optional): Start timestamp</li>
            <li>• <code className="bg-slate-100 px-2 py-0.5 rounded">to</code> (optional): End timestamp</li>
          </ul>

          <h4 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "metrics": [
    {
      "timestamp": "2024-12-11T10:30:00Z",
      "camera_id": "CAM-001",
      "lane_id": "LANE-1",
      "queue_length": 12,
      "avg_wait_time": 145.3
    }
  ],
  "summary": {
    "total_records": 500,
    "avg_queue_length": 8.5,
    "max_queue_length": 25,
    "avg_wait_time": 92.4
  }
}`}
            language="json"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Emergency & Alert Endpoints</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold mr-3">POST</span>
            <code className="text-slate-900 font-mono">/emergency/detect</code>
          </div>
          <p className="text-slate-700 mb-4">Detect emergency vehicles in video stream</p>

          <h4 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "emergency_vehicles_detected": true,
  "detections": [
    {
      "vehicle_id": 42,
      "type": "ambulance",
      "confidence": 0.94,
      "lane_id": "LANE-2",
      "timestamp": "2024-12-11T10:35:12Z",
      "location": [450, 320],
      "speed": 62.5,
      "direction": "north"
    }
  ],
  "alert_sent": true,
  "recommended_action": "Clear lane LANE-2 immediately"
}`}
            language="json"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold mr-3">POST</span>
            <code className="text-slate-900 font-mono">/accident/detect</code>
          </div>
          <p className="text-slate-700 mb-4">Detect potential accidents or stopped vehicles</p>

          <h4 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "accident_detected": true,
  "severity": "high",
  "location": {
    "camera_id": "CAM-003",
    "lane_id": "LANE-1",
    "coordinates": [680, 420]
  },
  "involved_vehicles": [
    {
      "vehicle_id": 15,
      "type": "car",
      "stationary_duration": 180
    },
    {
      "vehicle_id": 16,
      "type": "truck",
      "stationary_duration": 180
    }
  ],
  "timestamp": "2024-12-11T10:32:00Z",
  "alert_authorities": true
}`}
            language="json"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold mr-3">GET</span>
            <code className="text-slate-900 font-mono">/alerts</code>
          </div>
          <p className="text-slate-700 mb-4">Retrieve alert history</p>

          <h4 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "alerts": [
    {
      "id": "alert-001",
      "type": "emergency_vehicle",
      "severity": "high",
      "camera_id": "CAM-001",
      "description": "Ambulance detected in LANE-2",
      "timestamp": "2024-12-11T10:35:12Z",
      "status": "acknowledged"
    },
    {
      "id": "alert-002",
      "type": "accident",
      "severity": "critical",
      "camera_id": "CAM-003",
      "description": "Possible accident in LANE-1",
      "timestamp": "2024-12-11T10:32:00Z",
      "status": "active"
    }
  ],
  "total": 47,
  "page": 1,
  "per_page": 20
}`}
            language="json"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics & Reporting</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold mr-3">GET</span>
            <code className="text-slate-900 font-mono">/analytics/traffic-patterns</code>
          </div>
          <p className="text-slate-700 mb-4">Get traffic pattern analysis</p>

          <h4 className="font-semibold text-slate-900 mb-2">Response (200 OK)</h4>
          <CodeBlock
            code={`{
  "time_period": {
    "from": "2024-12-11T00:00:00Z",
    "to": "2024-12-11T23:59:59Z"
  },
  "patterns": {
    "peak_hours": [
      { "hour": 8, "avg_vehicles": 450 },
      { "hour": 17, "avg_vehicles": 520 }
    ],
    "busiest_lanes": [
      { "lane_id": "LANE-1", "total_vehicles": 2340 },
      { "lane_id": "LANE-3", "total_vehicles": 2180 }
    ],
    "vehicle_distribution": {
      "car": 68.5,
      "truck": 18.2,
      "bus": 8.1,
      "motorcycle": 5.2
    }
  },
  "insights": [
    "Peak traffic occurs between 8-9 AM and 5-6 PM",
    "LANE-1 experiences 15% more traffic than average",
    "Truck traffic increases significantly after 10 PM"
  ]
}`}
            language="json"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">WebSocket API</h2>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center mb-4">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-semibold mr-3">WS</span>
            <code className="text-slate-900 font-mono">/ws/metrics</code>
          </div>
          <p className="text-slate-700 mb-4">Real-time metrics streaming via WebSocket</p>

          <h4 className="font-semibold text-slate-900 mb-2">Connection Example</h4>
          <CodeBlock
            code={`const ws = new WebSocket('ws://localhost:8000/ws/metrics');

ws.onopen = () => {
  console.log('Connected to metrics stream');

  // Subscribe to specific camera
  ws.send(JSON.stringify({
    action: 'subscribe',
    camera_id: 'CAM-001'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received metrics:', data);
};`}
            language="javascript"
          />

          <h4 className="font-semibold text-slate-900 mb-2 mt-4">Message Format</h4>
          <CodeBlock
            code={`{
  "type": "metrics_update",
  "camera_id": "CAM-001",
  "timestamp": "2024-12-11T10:35:00Z",
  "data": {
    "active_vehicles": 45,
    "queue_length": 12,
    "avg_wait_time": 145.3,
    "emergency_vehicles": 0,
    "alerts": []
  }
}`}
            language="json"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Responses</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h4 className="font-semibold text-slate-900 mb-3">Standard Error Format</h4>
          <CodeBlock
            code={`{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Camera ID is required",
    "details": {
      "field": "camera_id",
      "reason": "missing_required_field"
    }
  },
  "request_id": "req-12345"
}`}
            language="json"
          />

          <h4 className="font-semibold text-slate-900 mb-3 mt-4">Common Error Codes</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Code</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-2 font-mono text-slate-900">INVALID_REQUEST</td>
                  <td className="px-4 py-2 text-slate-600">400</td>
                  <td className="px-4 py-2 text-slate-600">Request validation failed</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-slate-900">UNAUTHORIZED</td>
                  <td className="px-4 py-2 text-slate-600">401</td>
                  <td className="px-4 py-2 text-slate-600">Authentication required</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-slate-900">NOT_FOUND</td>
                  <td className="px-4 py-2 text-slate-600">404</td>
                  <td className="px-4 py-2 text-slate-600">Resource not found</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-slate-900">RATE_LIMIT_EXCEEDED</td>
                  <td className="px-4 py-2 text-slate-600">429</td>
                  <td className="px-4 py-2 text-slate-600">Too many requests</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-slate-900">INTERNAL_ERROR</td>
                  <td className="px-4 py-2 text-slate-600">500</td>
                  <td className="px-4 py-2 text-slate-600">Server error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
