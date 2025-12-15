import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
  time: string;
  vehicles: number;
}

interface RealtimeChartProps {
  data: DataPoint[];
  title?: string;
}

export function RealtimeChart({ data, title = 'Vehicles Per Minute' }: RealtimeChartProps) {
  const latestValue = data.length > 0 ? data[data.length - 1].vehicles : 0;
  const previousValue = data.length > 1 ? data[data.length - 2].vehicles : 0;
  const change = latestValue - previousValue;
  const changePercent = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(1) : '0';
  const isPositive = change >= 0;

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-card p-6" style={{ animationDelay: '200ms' }}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          <p className="mt-1 font-mono text-2xl font-bold text-foreground">
            {latestValue}
          </p>
          <p className="text-sm text-muted-foreground">Real-time traffic monitoring</p>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-xs",
          isPositive ? "border-foreground/20 text-foreground" : "border-muted-foreground/20 text-muted-foreground"
        )}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? '+' : ''}{changePercent}%
        </div>
      </div>
      
      <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="vehicleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 0%, 100%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(0, 0%, 100%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(0, 0%, 18%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(0, 0%, 50%)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(0, 0%, 50%)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 4%)',
                border: '1px solid hsl(0, 0%, 18%)',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 60%)' }}
              itemStyle={{ color: 'hsl(0, 0%, 100%)' }}
            />
            <Area
              type="monotone"
              dataKey="vehicles"
              stroke="hsl(0, 0%, 100%)"
              strokeWidth={2}
              fill="url(#vehicleGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: 'hsl(0, 0%, 100%)',
                stroke: 'hsl(0, 0%, 0%)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
