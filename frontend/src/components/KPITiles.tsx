import { Car, Timer, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPITilesProps {
  totalEvents: number;
  avgDwellTime: number;
  queueLength: number;
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  delay?: number;
}

function KPICard({ title, value, subtitle, icon, trend, trendUp, delay = 0 }: KPICardProps) {
  return (
    <div
      className="animate-fade-in group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-foreground/30 hover:glow"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent animate-scan" />
      </div>
      
      {/* Top border accent */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary">
            {icon}
          </div>
          <div className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs",
            trendUp 
              ? "border-foreground/20 text-foreground" 
              : "border-muted-foreground/20 text-muted-foreground"
          )}>
            {trendUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend}
          </div>
        </div>
        
        <div className="mt-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export function KPITiles({ totalEvents, avgDwellTime, queueLength }: KPITilesProps) {
  const kpis = [
    {
      title: 'Total Vehicles',
      value: totalEvents.toLocaleString(),
      subtitle: 'Detected Today',
      icon: <Car className="h-6 w-6 text-foreground" />,
      trend: '+2.5%',
      trendUp: true,
    },
    {
      title: 'Avg Dwell Time',
      value: `${avgDwellTime.toFixed(1)}s`,
      subtitle: 'Per Vehicle',
      icon: <Timer className="h-6 w-6 text-foreground" />,
      trend: '-1.2%',
      trendUp: false,
    },
    {
      title: 'Queue Length',
      value: queueLength.toString(),
      subtitle: 'Active Queues',
      icon: <Users className="h-6 w-6 text-foreground" />,
      trend: '+0.8%',
      trendUp: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.title} {...kpi} delay={index * 100} />
      ))}
    </div>
  );
}
