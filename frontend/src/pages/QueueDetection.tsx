import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import {
  CloudUpload,
  VideoLibrary,
  Image as ImageIcon,
  PlayArrow,
  Stop,
  Delete,
  Download,
  Timeline,
  Menu as MenuIcon,
} from '@mui/icons-material';

interface QueueStatistics {
  totalVehicles: number;
  currentlyInQueue: number;
  completedQueue: number;
  avgWaitTime: number;
  maxWaitTime: number;
  minWaitTime: number;
  vehicleDetails: Array<{
    id: number;
    type: string;
    queueTime: number;
  }>;
}

interface DetectionResult {
  imageUrl: string;
  statistics: QueueStatistics;
  processingTime: number;
  isVideo: boolean;
}

const QueueDetection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid video (MP4, AVI, MOV) or image (JPG, PNG) file');
        return;
      }

      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      setResult(null);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/v1/queue/detect', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Detection response:', data);
      
      // Handle output URL based on type
      let outputUrl = previewUrl;
      
      if (data.is_video && data.output_path) {
        // For videos, fetch as blob and create object URL
        console.log('Fetching video from:', data.output_path);
        try {
          const videoResponse = await fetch(data.output_path);
          if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.status}`);
          }
          const videoBlob = await videoResponse.blob();
          console.log('Video blob size:', videoBlob.size, 'type:', videoBlob.type);
          outputUrl = URL.createObjectURL(videoBlob);
          console.log('Created blob URL:', outputUrl);
        } catch (videoError) {
          console.error('Error fetching video:', videoError);
          throw new Error('Failed to load processed video');
        }
      } else if (data.output_base64) {
        // For images, decode base64
        const byteCharacters = atob(data.output_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        outputUrl = URL.createObjectURL(blob);
        console.log('Image output URL:', outputUrl);
      }
      
      console.log('Setting result with URL:', outputUrl);
      
      setResult({
        imageUrl: outputUrl,
        statistics: data.statistics,
        processingTime: data.processing_time,
        isVideo: data.is_video || false,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDownloadResult = () => {
    if (result?.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `queue_detection_${Date.now()}.jpg`;
      link.click();
    }
  };

  const isVideo = selectedFile?.type.startsWith('video/');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />
      <Box
        sx={{
          flexGrow: 1,
          marginLeft: { xs: 0, md: sidebarOpen ? '280px' : '64px' },
          transition: 'margin-left 0.2s ease-in-out',
          minHeight: '100vh',
          bgcolor: '#0a0a0a',
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Mobile Menu Button */}
        <IconButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            bgcolor: '#1e293b',
            color: '#ffffff',
            '&:hover': {
              bgcolor: '#334155',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Header */}
        <Box sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.8rem' },
              color: '#ffffff',
              mb: 2.5,
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Timeline sx={{ color: '#3b82f6', fontSize: { xs: '2rem', md: '3rem' } }} />
            Queue Detection
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
            Upload video or image to detect vehicles and calculate queue waiting times using YOLOv8
          </Typography>
        </Box>

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
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 0.5, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <CloudUpload sx={{ fontSize: 32 }} />
                  Upload Media
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 4 }}>
                  MP4, AVI, MOV, JPG, PNG
                </Typography>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {!selectedFile ? (
                <Box
                  onClick={handleUploadClick}
                  sx={{
                    border: '2px dashed rgba(14, 165, 233, 0.5)',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#0ea5e9',
                      bgcolor: 'rgba(14, 165, 233, 0.05)',
                    },
                  }}
                >
                  <CloudUpload sx={{ fontSize: 48, color: '#0ea5e9', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                    Click to upload video or image
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Supports MP4, AVI, MOV, JPG, PNG (max 500MB)
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Card sx={{ bgcolor: '#0f172a', mb: 2 }}>
                    {isVideo ? (
                      <CardMedia
                        component="video"
                        ref={videoRef}
                        src={previewUrl}
                        controls
                        sx={{ maxHeight: 300 }}
                      />
                    ) : (
                      <CardMedia
                        component="img"
                        image={previewUrl}
                        alt="Preview"
                        sx={{ maxHeight: 300, objectFit: 'contain' }}
                      />
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {isVideo ? (
                          <VideoLibrary sx={{ color: '#0ea5e9' }} />
                        ) : (
                          <ImageIcon sx={{ color: '#0ea5e9' }} />
                        )}
                        <Typography variant="body2" sx={{ color: 'white', flex: 1 }}>
                          {selectedFile.name}
                        </Typography>
                        <IconButton size="small" onClick={handleClearFile}>
                          <Delete sx={{ color: '#ef4444' }} />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                    </CardContent>
                  </Card>

                  {uploadProgress > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: 'rgba(14, 165, 233, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#0ea5e9',
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>
                        {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleProcessFile}
                      disabled={isProcessing}
                      startIcon={<PlayArrow />}
                      sx={{
                        bgcolor: '#0ea5e9',
                        '&:hover': { bgcolor: '#0284c7' },
                      }}
                    >
                      {isProcessing ? 'Processing...' : 'Process'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleUploadClick}
                      startIcon={<CloudUpload />}
                      sx={{
                        borderColor: '#0ea5e9',
                        color: '#0ea5e9',
                        '&:hover': {
                          borderColor: '#0284c7',
                          bgcolor: 'rgba(14, 165, 233, 0.1)',
                        },
                      }}
                    >
                      Change
                    </Button>
                  </Box>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

          {/* Results Section */}
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
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 0.5, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <Timeline sx={{ fontSize: 32 }} />
                  Detection Results
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 4 }}>
                  Processed queue analysis
                </Typography>

              {result ? (
                <Box>
                  {/* Annotated Output */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
                      Processed Output with Annotations
                    </Typography>
                    <Card sx={{ bgcolor: '#0f172a', overflow: 'hidden' }}>
                      {result.isVideo ? (
                        <Box>
                          <Box 
                            component="iframe"
                            src={result.imageUrl}
                            sx={{
                              width: '100%',
                              height: 400,
                              border: 'none',
                              bgcolor: '#000'
                            }}
                          />
                          <Box sx={{ p: 2, bgcolor: '#1e293b', textAlign: 'center' }}>
                            <Button
                              variant="contained"
                              href={result.imageUrl}
                              target="_blank"
                              download="queue_detection_result.mp4"
                              sx={{
                                bgcolor: '#0ea5e9',
                                '&:hover': { bgcolor: '#0284c7' },
                              }}
                            >
                              Open Video in New Tab
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <img
                          src={result.imageUrl}
                          alt="Processed result"
                          style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                          onError={(e) => {
                            console.error('Image load error:', e);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully');
                          }}
                        />
                      )}
                    </Card>
                  </Box>

                  {/* Statistics Cards */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6 }}>
                      <Card sx={{ bgcolor: '#0f172a', p: 2 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Total Vehicles
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#0ea5e9', fontWeight: 600 }}>
                          {result.statistics.totalVehicles}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Card sx={{ bgcolor: '#0f172a', p: 2 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          In Queue
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                          {result.statistics.currentlyInQueue}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Card sx={{ bgcolor: '#0f172a', p: 2 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Completed
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 600 }}>
                          {result.statistics.completedQueue}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Card sx={{ bgcolor: '#0f172a', p: 2 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Avg Wait Time
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                          {result.statistics.avgWaitTime.toFixed(1)}s
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.2)', my: 2 }} />

                  {/* Additional Stats */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Max Wait Time:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                        {result.statistics.maxWaitTime.toFixed(2)}s
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Min Wait Time:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                        {result.statistics.minWaitTime.toFixed(2)}s
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Processing Time:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                        {result.processingTime.toFixed(2)}s
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownloadResult}
                    sx={{
                      borderColor: '#0ea5e9',
                      color: '#0ea5e9',
                      '&:hover': {
                        borderColor: '#0284c7',
                        bgcolor: 'rgba(14, 165, 233, 0.1)',
                      },
                    }}
                  >
                    Download Results
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 400,
                    border: '2px dashed rgba(148, 163, 184, 0.3)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Results will appear here after processing
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

          {/* Vehicle Details Table */}
          {result && result.statistics.vehicleDetails.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#1e293b',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Vehicle Details
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  {result.statistics.vehicleDetails.map((vehicle, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        bgcolor: '#0f172a',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'rgba(14, 165, 233, 0.05)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                          label={`ID: ${vehicle.id}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(14, 165, 233, 0.2)',
                            color: '#0ea5e9',
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {vehicle.type}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${vehicle.queueTime.toFixed(2)}s`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(139, 92, 246, 0.2)',
                          color: '#8b5cf6',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default QueueDetection;
