import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, IconButton } from '@mui/material';
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

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const FRAME_DELAY = 100; // ms between frames

  const classColors: Record<string, string> = {
    car: '#1976d2',
    truck: '#d32f2f',
    bus: '#ed6c02',
    bike: '#2e7d32',
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

    // Clear canvas
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
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
    const color = classColors[event.class] || '#666666';

    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

    // Fill with semi-transparent color
    ctx.fillStyle = color + '20';
    ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);

    // Draw label
    ctx.fillStyle = color;
    ctx.fillRect(bbox.x, bbox.y - 25, 150, 25);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`${event.class} (${(event.confidence * 100).toFixed(0)}%)`, bbox.x + 5, bbox.y - 7);

    // Draw frame info
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(`Frame: ${frameIndex + 1}/${events.length}`, 10, 30);
    ctx.fillText(`Time: ${new Date(event.timestamp).toLocaleTimeString()}`, 10, 55);
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Track Replay
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Track ID"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            onKeyPress={(e) => e.key === 'Enter' && fetchTrack()}
          />
          <Button variant="contained" onClick={fetchTrack} disabled={loading}>
            {loading ? 'Loading...' : 'Load Track'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {events.length > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <IconButton onClick={handlePlayPause} color="primary">
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={handleReset} color="secondary">
                <Replay />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', border: '2px solid #e0e0e0', borderRadius: 1 }}>
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
            </Box>
          </>
        )}

        {events.length === 0 && !loading && !error && (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            Enter a track ID to view replay
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ReplayPanel;
