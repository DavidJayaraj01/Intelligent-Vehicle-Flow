import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Clock,
  Users,
  Activity,
  RefreshCw,
  Info,
  Play,
  Square,
  Video,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws');
const YOUTUBE_LIVE_URL = 'https://www.youtube.com/watch?v=6dp-bvQ7RWo';

interface Detection {
  id: number;
  type: string;
  confidence: number;
  bbox: number[];
  center: number[];
  in_queue: boolean;
  queue_time: number;
}

interface LiveStats {
  total_vehicles: number;
  vehicles_by_type: { [key: string]: number };
  current_queue_length: number;
  avg_queue_time: number;
  tracked_vehicles: number;
}

interface DetectionData {
  frame_number: number;
  timestamp: string;
  detections: Detection[];
  statistics: LiveStats;
  queue_times: { [key: number]: number };
}

const Analytics: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('live_stream_01');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [detectionData, setDetectionData] = useState<DetectionData | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Connect to WebSocket for live updates
  useEffect(() => {
    if (isStreaming) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isStreaming]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`${WS_URL}/api/v1/live-stream/ws`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'detection_update') {
          if (data.frame) {
            displayFrame(data.frame);
          }
          if (data.data) {
            setDetectionData(data.data);
            setLiveStats(data.data.statistics);
            updateHistoricalData(data.data);
          }
        } else if (data.type === 'stream_ended') {
          setIsStreaming(false);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const displayFrame = (base64Frame: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = `data:image/jpeg;base64,${base64Frame}`;
  };

  const updateHistoricalData = (data: DetectionData) => {
    const time = new Date(data.timestamp).toLocaleTimeString();
    const newPoint = {
      time,
      vehicles: data.statistics.total_vehicles,
      queueLength: data.statistics.current_queue_length,
    };

    setHistoricalData(prev => {
      const updated = [...prev, newPoint];
      // Keep last 20 data points
      return updated.slice(-20);
    });
  };

  const startLiveStream = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/v1/live-stream/start`, {
        youtube_url: YOUTUBE_LIVE_URL,
        camera_id: 'live_stream_01',
        save_to_database: true,
      });

      if (response.data.status === 'started') {
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Failed to start live stream:', error);
      alert('Failed to start live stream. Please check the console for errors.');
    } finally {
      setLoading(false);
    }
  };

  const stopLiveStream = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/v1/live-stream/stop`);
      setIsStreaming(false);
      disconnectWebSocket();
    } catch (error) {
      console.error('Failed to stop live stream:', error);
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypeData = liveStats?.vehicles_by_type 
    ? Object.entries(liveStats.vehicles_by_type).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count
      }))
    : [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />

      <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "md:ml-[280px]" : "md:ml-16")}>
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-8 w-8 text-primary inline" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono inline">
                  Live Stream Analytics
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time vehicle detection and queue analysis from YouTube live stream
              </p>
            </div>
            <div className="flex gap-2">
              {!isStreaming ? (
                <Button 
                  onClick={startLiveStream}
                  disabled={loading}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Live Detection
                </Button>
              ) : (
                <Button 
                  onClick={stopLiveStream}
                  disabled={loading}
                  variant="destructive"
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Stream
                </Button>
              )}
            </div>
          </div>

          {loading && (
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary animate-pulse" />
            </div>
          )}

          {/* Live Stream Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main video feed */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card/80 backdrop-blur p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-mono flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Live Detection Feed
                </h2>
                {isStreaming && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">LIVE</span>
                  </div>
                )}
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Click "Start Live Detection" to begin</p>
                    </div>
                  </div>
                )}
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Real-time Stats */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <h3 className="text-lg font-bold mb-4 font-mono">Real-time Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Vehicles Detected</div>
                    <div className="text-3xl font-mono font-bold">{liveStats?.total_vehicles || 0}</div>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Current Queue Length</div>
                    <div className="text-2xl font-mono font-bold text-orange-500">
                      {liveStats?.current_queue_length || 0}
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Avg Queue Time</div>
                    <div className="text-2xl font-mono font-bold text-primary">
                      {liveStats?.avg_queue_time.toFixed(1) || '0.0'}s
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Tracked Vehicles</div>
                    <div className="text-2xl font-mono font-bold">{liveStats?.tracked_vehicles || 0}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Types */}
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <h3 className="text-lg font-bold mb-4 font-mono">Vehicles by Type</h3>
                <div className="space-y-3">
                  {vehicleTypeData.map((item) => (
                    <div key={item.type}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">{item.type}</span>
                        <span className="text-sm font-mono font-bold">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ 
                            width: `${liveStats ? (item.count / liveStats.total_vehicles) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Charts */}
          {historicalData.length > 0 && (
            <>
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <h2 className="text-xl font-bold mb-6 font-mono">Vehicle Detection Timeline</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="vehicles"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Total Vehicles"
                    />
                    <Line
                      type="monotone"
                      dataKey="queueLength"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Queue Length"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {vehicleTypeData.length > 0 && (
                <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                  <h2 className="text-xl font-bold mb-6 font-mono">Vehicle Type Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vehicleTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="type" 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* Current Detections Table */}
          {detectionData && detectionData.detections.length > 0 && (
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <h2 className="text-xl font-bold mb-6 font-mono">Current Detections</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Confidence</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Queue Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detectionData.detections.slice(0, 10).map((det) => (
                      <tr key={det.id} className="border-b border-border/50">
                        <td className="py-3 px-4 font-mono text-sm">{det.id}</td>
                        <td className="py-3 px-4 text-sm capitalize">{det.type}</td>
                        <td className="py-3 px-4 text-sm">{(det.confidence * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium",
                            det.in_queue 
                              ? "bg-orange-500/10 text-orange-500" 
                              : "bg-green-500/10 text-green-500"
                          )}>
                            {det.in_queue ? 'In Queue' : 'Clear'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {det.queue_time > 0 ? `${det.queue_time.toFixed(1)}s` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-8">
            <h2 className="text-2xl font-bold mb-6 font-mono">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Live Stream Processing</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connects to YouTube live stream and processes video frames in real-time using YOLOv8 object detection model.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Vehicle Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ByteTrack algorithm assigns unique IDs to each vehicle and tracks them across frames for accurate queue time calculation.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Queue Analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Virtual gate lines detect when vehicles enter and exit queue zones, calculating precise wait times and generating analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
