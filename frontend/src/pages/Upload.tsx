import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Stack,
  Divider,
  Container,
} from '@mui/material';
import {
  CloudUpload,
  Image as ImageIcon,
  VideoLibrary,
  Delete,
  ZoomIn,
  ZoomOut,
  Refresh,
  Menu as MenuIcon,
  Logout,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

interface Detection {
  bbox: [number, number, number, number];
  confidence: number;
  class: string;
  frame?: number;
  timestamp?: number;
}

interface DetectionResult {
  detections: Detection[];
  count?: number;
  total_detections?: number;
  processing_time: number;
  image_size?: [number, number];
  video_size?: [number, number];
  vehicle_counts?: { [key: string]: number };
  frames_processed?: number;
  total_frames?: number;
  fps?: number;
  sample_rate?: number;
}

const Upload: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (tabValue === 0 && !isImage) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    
    if (tabValue === 1 && !isVideo) {
      setError('Please select a video file (MP4, AVI, etc.)');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setDetectionResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setDetectionResult(null);
    setError(null);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const drawDetections = (imageElement: HTMLImageElement, detections: Detection[]) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    // Set canvas size to match image
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;

    console.log('Canvas dimensions:', canvas.width, canvas.height);
    console.log('Drawing detections:', detections.length);

    // Draw image
    ctx.drawImage(imageElement, 0, 0);

    // Draw detections
    detections.forEach((detection, idx) => {
      const [x1, y1, x2, y2] = detection.bbox;
      const width = x2 - x1;
      const height = y2 - y1;

      console.log(`Detection ${idx}:`, { x1, y1, x2, y2, width, height, class: detection.class });

      // Get color based on vehicle type
      const color = getVehicleTypeColor(detection.class);

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(x1, y1, width, height);

      // Draw label background
      const label = `${detection.class} ${(detection.confidence * 100).toFixed(1)}%`;
      ctx.font = 'bold 18px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 24;
      const padding = 8;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight - padding, textMetrics.width + padding * 2, textHeight + padding);

      // Draw label text
      ctx.fillStyle = '#fff';
      ctx.fillText(label, x1 + padding, y1 - padding);
    });
    
    console.log('Drawing complete');
  };

  const handleDetect = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = tabValue === 0 
        ? 'http://localhost:8000/api/v1/detect/image'
        : 'http://localhost:8000/api/v1/detect/video';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`);
      }

      const result: DetectionResult = await response.json();
      console.log('Detection result:', result);
      
      // Normalize the result to have a count field
      if (tabValue === 1 && result.total_detections !== undefined) {
        result.count = result.total_detections;
      }
      
      setDetectionResult(result);

      // Draw detections on canvas for images - use setTimeout to ensure canvas is rendered
      if (tabValue === 0 && preview) {
        console.log('Creating image for drawing detections');
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Enable CORS
        img.onload = () => {
          console.log('Image loaded, dimensions:', img.width, img.height);
          // Wait for React to render the canvas element
          setTimeout(() => {
            drawDetections(img, result.detections);
          }, 100);
        };
        img.onerror = (err) => {
          console.error('Image load error:', err);
          setError('Failed to load image for detection visualization');
        };
        img.src = preview;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const getVehicleTypeColor = (vehicleType: string): string => {
    const colors: { [key: string]: string } = {
      car: '#4caf50',
      truck: '#ff9800',
      bus: '#2196f3',
      motorcycle: '#9c27b0',
      bicycle: '#00bcd4',
      bike: '#00bcd4',
      person: '#f44336',
      van: '#ff5722',
    };
    return colors[vehicleType.toLowerCase()] || '#00ff00';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: { xs: 'column', md: 'row' } }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />

      <Box
        sx={{
          flexGrow: 1,
          marginLeft: { xs: 0, md: sidebarOpen ? '280px' : '72px' },
          transition: 'margin-left 0.3s',
          width: { xs: '100%', md: 'auto' },
        }}
      >
        {/* AppBar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: '#1e293b',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Vehicle Flow Analyzer
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Header */}
          <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: '#0ea5e9',
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Vehicle Detection Upload
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                px: { xs: 1, sm: 0 }
              }}
            >
              Upload images or videos to detect and analyze vehicles using AI
            </Typography>
          </Box>

          {/* Tabs */}
          <Paper 
            elevation={3} 
            sx={{ 
              mb: { xs: 3, md: 4 }, 
              borderRadius: 2,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(_, v) => { setTabValue(v); handleClear(); }}
              centered
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                  fontWeight: 600,
                  minHeight: { xs: 56, sm: 64 },
                  textTransform: 'none',
                  px: { xs: 1, sm: 2 },
                },
                '& .Mui-selected': {
                  color: '#0ea5e9 !important',
                },
              }}
            >
              <Tab 
                icon={<ImageIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />} 
                label="Image Upload" 
                iconPosition="start" 
              />
              <Tab 
                icon={<VideoLibrary sx={{ fontSize: { xs: 24, sm: 28 } }} />} 
                label="Video Upload" 
                iconPosition="start" 
              />
            </Tabs>
          </Paper>

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {/* Upload Section */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={4}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  border: '1px solid rgba(14, 165, 233, 0.1)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(14, 165, 233, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {tabValue === 0 ? <ImageIcon sx={{ color: '#0ea5e9', fontSize: 28 }} /> : <VideoLibrary sx={{ color: '#0ea5e9', fontSize: 28 }} />}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {tabValue === 0 ? 'Upload Image' : 'Upload Video'}
                    </Typography>
                  </Stack>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={tabValue === 0 ? 'image/*' : 'video/*'}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  <Box
                    sx={{
                      border: '3px dashed rgba(14, 165, 233, 0.3)',
                      borderRadius: 3,
                      p: { xs: 4, sm: 5, md: 6 },
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: 'rgba(14, 165, 233, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        borderColor: '#0ea5e9', 
                        bgcolor: 'rgba(14, 165, 233, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={handleUploadClick}
                  >
                    <CloudUpload sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, color: '#0ea5e9', mb: 2 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Click to select {tabValue === 0 ? 'an image' : 'a video'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                      {tabValue === 0 ? 'Supported: JPG, PNG, GIF' : 'Supported: MP4, AVI, MOV'}
                    </Typography>
                  </Box>

              {selectedFile && (
                <Box sx={{ mt: 3 }}>
                  <Paper 
                    elevation={2}
                    sx={{ 
                      p: { xs: 2, sm: 2.5 }, 
                      mb: 2, 
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                      border: '1px solid rgba(14, 165, 233, 0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <CheckCircle sx={{ color: '#22c55e', fontSize: { xs: 28, sm: 32 } }} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#0ea5e9',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                      onClick={handleDetect}
                      disabled={loading}
                      fullWidth
                      sx={{
                        py: { xs: 1.2, sm: 1.5 },
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        },
                      }}
                    >
                      {loading ? 'Analyzing...' : 'Detect Vehicles'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Delete />}
                      onClick={handleClear}
                      disabled={loading}
                      sx={{
                        py: { xs: 1.2, sm: 1.5 },
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        minWidth: { xs: '100%', sm: 'auto' },
                        borderColor: 'rgba(239, 68, 68, 0.5)',
                        color: '#ef4444',
                        '&:hover': {
                          borderColor: '#ef4444',
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                        },
                      }}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Box>
              )}

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 3 }}
                  icon={<ErrorIcon />}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {error}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Detection Results */}
          {detectionResult && (
            <Card 
              elevation={4}
              sx={{ 
                mt: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <CheckCircle sx={{ color: '#22c55e', fontSize: { xs: 28, sm: 32 } }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#22c55e', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Detection Complete
                  </Typography>
                </Stack>

                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        textAlign: 'center',
                        bgcolor: 'rgba(14, 165, 233, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(14, 165, 233, 0.2)',
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#0ea5e9', mb: 1, fontSize: { xs: '2rem', sm: '3rem' } }}>
                        {detectionResult.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Vehicles Detected
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        textAlign: 'center',
                        bgcolor: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#a855f7', mb: 1, fontSize: { xs: '2rem', sm: '3rem' } }}>
                        {detectionResult.processing_time.toFixed(2)}s
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Processing Time
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        textAlign: 'center',
                        bgcolor: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.8rem' } }}>
                        {detectionResult.image_size 
                          ? `${detectionResult.image_size[0]}×${detectionResult.image_size[1]}`
                          : detectionResult.video_size 
                          ? `${detectionResult.video_size[0]}×${detectionResult.video_size[1]}`
                          : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Resolution
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Video-specific stats */}
                {detectionResult.frames_processed && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Video Analysis Details:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: { xs: 1.5, sm: 2 }, 
                            textAlign: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#60a5fa', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {detectionResult.frames_processed}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Frames Analyzed
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: { xs: 1.5, sm: 2 }, 
                            textAlign: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#60a5fa', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {detectionResult.fps}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Video FPS
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: { xs: 1.5, sm: 2 }, 
                            textAlign: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#60a5fa', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {detectionResult.total_frames}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Total Frames
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: { xs: 1.5, sm: 2 }, 
                            textAlign: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#60a5fa', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {detectionResult.sample_rate}x
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Sample Rate
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {detectionResult.vehicle_counts && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Vehicle Type Distribution:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                          {Object.entries(detectionResult.vehicle_counts).map(([type, count]) => (
                            <Paper 
                              key={type}
                              elevation={0}
                              sx={{ 
                                px: 2, 
                                py: 1,
                                bgcolor: getVehicleTypeColor(type),
                                borderRadius: 2,
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                {type}: {count}
                              </Typography>
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}


                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#0ea5e9', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Detected Vehicles:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}>
                  {detectionResult.detections.map((detection, idx) => (
                    <Chip
                      key={idx}
                      label={`${detection.class} (${(detection.confidence * 100).toFixed(1)}%)`}
                      sx={{
                        bgcolor: getVehicleTypeColor(detection.class),
                        color: '#fff',
                        fontSize: { xs: '0.75rem', sm: '0.9rem' },
                        fontWeight: 600,
                        py: { xs: 2, sm: 2.5 },
                        px: { xs: 0.5, sm: 1 },
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

            {/* Preview Section */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={4}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  border: '1px solid rgba(14, 165, 233, 0.1)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box 
                        sx={{ 
                          p: { xs: 1, sm: 1.5 }, 
                          borderRadius: 2, 
                          bgcolor: 'rgba(14, 165, 233, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ImageIcon sx={{ color: '#0ea5e9', fontSize: { xs: 24, sm: 28 } }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Preview & Detections
                      </Typography>
                    </Stack>
                    {preview && (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton 
                          onClick={handleZoomOut} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(14, 165, 233, 0.1)',
                            '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.2)' },
                          }}
                        >
                          <ZoomOut sx={{ color: '#0ea5e9', fontSize: { xs: 20, sm: 24 } }} />
                        </IconButton>
                        <IconButton 
                          onClick={handleResetZoom} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(14, 165, 233, 0.1)',
                            '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.2)' },
                          }}
                        >
                          <Refresh sx={{ color: '#0ea5e9', fontSize: { xs: 20, sm: 24 } }} />
                        </IconButton>
                        <IconButton 
                          onClick={handleZoomIn} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(14, 165, 233, 0.1)',
                            '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.2)' },
                          }}
                        >
                          <ZoomIn sx={{ color: '#0ea5e9', fontSize: { xs: 20, sm: 24 } }} />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>

                  <Box
                    sx={{
                      minHeight: { xs: 300, sm: 400, md: 500 },
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'auto',
                      position: 'relative',
                      border: '2px solid rgba(14, 165, 233, 0.2)',
                    }}
                  >
                    {!preview && (
                      <Stack alignItems="center" spacing={2}>
                        <ImageIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: 'rgba(148, 163, 184, 0.3)' }} />
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          No file selected
                        </Typography>
                      </Stack>
                    )}

                    {preview && tabValue === 0 && (
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          transform: `scale(${zoom})`, 
                          transformOrigin: 'center', 
                          p: 2,
                          maxWidth: '100%',
                          overflow: 'auto',
                        }}
                      >
                        {!detectionResult && (
                          <img
                            src={preview}
                            alt="Preview"
                            style={{ 
                              width: '100%',
                              height: 'auto',
                              display: 'block', 
                              borderRadius: '8px',
                              objectFit: 'contain',
                            }}
                          />
                        )}
                        {detectionResult && (
                          <canvas
                            ref={canvasRef}
                            style={{ 
                              width: '100%',
                              height: 'auto',
                              display: 'block', 
                              borderRadius: '8px',
                              objectFit: 'contain',
                            }}
                          />
                        )}
                      </Box>
                    )}

                    {preview && tabValue === 1 && (
                      <video
                        src={preview}
                        controls
                        style={{ 
                          maxWidth: '100%', 
                          transform: `scale(${zoom})`,
                          borderRadius: '8px',
                        }}
                      />
                    )}
                  </Box>

                  {detectionResult && (
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mt: 3,
                        bgcolor: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        '& .MuiAlert-icon': {
                          color: '#22c55e',
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Detection complete! Found {detectionResult.count} vehicle(s) in {detectionResult.processing_time.toFixed(2)} seconds.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Upload;
