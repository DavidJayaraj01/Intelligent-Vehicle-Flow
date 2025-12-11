import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  Card,
  CardContent,
  Alert,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Restore,
  PlayArrow,
  Pause,
  Info,
  Height,
} from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';

interface LineAdjusterProps {
  videoUrl?: string;
  imageUrl?: string;
  onLinesUpdate?: (entryY: number, exitY: number) => void;
  initialEntryY?: number;
  initialExitY?: number;
}

const LineAdjuster: React.FC<LineAdjusterProps> = ({
  videoUrl,
  imageUrl,
  onLinesUpdate,
  initialEntryY = 30,
  initialExitY = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [entryLinePercent, setEntryLinePercent] = useState(initialEntryY);
  const [exitLinePercent, setExitLinePercent] = useState(initialExitY);
  const [draggingLine, setDraggingLine] = useState<'entry' | 'exit' | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const { mode } = useThemeContext();

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.addEventListener('loadedmetadata', handleMediaLoaded);
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleMediaLoaded);
      };
    } else if (imageUrl && imageRef.current) {
      imageRef.current.src = imageUrl;
      imageRef.current.addEventListener('load', handleMediaLoaded);
      return () => {
        imageRef.current?.removeEventListener('load', handleMediaLoaded);
      };
    }
  }, [videoUrl, imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [entryLinePercent, exitLinePercent, canvasDimensions, isPlaying]);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      const interval = setInterval(() => {
        drawCanvas();
      }, 33); // ~30fps
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleMediaLoaded = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const image = imageRef.current;
    
    if (!canvas) return;

    let width = 0;
    let height = 0;

    if (video && videoUrl) {
      width = video.videoWidth;
      height = video.videoHeight;
    } else if (image && imageUrl) {
      width = image.naturalWidth;
      height = image.naturalHeight;
    }

    // Scale to fit container (max 800px width)
    const maxWidth = 800;
    const scale = width > maxWidth ? maxWidth / width : 1;
    
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    setCanvasDimensions({ width: canvas.width, height: canvas.height });
    drawCanvas();
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
    const image = imageRef.current;
    
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame or image
    if (video && videoUrl && !video.paused) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else if (image && imageUrl) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    // Draw lines
    const entryY = (entryLinePercent / 100) * canvas.height;
    const exitY = (exitLinePercent / 100) * canvas.height;

    // Entry line (green)
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, entryY);
    ctx.lineTo(canvas.width, entryY);
    ctx.stroke();

    // Entry line label
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`ENTRY LINE (Y=${Math.round(entryY)}px)`, 10, entryY - 10);

    // Exit line (red)
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, exitY);
    ctx.lineTo(canvas.width, exitY);
    ctx.stroke();

    // Exit line label
    ctx.fillStyle = '#f87171';
    ctx.fillText(`EXIT LINE (Y=${Math.round(exitY)}px)`, 10, exitY + 25);

    // Queue zone highlight
    ctx.fillStyle = 'rgba(96, 165, 250, 0.1)';
    ctx.fillRect(0, entryY, canvas.width, exitY - entryY);

    // Queue zone border
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(0, entryY, canvas.width, exitY - entryY);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const entryY = (entryLinePercent / 100) * canvas.height;
    const exitY = (exitLinePercent / 100) * canvas.height;

    if (Math.abs(y - entryY) < 15) {
      setDraggingLine('entry');
    } else if (Math.abs(y - exitY) < 15) {
      setDraggingLine('exit');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !draggingLine) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percent = Math.max(5, Math.min(95, (y / canvas.height) * 100));

    if (draggingLine === 'entry') {
      setEntryLinePercent(Math.min(percent, exitLinePercent - 10));
    } else {
      setExitLinePercent(Math.max(percent, entryLinePercent + 10));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingLine(null);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const entryY = Math.round((entryLinePercent / 100) * canvas.height);
    const exitY = Math.round((exitLinePercent / 100) * canvas.height);

    onLinesUpdate?.(entryY, exitY);
    
    // Save to localStorage
    const config = {
      entryLineY: entryY,
      exitLineY: exitY,
      entryLinePercent: entryLinePercent / 100,
      exitLinePercent: exitLinePercent / 100,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('queueLineConfig', JSON.stringify(config));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setEntryLinePercent(30);
    setExitLinePercent(80);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const queueZoneHeight = Math.round(((exitLinePercent - entryLinePercent) / 100) * canvasDimensions.height);

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Interactive Line Adjustment
            </Typography>
            {videoUrl && (
              <IconButton onClick={togglePlay} color="primary">
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            )}
          </Box>

          <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
            Drag the green (entry) and red (exit) lines to define your queue detection zone. 
            Vehicles crossing both lines will be counted in queue statistics.
          </Alert>

          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              bgcolor: mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{
                maxWidth: '100%',
                cursor: draggingLine ? 'ns-resize' : 'default',
                borderRadius: '8px',
              }}
            />
          </Box>

          {/* Hidden media elements */}
          {videoUrl && <video ref={videoRef} style={{ display: 'none' }} />}
          {imageUrl && <img ref={imageRef} style={{ display: 'none' }} alt="Source" />}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                Entry Line Position: {entryLinePercent.toFixed(1)}%
              </Typography>
              <Slider
                value={entryLinePercent}
                onChange={(_, value) => setEntryLinePercent(Math.min(value as number, exitLinePercent - 10))}
                min={5}
                max={95}
                step={0.1}
                valueLabelDisplay="auto"
                sx={{
                  color: '#4ade80',
                  '& .MuiSlider-thumb': {
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(74, 222, 128, 0.16)',
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                Exit Line Position: {exitLinePercent.toFixed(1)}%
              </Typography>
              <Slider
                value={exitLinePercent}
                onChange={(_, value) => setExitLinePercent(Math.max(value as number, entryLinePercent + 10))}
                min={5}
                max={95}
                step={0.1}
                valueLabelDisplay="auto"
                sx={{
                  color: '#f87171',
                  '& .MuiSlider-thumb': {
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(248, 113, 113, 0.16)',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              icon={<Height />}
              label={`Queue Zone: ${queueZoneHeight}px`}
              color="info"
            />
            <Chip
              label={`Entry at ${entryLinePercent.toFixed(1)}%`}
              sx={{ bgcolor: '#4ade80', color: '#000' }}
            />
            <Chip
              label={`Exit at ${exitLinePercent.toFixed(1)}%`}
              sx={{ bgcolor: '#f87171', color: '#fff' }}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Configuration
            </Button>
          </Box>

          {saved && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Line configuration saved successfully!
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LineAdjuster;
