import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  LocalParking,
  Timeline,
  Warning,
  LocalHospital,
  Speed,
  AttachMoney,
  LocationOn,
  Refresh,
  Info,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

interface BusinessInsight {
  title: string;
  description: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  details: string[];
  importance: 'critical' | 'high' | 'medium' | 'low';
}

const Analytics: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01');
  const [loading, setLoading] = useState(false);
  const mode = 'dark';  // Default theme mode
  // Using line charts by default

  // Sample data - replace with real API calls
  const peakHourData = [
    { time: '06:00', vehicles: 45 },
    { time: '07:00', vehicles: 120 },
    { time: '08:00', vehicles: 280 },
    { time: '09:00', vehicles: 190 },
    { time: '10:00', vehicles: 140 },
    { time: '11:00', vehicles: 110 },
    { time: '12:00', vehicles: 150 },
    { time: '13:00', vehicles: 130 },
    { time: '17:00', vehicles: 240 },
    { time: '18:00', vehicles: 310 },
    { time: '19:00', vehicles: 200 },
  ];

  const queueAnalysisData = [
    { lane: 'Lane 1', avgWait: 45, maxWait: 180, vehicles: 234 },
    { lane: 'Lane 2', avgWait: 32, maxWait: 120, vehicles: 198 },
    { lane: 'Lane 3', avgWait: 58, maxWait: 210, vehicles: 156 },
    { lane: 'Lane 4', avgWait: 28, maxWait: 95, vehicles: 287 },
  ];

  const businessInsights: BusinessInsight[] = [
    {
      title: 'Peak Hour Identification',
      description: 'Morning and evening rush hours identified with precision',
      value: '8:00 AM & 6:00 PM',
      trend: 'stable',
      icon: <Schedule />,
      importance: 'critical',
      details: [
        'Morning peak: 7:30 AM - 9:00 AM (280 vehicles/hour)',
        'Evening peak: 5:30 PM - 7:00 PM (310 vehicles/hour)',
        'Peak times account for 65% of daily traffic',
        'Recommendation: Add 2 lanes during peak hours',
      ],
    },
    {
      title: 'Queue Analysis',
      description: 'Average wait time and queue length monitoring',
      value: '3.2 minutes',
      trend: 'down',
      icon: <LocalParking />,
      importance: 'high',
      details: [
        'Average queue length: 12 vehicles',
        'Maximum queue detected: 28 vehicles at 6:15 PM',
        'Queue clearance rate: 85% efficiency',
        'Wait time reduced by 15% from last week',
      ],
    },
    {
      title: 'Lane Performance Score',
      description: 'Real-time scoring of each traffic lane efficiency',
      value: '87/100',
      trend: 'up',
      icon: <Timeline />,
      importance: 'high',
      details: [
        'Lane 4 performing best: 94/100 (287 vehicles processed)',
        'Lane 3 needs attention: 72/100 (high wait times)',
        'Overall throughput: 875 vehicles/hour',
        'Lane utilization: 78% average',
      ],
    },
    {
      title: 'Congestion Hotspots',
      description: 'AI-detected areas prone to traffic buildup',
      value: '3 locations',
      trend: 'stable',
      icon: <LocationOn />,
      importance: 'critical',
      details: [
        'Junction A: High congestion 8-9 AM',
        'Merge Point B: Bottleneck during rush hours',
        'Exit Ramp C: Queue spillback detected',
        'Suggested: Traffic signal timing adjustment',
      ],
    },
    {
      title: 'Emergency Response Efficiency',
      description: 'Average time for emergency vehicle clearance',
      value: '42 seconds',
      trend: 'up',
      icon: <LocalHospital />,
      importance: 'critical',
      details: [
        'Emergency vehicle detected: 18 instances today',
        'Average lane clearance time: 42 seconds',
        '95% success rate in path clearing',
        'Fastest response: 28 seconds',
      ],
    },
    {
      title: 'Incident Risk Prediction',
      description: 'AI-powered prediction of potential traffic incidents',
      value: 'Medium Risk',
      trend: 'stable',
      icon: <Warning />,
      importance: 'medium',
      details: [
        'Risk score: 6.2/10 (Medium)',
        'High-risk periods: 5-7 PM',
        'Weather impact: Low visibility tomorrow AM',
        'Preventive deployment recommended',
      ],
    },
    {
      title: 'Traffic Forecast (Next Hour)',
      description: 'ML-based prediction of upcoming traffic patterns',
      value: '+25% increase',
      trend: 'up',
      icon: <Speed />,
      importance: 'high',
      details: [
        'Expected vehicles next hour: 195 (+25%)',
        'Confidence level: 92%',
        'Predicted queue time: 4.5 minutes',
        'Recommendation: Pre-activate overflow lanes',
      ],
    },
    {
      title: 'Economic Impact Analysis',
      description: 'Estimated fuel and time savings from optimized flow',
      value: '$12,450/day',
      trend: 'up',
      icon: <AttachMoney />,
      importance: 'medium',
      details: [
        'Fuel savings: $8,200/day (reduced idling)',
        'Time savings: 2,840 person-hours/day',
        'Economic value: $4,250/day productivity gain',
        'CO2 reduction: 1.2 tons/day',
      ],
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => setLoading(false), 1000);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp color="success" fontSize="small" />;
    if (trend === 'down') return <TrendingUp color="error" fontSize="small" sx={{ transform: 'rotate(180deg)' }} />;
    return null;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          ml: sidebarOpen ? '280px' : '64px',
          transition: 'margin 0.2s ease-in-out',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Business Intelligence Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time insights converted from live traffic camera data
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <Refresh sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Vehicles Today
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  8,542
                </Typography>
                <Chip label="+12% vs yesterday" size="small" color="success" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Avg Queue Time
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  3.2 min
                </Typography>
                <Chip label="-8% improvement" size="small" color="success" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  System Efficiency
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  87%
                </Typography>
                <Chip label="Above target" size="small" color="success" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Daily Savings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  $12.4K
                </Typography>
                <Chip label="Economic impact" size="small" color="info" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Peak Hour Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Peak Hour Traffic Pattern
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={peakHourData}>
                <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#1a1a1a' : '#e0e0e0'} />
                <XAxis dataKey="time" stroke={mode === 'dark' ? '#999999' : '#666666'} />
                <YAxis stroke={mode === 'dark' ? '#999999' : '#666666'} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: mode === 'dark' ? '#0a0a0a' : '#fafafa',
                    border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
                    color: mode === 'dark' ? '#ffffff' : '#000000',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vehicles"
                  stroke={mode === 'dark' ? '#ffffff' : '#000000'}
                  fill={mode === 'dark' ? '#ffffff' : '#000000'}
                  name="Vehicles"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Queue Analysis Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Lane Performance & Queue Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={queueAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#1a1a1a' : '#e0e0e0'} />
                <XAxis dataKey="lane" stroke={mode === 'dark' ? '#999999' : '#666666'} />
                <YAxis stroke={mode === 'dark' ? '#999999' : '#666666'} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: mode === 'dark' ? '#0a0a0a' : '#fafafa',
                    border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
                    color: mode === 'dark' ? '#ffffff' : '#000000',
                  }}
                />
                <Legend />
                <Bar dataKey="avgWait" fill={mode === 'dark' ? '#ffffff' : '#000000'} name="Avg Wait (sec)" />
                <Bar dataKey="vehicles" fill={mode === 'dark' ? '#666666' : '#cccccc'} name="Vehicles Processed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Business Insights Grid */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Comprehensive Business Insights
        </Typography>
        <Grid container spacing={3}>
          {businessInsights.map((insight, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        mr: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {insight.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {insight.title}
                        </Typography>
                        {getTrendIcon(insight.trend)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {insight.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {insight.value}
                        </Typography>
                        <Chip
                          label={insight.importance.toUpperCase()}
                          size="small"
                          color={getImportanceColor(insight.importance) as any}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {insight.details.map((detail, idx) => (
                      <ListItem key={idx} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Info fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={detail}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Value Proposition */}
        <Card sx={{ mt: 4, bgcolor: mode === 'dark' ? '#0f0f0f' : '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Why These Insights Matter
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  For Traffic Authorities
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time data enables dynamic traffic signal optimization, reducing congestion by up to 30% and improving overall traffic flow efficiency.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  For City Planners
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Historical patterns and predictions guide infrastructure investments, lane expansions, and smart city initiatives with data-backed decisions.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  For Emergency Services
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instant lane clearance notifications and optimized routing save critical seconds, potentially saving lives during medical emergencies.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default Analytics;