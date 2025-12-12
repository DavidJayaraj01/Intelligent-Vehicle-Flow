import React, { useState, useEffect } from 'react';
import {
  Download,
  Eye,
  Filter,
  Search,
  FileText,
  RefreshCw,
  Calendar,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import Sidebar from '../components/Sidebar';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  const [selectedCamera, setSelectedCamera] = useState<string>('live_stream_01');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodaySummary();
    
    // Set default dates (last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const fetchTodaySummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/reports/summary/today`);
      setTodaySummary(response.data);
    } catch (error) {
      console.error('Failed to fetch today summary:', error);
    }
  };

  const downloadCSV = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/v1/reports/download/csv`,
        {
          params: {
            start_date: `${startDate}T00:00:00Z`,
            end_date: `${endDate}T23:59:59Z`,
            camera_id: selectedCamera
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `detections_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download CSV:', error);
      alert('Failed to download CSV report');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/v1/reports/download/json`,
        {
          params: {
            start_date: `${startDate}T00:00:00Z`,
            end_date: `${endDate}T23:59:59Z`,
            camera_id: selectedCamera
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_${startDate}_${endDate}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download JSON:', error);
      alert('Failed to download JSON report');
    } finally {
      setLoading(false);
    }
  };

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
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'business-insights': return 'Business';
      case 'traffic-analysis': return 'Traffic';
      case 'emergency-response': return 'Emergency';
      case 'queue-performance': return 'Queue';
      default: return type;
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
                Reports & Downloads
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time Analytics Reports from Live Detection
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchTodaySummary}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Today's Summary */}
          {todaySummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  Today's Detections
                </div>
                <div className="text-3xl font-mono font-bold mb-2">
                  {todaySummary.total_detections?.toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                  {todaySummary.date}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  Unique Vehicles
                </div>
                <div className="text-3xl font-mono font-bold mb-2">
                  {todaySummary.unique_vehicles?.toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">
                  Tracked with IDs
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  Vehicle Types
                </div>
                <div className="text-3xl font-mono font-bold mb-2">
                  {Object.keys(todaySummary.vehicles_by_type || {}).length}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 text-xs font-medium">
                  Categories
                </div>
              </div>
            </div>
          )}

          {/* Download Reports Section */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 font-mono flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Detection Reports
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={downloadCSV}
                disabled={loading || !startDate || !endDate}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download CSV Report
              </Button>
              <Button 
                onClick={downloadJSON}
                disabled={loading || !startDate || !endDate}
                variant="outline"
                className="gap-2"
              >
                <FileJson className="h-4 w-4" />
                Download JSON Report
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              Reports include all vehicle detections with IDs, types, timestamps, and queue times from the selected date range.
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onChange={(e: any) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="business-insights">Business Insights</option>
              <option value="traffic-analysis">Traffic Analysis</option>
              <option value="emergency-response">Emergency Response</option>
              <option value="queue-performance">Queue Performance</option>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Reports Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{report.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{report.title}</span>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground mb-1">TOTAL REPORTS</div>
              <div className="text-2xl font-bold font-mono">{reports.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground mb-1">COMPLETED</div>
              <div className="text-2xl font-bold font-mono text-green-400">
                {reports.filter(r => r.status === 'completed').length}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground mb-1">TOTAL VEHICLES</div>
              <div className="text-2xl font-bold font-mono">
                {reports.reduce((sum, r) => sum + r.metrics.vehicles, 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs font-mono text-muted-foreground mb-1">AVG EFFICIENCY</div>
              <div className="text-2xl font-bold font-mono text-primary">
                {Math.round(reports.reduce((sum, r) => sum + r.metrics.efficiency, 0) / reports.length)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
