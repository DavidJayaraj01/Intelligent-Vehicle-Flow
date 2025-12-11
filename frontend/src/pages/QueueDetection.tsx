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
  Tabs,
  Tab,
} from '@mui/material';
import { useThemeContext } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import LineAdjuster from '../components/LineAdjuster';
import {
  CloudUpload,
  VideoLibrary,
  Image as ImageIcon,
  PlayArrow,
  Stop,
  Delete,
  Download,
  Timeline,
  Tune,
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
  const { mode } = useThemeContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [entryLineY, setEntryLineY] = useState<number>(266);
  const [exitLineY, setExitLineY] = useState<number>(414);
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
    formData.append('entry_line_y', entryLineY.toString());
    formData.append('exit_line_y', exitLineY.toString());

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
    <>
      <Sidebar />
      <Box
        sx={{
          marginLeft: '200px',
          transition: 'margin-left 0.3s',
          minHeight: '100vh',
          bgcolor: mode === 'dark' ? '#000000' : '#ffffff',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: mode === 'dark' ? '#ffffff' : '#000000',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Timeline sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }} />
            Queue Detection System
          </Typography>
          <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}>
            Upload video or image to detect vehicles and calculate queue waiting times using YOLOv8
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: mode === 'dark' ? '#ffffff' : '#000000',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: mode === 'dark' ? '#ffffff' : '#000000',
              },
            }}
          >
            <Tab label="Detection & Processing" icon={<Timeline />} iconPosition="start" />
            <Tab label="Line Configuration" icon={<Tune />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                bgcolor: mode === 'dark' ? '#0a0a0a' : '#fafafa',
                border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CloudUpload />
                Upload Media
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
                    border: mode === 'dark' ? '2px dashed rgba(255, 255, 255, 0.2)' : '2px dashed rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  <CloudUpload sx={{ fontSize: 48, color: mode === 'dark' ? '#ffffff' : '#000000', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mb: 1 }}>
                    Click to upload video or image
                  </Typography>
                  <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                    Supports MP4, AVI, MOV, JPG, PNG (max 500MB)
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Card sx={{ bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', mb: 2, border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
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
                          <VideoLibrary sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }} />
                        ) : (
                          <ImageIcon sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }} />
                        )}
                        <Typography variant="body2" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', flex: 1 }}>
                          {selectedFile.name}
                        </Typography>
                        <IconButton size="small" onClick={handleClearFile}>
                          <Delete sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }} />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
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
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: mode === 'dark' ? '#ffffff' : '#000000',
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', mt: 0.5 }}>
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
                        bgcolor: mode === 'dark' ? '#ffffff' : '#000000',
                        color: mode === 'dark' ? '#000000' : '#ffffff',
                        '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)' },
                      }}
                    >
                      {isProcessing ? 'Processing...' : 'Process'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleUploadClick}
                      startIcon={<CloudUpload />}
                      sx={{
                        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                        color: mode === 'dark' ? '#ffffff' : '#000000',
                        '&:hover': {
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
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
            </Paper>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                bgcolor: mode === 'dark' ? '#0a0a0a' : '#fafafa',
                border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                minHeight: 500,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Timeline />
                Detection Results
              </Typography>

              {result ? (
                <Box>
                  {/* Annotated Output */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', mb: 1 }}>
                      Processed Output with Annotations
                    </Typography>
                    <Card sx={{ bgcolor: mode === 'dark' ? '#000000' : '#ffffff', overflow: 'hidden', border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
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
                          <Box sx={{ p: 2, bgcolor: mode === 'dark' ? '#0a0a0a' : '#fafafa', textAlign: 'center' }}>
                            <Button
                              variant="contained"
                              href={result.imageUrl}
                              target="_blank"
                              download="queue_detection_result.mp4"
                              sx={{
                                bgcolor: mode === 'dark' ? '#ffffff' : '#000000',
                                color: mode === 'dark' ? '#000000' : '#ffffff',
                                '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)' },
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
                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', p: 2, border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                          Total Vehicles
                        </Typography>
                        <Typography variant="h4" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 600 }}>
                          {result.statistics.totalVehicles}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', p: 2, border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                          In Queue
                        </Typography>
                        <Typography variant="h4" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 600 }}>
                          {result.statistics.currentlyInQueue}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', p: 2, border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                          Completed
                        </Typography>
                        <Typography variant="h4" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 600 }}>
                          {result.statistics.completedQueue}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', p: 2, border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                          Avg Wait Time
                        </Typography>
                        <Typography variant="h4" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 600 }}>
                          {result.statistics.avgWaitTime.toFixed(1)}s
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  <Divider sx={{ borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', my: 2 }} />

                  {/* Additional Stats */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                        Max Wait Time:
                      </Typography>
                      <Typography variant="body2" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 500 }}>
                        {result.statistics.maxWaitTime.toFixed(2)}s
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                        Min Wait Time:
                      </Typography>
                      <Typography variant="body2" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 500 }}>
                        {result.statistics.minWaitTime.toFixed(2)}s
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                        Processing Time:
                      </Typography>
                      <Typography variant="body2" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 500 }}>
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
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      color: mode === 'dark' ? '#ffffff' : '#000000',
                      '&:hover': {
                        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
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
                    border: mode === 'dark' ? '2px dashed rgba(255, 255, 255, 0.2)' : '2px dashed rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                    Results will appear here after processing
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Vehicle Details Table */}
          {result && result.statistics.vehicleDetails.length > 0 && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: mode === 'dark' ? '#0a0a0a' : '#fafafa',
                  border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h6" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mb: 2 }}>
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
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                        borderRadius: 1,
                        border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                        '&:hover': {
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                          label={`ID: ${vehicle.id}`}
                          size="small"
                          sx={{
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            color: mode === 'dark' ? '#ffffff' : '#000000',
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="body2" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }}>
                          {vehicle.type}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${vehicle.queueTime.toFixed(2)}s`}
                        size="small"
                        sx={{
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          color: mode === 'dark' ? '#ffffff' : '#000000',
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
        )}

        {/* Tab 2: Line Configuration */}
        {activeTab === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Configure Entry and Exit Lines for Queue Detection
              </Typography>
              <Typography variant="body2">
                Use this tool to visually set the boundary lines where vehicles enter and exit the queue zone. 
                Upload a reference frame from your video feed or use a sample image to adjust line positions.
                The system will use these coordinates for accurate queue detection and wait time analysis.
              </Typography>
            </Alert>

            {previewUrl ? (
              <LineAdjuster
                videoUrl={selectedFile?.type.startsWith('video/') ? previewUrl : undefined}
                imageUrl={selectedFile?.type.startsWith('image/') ? previewUrl : undefined}
                onLinesUpdate={(entry, exit) => {
                  setEntryLineY(entry);
                  setExitLineY(exit);
                  console.log('Lines updated:', { entry, exit });
                }}
                initialEntryY={entryLineY}
                initialExitY={exitLineY}
              />
            ) : (
              <Card sx={{ bgcolor: mode === 'dark' ? '#0a0a0a' : '#fafafa', border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', textAlign: 'center', py: 8 }}>
                <CardContent>
                  <Tune sx={{ fontSize: 64, color: mode === 'dark' ? '#ffffff' : '#000000', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mb: 1 }}>
                    Upload Media First
                  </Typography>
                  <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', mb: 3 }}>
                    Please upload a video or image in the Detection & Processing tab to configure the detection lines
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setActiveTab(0)}
                    sx={{ bgcolor: mode === 'dark' ? '#ffffff' : '#000000', color: mode === 'dark' ? '#000000' : '#ffffff', '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)' } }}
                  >
                    Go to Upload
                  </Button>
                </CardContent>
              </Card>
            )}

            {entryLineY > 0 && exitLineY > 0 && (
              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  ✓ Line configuration saved: Entry at {entryLineY}px, Exit at {exitLineY}px
                </Typography>
              </Alert>
            )}
          </Box>
        )}
        </Box>
      </Box>
    </>
  );
};

export default QueueDetection;
