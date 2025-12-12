import { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Detection {
  id: string;
  class: string;
  confidence: number;
  bbox: number[];
  timestamp: string;
}

interface CameraFeedProps {
  cameraId: string;
  cameraName: string;
  detections: Detection[];
  youtubeUrl?: string;
}

export function CameraFeed({ cameraId, cameraName, detections, youtubeUrl }: CameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}` : null;
  };

  const embedUrl = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;

  useEffect(() => {
    drawDetections();
  }, [detections, zoom]);

  const drawDetections = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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
      const scaledX = x * zoom;
      const scaledY = y * zoom;
      const scaledWidth = width * zoom;
      const scaledHeight = height * zoom;

      // Draw bounding box with glow effect
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      ctx.shadowColor = 'transparent';

      // Draw label background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(scaledX, scaledY - 24, scaledWidth, 24);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.font = '11px JetBrains Mono';
      ctx.textBaseline = 'middle';
      const label = `${detection.class.toUpperCase()} ${(detection.confidence * 100).toFixed(0)}%`;
      ctx.fillText(label, scaledX + 6, scaledY - 12);

      // Draw corner accents
      const cornerSize = 8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(scaledX, scaledY + cornerSize);
      ctx.lineTo(scaledX, scaledY);
      ctx.lineTo(scaledX + cornerSize, scaledY);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(scaledX + scaledWidth - cornerSize, scaledY);
      ctx.lineTo(scaledX + scaledWidth, scaledY);
      ctx.lineTo(scaledX + scaledWidth, scaledY + cornerSize);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(scaledX, scaledY + scaledHeight - cornerSize);
      ctx.lineTo(scaledX, scaledY + scaledHeight);
      ctx.lineTo(scaledX + cornerSize, scaledY + scaledHeight);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(scaledX + scaledWidth - cornerSize, scaledY + scaledHeight);
      ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
      ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - cornerSize);
      ctx.stroke();
    });

    // Draw timestamp overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 120, canvas.height - 30, 110, 22);
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px JetBrains Mono';
    ctx.fillText(new Date().toLocaleTimeString(), canvas.width - 114, canvas.height - 15);
  };

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-card overflow-hidden" style={{ animationDelay: '100ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
          <div>
            <p className="font-mono text-xs text-foreground">{cameraId.toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">{cameraName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-mono text-xs text-muted-foreground">
            {(zoom * 100).toFixed(0)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative aspect-video bg-background">
        {embedUrl ? (
          /* YouTube Live Stream */
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          /* Canvas for detections */
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="h-full w-full object-contain"
          />
        )}
        
        {/* Scan line overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent animate-scan" />
        </div>

        {/* Detection count */}
        <div className="absolute bottom-4 left-4 rounded border border-border bg-background/80 px-3 py-1.5 backdrop-blur">
          <span className="font-mono text-xs text-foreground">
            {detections.length} DETECTIONS
          </span>
        </div>
      </div>

      {/* Detection legend */}
      <div className="flex flex-wrap gap-4 border-t border-border p-4">
        {['car', 'truck', 'bus', 'motorcycle'].map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border border-foreground bg-foreground/20" />
            <span className="font-mono text-xs text-muted-foreground uppercase">
              {type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
