import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp } from '@mui/icons-material';

interface DataPoint {
  time: string;
  vehicles: number;
}

interface RealtimeChartProps {
  data: DataPoint[];
  title?: string;
}

const RealtimeChart: React.FC<RealtimeChartProps> = ({ data, title = 'Vehicles Per Minute' }) => {
  const latestValue = data.length > 0 ? data[data.length - 1].vehicles : 0;
  const previousValue = data.length > 1 ? data[data.length - 2].vehicles : 0;
  const change = latestValue - previousValue;
  const changePercent = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(1) : '0';

  return (
    <Card 
      elevation={0}
      className="glass-card fade-in"
      sx={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          borderColor: 'rgba(59, 130, 246, 0.4)',
          boxShadow: '0 12px 48px rgba(59, 130, 246, 0.2)',
          transform: 'translateY(-4px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                color: '#ffffff',
                mb: 1,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 500,
              }}
            >
              Real-time traffic monitoring
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              icon={<TrendingUp sx={{ fontSize: 18 }} />}
              label={`${change >= 0 ? '+' : ''}${changePercent}%`}
              size="small"
              sx={{
                bgcolor: change >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: change >= 0 ? '#10b981' : '#ef4444',
                border: `1px solid ${change >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            />
            <Box sx={{ 
              bgcolor: 'rgba(59, 130, 246, 0.15)', 
              px: 2, 
              py: 0.5, 
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 800 }}>
                {latestValue}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: '100%', height: 360 }}>
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.08)"
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(10, 14, 26, 0.98)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  padding: '12px 16px',
                }}
                cursor={{ stroke: 'rgba(59, 130, 246, 0.3)', strokeWidth: 2 }}
                labelStyle={{ color: '#3b82f6', fontWeight: 700, marginBottom: '4px' }}
              />
              <Legend 
                wrapperStyle={{ 
                  color: '#94a3b8', 
                  paddingTop: '20px',
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="vehicles"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#colorVehicles)"
                name="Vehicles/min"
                isAnimationActive={true}
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="vehicles" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#0a0e1a' }}
                activeDot={{ r: 7, fill: '#3b82f6', stroke: '#0a0e1a', strokeWidth: 3 }}
                name="Vehicles/min"
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RealtimeChart;
