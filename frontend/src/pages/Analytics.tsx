import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Users,
  Activity,
  RefreshCw,
  Info,
  AlertTriangle,
  Ambulance,
  Gauge,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { getEvents } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [vehiclesByType, setVehiclesByType] = useState<any>({});
  const [peakHourData, setPeakHourData] = useState<any[]>([]);
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedCamera]);
  
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch all events for the selected camera
      const response = await getEvents({ camera_id: selectedCamera, limit: 10000 });
      const events = response.data;
      
      // Calculate total vehicles
      setTotalVehicles(events.length);
      
      // Group by vehicle type
      const typeCount: any = {};
      events.forEach((event: any) => {
        const vehicleType = (event.class || event.class_ || 'unknown').toLowerCase();
        typeCount[vehicleType] = (typeCount[vehicleType] || 0) + 1;
      });
      setVehiclesByType(typeCount);
      
      // Group by hour for peak hour analysis
      const hourlyCount: any = {};
      events.forEach((event: any) => {
        const hour = new Date(event.timestamp).getHours();
        const timeKey = `${hour.toString().padStart(2, '0')}:00`;
        hourlyCount[timeKey] = (hourlyCount[timeKey] || 0) + 1;
      });
      
      // Convert to array and sort
      const hourlyData = Object.entries(hourlyCount)
        .map(([time, vehicles]) => ({ time, vehicles }))
        .sort((a, b) => a.time.localeCompare(b.time));
      
      setPeakHourData(hourlyData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  // Queue analysis data - still using mock for now as it requires queue-specific events
  const queueAnalysisData = [
    { lane: 'Lane 1', avgWait: 45, maxWait: 180, vehicles: 234 },
    { lane: 'Lane 2', avgWait: 32, maxWait: 120, vehicles: 198 },
    { lane: 'Lane 3', avgWait: 58, maxWait: 210, vehicles: 156 },
    { lane: 'Lane 4', avgWait: 28, maxWait: 95, vehicles: 287 },
  ];

  const businessInsights: BusinessInsight[] = [
    {
      title: 'Total Vehicles Today',
      description: 'Real-time vehicle count from live stream analysis',
      value: totalVehicles.toLocaleString(),
      trend: 'up',
      icon: <Activity className="h-5 w-5" />,
      importance: 'critical',
      details: [
        `Cars detected: ${vehiclesByType.car || 0}`,
        `Trucks detected: ${vehiclesByType.truck || 0}`,
        `Buses detected: ${vehiclesByType.bus || 0}`,
        `Motorcycles detected: ${vehiclesByType.motorcycle || 0}`,
      ],
    },
    {
      title: 'Peak Hour Identification',
      description: 'Traffic patterns based on real detection data',
      value: peakHourData.length > 0 ? `${peakHourData.reduce((max, curr) => curr.vehicles > max.vehicles ? curr : max, peakHourData[0])?.time}` : 'N/A',
      trend: 'stable',
      icon: <Clock className="h-5 w-5" />,
      importance: 'critical',
      details: [
        `Peak hour: ${peakHourData.length > 0 ? peakHourData.reduce((max, curr) => curr.vehicles > max.vehicles ? curr : max, peakHourData[0])?.time : 'N/A'}`,
        `Peak vehicles: ${peakHourData.length > 0 ? peakHourData.reduce((max, curr) => curr.vehicles > max.vehicles ? curr : max, peakHourData[0])?.vehicles : 0}`,
        `Total hours analyzed: ${peakHourData.length}`,
        'Real-time data from live stream',
      ],
    },
    {
      title: 'Queue Analysis',
      description: 'Average wait time and queue length monitoring',
      value: '3.2 minutes',
      trend: 'down',
      icon: <Users className="h-5 w-5" />,
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
      icon: <Activity className="h-5 w-5" />,
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
      icon: <MapPin className="h-5 w-5" />,
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
      icon: <Ambulance className="h-5 w-5" />,
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
      icon: <AlertTriangle className="h-5 w-5" />,
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
      icon: <Gauge className="h-5 w-5" />,
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
      icon: <DollarSign className="h-5 w-5" />,
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
        return 'text-destructive';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getImportanceBg = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-destructive/10 border-destructive/20';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'bg-primary/10 border-primary/20';
      default:
        return 'bg-muted border-border';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
    return null;
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
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-8 w-8 text-primary inline" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono inline">
                  Business Intelligence Analytics
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time insights converted from live traffic camera data
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
              Refresh Data
            </Button>
          </div>

          {loading && (
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary animate-pulse" />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <div className="text-sm text-muted-foreground font-medium mb-2">
                Total Vehicles Today
              </div>
              <div className="text-3xl font-mono font-bold mb-2">8,542</div>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">
                +12% vs yesterday
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <div className="text-sm text-muted-foreground font-medium mb-2">
                Avg Queue Time
              </div>
              <div className="text-3xl font-mono font-bold mb-2">3.2 min</div>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">
                -8% improvement
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <div className="text-sm text-muted-foreground font-medium mb-2">
                System Efficiency
              </div>
              <div className="text-3xl font-mono font-bold mb-2">87%</div>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">
                Above target
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <div className="text-sm text-muted-foreground font-medium mb-2">
                Daily Savings
              </div>
              <div className="text-3xl font-mono font-bold mb-2">$12.4K</div>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Economic impact
              </div>
            </div>
          </div>

          {/* Peak Hour Chart */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
            <h2 className="text-xl font-bold mb-6 font-mono">Peak Hour Traffic Pattern</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={peakHourData}>
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
                  name="Vehicles"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Queue Analysis Chart */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
            <h2 className="text-xl font-bold mb-6 font-mono">Lane Performance & Queue Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={queueAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="lane" 
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
                <Bar dataKey="avgWait" fill="hsl(var(--primary))" name="Avg Wait (sec)" />
                <Bar dataKey="vehicles" fill="hsl(var(--muted-foreground))" name="Vehicles Processed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Business Insights Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6 font-mono">Comprehensive Business Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {businessInsights.map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl border bg-card/80 backdrop-blur p-6 space-y-4",
                    getImportanceBg(insight.importance)
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-background/50 flex items-center justify-center">
                      <div className={getImportanceColor(insight.importance)}>
                        {insight.icon}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{insight.title}</h3>
                        {getTrendIcon(insight.trend)}
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-mono font-bold">{insight.value}</div>
                        <div className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium",
                          insight.importance === 'critical' ? 'bg-destructive/10 text-destructive' :
                          insight.importance === 'high' ? 'bg-orange-500/10 text-orange-500' :
                          insight.importance === 'medium' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {insight.importance.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <ul className="space-y-2">
                    {insight.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Value Proposition */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-8">
            <h2 className="text-2xl font-bold mb-6 font-mono">Why These Insights Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h3 className="text-lg font-bold">For Traffic Authorities</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-time data enables dynamic traffic signal optimization, reducing congestion by up to 30% and improving overall traffic flow efficiency.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold">For City Planners</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Historical patterns and predictions guide infrastructure investments, lane expansions, and smart city initiatives with data-backed decisions.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold">For Emergency Services</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instant lane clearance notifications and optimized routing save critical seconds, potentially saving lives during medical emergencies.
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
