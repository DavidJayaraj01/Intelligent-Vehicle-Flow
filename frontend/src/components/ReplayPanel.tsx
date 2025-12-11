import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, IconButton, Alert } from '@mui/material';
import { PlayArrow, Pause, Replay } from '@mui/icons-material';
import { getTracks } from '../services/api';

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TrackEvent {
  timestamp: string;
  bbox: BBox;
  class: string;
  confidence: number;
}

const ReplayPanel: React.FC = () => {
  const [trackId, setTrackId] = useState('');
  const [events, setEvents] = useState<TrackEvent[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;
  const FRAME_DELAY = 100; // ms between frames

  const classColors: Record<string, string> = {
    car: '#0ea5e9',
    truck: '#ef4444',
    bus: '#f59e0b',
    bike: '#10b981',
  };

  const fetchTrack = async () => {
    if (!trackId.trim()) {
      setError('Please enter a track ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await getTracks(trackId.trim());
      const trackEvents = response.data.map((e: any) => ({
        timestamp: e.timestamp,
        bbox: e.bbox,
        class: e.class,
        confidence: e.confidence,
      }));
      setEvents(trackEvents);
      setCurrentFrame(0);
      setIsPlaying(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch track');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || events.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#1a1f2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = 'rgba(94, 109, 126, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    if (frameIndex >= events.length) return;

    const event = events[frameIndex];
    const bbox = event.bbox;
    const color = classColors[event.class] || '#94a3b8';

    // Draw bounding box with glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
    ctx.shadowColor = 'transparent';

    // Fill with semi-transparent color
    ctx.fillStyle = color + '30';
    ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);

    // Draw label
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(bbox.x, bbox.y - 28, 180, 28);
    ctx.globalAlpha = 1.0;
    
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px Inter, Roboto, sans-serif';
    ctx.fillText(`${event.class.toUpperCase()} ${(event.confidence * 100).toFixed(0)}%`, bbox.x + 5, bbox.y - 10);

    // Draw frame info
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, 10, 220, 60);
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 220, 60);

    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 13px Inter, Roboto, sans-serif';
    ctx.fillText(`Frame: ${frameIndex + 1}/${events.length}`, 18, 28);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, Roboto, sans-serif';
    ctx.fillText(new Date(event.timestamp).toLocaleTimeString(), 18, 45);
    ctx.fillText(new Date(event.timestamp).toLocaleDateString(), 18, 58);
  };

  useEffect(() => {
    drawFrame(currentFrame);
  }, [currentFrame, events]);

  useEffect(() => {
    if (isPlaying && events.length > 0) {
      animationRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, FRAME_DELAY);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, events.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  return (
    <Card 
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'none',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: 'none',
        height: '100%',
      }}
    >
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            mb: 3
          }}
        >
          Track Replay
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Track ID"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            size="small"
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                color: '#f8fafc',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: '#0ea5e9',
                },
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && fetchTrack()}
          />
          <Button 
            variant="contained" 
            onClick={fetchTrack} 
            disabled={loading}
            sx={{
              bgcolor: '#0ea5e9',
              color: '#fff',
              '&:hover': { bgcolor: '#0284c7' }
            }}
          >
            {loading ? 'Loading...' : 'Load Track'}
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              '& .MuiAlert-icon': { color: '#fca5a5' }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {events.length > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <IconButton 
                onClick={handlePlayPause} 
                sx={{
                  bgcolor: 'rgba(14, 165, 233, 0.1)',
                  color: '#0ea5e9',
                  '&:hover': {
                    bgcolor: 'rgba(14, 165, 233, 0.2)',
                  }
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton 
                onClick={handleReset}
                sx={{
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.2)',
                  }
                }}
              >
                <Replay />
              </IconButton>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
            </Box>
          </>
        )}

        {events.length === 0 && !loading && !error && (
          <Typography 
            color="text.secondary" 
            align="center" 
            sx={{ py: 4, color: '#64748b' }}
          >
            Enter a track ID to view replay
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ReplayPanel;
