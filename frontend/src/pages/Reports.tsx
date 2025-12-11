import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Download,
  Visibility,
  FilterList,
  Search,
  DateRange,
  Description,
  PictureAsPdf,
  TableChart,
  MoreVert,
  Share,
  Delete,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

interface Report {
  id: string;
  title: string;
  type: 'business-insights' | 'traffic-analysis' | 'emergency-response' | 'queue-performance';
  date: string;
  timeRange: string;
  status: 'completed' | 'processing' | 'failed';
  size: string;
  metrics: {
    vehicles: number;
    avgQueue: number;
    incidents: number;
    efficiency: number;
  };
}

const Reports: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const mode = 'dark';  // Default theme mode

  const reports: Report[] = [
    {
      id: 'RPT-2024-001',
      title: 'Daily Business Insights Report',
      type: 'business-insights',
      date: '2024-12-11',
      timeRange: '00:00 - 23:59',
      status: 'completed',
      size: '2.4 MB',
      metrics: {
        vehicles: 8542,
        avgQueue: 3.2,
        incidents: 2,
        efficiency: 87,
      },
    },
    {
      id: 'RPT-2024-002',
      title: 'Peak Hour Traffic Analysis',
      type: 'traffic-analysis',
      date: '2024-12-11',
      timeRange: '07:00 - 09:00',
      status: 'completed',
      size: '1.8 MB',
      metrics: {
        vehicles: 2840,
        avgQueue: 4.5,
        incidents: 0,
        efficiency: 82,
      },
    },
    {
      id: 'RPT-2024-003',
      title: 'Emergency Response Summary',
      type: 'emergency-response',
      date: '2024-12-10',
      timeRange: '00:00 - 23:59',
      status: 'completed',
      size: '856 KB',
      metrics: {
        vehicles: 18,
        avgQueue: 0,
        incidents: 18,
        efficiency: 95,
      },
    },
    {
      id: 'RPT-2024-004',
      title: 'Weekly Queue Performance',
      type: 'queue-performance',
      date: '2024-12-04 - 2024-12-11',
      timeRange: 'Full Week',
      status: 'completed',
      size: '5.2 MB',
      metrics: {
        vehicles: 59846,
        avgQueue: 3.5,
        incidents: 12,
        efficiency: 85,
      },
    },
    {
      id: 'RPT-2024-005',
      title: 'Monthly Business Insights',
      type: 'business-insights',
      date: '2024-11-01 - 2024-11-30',
      timeRange: 'Full Month',
      status: 'completed',
      size: '12.8 MB',
      metrics: {
        vehicles: 256420,
        avgQueue: 3.8,
        incidents: 45,
        efficiency: 83,
      },
    },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, report: Report) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReport(null);
  };

  const handleDownload = (report: Report, format: 'pdf' | 'excel' | 'json') => {
    // Simulate download
    console.log(`Downloading ${report.id} as ${format}`);
    handleMenuClose();
    
    // In real implementation, this would call an API endpoint
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${format}.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'business-insights':
        return 'primary';
      case 'traffic-analysis':
        return 'info';
      case 'emergency-response':
        return 'error';
      case 'queue-performance':
        return 'success';
      default:
        return 'default';
    }
  };

  const getReportTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Reports & Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Download and view historical business insights reports
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Description />}
            onClick={() => handleDownload(reports[0], 'pdf')}
          >
            Generate New Report
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Reports
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {reports.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  This Month
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  12
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Size
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  23 MB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Latest Report
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                  Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search reports by title or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button startIcon={<DateRange />} variant="outlined" size="small">
                  Date Range
                </Button>
                <Button startIcon={<FilterList />} variant="outlined" size="small">
                  Filter Type
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Report ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Key Metrics</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow
                    key={report.id}
                    sx={{
                      '&:hover': {
                        bgcolor: mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {report.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {report.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.timeRange}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getReportTypeLabel(report.type)}
                        size="small"
                        color={getReportTypeColor(report.type) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{report.date}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption">
                          Vehicles: {report.metrics.vehicles.toLocaleString()}
                        </Typography>
                        <Typography variant="caption">
                          Efficiency: {report.metrics.efficiency}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{report.size}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        size="small"
                        color={report.status === 'completed' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(report, 'pdf')}
                          title="Download PDF"
                        >
                          <Download fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, report)}
                          title="More options"
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedReport && handleDownload(selectedReport, 'pdf')}>
            <PictureAsPdf fontSize="small" sx={{ mr: 1 }} />
            Download as PDF
          </MenuItem>
          <MenuItem onClick={() => selectedReport && handleDownload(selectedReport, 'excel')}>
            <TableChart fontSize="small" sx={{ mr: 1 }} />
            Download as Excel
          </MenuItem>
          <MenuItem onClick={() => selectedReport && handleDownload(selectedReport, 'json')}>
            <Description fontSize="small" sx={{ mr: 1 }} />
            Download as JSON
          </MenuItem>
          <Divider />
          <MenuItem>
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem>
            <Share fontSize="small" sx={{ mr: 1 }} />
            Share Report
          </MenuItem>
          <Divider />
          <MenuItem sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete Report
          </MenuItem>
        </Menu>

        {/* Report Template Info */}
        <Card sx={{ mt: 4, bgcolor: mode === 'dark' ? '#0f0f0f' : '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Business Insights Report Contents
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Traffic Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
                  <li>Peak hour identification and patterns</li>
                  <li>Vehicle count trends and forecasts</li>
                  <li>Lane-by-lane performance metrics</li>
                  <li>Congestion hotspot analysis</li>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Business Intelligence
                </Typography>
                <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
                  <li>Queue wait time analysis</li>
                  <li>Emergency response efficiency</li>
                  <li>Economic impact calculations</li>
                  <li>Infrastructure recommendations</li>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Reports;