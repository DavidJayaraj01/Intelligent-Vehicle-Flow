import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import {
  CloudUpload,
  VideoLibrary,
  Image as ImageIcon,
  Delete,
  LocalHospital,
  Warning,
  Menu as MenuIcon,
} from '@mui/icons-material';

interface DetectionCount {
  ambulance: number;
  fire_truck: number;
  police_car: number;
}

interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

interface EmergencyStatistics {
  detectionCounts: DetectionCount;
  totalDetections: number;
  framesWithDetections?: number;
  totalFrames?: number;
  maxConfidence?: DetectionCount;
  detections?: Detection[];
}

interface DetectionResult {
  success: boolean;
  isVideo: boolean;
  videoUrl?: string;
  imageData?: string;
  statistics: EmergencyStatistics;
  processingTime: number;
}

const EmergencyDetection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string>('');
  // const [uploadProgress, setUploadProgress] = useState(0);  // Unused - LinearProgress is indeterminate
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // setUploadProgress(0);  // Unused
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');
    // setUploadProgress(0);  // Unused

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Sending emergency detection request...');

      const response = await fetch('/api/v1/emergency/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Detection failed');
      }

      const data: DetectionResult = await response.json();
      console.log('Emergency detection response:', data);

      // If video, fetch the video file
      if (data.isVideo && data.videoUrl) {
        console.log('Fetching video from:', data.videoUrl);
        const videoResponse = await fetch(data.videoUrl);
        
        if (!videoResponse.ok) {
          throw new Error('Failed to load processed video');
        }

        const blob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(blob);
        
        setResult({
          ...data,
          videoUrl: videoUrl,
        });
      } else {
        setResult(data);
      }

      // setUploadProgress(100);  // Unused
    } catch (err) {
      console.error('Emergency detection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return '🚑';
      case 'fire_truck':
        return '🚒';
      case 'police_car':
        return '🚓';
      default:
        return '🚨';
    }
  };

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case 'ambulance':
        return '#fbbf24'; // Yellow
      case 'fire_truck':
        return '#f97316'; // Orange
      case 'police_car':
        return '#3b82f6'; // Blue
      default:
        return '#64748b';
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e1a' }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />
      
      <Box 
        sx={{ 
          flexGrow: 1,
          ml: { xs: 0, md: sidebarOpen ? '280px' : '64px' },
          transition: 'margin-left 0.3s ease-in-out',
          minHeight: '100vh',
          bgcolor: '#0a0a0a',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 1400, width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
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
            <LocalHospital sx={{ color: '#ef4444', fontSize: { xs: '2rem', md: '3rem' } }} />
            Emergency Detection
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
            AI-powered detection of ambulances, fire trucks, and police cars in real-time
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
                border: '1px solid rgba(239, 68, 68, 0.15)',
                height: '100%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 12px 48px rgba(239, 68, 68, 0.15)',
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
                      border: '2px dashed #475569',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: '#0f172a',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: '#ef4444',
                        bgcolor: '#1e293b',
                      },
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 1 }}>
                      Click to upload video or image
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Supported: MP4, AVI, MOV, JPG, PNG (Max 500MB)
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Box
                      sx={{
                        bgcolor: '#0f172a',
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {selectedFile.type.startsWith('video/') ? (
                        <video
                          src={previewUrl}
                          controls
                          style={{ width: '100%', maxHeight: 300, borderRadius: 8 }}
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8 }}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {selectedFile.type.startsWith('video/') ? (
                        <VideoLibrary sx={{ color: '#ef4444', mr: 1 }} />
                      ) : (
                        <ImageIcon sx={{ color: '#ef4444', mr: 1 }} />
                      )}
                      <Typography variant="body2" sx={{ color: '#cbd5e1', flex: 1 }}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', mr: 2 }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={handleClearFile}
                        sx={{ color: '#ef4444' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleProcess}
                      disabled={isProcessing}
                      startIcon={<LocalHospital />}
                      sx={{
                        bgcolor: '#ef4444',
                        '&:hover': { bgcolor: '#dc2626' },
                        py: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      {isProcessing ? 'Processing...' : 'Detect Emergency Vehicles'}
                    </Button>

                    {isProcessing && (
                      <LinearProgress
                        sx={{
                          mt: 2,
                          bgcolor: '#1e293b',
                          '& .MuiLinearProgress-bar': { bgcolor: '#ef4444' },
                        }}
                      />
                    )}
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
                border: '1px solid rgba(239, 68, 68, 0.15)',
                height: '100%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 12px 48px rgba(239, 68, 68, 0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 0.5, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <Warning sx={{ fontSize: 32 }} />
                  Detection Results
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 4 }}>
                  Emergency vehicle analysis
                </Typography>

                {!result ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      color: '#64748b',
                    }}
                  >
                    <LocalHospital sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="body1">
                      No results yet. Upload and process a file to see detections.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Processed Output */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
                        Processed Output with Annotations
                      </Typography>
                      <Card sx={{ bgcolor: '#0f172a', overflow: 'hidden' }}>
                        {result.isVideo ? (
                          <Box>
                            <Box 
                              component="iframe"
                              src={result.videoUrl}
                              sx={{
                                width: '100%',
                                height: 300,
                                border: 'none',
                                bgcolor: '#000'
                              }}
                            />
                            <Box sx={{ p: 2, bgcolor: '#1e293b', textAlign: 'center' }}>
                              <Button
                                component="a"
                                variant="contained"
                                href={result.videoUrl || '#'}
                                target="_blank"
                                download="emergency_detection_result.mp4"
                                sx={{
                                  bgcolor: '#ef4444',
                                  '&:hover': { bgcolor: '#dc2626' },
                                }}
                              >
                                Open Video in New Tab
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <img
                            src={result.imageData}
                            alt="Processed result"
                            style={{ width: '100%', display: 'block' }}
                          />
                        )}
                      </Card>
                    </Box>

                    {/* Statistics */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>
                        Detection Summary
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Card sx={{ bgcolor: '#0f172a', p: 2, textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
                              {result.statistics.totalDetections}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              Total Detections
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Card sx={{ bgcolor: '#0f172a', p: 2, textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                              {result.processingTime}s
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              Processing Time
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Detection Counts */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>
                        Emergency Vehicle Counts
                      </Typography>
                      
                      {Object.entries(result.statistics.detectionCounts).map(([type, count]) => (
                        <Box
                          key={type}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: '#0f172a',
                            p: 2,
                            borderRadius: 1,
                            mb: 1,
                            borderLeft: `4px solid ${getEmergencyColor(type)}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: 24, mr: 2 }}>
                              {getEmergencyIcon(type)}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#cbd5e1', fontWeight: 500 }}>
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                          </Box>
                          <Chip
                            label={count}
                            sx={{
                              bgcolor: getEmergencyColor(type),
                              color: '#fff',
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      ))}
                    </Box>

                    {result.isVideo && result.statistics.totalFrames && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#0f172a', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Frames with detections: {result.statistics.framesWithDetections} / {result.statistics.totalFrames}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default EmergencyDetection;
