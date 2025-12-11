import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Users,
  Activity,
  RefreshCw,
  BarChart3,
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

  const peakHourData = [
    { time: '06:00', vehicles: 45 },
    { time: '07:00', vehicles: 120 },
    { time: '08:00', vehicles: 280 },
    { time: '09:00', vehicles: 190 },
    { time: '10:00', vehicles: 140 },
    { time: '12:00', vehicles: 150 },
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
      description: 'Morning and evening rush hours identified',
      value: '8:00 AM & 6:00 PM',
      trend: 'stable',
      icon: <Clock className="h-5 w-5" />,
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
      description: 'Average wait time monitoring',
      value: '3.2 minutes',
      trend: 'down',
      icon: <Users className="h-5 w-5" />,
      importance: 'high',
      details: [
        'Average queue length: 12 vehicles',
        'Maximum queue: 28 vehicles at 6:15 PM',
        'Queue clearance: 85% efficiency',
        'Wait time reduced by 15% from last week',
      ],
    },
    {
      title: 'Traffic Flow Efficiency',
      description: 'Overall system performance',
      value: '87%',
      trend: 'up',
      icon: <Activity className="h-5 w-5" />,
      importance: 'high',
      details: [
        'Average throughput: 1,250 vehicles/hour',
        'System uptime: 99.8%',
        'Processing accuracy: 94.2%',
        'Improved by 8% this month',
      ],
    },
  ];

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
                Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Business Insights & Traffic Analysis
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          {/* Business Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {businessInsights.map((insight, index) => (
              <div
                key={index}
                className="animate-fade-in rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    insight.importance === 'critical' ? "bg-destructive/10" :
                    insight.importance === 'high' ? "bg-primary/10" :
                    "bg-muted"
                  )}>
                    <div className={cn(
                      insight.importance === 'critical' ? "text-destructive" :
                      insight.importance === 'high' ? "text-primary" :
                      "text-muted-foreground"
                    )}>
                      {insight.icon}
                    </div>
                  </div>
                  {insight.trend && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-mono",
                      insight.trend === 'up' ? "text-green-400" :
                      insight.trend === 'down' ? "text-destructive" :
                      "text-muted-foreground"
                    )}>
                      {insight.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                       insight.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                <p className="text-2xl font-bold font-mono text-primary mb-4">{insight.value}</p>

                <div className="space-y-2">
                  {insight.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Peak Hour Traffic */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6">
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Peak Hour Traffic
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vehicles per hour throughout the day
                </p>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={peakHourData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" vertical={false} />
                    <XAxis dataKey="time" stroke="hsl(0, 0%, 50%)" style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="hsl(0, 0%, 50%)" style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 4%)',
                        border: '1px solid hsl(0, 0%, 18%)',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="vehicles" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Queue Analysis */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6">
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Lane Performance
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Average wait time by lane (seconds)
                </p>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queueAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" vertical={false} />
                    <XAxis dataKey="lane" stroke="hsl(0, 0%, 50%)" style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="hsl(0, 0%, 50%)" style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 4%)',
                        border: '1px solid hsl(0, 0%, 18%)',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="avgWait" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Statistics Table */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Lane Statistics
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Detailed performance metrics
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-mono text-muted-foreground">LANE</th>
                    <th className="text-left py-3 px-4 text-xs font-mono text-muted-foreground">AVG WAIT</th>
                    <th className="text-left py-3 px-4 text-xs font-mono text-muted-foreground">MAX WAIT</th>
                    <th className="text-left py-3 px-4 text-xs font-mono text-muted-foreground">VEHICLES</th>
                    <th className="text-left py-3 px-4 text-xs font-mono text-muted-foreground">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {queueAnalysisData.map((lane, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm">{lane.lane}</td>
                      <td className="py-3 px-4 font-mono text-sm">{lane.avgWait}s</td>
                      <td className="py-3 px-4 font-mono text-sm">{lane.maxWait}s</td>
                      <td className="py-3 px-4 font-mono text-sm">{lane.vehicles}</td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "inline-block px-2 py-1 rounded text-xs font-mono",
                          lane.avgWait < 40 ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                          lane.avgWait < 60 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" :
                          "bg-destructive/10 text-destructive border border-destructive/30"
                        )}>
                          {lane.avgWait < 40 ? 'OPTIMAL' : lane.avgWait < 60 ? 'MODERATE' : 'SLOW'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
