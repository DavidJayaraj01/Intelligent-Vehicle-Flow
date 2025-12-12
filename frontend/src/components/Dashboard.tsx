import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, Square, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEvents, getMetrics, getMetricsTimeSeries } from '../services/api';
import wsService from '../services/websocket';
import { KPITiles } from './KPITiles';
import { RealtimeChart } from './RealtimeChart';
import { EventTable } from './EventTable';
import { ActionModal } from './ActionModal';
import Sidebar from './Sidebar';
import { CameraFeed } from './CameraFeed';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws');
const YOUTUBE_LIVE_URL = 'https://www.youtube.com/watch?v=6dp-bvQ7RWo'; // YouTube Live Stream

interface Metrics {
  total_events: number;
  avg_dwell_time: number;
  queue_length: number;
}

interface LiveStats {
  total_vehicles: number;
  vehicles_by_type: { [key: string]: number };
  current_queue_length: number;
  avg_queue_time: number;
  tracked_vehicles: number;
}

interface Recommendation {
  type: string;
  description: string;
  params: Record<string, any>;
  confidence: number;
  camera_id?: string;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    total_events: 0,
    avg_dwell_time: 0,
    queue_length: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01'); // Camera 1
  const [detections, setDetections] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Live stream states
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const wsLiveRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchData = async () => {
    try {
      setError(null);
      // Fetch recent events
      const eventsResponse = await getEvents({ limit: 100 });
      setEvents(eventsResponse.data);

      // Fetch events for selected camera
      const cameraEventsResponse = await getEvents({ camera_id: selectedCamera, limit: 50 });
      
      // Convert events to detections for visualization
      const newDetections = cameraEventsResponse.data.map((event: any) => ({
        id: event.track_id,
        class: event.class,
        confidence: event.confidence || 0.95,
        bbox: event.bbox || [Math.random() * 600, Math.random() * 300, 80, 120],
        timestamp: event.timestamp,
      }));
      setDetections(newDetections);

      // Fetch metrics
      const metricsResponse = await getMetrics({});
      setMetrics({
        total_events: metricsResponse.data.total_events,
        avg_dwell_time: metricsResponse.data.avg_dwell_time,
        queue_length: metricsResponse.data.queue_length,
      });

      // Fetch time series data
      const timeSeriesResponse = await getMetricsTimeSeries({
        metric_name: 'vehicles_per_min',
        interval: 1,
      });

      const chartData = timeSeriesResponse.data.data_points.map((point: any) => ({
        time: new Date(point.timestamp).toLocaleTimeString(),
        vehicles: point.value,
      }));
      setChartData(chartData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  // Live stream functions
  const connectLiveStream = () => {
    try {
      const wsUrl = `${WS_URL}/api/v1/live-stream/ws`;
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Live stream WebSocket connected successfully');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message type:', data.type);
          
          if (data.type === 'detection_update') {
            console.log('Detection update received with', 
              data.data?.detections?.length || 0, 'detections',
              'Frame size:', data.frame?.length || 0, 'bytes');
            
            if (data.frame) {
              displayFrame(data.frame);
            } else {
              console.warn('No frame in detection_update');
            }
            
            if (data.data) {
              console.log('Statistics:', data.data.statistics);
              setLiveStats(data.data.statistics);
              updateChartWithLiveData(data.data);
            } else {
              console.warn('No data in detection_update');
            }
          } else if (data.type === 'stream_ended') {
            console.log('Stream ended notification received');
            setIsStreaming(false);
          } else if (data.type === 'status') {
            console.log('Status update:', data);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('Live stream WebSocket error:', error);
        setError('WebSocket connection error. Please check if backend is running.');
      };

      ws.onclose = () => {
        console.log('Live stream WebSocket disconnected');
        setIsStreaming(false);
      };

      wsLiveRef.current = ws;
    } catch (error) {
      console.error('Failed to connect live stream WebSocket:', error);
      setError('Failed to connect to live stream. Please try again.');
    }
  };

  const disconnectLiveStream = () => {
    if (wsLiveRef.current) {
      wsLiveRef.current.close();
      wsLiveRef.current = null;
    }
  };

  const displayFrame = (base64Frame: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas ref not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }

    const img = new Image();
    img.onload = () => {
      console.log('Frame loaded successfully, image size:', img.width, 'x', img.height);
      
      // Set canvas size to match container
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Draw image scaled to fit canvas
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        console.log('Frame drawn to canvas:', canvas.width, 'x', canvas.height);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }
    };
    img.onerror = (e) => {
      console.error('Failed to load frame image:', e);
    };
    img.src = `data:image/jpeg;base64,${base64Frame}`;
  };

  const updateChartWithLiveData = (data: any) => {
    const time = new Date(data.timestamp).toLocaleTimeString();
    const newPoint = {
      time,
      vehicles: data.statistics.total_vehicles,
    };

    setChartData(prev => {
      const updated = [...prev, newPoint];
      return updated.slice(-20); // Keep last 20 points
    });
  };

  const startLiveStream = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setStreamLoading(true);
      setError(null);
      
      console.log('Starting live stream with URL:', YOUTUBE_LIVE_URL);
      const response = await axios.post(`${API_URL}/api/v1/live-stream/start`, {
        youtube_url: YOUTUBE_LIVE_URL,
        camera_id: 'live_stream_01',
        save_to_database: true,
      });

      console.log('Start stream response:', response.data);
      
