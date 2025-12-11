import React, { useState, useRef } from 'react';
import { Upload, Ambulance, AlertTriangle, Shield, Flame, Loader2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/Sidebar';
import { cn } from '@/lib/utils';

interface DetectionCount {
  ambulance: number;
  fire_truck: number;
  police_car: number;
}

interface EmergencyStatistics {
  detectionCounts: DetectionCount;
  totalDetections: number;
  framesWithDetections?: number;
  totalFrames?: number;
  maxConfidence?: number;
}

interface DetectionResult {
  success: boolean;
  isVideo: boolean;
  videoUrl?: string;
  imageData?: string;
  statistics: EmergencyStatistics;
  processingTime?: number;
}

const EmergencyDetection: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid video (MP4, AVI, MOV) or image (JPG, PNG) file');
      return;
    }

    // Validate file size (max 500MB)
    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB');
      return;
    }

    setFile(selectedFile);
    setResults(null);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);

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

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE}/emergency/detect`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Detection failed');
      }

      const data: DetectionResult = await response.json();
      console.log('Emergency detection response:', data);

      // If video, use the video URL
      if (data.isVideo && data.videoUrl) {
        console.log('Video URL:', data.videoUrl);
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        setResults({
          ...data,
          videoUrl: `${baseUrl}${data.videoUrl}`,
        });
      } else {
        setResults(data);
      }
    } catch (err) {
      console.error('Emergency detection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadResult = () => {
    if (results?.videoUrl || results?.imageData) {
      const link = document.createElement('a');
      link.href = results.videoUrl || results.imageData || '';
      link.download = `emergency_detection_${Date.now()}.${results.isVideo ? 'mp4' : 'jpg'}`;
      link.click();
    }
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return <Ambulance className="h-6 w-6 text-yellow-400" />;
      case 'fire_truck':
        return <Flame className="h-6 w-6 text-orange-400" />;
      case 'police_car':
        return <Shield className="h-6 w-6 text-blue-400" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
    }
  };

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case 'ambulance':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'fire_truck':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'police_car':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const isVideo = file?.type.startsWith('video/');

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedCamera={selectedCamera}
        onCameraSelect={setSelectedCamera}
      />

      <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "md:ml-[280px]" : "md:ml-16")}>
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
                <AlertTriangle className="inline-block h-8 w-8 text-destructive mr-3" />
                Emergency Detection
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered detection of ambulances, fire trucks, and police cars in real-time
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Upload Section */}
            <div className="rounded-xl border border-destructive/30 bg-card/80 backdrop-blur p-8">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-semibold">Upload Media</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6">MP4, AVI, MOV, JPG, PNG (max 500MB)</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer transition-all hover:border-destructive hover:bg-destructive/5"
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm mb-1">Click to upload video or image</p>
                  <p className="text-xs text-muted-foreground">Supported: MP4, AVI, MOV, JPG, PNG</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/50 overflow-hidden">
                    {isVideo ? (
                      <video src={preview || ''} controls className="w-full max-h-[300px]" />
                    ) : (
                      <img src={preview || ''} alt="Preview" className="w-full max-h-[300px] object-contain" />
                    )}
                    <div className="p-3 border-t border-border">
                      <div className="flex items-center gap-2 mb-1">
                        {isVideo ? <Upload className="h-4 w-4 text-destructive" /> : <Upload className="h-4 w-4 text-destructive" />}
                        <p className="text-sm font-medium flex-1">{file.name}</p>
                        <Button variant="ghost" size="sm" onClick={handleClear} disabled={uploading}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-destructive transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={handleAnalyze}
                    disabled={uploading || !!results}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        Detect Emergency Vehicles
                      </>
                    )}
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="rounded-xl border border-destructive/30 bg-card/80 backdrop-blur p-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-semibold">Detection Results</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6">Emergency vehicle analysis</p>

              {!results ? (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border rounded-lg text-muted-foreground">
                  <AlertTriangle className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-sm">No results yet. Upload and process a file to see detections.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Processed Output */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Processed Output with Annotations</p>
                    <div className="rounded-lg border border-border bg-muted/50 overflow-hidden">
                      {results.isVideo ? (
                        <div>
                          <video 
                            src={results.videoUrl} 
                            controls 
                            className="w-full max-h-[300px]"
                          />
                          <div className="p-3 bg-card/50 text-center border-t border-border">
                            <a
                              href={results.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-destructive hover:underline"
                            >
                              Open Video in New Tab →
                            </a>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={results.imageData}
                          alt="Processed result"
                          className="w-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleDownloadResult}
                  >
                    <Download className="h-4 w-4" />
                    Download Results
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          {results && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <div className="text-xs font-mono text-muted-foreground mb-2">TOTAL DETECTIONS</div>
                <div className="text-4xl font-bold text-destructive font-mono">
                  {results.statistics.totalDetections}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <div className="text-xs font-mono text-muted-foreground mb-2">PROCESSING TIME</div>
                <div className="text-4xl font-bold text-green-400 font-mono">
                  {results.processingTime?.toFixed(1) || 0}s
                </div>
              </div>
            </div>
          )}

          {/* Emergency Vehicle Counts */}
          {results && (
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <h3 className="text-lg font-semibold mb-4">Emergency Vehicle Counts</h3>
              <div className="space-y-3">
                {Object.entries(results.statistics.detectionCounts).map(([type, count]) => (
                  <div
                    key={type}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border-l-4",
                      getEmergencyColor(type)
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getEmergencyIcon(type)}
                      <span className="font-medium">
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-background font-mono font-bold">
                      {count}
                    </div>
                  </div>
                ))}
              </div>

              {results.isVideo && results.statistics.totalFrames && (
                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">
                    Frames with detections: {results.statistics.framesWithDetections} / {results.statistics.totalFrames}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyDetection;
