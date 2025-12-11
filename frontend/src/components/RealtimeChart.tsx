import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  time: string;
  vehicles: number;
}

interface RealtimeChartProps {
  data: DataPoint[];
  title?: string;
}

const RealtimeChart: React.FC<RealtimeChartProps> = ({ data, title = 'Vehicles Per Minute' }) => {
  return (
    <Card 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(14, 165, 233, 0.15)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'rgba(14, 165, 233, 0.3)',
        }
      }}
    >
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: '#f8fafc',
            mb: 3
          }}
        >
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)"
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
                cursor={{ stroke: 'rgba(14, 165, 233, 0.5)' }}
              />
              <Legend 
                wrapperStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="vehicles" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0ea5e9' }}
                activeDot={{ r: 6, fill: '#0ea5e9' }}
                name="Vehicles/min"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RealtimeChart;
