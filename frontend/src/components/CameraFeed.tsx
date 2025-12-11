import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, IconButton } from '@mui/material';
import { ZoomIn, ZoomOut, Fullscreen } from '@mui/icons-material';

interface Detection {
  id: string;
  class: string;
  confidence: number;
  bbox: number[]; // [x, y, width, height]
  timestamp: string;
}

interface CameraFeedProps {
  cameraId: string;
  cameraName: string;
  detections: Detection[];
}

const COLORS: Record<string, string> = {
  car: '#0ea5e9',
  truck: '#ef4444',
  bus: '#f59e0b',
  bike: '#10b981',
  person: '#8b5cf6',
};

const CameraFeed: React.FC<CameraFeedProps> = ({ cameraId, cameraName, detections }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    drawDetections();
  }, [detections, zoom]);

  const drawDetections = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#1a1f2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(94, 109, 126, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw detections
    detections.forEach((detection) => {
      const [x, y, width, height] = detection.bbox;
      const color = COLORS[detection.class] || '#94a3b8';

      // Scale coordinates
      const scaledX = x * zoom;
      const scaledY = y * zoom;
      const scaledWidth = width * zoom;
      const scaledHeight = height * zoom;

      // Draw bounding box with glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      ctx.shadowColor = 'transparent';

      // Draw filled rectangle at top with gradient
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(scaledX, scaledY - 28, scaledWidth, 28);
      ctx.globalAlpha = 1.0;

      // Draw label text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px Inter, Roboto, sans-serif';
      const label = `${detection.class.toUpperCase()} ${(detection.confidence * 100).toFixed(0)}%`;
      ctx.fillText(label, scaledX + 5, scaledY - 10);

      // Draw center indicator
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(scaledX + scaledWidth / 2, scaledY + scaledHeight / 2, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Draw timestamp and camera info
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, 10, 260, 40);
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 260, 40);
    
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 13px Inter, Roboto, sans-serif';
    ctx.fillText(cameraName, 20, 28);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, Roboto, sans-serif';
    ctx.fillText(new Date().toLocaleTimeString(), 20, 42);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'none',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'white',
        height: '100%',
        borderRadius: '16px',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            {cameraName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Camera ID: {cameraId} • {detections.length} active detections
          </Typography>
        </Box>
        <Box>
          <IconButton 
            size="small" 
            onClick={handleZoomOut} 
            sx={{ 
              color: '#94a3b8',
              mr: 1,
              '&:hover': { color: '#0ea5e9' }
            }}
          >
            <ZoomOut />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleZoomIn} 
            sx={{ 
              color: '#94a3b8',
              mr: 1,
              '&:hover': { color: '#0ea5e9' }
            }}
          >
            <ZoomIn />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ 
              color: '#94a3b8',
              '&:hover': { color: '#0ea5e9' }
            }}
          >
            <Fullscreen />
          </IconButton>
        </Box>
      </Box>

      {/* Canvas for drawing detections */}
      <Box sx={{ 
        position: 'relative', 
        backgroundColor: '#0f172a', 
        borderRadius: '14px', 
        overflow: 'hidden', 
        border: '1px solid rgba(14, 165, 233, 0.15)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
        {detections.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              No detections
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569' }}>
              Waiting for vehicle data...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Detection Stats */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {Object.entries(
          detections.reduce((acc, det) => {
            acc[det.class] = (acc[det.class] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([className, count]) => (
          <Chip
            key={className}
            label={`${className.charAt(0).toUpperCase() + className.slice(1)}: ${count}`}
            size="small"
            sx={{
              backgroundColor: `${COLORS[className] || '#94a3b8'}20`,
              color: COLORS[className] || '#94a3b8',
              fontWeight: 600,
              border: `1px solid ${COLORS[className] || '#94a3b8'}40`,
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default CameraFeed;
