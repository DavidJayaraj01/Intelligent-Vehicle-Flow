import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import { useThemeContext } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import {
  CloudUpload,
  VideoLibrary,
  Image as ImageIcon,
  Delete,
  Download,
  LocalHospital,
  Warning,
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
  const { mode } = useThemeContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');
    setUploadProgress(0);

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

      setUploadProgress(100);
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
    // Use theme-aware colors instead of colored emergency colors
    return mode === 'dark' ? '#ffffff' : '#000000';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: mode === 'dark' ? '#000000' : '#ffffff' }}>
      <Sidebar />
      
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Box 
              sx={{ 
                width: 56, 
                height: 56, 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <LocalHospital sx={{ fontSize: 32, color: mode === 'dark' ? '#ffffff' : '#000000' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: mode === 'dark' ? '#ffffff' : '#000000',
                  letterSpacing: '-0.5px',
                }}
              >
                Emergency Vehicle Detection
              </Typography>
              <Typography variant="body1" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', mt: 0.5 }}>
                AI-powered detection of ambulances, fire trucks, and police cars in real-time
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', mt: 3 }} />
        </Box>

        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                bgcolor: mode === 'dark' ? '#0a0a0a' : '#fafafa', 
                borderRadius: 3, 
                height: '100%',
                border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <CloudUpload sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h5" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>
                    Upload Media
                  </Typography>
                </Box>

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
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      },
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mb: 1 }}>
                      Click to upload video or image
                    </Typography>
                    <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
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
                        <VideoLibrary sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mr: 1 }} />
                      ) : (
                        <ImageIcon sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mr: 1 }} />
                      )}
                      <Typography variant="body2" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', flex: 1 }}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', mr: 2 }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={handleClearFile}
                        sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }}
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
                        bgcolor: mode === 'dark' ? '#ffffff' : '#000000',
                        color: mode === 'dark' ? '#000000' : '#ffffff',
                        '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)' },
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
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': { bgcolor: mode === 'dark' ? '#ffffff' : '#000000' },
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
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: mode === 'dark' ? '#0a0a0a' : '#fafafa', borderRadius: 2, height: '100%', border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 600 }}>
                    Detection Results
                  </Typography>
                </Box>

                {!result ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
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
                      <Typography variant="subtitle2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', mb: 1 }}>
                        Processed Output with Annotations
                      </Typography>
                      <Card sx={{ bgcolor: mode === 'dark' ? '#000000' : '#ffffff', overflow: 'hidden', border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)' }}>
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
                            <Box sx={{ p: 2, bgcolor: mode === 'dark' ? '#0a0a0a' : '#fafafa', textAlign: 'center' }}>
                              <Button
                                variant="contained"
                                href={result.videoUrl}
                                target="_blank"
                                download="emergency_detection_result.mp4"
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
                            src={result.imageData}
                            alt="Processed result"
                            style={{ width: '100%', display: 'block' }}
                          />
                        )}
                      </Card>
                    </Box>

                    {/* Statistics */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', mb: 2 }}>
                        Detection Summary
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card sx={{ bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', p: 2, textAlign: 'center', border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <Typography variant="h3" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>
                              {result.statistics.totalDetections}
                            </Typography>
                            <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                              Total Detections
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card sx={{ bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', p: 2, textAlign: 'center', border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                            <Typography variant="h3" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 700 }}>
                              {result.processingTime}s
                            </Typography>
                            <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
                              Processing Time
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Detection Counts */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', mb: 2 }}>
                        Emergency Vehicle Counts
                      </Typography>
                      
                      {Object.entries(result.statistics.detectionCounts).map(([type, count]) => (
                        <Box
                          key={type}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                            p: 2,
                            borderRadius: 1,
                            mb: 1,
                            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: 24, mr: 2 }}>
                              {getEmergencyIcon(type)}
                            </Typography>
                            <Typography variant="body1" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000', fontWeight: 500 }}>
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                          </Box>
                          <Chip
                            label={count}
                            sx={{
                              bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              color: mode === 'dark' ? '#ffffff' : '#000000',
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      ))}
                    </Box>

                    {result.isVideo && result.statistics.totalFrames && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', borderRadius: 1, border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Typography variant="caption" sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
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
  );
};

export default EmergencyDetection;
