import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEvents, getMetrics, getMetricsTimeSeries } from '../services/api';
import wsService from '../services/websocket';
import { KPITiles } from './KPITiles';
import { RealtimeChart } from './RealtimeChart';
import { EventTable } from './EventTable';
import { ActionModal } from './ActionModal';
import Sidebar from './Sidebar';
import { CameraFeed } from './CameraFeed';
import { LiveStreamStats } from './LiveStreamStats';
  
interface Metrics {
  total_events: number;
  avg_dwell_time: number;
  queue_length: number;
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
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01');
  const [detections, setDetections] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

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
    };
  }, [selectedCamera]);

  const getCameraName = (cameraId: string) => {
    const cameraNames: Record<string, string> = {
      cam01: 'Main Intersection North',
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
                Real-time Surveillance System
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-mono text-green-400">LIVE</span>
              </div>
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
              totalEvents={metrics.total_events}
              avgDwellTime={metrics.avg_dwell_time}
              queueLength={metrics.queue_length}
            />
          </div>

          {/* Chart and Camera Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-7">
              <RealtimeChart data={chartData} title="Vehicles Per Minute" />
            </div>
            <div className="lg:col-span-5">
              <CameraFeed
                cameraId={selectedCamera}
                cameraName={getCameraName(selectedCamera)}
                detections={detections}
                youtubeUrl={
                  selectedCamera === 'cam01' ? 'https://www.youtube.com/watch?v=6dp-bvQ7RWo' :
                  selectedCamera === 'cam02' ? 'https://www.youtube.com/watch?v=y-Os52eW2rg' :
                  selectedCamera === 'cam03' ? 'https://www.youtube.com/watch?v=y-Os52eW2rg' :
                  undefined
                }
                onAnalysisComplete={(results) => setLatestAnalysis(results)}
              />
            </div>
          </div>

          {/* Live Stream Statistics */}
          {latestAnalysis && (selectedCamera === 'cam01' || selectedCamera === 'cam02' || selectedCamera === 'cam03') && (
            <div className="mb-8">
              <LiveStreamStats cameraId={selectedCamera} latestAnalysis={latestAnalysis} />
            </div>
          )}

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
