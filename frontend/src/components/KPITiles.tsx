import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { DirectionsCar, Timer, Queue, TrendingUp, TrendingDown } from '@mui/icons-material';

interface KPITilesProps {
  totalEvents: number;
  avgDwellTime: number;
  queueLength: number;
}

const KPITiles: React.FC<KPITilesProps> = ({ totalEvents, avgDwellTime, queueLength }) => {
  const kpis = [
    {
      title: 'Total Vehicles',
      value: totalEvents.toLocaleString(),
      icon: <DirectionsCar sx={{ fontSize: 44 }} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      glowColor: 'rgba(59, 130, 246, 0.3)',
      trend: '+2.5%',
      trendUp: true,
      subtitle: 'Detected Today',
    },
    {
      title: 'Avg Dwell Time',
      value: `${avgDwellTime.toFixed(1)}s`,
      icon: <Timer sx={{ fontSize: 44 }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      trend: '-1.2%',
      trendUp: false,
      subtitle: 'Per Vehicle',
    },
    {
      title: 'Queue Length',
      value: queueLength.toString(),
      icon: <Queue sx={{ fontSize: 44 }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      glowColor: 'rgba(239, 68, 68, 0.3)',
      trend: '+0.8%',
      trendUp: true,
      subtitle: 'Active Queues',
    },
  ];

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card 
            className="fade-in glass-card card-hover"
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${kpi.bgColor} 0%, rgba(255, 255, 255, 0.02) 100%)`,
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                borderColor: kpi.color,
                boxShadow: `0 12px 40px ${kpi.glowColor}, 0 0 20px ${kpi.glowColor}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${kpi.color}, transparent)`,
                opacity: 0,
                transition: 'opacity 0.3s',
              },
              '&:hover::before': {
                opacity: 1,
              },
              animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards`,
            }}
          >
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    color="text.secondary" 
                    gutterBottom 
                    variant="overline"
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 700,
                      letterSpacing: '1.2px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {kpi.title}
                  </Typography>
                  <Typography 
                    variant="h3" 
                    component="div" 
                    sx={{ 
                      fontWeight: 800,
                      color: '#ffffff',
                      mb: 0.5,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {kpi.value}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      display: 'block',
                      mb: 1.5,
                    }}
                  >
                    {kpi.subtitle}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {kpi.trendUp ? (
                      <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: '#10b981' }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#10b981',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {kpi.trend}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.75rem',
                        ml: 0.5,
                      }}
                    >
                      vs last hour
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${kpi.bgColor}, ${kpi.color}20)`,
                    borderRadius: '16px',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 80,
                    minHeight: 80,
                    border: `1px solid ${kpi.color}30`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'rotate(5deg) scale(1.1)',
                      boxShadow: `0 0 20px ${kpi.glowColor}`,
                    }
                  }}
                >
                  {React.cloneElement(kpi.icon, { sx: { color: kpi.color, fontSize: 44 } })}
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
