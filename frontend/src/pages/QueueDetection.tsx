import React, { useState, useRef } from 'react';
import { Upload, Video, Image as ImageIcon, Activity, Loader2, X, Download, TrendingUp, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/Sidebar';
import { LineDrawingCanvas } from '../components/LineDrawingCanvas';
import { cn } from '@/lib/utils';

interface QueueStatistics {
  totalVehicles: number;
  currentlyInQueue: number;
  completedQueue: number;
  avgWaitTime: number;
  maxWaitTime?: number;
  minWaitTime?: number;
  vehicleDetails?: Array<{
    id: number;
    type: string;
    queueTime: number;
  }>;
  vehiclesInQueue?: number;
}

interface DetectionResult {
  imageUrl: string;
  statistics: QueueStatistics;
  processing_time: number;
  is_video: boolean;
  output_path?: string;
}

interface Line {
  type: 'entry' | 'exit';
  orientation: 'horizontal' | 'vertical';
  position: number;
  label: string;
}

const QueueDetection: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('cam01');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showLineDrawing, setShowLineDrawing] = useState(false);
  const [lines, setLines] = useState<{ entryLine: Line; exitLine: Line } | null>(null);
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
    setShowLineDrawing(false);
    setLines(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSetupLines = () => {
    if (preview) {
      setShowLineDrawing(true);
    }
  };

  const handleLinesSet = (newLines: { entryLine: Line; exitLine: Line }) => {
    setLines(newLines);
    setShowLineDrawing(false);
  };

  const handleUpload = async (type: 'video' | 'image') => {
    fileInputRef.current?.click();
    fileInputRef.current!.accept = type === 'video' ? 'video/*' : 'image/*';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    
    // Include line configuration if set
    if (lines) {
      formData.append('entry_line', JSON.stringify({
        orientation: lines.entryLine.orientation,
        position: lines.entryLine.position
      }));
      formData.append('exit_line', JSON.stringify({
        orientation: lines.exitLine.orientation,
        position: lines.exitLine.position
      }));
    }

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

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/v1/queue/detect`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      const data = await response.json();
      console.log('Detection response:', data);

      // Handle output URL based on type
      let outputUrl = preview || '';
      
      if (data.is_video && data.output_path) {
        // For videos, use the full URL with cache buster
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        outputUrl = `${baseUrl}${data.output_path}?t=${Date.now()}`;
        console.log('Video URL:', outputUrl);
      } else if (data.output_base64) {
        // For images, decode base64
        const byteCharacters = atob(data.output_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        outputUrl = URL.createObjectURL(blob);
        console.log('Image output URL:', outputUrl);
      }

      setResults({
        imageUrl: outputUrl,
        statistics: data.statistics,
        processing_time: data.processing_time,
        is_video: data.is_video || false,
        output_path: data.output_path,
      });
      
      console.log('Queue detection completed:', {
        isVideo: data.is_video,
        hasLines: !!lines,
        outputUrl: outputUrl,
        imageUrl: outputUrl,
        statistics: data.statistics
      });
      
      // Log the actual result that will be used
      console.log('Results state will be set to:', {
        imageUrl: outputUrl,
        is_video: data.is_video
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError('');
    setUploadProgress(0);
    setShowLineDrawing(false);
    setLines(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadResult = () => {
    if (results?.imageUrl) {
      const link = document.createElement('a');
      link.href = results.imageUrl;
      link.download = `queue_detection_${Date.now()}.${results.is_video ? 'mp4' : 'jpg'}`;
      link.click();
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
                <Activity className="inline-block h-8 w-8 text-primary mr-3" />
                Queue Detection
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Upload video or image to detect vehicles and calculate queue waiting times using YOLOv8
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Upload Section */}
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-8">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-6 w-6 text-primary" />
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
                  className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
                >
                  <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
                  <p className="text-sm mb-1">Click to upload video or image</p>
                  <p className="text-xs text-muted-foreground">Supports MP4, AVI, MOV, JPG, PNG</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/50 overflow-hidden">
                    {isVideo && preview ? (
                      <video src={preview} controls className="w-full max-h-[300px]" />
                    ) : preview ? (
                      <img src={preview} alt="Preview" className="w-full max-h-[300px] object-contain" />
                    ) : null}
                    <div className="p-3 border-t border-border">
                      <div className="flex items-center gap-2 mb-1">
                        {isVideo ? <Video className="h-4 w-4 text-primary" /> : <ImageIcon className="h-4 w-4 text-primary" />}
                        <p className="text-sm font-medium flex-1">{file.name}</p>
                        <Button variant="ghost" size="sm" onClick={handleClear} disabled={uploading}>
                          <X className="h-4 w-4 text-destructive" />
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
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleSetupLines}
                      disabled={uploading || !!results || showLineDrawing}
                      variant="outline"
                    >
                      <Settings className="h-4 w-4" />
                      Setup Lines
                    </Button>
                    <Button
                      className="flex-1 gap-2"
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
                          <Activity className="h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {lines && !showLineDrawing && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary font-semibold mb-1">✓ Lines Configured</p>
                      <p className="text-xs text-muted-foreground">
                        Entry: {lines.entryLine.orientation} at {lines.entryLine.position.toFixed(1)}% | 
                        Exit: {lines.exitLine.orientation} at {lines.exitLine.position.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Detection Results</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-6">Processed queue analysis</p>

              {results ? (
                <div className="space-y-4">
                  {/* Annotated Output */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Processed Output with Annotations</p>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-mono">
                        ANNOTATED
                      </span>
                    </div>
                    <div className="rounded-lg border border-primary/30 bg-muted/50 overflow-hidden">
                      {results.is_video && results.imageUrl ? (
                        <div>
                          <div className="bg-black p-2 text-xs text-gray-400 font-mono">
                            Video: {results.imageUrl.substring(0, 60)}...
                          </div>
                          <video 
                            key={results.imageUrl}
                            src={results.imageUrl} 
                            controls 
                            preload="metadata"
                            autoPlay={false}
                            className="w-full max-h-[500px] bg-black"
                            style={{ display: 'block' }}
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              console.error('Video load error:', {
                                error: e,
                                src: target.src,
                                networkState: target.networkState,
                                readyState: target.readyState,
                                errorCode: target.error?.code,
                                errorMessage: target.error?.message
                              });
                              setError('Failed to load video preview. Check console for details.');
                            }}
                            onLoadStart={() => {
                              console.log('Video load started:', results.imageUrl);
                            }}
                            onLoadedMetadata={(e) => {
                              const target = e.target as HTMLVideoElement;
                              console.log('Queue detection video loaded successfully:', {
                                duration: target.duration,
                                videoWidth: target.videoWidth,
                                videoHeight: target.videoHeight
                              });
                            }}onCanPlay={() => {
                              console.log('Video can play');
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                          <div className="p-3 bg-card/50 border-t border-border">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <div className="flex-1">
                                  <p className="font-semibold text-primary mb-1">Video contains:</p>
                                  <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>Entry line (Green) and Exit line (Red)</li>
                                    <li>Vehicle bounding boxes with tracking IDs</li>
                                    <li>Real-time wait time for each vehicle</li>
                                    <li>Queue statistics panel</li>
                                  </ul>
                                </div>
                                <a
                                  href={results.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline font-medium whitespace-nowrap"
                                >
                                  Open in New Tab →
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : results.imageUrl ? (
                        <div>
                          <img
                            src={results.imageUrl}
                            alt="Processed result with annotations"
                            className="w-full max-h-[500px] object-contain bg-black"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              setError('Failed to load image preview');
                            }}
                          />
                          <div className="p-3 bg-card/50 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              Image shows detection lines, vehicle bounding boxes, and queue information
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground p-4">
                          <AlertTriangle className="h-12 w-12 mb-3 opacity-50" />
                          <p className="text-sm text-center">Video/Image not available</p>
                          <p className="text-xs text-center mt-2">Results: {JSON.stringify({is_video: results.is_video, hasUrl: !!results.imageUrl})}</p>
                        </div>
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
              ) : (
                <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Results will appear here after processing</p>
                </div>
              )}
            </div>
          </div>

          {/* Line Drawing Section - Show before statistics */}
          {showLineDrawing && preview && !results && (
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-8 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Configure Queue Lines</h3>
              </div>
              <LineDrawingCanvas 
                imageUrl={preview} 
                onLinesSet={handleLinesSet}
              />
            </div>
          )}

          {/* Statistics Cards */}
          {results && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-xs font-mono text-muted-foreground mb-2">TOTAL VEHICLES</div>
                <div className="text-4xl font-bold text-primary font-mono">
                  {results.statistics.totalVehicles}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-xs font-mono text-muted-foreground mb-2">IN QUEUE</div>
                <div className="text-4xl font-bold text-orange-400 font-mono">
                  {results.statistics.currentlyInQueue || results.statistics.vehiclesInQueue || 0}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-xs font-mono text-muted-foreground mb-2">COMPLETED</div>
                <div className="text-4xl font-bold text-green-400 font-mono">
                  {results.statistics.completedQueue || 0}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-xs font-mono text-muted-foreground mb-2">AVG WAIT TIME</div>
                <div className="text-4xl font-bold text-purple-400 font-mono">
                  {results.statistics.avgWaitTime.toFixed(1)}s
                </div>
              </div>
            </div>
          )}

          {/* Additional Statistics */}
          {results && (
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-6">
              <h3 className="text-lg font-semibold mb-4 font-mono">Additional Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {results.statistics.maxWaitTime !== undefined && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Max Wait Time:</span>
                    <span className="text-sm font-mono font-semibold">{results.statistics.maxWaitTime.toFixed(2)}s</span>
                  </div>
                )}
                {results.statistics.minWaitTime !== undefined && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Min Wait Time:</span>
                    <span className="text-sm font-mono font-semibold">{results.statistics.minWaitTime.toFixed(2)}s</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Processing Time:</span>
                  <span className="text-sm font-mono font-semibold">{results.processing_time.toFixed(2)}s</span>
                </div>
              </div>

              {/* Vehicle Details Table */}
              {results.statistics.vehicleDetails && results.statistics.vehicleDetails.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Vehicle Details</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {results.statistics.vehicleDetails.map((vehicle, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono font-semibold">
                            ID: {vehicle.id}
                          </span>
                          <span className="text-sm">{vehicle.type}</span>
                        </div>
                        <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-mono font-semibold">
                          {vehicle.queueTime.toFixed(2)}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueDetection;
