import React, { useState, useEffect } from 'react';
import {
  Download,
  Eye,
  Filter,
  Search,
  FileText,
  RefreshCw,
  Calendar,
  X,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import Sidebar from '../components/Sidebar';
import { cn } from '@/lib/utils';
import { getEvents } from '../services/api';

interface Report {
  id: string;
  title: string;
  type: 'business-insights' | 'traffic-analysis' | 'emergency-response' | 'queue-performance' | 'daily';
  date: string;
  timeRange: string;
  status: 'completed' | 'processing' | 'failed';
  size: string;
  created_at?: string;
  metrics: {
    vehicles: number;
    avgQueue: number;
    incidents: number;
    efficiency: number;
  };
}

const Reports: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [stats, setStats] = useState({
    total_reports: 0,
    completed: 0,
    total_vehicles: 0,
    cars_detected: 0,
    cars_percentage: 0,
    trucks_buses: 0,
    motorcycles: 0,
    avg_efficiency: 0
  });

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    generateReports();
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      generateReports();
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedCamera, filterDate]);

  const fetchStats = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = `${API_BASE}/api/v1/reports/stats${selectedCamera !== 'all' && selectedCamera ? `?camera_id=${selectedCamera}` : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    // Generate a new report with today's data, then refresh the list
    if (!selectedCamera || selectedCamera === 'all') {
      showNotification('Please select a specific camera to generate today\'s report', 'info');
      generateReports();
      fetchStats();
      return;
    }

    setLoading(true);
    showNotification('Generating new report with today\'s real-time data...', 'info');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${API_BASE}/api/v1/reports/generate-today?camera_id=${selectedCamera}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const result = await response.json();
        showNotification(
          `✓ New report generated!\n${result.metrics.total_vehicles} vehicles detected today`,
          'success'
        );
      } else {
        const error = await response.json();
        if (error.detail?.includes('No events found')) {
          showNotification('No vehicle data available for today yet', 'info');
        } else {
          showNotification('Failed to generate report', 'error');
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Error generating report', 'error');
    } finally {
      // Always refresh the list and stats
      await generateReports();
      await fetchStats();
      setLoading(false);
    }
  };

  const generateReports = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCamera !== 'all') {
        params.append('camera_id', selectedCamera);
      }
      
      // Convert DD-MM-YY to YYYY-MM-DD for API
      if (filterDate) {
        // Only apply filter if date is complete (8 characters: DD-MM-YY)
        if (filterDate.length === 8) {
          const dateMatch = filterDate.match(/^(\d{2})-(\d{2})-(\d{2})$/);
          if (dateMatch) {
            const [_, day, month, year] = dateMatch;
            const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
            const apiDate = `${fullYear}-${month}-${day}`;
            params.append('filter_date', apiDate);
            console.log(`Filtering reports for date: ${apiDate} (from input: ${filterDate})`);
          }
        }
      }
      
      // Fetch reports from backend
      const response = await fetch(
        `${API_BASE}/api/v1/reports/list?${params.toString()}`
      );
      
      console.log('Fetching reports from:', `${API_BASE}/api/v1/reports/list?${params.toString()}`);
      
      if (response.ok) {
        const reportsData = await response.json();
        console.log('Reports received:', reportsData.length, reportsData);
        setReports(reportsData);
      } else {
        console.error('Failed to fetch reports');
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'daily': 'Daily',
      'weekly': 'Weekly', 
      'monthly': 'Monthly',
      'business': 'Business',
      'traffic': 'Traffic',
      'emergency': 'Emergency',
      'queue': 'Queue',
      'business-insights': 'Business',
      'traffic-analysis': 'Traffic',
      'emergency-response': 'Emergency',
      'queue-performance': 'Queue'
    };
    return labels[type] || type;
  };

  const handleGenerateReport = async () => {
    if (!selectedCamera || selectedCamera === 'all') {
      showNotification('Please select a specific camera to generate a report', 'warning');
      return;
    }

    setGenerating(true);
    showNotification('Generating professional report with business insights...', 'info');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Use same query as Analytics page - just pass camera_id
      const url = `${API_BASE}/api/v1/reports/generate?camera_id=${selectedCamera}&report_type=daily`;
      const response = await fetch(url, { method: 'POST' });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message with key metrics
        const message = `Report ${result.report_id} generated successfully!\n\n` +
                       `📊 Total Vehicles: ${result.metrics.total_vehicles.toLocaleString()}\n` +
                       `🚗 Cars: ${result.metrics.cars.toLocaleString()} (${result.metrics.car_percentage.toFixed(1)}%)\n` +
                       `🚛 Trucks: ${result.metrics.trucks.toLocaleString()}\n` +
                       `🚌 Buses: ${result.metrics.buses.toLocaleString()}\n` +
                       `🏍️ Motorcycles: ${result.metrics.motorcycles.toLocaleString()}\n\n` +
                       `Report includes business insights, charts, and recommendations!`;
        
        showNotification(message, 'success');
        generateReports();
        fetchStats();
      } else {
        const error = await response.json();
        showNotification(`Failed to generate report: ${error.detail || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Error generating report. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    showNotification(`Downloading report ${reportId}...`, 'info');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/v1/reports/download/${reportId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification(`Report ${reportId} downloaded successfully!`, 'success');
      } else {
        showNotification('Failed to download report', 'error');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      showNotification('Error downloading report', 'error');
    }
  };

  const handlePreview = async (reportId: string) => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/v1/reports/preview/${reportId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      } else {
        showNotification('Failed to load preview', 'error');
        setPreviewOpen(false);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      showNotification('Error loading preview', 'error');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm(`Are you sure you want to delete report ${reportId}? This action cannot be undone.`)) return;
    
    showNotification(`Deleting report ${reportId}...`, 'info');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/v1/reports/delete/${reportId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showNotification(`Report ${reportId} deleted successfully`, 'success');
        generateReports();
        fetchStats();
      } else {
        showNotification('Failed to delete report', 'error');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      showNotification('Error deleting report', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />

      <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "md:ml-[280px]" : "md:ml-16")}>
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
                Reports
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Generated Analytics & Documentation
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={loading}
              title="Generate new report with today's real-time data"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh & Generate New
            </Button>
          </div>

          {/* Enhanced Reports Feature Banner */}
          <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-purple-500/5 to-emerald-500/5 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  ✨ Enhanced Professional Reports Now Available
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate comprehensive traffic intelligence reports with advanced visualizations, deep analytics, and AI-powered insights.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    📊 5 Advanced Charts
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    💡 16+ KPI Metrics
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    🎯 AI Business Insights
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
                    📈 Trend Analysis
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/30">
                    🎨 Minimal Design
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="business-insights">Business Insights</option>
                <option value="traffic-analysis">Traffic Analysis</option>
                <option value="emergency-response">Emergency Response</option>
                <option value="queue-performance">Queue Performance</option>
              </Select>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 whitespace-nowrap"
                onClick={handleGenerateReport}
                disabled={generating || !selectedCamera || selectedCamera === 'all'}
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 p-4 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Filter by Date:</span>
              <Input
                type="text"
                value={filterDate}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9-]/g, '');
                  if (value.length <= 8) {
                    setFilterDate(value);
                  }
                }}
                placeholder="DD-MM-YY"
                className="w-32 font-mono"
                maxLength={8}
              />
              <span className="text-xs text-muted-foreground">Format: DD-MM-YY</span>
              {filterDate && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilterDate('')}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Reports Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No reports available</p>
                <p className="text-sm">Analyze the live stream to generate reports</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">REPORT ID</TableHead>
                  <TableHead className="font-mono text-xs">TITLE</TableHead>
                  <TableHead className="font-mono text-xs">TYPE</TableHead>
                  <TableHead className="font-mono text-xs">DATE</TableHead>
                  <TableHead className="font-mono text-xs">VEHICLES</TableHead>
                  <TableHead className="font-mono text-xs">EFFICIENCY</TableHead>
                  <TableHead className="font-mono text-xs">STATUS</TableHead>
                  <TableHead className="font-mono text-xs text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  // Check if report is recent (within last hour)
                  const isNew = report.created_at ? 
                    (new Date().getTime() - new Date(report.created_at).getTime()) < 3600000 : false;
                  
                  return (
                  <TableRow key={report.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{report.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{report.title}</span>
                            {isNew && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-emerald-400 font-mono">📊 5 Charts</span>
                            <span className="text-[10px] text-blue-400 font-mono">💡 16+ Metrics</span>
                            <span className="text-[10px] text-purple-400 font-mono">🎯 AI Insights</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-1 rounded text-xs font-mono bg-primary/10 text-primary border border-primary/30">
                        {getTypeLabel(report.type)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{report.metrics.vehicles.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-block px-2 py-1 rounded text-xs font-mono",
                        report.metrics.efficiency >= 90 ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                        report.metrics.efficiency >= 80 ? "bg-primary/10 text-primary border border-primary/30" :
                        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                      )}>
                        {report.metrics.efficiency}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-block px-2 py-1 rounded text-xs font-mono uppercase",
                        report.status === 'completed' ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                        report.status === 'processing' ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" :
                        "bg-destructive/10 text-destructive border border-destructive/30"
                      )}>
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-400"
                          onClick={() => handlePreview(report.id)}
                          title="Preview Report"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleDownload(report.id)}
                          title="Download Professional PDF with Charts & Insights"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(report.id)}
                          title="Delete Report"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            )}
          </div>

          {/* Summary Stats - Live Data from Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground mb-1">TOTAL VEHICLES TODAY</div>
              <div className="text-2xl font-bold font-mono">{stats.total_vehicles.toLocaleString()}</div>
              <div className="text-xs text-green-400 mt-1">Live stream data</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground mb-1">CARS DETECTED</div>
              <div className="text-2xl font-bold font-mono text-blue-400">
                {stats.cars_detected.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stats.cars_percentage}% of total</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground mb-1">TRUCKS + BUSES</div>
              <div className="text-2xl font-bold font-mono text-orange-400">
                {stats.trucks_buses.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Commercial vehicles</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground mb-1">MOTORCYCLES</div>
              <div className="text-2xl font-bold font-mono text-green-400">
                {stats.motorcycles.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Two-wheelers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Snackbar */}
      <div 
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300",
          notification.open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div 
          className={cn(
            "rounded-lg border shadow-lg p-4 max-w-md",
            notification.severity === 'success' && "bg-green-50 border-green-200 text-green-900",
            notification.severity === 'error' && "bg-red-50 border-red-200 text-red-900",
            notification.severity === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-900",
            notification.severity === 'info' && "bg-blue-50 border-blue-200 text-blue-900"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {notification.severity === 'success' && (
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {notification.severity === 'error' && (
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {notification.severity === 'warning' && (
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {notification.severity === 'info' && (
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium whitespace-pre-line">{notification.message}</p>
            </div>
            <button
              onClick={closeNotification}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Report Preview</h2>
                {previewData && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {previewData.report_id} • {previewData.date_range}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setPreviewOpen(false);
                  setPreviewData(null);
                }}
                className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : previewData ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{previewData.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>📹 Camera: {previewData.camera_id}</span>
                      <span>📅 {previewData.date_range}</span>
                      <span>📄 {previewData.file_size}</span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  {previewData.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="rounded-lg border border-border bg-card/50 p-4">
                        <div className="text-xs font-mono text-muted-foreground mb-1">TOTAL VEHICLES</div>
                        <div className="text-2xl font-bold font-mono">{previewData.metrics.total_vehicles?.toLocaleString()}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-card/50 p-4">
                        <div className="text-xs font-mono text-muted-foreground mb-1">CARS</div>
                        <div className="text-2xl font-bold font-mono text-blue-400">{previewData.metrics.cars?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">{previewData.metrics.car_percentage?.toFixed(1)}%</div>
                      </div>
                      <div className="rounded-lg border border-border bg-card/50 p-4">
                        <div className="text-xs font-mono text-muted-foreground mb-1">TRUCKS</div>
                        <div className="text-2xl font-bold font-mono text-orange-400">{previewData.metrics.trucks?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">{previewData.metrics.truck_percentage?.toFixed(1)}%</div>
                      </div>
                      <div className="rounded-lg border border-border bg-card/50 p-4">
                        <div className="text-xs font-mono text-muted-foreground mb-1">MOTORCYCLES</div>
                        <div className="text-2xl font-bold font-mono text-green-400">{previewData.metrics.motorcycles?.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">{previewData.metrics.motorcycle_percentage?.toFixed(1)}%</div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {previewData.summary && (
                    <div className="rounded-lg border border-border bg-card/50 p-4">
                      <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Executive Summary
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{previewData.summary}</p>
                    </div>
                  )}

                  {/* Full Content */}
                  {previewData.full_content && (
                    <div className="rounded-lg border border-border bg-card/50 p-4">
                      <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Full Report Content
                      </h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{previewData.full_content}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No preview data available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewOpen(false);
                  setPreviewData(null);
                }}
              >
                Close
              </Button>
              {previewData && (
                <Button
                  variant="default"
                  onClick={() => {
                    handleDownload(previewData.report_id);
                    setPreviewOpen(false);
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
