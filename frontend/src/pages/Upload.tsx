import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import {
  CloudUpload,
  Image as ImageIcon,
  VideoLibrary,
  Delete,
  ZoomIn,
  ZoomOut,
  Refresh,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;

    ctx.drawImage(imageElement, 0, 0);

    detections.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.bbox;
      const width = x2 - x1;
      const height = y2 - y1;
      const color = getVehicleTypeColor(detection.class);

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeRect(x1, y1, width, height);
      ctx.shadowColor = 'transparent';

      const label = `${detection.class} ${(detection.confidence * 100).toFixed(1)}%`;
      ctx.font = 'bold 18px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 24;
      const padding = 8;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight - padding, textMetrics.width + padding * 2, textHeight + padding);

      ctx.fillStyle = '#fff';
      ctx.fillText(label, x1 + padding, y1 - padding);
    });
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
      
      if (tabValue === 1 && result.total_detections !== undefined) {
        result.count = result.total_detections;
      }
      
      setDetectionResult(result);

      if (tabValue === 0 && preview) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setTimeout(() => {
            drawDetections(img, result.detections);
          }, 100);
        };
        img.src = preview;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const getVehicleTypeColor = (vehicleType: string): string => {
    const colors: { [key: string]: string } = {
      car: '#0ea5e9',
      truck: '#f59e0b',
      bus: '#6366f1',
      motorcycle: '#ec4899',
      bicycle: '#10b981',
      bike: '#10b981',
      person: '#ef4444',
      van: '#f97316',
    };
    return colors[vehicleType.toLowerCase()] || '#94a3b8';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />

      <Box
        sx={{
          flexGrow: 1,
          marginLeft: sidebarOpen ? '280px' : '72px',
          transition: 'margin-left 0.3s',
          bgcolor: '#000000',
        }}
      >
        <Layout>
          {/* Hero Section */}
          <Box sx={{ mb: 8 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900,
                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.8rem' },
                color: '#ffffff',
                mb: 2.5,
                letterSpacing: '-1px',
              }}
            >
              Vehicle Detection
            </Typography>
            <Typography 
              variant="h5"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 400,
                fontSize: { xs: '1.05rem', md: '1.25rem' },
                maxWidth: '700px',
                lineHeight: 1.6,
              }}
            >
              Upload and analyze images or videos with advanced AI-powered vehicle detection technology
            </Typography>
          </Box>

          {/* Tabs */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 6, 
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'none',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              boxShadow: 'none',
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(_, v) => { setTabValue(v); handleClear(); }}
              centered
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  minHeight: 72,
                  textTransform: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#ffffff',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                },
                '& .Mui-selected': {
                  color: '#ffffff !important',
                },
                '& .MuiTabs-indicator': {
                  background: '#ffffff',
                  height: 4,
                  borderRadius: '2px',
                },
              }}
            >
              <Tab 
                icon={<ImageIcon sx={{ fontSize: 28, mr: 1 }} />} 
                label="Image Upload" 
                iconPosition="start" 
              />
              <Tab 
                icon={<VideoLibrary sx={{ fontSize: 28, mr: 1 }} />} 
                label="Video Upload" 
                iconPosition="start" 
              />
            </Tabs>
          </Paper>

          <Grid container spacing={5}>
            {/* Upload Section */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(14, 165, 233, 0.15)',
                  height: '100%',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    boxShadow: '0 12px 48px rgba(14, 165, 233, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 4 }}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: '12px', 
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {tabValue === 0 ? 
                        <ImageIcon sx={{ color: '#ffffff', fontSize: 32 }} /> : 
                        <VideoLibrary sx={{ color: '#ffffff', fontSize: 32 }} />
                      }
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#ffffff' }}>
                        {tabValue === 0 ? 'Upload Image' : 'Upload Video'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {tabValue === 0 ? 'JPG, PNG, GIF' : 'MP4, AVI, MOV'}
                      </Typography>
                    </Box>
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
                      border: '3px dashed rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      p: 6,
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={handleUploadClick}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        animation: 'float 3s ease-in-out infinite',
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-10px)' },
                        },
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 80, color: '#ffffff' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#ffffff' }}>
                      Click to select {tabValue === 0 ? 'an image' : 'a video'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      or drag and drop your file here
                    </Typography>
                  </Box>

                  {selectedFile && (
                    <Box sx={{ mt: 4 }}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3, 
                          mb: 3, 
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '12px',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <CheckCircle sx={{ color: '#22c55e', fontSize: 32, flexShrink: 0 }} />
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 700, 
                                color: '#ffffff',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {selectedFile.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>

                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                          onClick={handleDetect}
                          disabled={loading}
                          fullWidth
                          sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 700,
                            background: '#ffffff',
                            color: '#000000',
                            boxShadow: 'none',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.9)',
                              boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)',
                              transform: 'translateY(-2px)',
                            },
                            textTransform: 'none',
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
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 700,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: '#ffffff',
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              background: 'rgba(255, 255, 255, 0.05)',
                            },
                            textTransform: 'none',
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
                      sx={{ 
                        mt: 3,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        '& .MuiAlert-icon': { color: '#fca5a5' },
                      }}
                      icon={<ErrorIcon />}
                      onClose={() => setError(null)}
                    >
                      {error}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Preview Section */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(14, 165, 233, 0.15)',
                  height: '100%',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    boxShadow: '0 12px 48px rgba(14, 165, 233, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: '12px', 
                          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ImageIcon sx={{ color: '#0ea5e9', fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Preview
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {preview ? 'File loaded' : 'Waiting for file'}
                        </Typography>
                      </Box>
                    </Stack>
                    {preview && (
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          onClick={handleZoomOut} 
                          size="small"
                          sx={{ 
                            background: 'rgba(14, 165, 233, 0.1)',
                            color: '#0ea5e9',
                            '&:hover': { background: 'rgba(14, 165, 233, 0.2)' },
                          }}
                        >
                          <ZoomOut />
                        </IconButton>
                        <IconButton 
                          onClick={handleResetZoom} 
                          size="small"
                          sx={{ 
                            background: 'rgba(14, 165, 233, 0.1)',
                            color: '#0ea5e9',
                            '&:hover': { background: 'rgba(14, 165, 233, 0.2)' },
                          }}
                        >
                          <Refresh />
                        </IconButton>
                        <IconButton 
                          onClick={handleZoomIn} 
                          size="small"
                          sx={{ 
                            background: 'rgba(14, 165, 233, 0.1)',
                            color: '#0ea5e9',
                            '&:hover': { background: 'rgba(14, 165, 233, 0.2)' },
                          }}
                        >
                          <ZoomIn />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>

                  <Box
                    sx={{
                      minHeight: 450,
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'auto',
                      border: '1px solid rgba(14, 165, 233, 0.2)',
                      flexGrow: 1,
                    }}
                  >
                    {!preview && (
                      <Stack alignItems="center" spacing={2}>
                        <ImageIcon sx={{ fontSize: 80, color: 'rgba(148, 163, 184, 0.2)' }} />
                        <Typography variant="body1" color="text.secondary">
                          No file selected yet
                        </Typography>
                      </Stack>
                    )}

                    {preview && tabValue === 0 && (
                      <Box 
                        sx={{ 
                          transform: `scale(${zoom})`, 
                          transformOrigin: 'center', 
                          p: 2,
                          width: '100%',
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
                          maxHeight: '100%',
                          borderRadius: '8px',
                          transform: `scale(${zoom})`,
                        }}
                      />
                    )}
                  </Box>

                  {detectionResult && (
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mt: 3,
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        '& .MuiAlert-icon': {
                          color: '#22c55e',
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        ✓ Detection complete! {detectionResult.count} vehicle(s) in {detectionResult.processing_time.toFixed(2)}s
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Results Section */}
          {detectionResult && (
            <Box sx={{ mt: 8 }}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <CheckCircle sx={{ color: '#22c55e', fontSize: 36 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e' }}>
                        Detection Results
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Analysis complete and ready for review
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3,
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
                          border: '1px solid rgba(14, 165, 233, 0.2)',
                          borderRadius: '12px',
                        }}
                      >
                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#0ea5e9', mb: 1 }}>
                          {detectionResult.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Vehicles Detected
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3,
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
                          border: '1px solid rgba(168, 85, 247, 0.2)',
                          borderRadius: '12px',
                        }}
                      >
                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#a855f7', mb: 1 }}>
                          {detectionResult.processing_time.toFixed(2)}s
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Processing Time
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3,
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          borderRadius: '12px',
                        }}
                      >
                        <Typography 
                          variant="h4" 
                          sx={{ fontWeight: 800, color: '#22c55e', mb: 1, fontSize: '1.5rem' }}
                        >
                          {detectionResult.image_size 
                            ? `${detectionResult.image_size[0]}×${detectionResult.image_size[1]}`
                            : detectionResult.video_size 
                            ? `${detectionResult.video_size[0]}×${detectionResult.video_size[1]}`
                            : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Resolution
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {detectionResult.vehicle_counts && (
                    <>
                      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#0ea5e9' }}>
                        Vehicle Distribution
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {Object.entries(detectionResult.vehicle_counts).map(([type, count]) => (
                          <Chip
                            key={type}
                            label={`${type}: ${count}`}
                            sx={{
                              background: `${getVehicleTypeColor(type)}20`,
                              color: getVehicleTypeColor(type),
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              py: 3,
                              px: 2,
                              border: `1px solid ${getVehicleTypeColor(type)}40`,
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  )}

                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#0ea5e9' }}>
                    Detected Objects ({detectionResult.detections.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {detectionResult.detections.map((detection, idx) => (
                      <Chip
                        key={idx}
                        label={`${detection.class} (${(detection.confidence * 100).toFixed(1)}%)`}
                        sx={{
                          background: `${getVehicleTypeColor(detection.class)}30`,
                          color: getVehicleTypeColor(detection.class),
                          fontWeight: 600,
                          border: `1px solid ${getVehicleTypeColor(detection.class)}50`,
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Layout>
      </Box>
    </Box>
  );
};

export default Upload;