      if (response.data.status === 'started' || response.data.status === 'success') {
        setIsStreaming(true);
        // Wait a moment for stream to initialize
        setTimeout(() => {
          connectLiveStream();
        }, 1000);
      } else {
        setError('Failed to start stream: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Failed to start live stream:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to start live stream';
      setError(errorMsg);
    } finally {
      setStreamLoading(false);
    }
  };

  const stopLiveStream = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setStreamLoading(true);
      await axios.post(`${API_URL}/api/v1/live-stream/stop`);
      setIsStreaming(false);
      disconnectLiveStream();
    } catch (error) {
      console.error('Failed to stop live stream:', error);
    } finally {
      setStreamLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Connect WebSocket
    wsService.connect();

    // Handle WebSocket messages
    const handleMessage = (message: any) => {
      console.log('WebSocket message:', message);

      switch (message.type) {
        case 'events_ingested':
          // Refresh events
          fetchData();
          break;

        case 'recommendation':
          // Show recommendation modal
          setRecommendation(message.data);
          setModalOpen(true);
          break;

        case 'action_requested':
          // Optionally refresh data
          console.log('Action requested:', message.data);
          break;

        case 'kpi_update':
          // Update specific KPI
          console.log('KPI update:', message.data);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    };

    wsService.onMessage(handleMessage);

    // Cleanup
    return () => {
      wsService.removeMessageCallback(handleMessage);
      wsService.disconnect();
      disconnectLiveStream();
    };
  }, [selectedCamera]);

  const getCameraName = (cameraId: string) => {
    const cameraNames: Record<string, string> = {
      cam01: 'Camera 1 - YouTube Live Detection',
      live_stream_01: 'YouTube Live Stream',
      cam02: 'Highway Entry Point',
      cam03: 'City Center Junction',
      cam04: 'Airport Road Gate',
    };
    return cameraNames[cameraId] || cameraId;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-[280px]' : 'md:ml-16'
        }`}
      >
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time Vehicle Detection & Analytics
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isStreaming ? (
                <Button
                  type="button"
                  onClick={(e) => startLiveStream(e)}
                  disabled={streamLoading}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Live Detection
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={(e) => stopLiveStream(e)}
                  disabled={streamLoading}
                  variant="destructive"
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Stream
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              {isStreaming && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-mono text-green-400">LIVE</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* KPI Tiles */}
          <div className="mb-8">
            <KPITiles
              totalEvents={liveStats?.total_vehicles || metrics.total_events}
              avgDwellTime={liveStats?.avg_queue_time || metrics.avg_dwell_time}
              queueLength={liveStats?.current_queue_length || metrics.queue_length}
            />
          </div>

          {/* YouTube Live Stream Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Live Video Feed */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card/80 backdrop-blur p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-mono flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  YouTube Live Detection Feed
                </h2>
                {isStreaming && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">LIVE</span>
                  </div>
                )}
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {/* YouTube Video Iframe - Shows when NOT detecting */}
                {!isStreaming && !streamLoading && (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/6dp-bvQ7RWo?si=Z8q14brxUEuWFtM8&autoplay=1&mute=1" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                    className="w-full h-full"
                  />
                )}
                
                {/* Detection Canvas - Shows YOLOv8 processed frames with annotations */}
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain"
                  style={{ display: isStreaming ? 'block' : 'none' }}
                />
                
                {/* Loading indicator when starting */}
                {streamLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="font-bold">Initializing YOLOv8...</p>
                      <p className="text-sm mt-2 opacity-75">Extracting stream URL</p>
                    </div>
                  </div>
                )}
              </div>
              
              {isStreaming && liveStats && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Total Vehicles</div>
                    <div className="text-lg font-mono font-bold">{liveStats.total_vehicles}</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Queue Length</div>
                    <div className="text-lg font-mono font-bold text-orange-500">{liveStats.current_queue_length}</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Avg Queue Time</div>
                    <div className="text-lg font-mono font-bold text-primary">{liveStats.avg_queue_time.toFixed(1)}s</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Tracked</div>
                    <div className="text-lg font-mono font-bold">{liveStats.tracked_vehicles}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Types Breakdown */}
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <h3 className="text-lg font-bold mb-4 font-mono">Vehicle Types Detected</h3>
              {liveStats?.vehicles_by_type ? (
                <div className="space-y-3">
                  {Object.entries(liveStats.vehicles_by_type).map(([type, count]) => (
                    <div key={type}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground capitalize">{type}</span>
                        <span className="text-sm font-mono font-bold">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ 
                            width: `${(count / liveStats.total_vehicles) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No live data yet</p>
                  <p className="text-xs mt-2">Start detection to see vehicle types</p>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-bold mb-2">Detection Features:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ YOLOv8 Object Detection</li>
                  <li>✓ ByteTrack ID Tracking</li>
                  <li>✓ Queue Time Calculation</li>
                  <li>✓ Entry/Exit Gate Lines</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chart and Camera Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-12">
              <RealtimeChart 
                data={chartData} 
                title={isStreaming ? "Live Vehicle Detection Timeline" : "Vehicles Per Minute"} 
              />
            </div>
          </div>

          {/* Events Table */}
          <EventTable events={events} loading={loading} />
        </div>
      </div>

      {/* Action Recommendation Modal */}
      <ActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        recommendation={recommendation}
      />
    </div>
  );
};

export default Dashboard;
