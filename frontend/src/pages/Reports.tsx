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
  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
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
      const url = `${API_BASE}/api/v1/reports/stats${selectedCamera !== 'all' ? `?camera_id=${selectedCamera}` : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Use same query as Analytics page - just pass camera_id
      const url = `${API_BASE}/api/v1/reports/generate?camera_id=${selectedCamera}&report_type=daily`;
      const response = await fetch(url, { method: 'POST' });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Report ${result.report_id} generated!\n\nData from Analytics:\nTotal: ${result.metrics.total_vehicles.toLocaleString()}\nCars: ${result.metrics.cars.toLocaleString()} (${result.metrics.car_percentage.toFixed(1)}%)\nTrucks: ${result.metrics.trucks.toLocaleString()}\nBuses: ${result.metrics.buses.toLocaleString()}\nMotorcycles: ${result.metrics.motorcycles.toLocaleString()}`);
        generateReports();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report.');
    }
  };

  const handleDownload = async (reportId: string) => {
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
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm(`Delete report ${reportId}?`)) return;
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/v1/reports/delete/${reportId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert(`✅ Report ${reportId} deleted`);
        generateReports();
        fetchStats();
      } else {
        alert('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
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
              onClick={generateReports}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
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
              >
                <FileText className="h-4 w-4" />
                Generate Report
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDownload(report.id)}
                          title="Download PDF"
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
                ))}
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
    </div>
  );
};

export default Reports;
