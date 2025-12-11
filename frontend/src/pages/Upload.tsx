import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Image as ImageIcon, Video, CheckCircle, Loader2, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/Sidebar';
import { cn } from '@/lib/utils';

const Upload: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    const fileType = selectedFile.type;
    const isImage = fileType.startsWith('image/');
    const isVideo = fileType.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      return;
    }

    setFile(selectedFile);
    setResults(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = file.type.startsWith('image/') 
        ? 'http://localhost:8000/api/v1/detect/image'
        : 'http://localhost:8000/api/v1/detect/video';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
                Upload & Detect
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Upload media files for vehicle detection
              </p>
            </div>
            <UploadIcon className="h-8 w-8 text-primary" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={tabValue === 0 ? "default" : "outline"}
              onClick={() => setTabValue(0)}
              className="gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Image
            </Button>
            <Button
              variant={tabValue === 1 ? "default" : "outline"}
              onClick={() => setTabValue(1)}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Video
            </Button>
          </div>

          {/* Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            accept={tabValue === 0 ? 'image/*' : 'video/*'}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div 
            className={cn(
              "rounded-xl border-2 border-dashed bg-card p-12 mb-8 transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  {tabValue === 0 ? (
                    <ImageIcon className="h-8 w-8 text-primary" />
                  ) : (
                    <Video className="h-8 w-8 text-primary" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Drop {tabValue === 0 ? 'Image' : 'Video'} Here
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  or click to browse from your computer
                </p>
                <Button className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  <UploadIcon className="h-4 w-4" />
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Preview */}
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {preview && (
                    file.type.startsWith('image/') ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <video src={preview} controls className="w-full h-full" />
                    )
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleClear}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={uploading || !!results}
                      className="gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detection Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-xs font-mono text-muted-foreground mb-2">DETECTIONS</div>
              <div className="text-3xl font-bold font-mono">
                {results?.count || results?.total_detections || '--'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-xs font-mono text-muted-foreground mb-2">PROCESSING TIME</div>
              <div className="text-3xl font-bold font-mono">
                {results?.processing_time ? `${results.processing_time}s` : '--'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-xs font-mono text-muted-foreground mb-2">FRAMES</div>
              <div className="text-3xl font-bold font-mono">
                {results?.frames_processed || results?.detections?.length || '--'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-xs font-mono text-muted-foreground mb-2">STATUS</div>
              <div className="flex items-center gap-2 text-sm">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    <span className="font-mono">Processing</span>
                  </>
                ) : results ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="font-mono">Complete</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="font-mono">Ready</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results Display */}
          {results && (
            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4 font-mono">Detection Results</h3>
              <div className="space-y-2 text-sm">
                {results.vehicle_counts && (
                  <div>
                    <span className="text-muted-foreground">Vehicle Types:</span>
                    <div className="mt-2 space-y-1">
                      {Object.entries(results.vehicle_counts).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between">
                          <span className="font-mono">{type}:</span>
                          <span className="font-mono font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {results.detections && (
                  <div className="mt-4">
                    <span className="text-muted-foreground">Total Detections:</span>
                    <span className="ml-2 font-mono font-bold">{results.detections.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
