import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { DirectionsCar, Timer, Queue } from '@mui/icons-material';

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
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Avg Dwell Time',
      value: `${avgDwellTime.toFixed(1)}s`,
      icon: <Timer sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff4e6',
    },
    {
      title: 'Queue Length',
      value: queueLength.toString(),
      icon: <Queue sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
  ];

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    {kpi.title}
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {kpi.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: kpi.bgColor,
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
