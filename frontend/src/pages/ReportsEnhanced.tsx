import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  RefreshCw,
  Calendar,
  TrendingUp,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Sidebar from '../components/Sidebar';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DailyStat {
  total: number;
  by_type: { [key: string]: number };
}

interface WeeklySummary {
  period: string;
  start_date: string;
  end_date: string;
  total_detections: number;
  unique_vehicles: number;
  daily_breakdown: { [date: string]: DailyStat };
}

interface TodaySummary {
  date: string;
  total_detections: number;
  unique_vehicles: number;
  vehicles_by_type: { [key: string]: number };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ReportsEnhanced: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('live_stream_01');
  const [loading, setLoading] = useState(false);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTodaySummary();
    fetchWeeklySummary();
    
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

  const fetchWeeklySummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/v1/reports/summary/week`);
      setWeeklySummary(response.data);
    } catch (error) {
      console.error('Failed to fetch weekly summary:', error);
    } finally {
      setLoading(false);
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
      
      // Create download link
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
      
      // Create download link
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

  const handleRefresh = () => {
    fetchTodaySummary();
    fetchWeeklySummary();
  };

  // Prepare chart data
  const dailyChartData = weeklySummary 
    ? Object.entries(weeklySummary.daily_breakdown).map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        vehicles: stats.total
      }))
    : [];

  const vehicleTypeData = todaySummary?.vehicles_by_type
    ? Object.entries(todaySummary.vehicles_by_type).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count
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
                <FileText className="h-8 w-8 text-primary inline" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono inline">
                  Analytics Reports
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate and download comprehensive traffic analytics reports
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {loading && (
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary animate-pulse" />
            </div>
          )}

          {/* Today's Summary */}
          {todaySummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  Today's Total Detections
                </div>
                <div className="text-3xl font-mono font-bold mb-2">
                  {todaySummary.total_detections.toLocaleString()}
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
                  {todaySummary.unique_vehicles.toLocaleString()}
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
                  {Object.keys(todaySummary.vehicles_by_type).length}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 text-xs font-medium">
                  Categories Detected
                </div>
              </div>
            </div>
          )}

          {/* Download Reports Section */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
            <h2 className="text-xl font-bold mb-6 font-mono flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Reports
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
                Download CSV
              </Button>
              <Button 
                onClick={downloadJSON}
                disabled={loading || !startDate || !endDate}
                variant="outline"
                className="gap-2"
              >
                <FileJson className="h-4 w-4" />
                Download JSON
              </Button>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          {dailyChartData.length > 0 && (
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <h2 className="text-xl font-bold mb-6 font-mono">7-Day Vehicle Detection Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
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
                    name="Vehicles Detected"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Vehicle Type Distribution */}
          {vehicleTypeData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <h2 className="text-xl font-bold mb-6 font-mono">Today's Vehicle Types (Pie Chart)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vehicleTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vehicleTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
                <h2 className="text-xl font-bold mb-6 font-mono">Today's Vehicle Types (Bar Chart)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
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
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Weekly Summary Details */}
          {weeklySummary && (
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <h2 className="text-xl font-bold mb-6 font-mono">Weekly Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Period</div>
                  <div className="text-xl font-mono font-bold">
                    {new Date(weeklySummary.start_date).toLocaleDateString()} - {new Date(weeklySummary.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total Detections</div>
                  <div className="text-xl font-mono font-bold text-primary">
                    {weeklySummary.total_detections.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Unique Vehicles</div>
                  <div className="text-xl font-mono font-bold text-green-500">
                    {weeklySummary.unique_vehicles.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Daily Average</div>
                  <div className="text-xl font-mono font-bold text-orange-500">
                    {Math.round(weeklySummary.total_detections / 7).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-8">
            <h2 className="text-2xl font-bold mb-6 font-mono">Report Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">CSV Export</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Download raw detection data in CSV format for analysis in Excel, Google Sheets, or other tools.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">JSON Export</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Export structured analytics data in JSON format for integration with other systems and APIs.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Real-time Updates</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All reports include the latest data from live stream detections, updated in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsEnhanced;
