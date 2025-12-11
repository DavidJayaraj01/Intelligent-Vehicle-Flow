import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  BarChart,
  ShowChart,
  Timeline,
  Notifications,
  Save,
  Restore,
  GridOn,
  Animation,
  Speed,
  CheckCircle,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { useThemeContext } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01');
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    mode,
    toggleTheme,
    chartType,
    setChartType,
    showGrid,
    toggleGrid,
    animationsEnabled,
    toggleAnimations,
  } = useThemeContext();

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      theme: mode,
      chartType,
      showGrid,
      animationsEnabled,
      notifications,
      autoRefresh,
      refreshInterval,
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetSettings = () => {
    if (mode === 'light') toggleTheme();
    setChartType('line');
    if (!showGrid) toggleGrid();
    if (!animationsEnabled) toggleAnimations();
    setNotifications(true);
    setAutoRefresh(true);
    setRefreshInterval(5);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          ml: sidebarOpen ? '280px' : '64px',
          transition: 'margin 0.2s ease-in-out',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Settings & Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize your dashboard experience and display preferences
          </Typography>
        </Box>

        {saveSuccess && (
          <Alert
            severity="success"
            icon={<CheckCircle />}
            sx={{ mb: 3 }}
            onClose={() => setSaveSuccess(false)}
          >
            Settings saved successfully!
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Appearance Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {mode === 'dark' ? <DarkMode /> : <LightMode />}
                  Appearance
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mode === 'dark'}
                        onChange={toggleTheme}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Dark Mode</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Theme Preview
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
                    }}
                  >
                    <Chip label="Primary" color="primary" />
                    <Chip label="Success" color="success" />
                    <Chip label="Warning" color="warning" />
                    <Chip label="Error" color="error" />
                  </Box>
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={animationsEnabled}
                        onChange={toggleAnimations}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Enable Animations</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Smooth transitions and loading animations
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timeline />
                  Chart Preferences
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Default Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    label="Default Chart Type"
                  >
                    <MenuItem value="line">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShowChart fontSize="small" />
                        Line Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="bar">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BarChart fontSize="small" />
                        Bar Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="area">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timeline fontSize="small" />
                        Area Chart
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showGrid}
                        onChange={toggleGrid}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Show Grid Lines</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Display grid on charts for better readability
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Chart Preview
                  </Typography>
                  <Box
                    sx={{
                      height: 100,
                      bgcolor: mode === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${mode === 'dark' ? '#333' : '#ddd'}`,
                    }}
                  >
                    {chartType === 'line' && <ShowChart sx={{ fontSize: 40, color: 'text.secondary' }} />}
                    {chartType === 'bar' && <BarChart sx={{ fontSize: 40, color: 'text.secondary' }} />}
                    {chartType === 'area' && <Timeline sx={{ fontSize: 40, color: 'text.secondary' }} />}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Data & Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed />
                  Data & Performance
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Auto Refresh</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically update data from live feed
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {autoRefresh && (
                  <Box sx={{ mb: 3, px: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Refresh Interval: {refreshInterval} seconds
                    </Typography>
                    <Slider
                      value={refreshInterval}
                      onChange={(_, value) => setRefreshInterval(value as number)}
                      min={1}
                      max={30}
                      step={1}
                      marks={[
                        { value: 1, label: '1s' },
                        { value: 15, label: '15s' },
                        { value: 30, label: '30s' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <GridOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cache Status"
                      secondary="3.2 MB cached data"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Speed />
                    </ListItemIcon>
                    <ListItemText
                      primary="Performance"
                      secondary="Optimal - 60 FPS rendering"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Notifications />
                  Notifications
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Enable Notifications</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive alerts for critical events
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {notifications && (
                  <Box sx={{ pl: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked size="small" />}
                      label={
                        <Typography variant="body2">Emergency vehicle detection</Typography>
                      }
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked size="small" />}
                      label={
                        <Typography variant="body2">High queue alerts ({">"} 20 vehicles)</Typography>
                      }
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked size="small" />}
                      label={
                        <Typography variant="body2">System status changes</Typography>
                      }
                    />
                    <FormControlLabel
                      control={<Switch size="small" />}
                      label={
                        <Typography variant="body2">Daily reports summary</Typography>
                      }
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Advanced Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Advanced Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Date Format</InputLabel>
                      <Select defaultValue="MM/DD/YYYY" label="Date Format">
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Time Format</InputLabel>
                      <Select defaultValue="12h" label="Time Format">
                        <MenuItem value="12h">12-hour</MenuItem>
                        <MenuItem value="24h">24-hour</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Language</InputLabel>
                      <Select defaultValue="en" label="Language">
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Español</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Timezone</InputLabel>
                      <Select defaultValue="UTC" label="Timezone">
                        <MenuItem value="UTC">UTC</MenuItem>
                        <MenuItem value="EST">EST</MenuItem>
                        <MenuItem value="PST">PST</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Restore />}
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
