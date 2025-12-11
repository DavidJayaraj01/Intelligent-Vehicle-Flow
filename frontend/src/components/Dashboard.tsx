import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Box, IconButton } from '@mui/material';
import { Logout, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { removeApiKey } from '../utils/auth';
import { getEvents, getMetrics, getMetricsTimeSeries } from '../services/api';
import wsService from '../services/websocket';
import KPITiles from './KPITiles';
import RealtimeChart from './RealtimeChart';
import EventTable from './EventTable';
import ReplayPanel from './ReplayPanel';
import ActionModal from './ActionModal';

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
  const navigate = useNavigate();
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

  const fetchData = async () => {
    try {
      // Fetch recent events
      const eventsResponse = await getEvents({ limit: 100 });
      setEvents(eventsResponse.data);

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
  }, []);

  const handleLogout = () => {
    removeApiKey();
    navigate('/');
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Vehicle Flow Analyzer Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleRefresh} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* KPI Tiles */}
        <Box sx={{ mb: 4 }}>
          <KPITiles
            totalEvents={metrics.total_events}
            avgDwellTime={metrics.avg_dwell_time}
            queueLength={metrics.queue_length}
          />
        </Box>

        {/* Chart and Replay Panel */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RealtimeChart data={chartData} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ReplayPanel />
          </Grid>
        </Grid>

        {/* Events Table */}
        <EventTable events={events} loading={loading} />
      </Container>

      {/* Action Recommendation Modal */}
      <ActionModal open={modalOpen} onClose={() => setModalOpen(false)} recommendation={recommendation} />
    </Box>
  );
};

export default Dashboard;
