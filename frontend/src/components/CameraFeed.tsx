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
  car: '#3b82f6',
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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
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
      const color = COLORS[detection.class] || '#ffffff';

      // Scale coordinates
      const scaledX = x * zoom;
      const scaledY = y * zoom;
      const scaledWidth = width * zoom;
      const scaledHeight = height * zoom;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Draw filled rectangle at top
      ctx.fillStyle = color;
      ctx.fillRect(scaledX, scaledY - 25, scaledWidth, 25);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      const label = `${detection.class.toUpperCase()} ${(detection.confidence * 100).toFixed(0)}%`;
      ctx.fillText(label, scaledX + 5, scaledY - 8);

      // Draw center dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(scaledX + scaledWidth / 2, scaledY + scaledHeight / 2, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw timestamp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(10, 10, 200, 30);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(new Date().toLocaleTimeString(), 20, 30);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: '#1e293b',
        color: 'white',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6">{cameraName}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Camera ID: {cameraId}
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={handleZoomOut} sx={{ color: 'white', mr: 1 }}>
            <ZoomOut />
          </IconButton>
          <IconButton size="small" onClick={handleZoomIn} sx={{ color: 'white', mr: 1 }}>
            <ZoomIn />
          </IconButton>
          <IconButton size="small" sx={{ color: 'white' }}>
            <Fullscreen />
          </IconButton>
        </Box>
      </Box>

      {/* Canvas for drawing detections */}
      <Box sx={{ position: 'relative', backgroundColor: '#0f172a', borderRadius: 1, overflow: 'hidden' }}>
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
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              No detections
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
              Waiting for vehicle data...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Detection Stats */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {Object.entries(
          detections.reduce((acc, det) => {
            acc[det.class] = (acc[det.class] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([className, count]) => (
          <Chip
            key={className}
            label={`${className}: ${count}`}
            size="small"
            sx={{
              backgroundColor: COLORS[className] || '#ffffff',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default CameraFeed;
