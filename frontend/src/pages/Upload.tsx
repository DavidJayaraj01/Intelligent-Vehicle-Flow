import React, { useState, useRef } from 'react';
import {
  Upload as CloudUpload,
  Image as ImageIcon,
  Video as VideoLibrary,
  Trash2 as Delete,
  ZoomIn,
  ZoomOut,
  RotateCcw as Refresh,
  CheckCircle,
  AlertCircle as ErrorIcon,
  Menu as MenuIcon,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/Sidebar';
import { cn } from '@/lib/utils';

interface Detection {
  bbox: [number, number, number, number];
  confidence: number;
  class: string;
  frame?: number;
  timestamp?: number;
}

interface DetectionResult {
  detections: Detection[];
  count?: number;
  total_detections?: number;
  processing_time: number;
  image_size?: [number, number];
  video_size?: [number, number];
  vehicle_counts?: { [key: string]: number };
  frames_processed?: number;
  total_frames?: number;
  fps?: number;
  sample_rate?: number;
}

const Upload: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (tabValue === 0 && !isImage) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    
    if (tabValue === 1 && !isVideo) {
      setError('Please select a video file (MP4, AVI, etc.)');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setDetectionResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setDetectionResult(null);
    setError(null);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const drawDetections = (imageElement: HTMLImageElement, detections: Detection[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;

    ctx.drawImage(imageElement, 0, 0);

    detections.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.bbox;
      const width = x2 - x1;
      const height = y2 - y1;
      const color = getVehicleTypeColor(detection.class);

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.strokeRect(x1, y1, width, height);
      ctx.shadowColor = 'transparent';

      const label = `${detection.class} ${(detection.confidence * 100).toFixed(1)}%`;
      ctx.font = 'bold 18px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 24;
      const padding = 8;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight - padding, textMetrics.width + padding * 2, textHeight + padding);

      ctx.fillStyle = '#fff';
      ctx.fillText(label, x1 + padding, y1 - padding);
    });
  };

  const handleDetect = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const endpoint = tabValue === 0 
        ? `${API_BASE}/detect/image`
        : `${API_BASE}/detect/video`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`);
      }

      const result: DetectionResult = await response.json();
      
      if (tabValue === 1 && result.total_detections !== undefined) {
        result.count = result.total_detections;
      }
      
      setDetectionResult(result);

      if (tabValue === 0 && preview) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setTimeout(() => {
            drawDetections(img, result.detections);
          }, 100);
        };
        img.src = preview;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const getVehicleTypeColor = (vehicleType: string): string => {
    const colors: { [key: string]: string } = {
      car: '#0ea5e9',
      truck: '#f59e0b',
      bus: '#6366f1',
      motorcycle: '#ec4899',
      bicycle: '#10b981',
      bike: '#10b981',
      person: '#ef4444',
      van: '#f97316',
    };
    return colors[vehicleType.toLowerCase()] || '#94a3b8';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />

      <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "md:ml-[280px]" : "md:ml-16")}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground font-mono mb-4">
              Vehicle Detection
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Upload and analyze images or videos with advanced AI-powered vehicle detection technology
            </p>
          </div>

          {/* Tabs */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur mb-8 overflow-hidden">
            <div className="grid grid-cols-2">
              <button
                onClick={() => { setTabValue(0); handleClear(); }}
                className={cn(
                  "flex items-center justify-center gap-3 py-6 text-lg font-bold transition-all",
                  tabValue === 0
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <ImageIcon className="h-7 w-7" />
                <span>Image Upload</span>
              </button>
              <button
                onClick={() => { setTabValue(1); handleClear(); }}
                className={cn(
                  "flex items-center justify-center gap-3 py-6 text-lg font-bold transition-all",
                  tabValue === 1
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <VideoLibrary className="h-7 w-7" />
                <span>Video Upload</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Upload Section */}
            <div className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 flex items-center justify-center">
                  {tabValue === 0 ? 
                    <ImageIcon className="h-8 w-8 text-primary" /> : 
                    <VideoLibrary className="h-8 w-8 text-primary" />
                  }
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {tabValue === 0 ? 'Upload Image' : 'Upload Video'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {tabValue === 0 ? 'JPG, PNG, GIF' : 'MP4, AVI, MOV'}
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={tabValue === 0 ? 'image/*' : 'video/*'}
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={handleUploadClick}
                className="border-3 border-dashed border-border rounded-xl p-8 text-center cursor-pointer bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all"
              >
                <div className="flex justify-center mb-3">
                  <CloudUpload className="h-16 w-16 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Click to select {tabValue === 0 ? 'an image' : 'a video'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  or drag and drop your file here
                </p>
              </div>

              {selectedFile && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleDetect}
                      disabled={loading}
                      className="flex-1 h-12 text-base font-bold"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <CloudUpload className="mr-2 h-5 w-5" />
                          Detect Vehicles
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      disabled={loading}
                      className="h-12"
                    >
                      <Delete className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
                  <ErrorIcon className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-destructive hover:text-destructive/80">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Preview</h2>
                    <p className="text-sm text-muted-foreground">
                      {preview ? 'File loaded' : 'Waiting for file'}
                    </p>
                  </div>
                </div>
                {preview && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleZoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleResetZoom}>
                      <Refresh className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="min-h-[350px] rounded-xl bg-background/30 border border-primary/20 flex items-center justify-center overflow-auto">
                {!preview && (
                  <div className="text-center space-y-4">
                    <ImageIcon className="h-20 w-20 text-muted-foreground/20 mx-auto" />
                    <p className="text-muted-foreground">No file selected yet</p>
                  </div>
                )}

                {preview && tabValue === 0 && (
                  <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }} className="p-4 w-full">
                    {!detectionResult && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto block rounded-lg"
                      />
                    )}
                    {detectionResult && (
                      <canvas
                        ref={canvasRef}
                        className="w-full h-auto block rounded-lg"
                      />
                    )}
                  </div>
                )}

                {preview && tabValue === 1 && (
                  <video
                    src={preview}
                    controls
                    style={{ transform: `scale(${zoom})` }}
                    className="max-w-full max-h-full rounded-lg"
                  />
                )}
              </div>

              {detectionResult && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <p className="font-bold text-green-500">
                    ✓ Detection complete! {detectionResult.count} vehicle(s) in {detectionResult.processing_time.toFixed(2)}s
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {detectionResult && (
            <div className="mt-8 rounded-xl border border-green-500/30 bg-card/80 backdrop-blur p-6 space-y-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-9 w-9 text-green-500" />
                <div>
                  <h2 className="text-2xl font-bold text-green-500">Detection Results</h2>
                  <p className="text-sm text-muted-foreground">Analysis complete and ready for review</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <div className="text-4xl font-mono font-bold text-primary mb-2">
                    {detectionResult.count}
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">Vehicles Detected</div>
                </div>
                <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <div className="text-4xl font-mono font-bold text-purple-500 mb-2">
                    {detectionResult.processing_time.toFixed(2)}s
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">Processing Time</div>
                </div>
                <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <div className="text-2xl font-mono font-bold text-green-500 mb-2">
                    {detectionResult.image_size 
                      ? `${detectionResult.image_size[0]}×${detectionResult.image_size[1]}`
                      : detectionResult.video_size 
                      ? `${detectionResult.video_size[0]}×${detectionResult.video_size[1]}`
                      : 'N/A'}
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">Resolution</div>
                </div>
              </div>

              {detectionResult.vehicle_counts && (
                <div className="space-y-3">
                  <div className="h-px bg-border" />
                  <h3 className="text-lg font-bold text-primary">Vehicle Distribution</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(detectionResult.vehicle_counts).map(([type, count]) => (
                      <div
                        key={type}
                        className="px-4 py-2 rounded-lg font-bold text-sm"
                        style={{
                          backgroundColor: `${getVehicleTypeColor(type)}20`,
                          color: getVehicleTypeColor(type),
                          border: `1px solid ${getVehicleTypeColor(type)}40`,
                        }}
                      >
                        {type}: {count}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="h-px bg-border" />
                <h3 className="text-lg font-bold text-primary">
                  Detected Objects ({detectionResult.detections.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {detectionResult.detections.map((detection, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-lg font-semibold text-sm"
                      style={{
                        backgroundColor: `${getVehicleTypeColor(detection.class)}30`,
                        color: getVehicleTypeColor(detection.class),
                        border: `1px solid ${getVehicleTypeColor(detection.class)}50`,
                      }}
                    >
                      {detection.class} ({(detection.confidence * 100).toFixed(1)}%)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
