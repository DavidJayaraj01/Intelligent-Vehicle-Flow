import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { DirectionsCar, Timer, Queue } from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';

interface KPITilesProps {
  totalEvents: number;
  avgDwellTime: number;
  queueLength: number;
}

const KPITiles: React.FC<KPITilesProps> = ({ totalEvents, avgDwellTime, queueLength }) => {
  const { mode } = useThemeContext();
  const kpis = [
    {
      title: 'Total Vehicles',
      value: totalEvents.toLocaleString(),
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      color: mode === 'dark' ? '#ffffff' : '#000000',
      bgColor: mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
      trend: '+2.5%',
    },
    {
      title: 'Avg Dwell Time',
      value: `${avgDwellTime.toFixed(1)}s`,
      icon: <Timer sx={{ fontSize: 40 }} />,
      color: mode === 'dark' ? '#ffffff' : '#000000',
      bgColor: mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
      trend: '-1.2%',
    },
    {
      title: 'Queue Length',
      value: queueLength.toString(),
      icon: <Queue sx={{ fontSize: 40 }} />,
      color: mode === 'dark' ? '#ffffff' : '#000000',
      bgColor: mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
      trend: '+0.8%',
    },
  ];

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'background.paper',
              backdropFilter: 'none',
              border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
              borderRadius: '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'none',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: `rgba(255, 255, 255, 0.15)`,
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.3)`,
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    color="text.secondary" 
                    gutterBottom 
                    variant="overline"
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: 600,
                      letterSpacing: '0.5px'
                    }}
                  >
                    {kpi.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 1
                    }}
                  >
                    {kpi.value}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: kpi.color,
                      fontWeight: 600
                    }}
                  >
                    {kpi.trend} from last hour
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: kpi.bgColor,
                    borderRadius: '12px',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 70,
                    minHeight: 70,
                  }}
                >
                  {React.cloneElement(kpi.icon, { sx: { color: kpi.color, fontSize: 40 } })}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KPITiles;
