import React, { useState, useEffect } from 'react';
import { Box, Grid, Alert } from '@mui/material';
import { getEvents, getMetrics, getMetricsTimeSeries } from '../services/api';
import wsService from '../services/websocket';
import KPITiles from './KPITiles';
import RealtimeChart from './RealtimeChart';
import EventTable from './EventTable';
import ReplayPanel from './ReplayPanel';
import ActionModal from './ActionModal';
import Layout from './Layout';
import Sidebar from './Sidebar';
import CameraFeed from './CameraFeed';

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

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: sidebarOpen ? '280px' : '72px',
          transition: 'margin-left 0.3s',
          bgcolor: '#000000',
        }}
      >
        <Layout onRefresh={handleRefresh}>
          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                '& .MuiAlert-icon': {
                  color: '#ef4444'
                }
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Camera Feed */}
          <Box sx={{ mb: 6 }}>
            <CameraFeed
              cameraId={selectedCamera}
              cameraName={getCameraName(selectedCamera)}
              detections={detections}
            />
          </Box>

          {/* KPI Tiles */}
          <Box sx={{ mb: 6 }}>
            <KPITiles
              totalEvents={metrics.total_events}
              avgDwellTime={metrics.avg_dwell_time}
              queueLength={metrics.queue_length}
            />
          </Box>

          {/* Chart and Replay Panel */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <RealtimeChart data={chartData} />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ReplayPanel />
            </Grid>
          </Grid>

          {/* Events Table */}
          <EventTable events={events} loading={loading} />

          {/* Action Recommendation Modal */}
          <ActionModal open={modalOpen} onClose={() => setModalOpen(false)} recommendation={recommendation} />
        </Layout>
      </Box>
    </Box>
  );
};

export default Dashboard;
