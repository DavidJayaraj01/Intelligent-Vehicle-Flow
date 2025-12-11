import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useThemeContext } from '../contexts/ThemeContext';

interface DataPoint {
  time: string;
  vehicles: number;
}

interface RealtimeChartProps {
  data: DataPoint[];
  title?: string;
}

const RealtimeChart: React.FC<RealtimeChartProps> = ({ data, title = 'Vehicles Per Minute' }) => {
  const { mode } = useThemeContext();
  return (
    <Card 
      elevation={0}
      sx={{
        background: 'background.paper',
        backdropFilter: 'none',
        border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
        borderRadius: '8px',
        boxShadow: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: mode === 'dark' ? '#333333' : '#cccccc',
        }
      }}
    >
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
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
                stroke={mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: mode === 'dark' ? '#999999' : '#666666' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke={mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: mode === 'dark' ? '#999999' : '#666666' }}
                stroke={mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: mode === 'dark' ? '#0a0a0a' : '#fafafa',
                  border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  color: mode === 'dark' ? '#ffffff' : '#000000'
                }}
                cursor={{ stroke: mode === 'dark' ? '#333333' : '#cccccc' }}
              />
              <Legend 
                wrapperStyle={{ color: mode === 'dark' ? '#999999' : '#666666' }}
              />
              <Line 
                type="monotone" 
                dataKey="vehicles" 
                stroke={mode === 'dark' ? '#ffffff' : '#000000'}
                strokeWidth={2}
                dot={{ r: 4, fill: mode === 'dark' ? '#ffffff' : '#000000' }}
                activeDot={{ r: 6, fill: mode === 'dark' ? '#ffffff' : '#000000' }}
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
