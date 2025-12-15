import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Check, MoveHorizontal, MoveVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Line {
  type: 'entry' | 'exit';
  orientation: 'horizontal' | 'vertical';
  position: number; // y position for horizontal, x position for vertical
  label: string;
}

interface LineDrawingCanvasProps {
  imageUrl: string;
  onLinesSet: (lines: { entryLine: Line; exitLine: Line }) => void;
}

export function LineDrawingCanvas({ imageUrl, onLinesSet }: LineDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [entryLine, setEntryLine] = useState<Line | null>(null);
  const [exitLine, setExitLine] = useState<Line | null>(null);
  const [currentStep, setCurrentStep] = useState<'entry' | 'exit' | 'done'>('entry');
  const [lineOrientation, setLineOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setImageDimensions({ width: img.width, height: img.height });
      drawCanvas();
    };
  }, [imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [entryLine, exitLine, imageDimensions]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw entry line (green)
    if (entryLine) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      
      if (entryLine.orientation === 'horizontal') {
        const y = (entryLine.position / 100) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('ENTRY LINE', 10, y - 10);
      } else {
        const x = (entryLine.position / 100) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px Arial';
        ctx.save();
        ctx.translate(x + 10, 50);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('ENTRY LINE', 0, 0);
        ctx.restore();
      }
    }

    // Draw exit line (red)
    if (exitLine) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      
      if (exitLine.orientation === 'horizontal') {
        const y = (exitLine.position / 100) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('EXIT LINE', 10, y + 20);
      } else {
        const x = (exitLine.position / 100) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 14px Arial';
        ctx.save();
        ctx.translate(x + 10, canvas.height - 50);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('EXIT LINE', 0, 0);
        ctx.restore();
      }
    }

    // Draw zone between lines if both are set
    if (entryLine && exitLine) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
      
      if (entryLine.orientation === 'horizontal' && exitLine.orientation === 'horizontal') {
        const y1 = (entryLine.position / 100) * canvas.height;
        const y2 = (exitLine.position / 100) * canvas.height;
        ctx.fillRect(0, Math.min(y1, y2), canvas.width, Math.abs(y2 - y1));
      } else if (entryLine.orientation === 'vertical' && exitLine.orientation === 'vertical') {
        const x1 = (entryLine.position / 100) * canvas.width;
        const x2 = (exitLine.position / 100) * canvas.width;
        ctx.fillRect(Math.min(x1, x2), 0, Math.abs(x2 - x1), canvas.height);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (currentStep === 'entry') {
      const newLine: Line = {
        type: 'entry',
        orientation: lineOrientation,
        position: lineOrientation === 'horizontal' ? y : x,
        label: 'ENTRY',
      };
      setEntryLine(newLine);
      setCurrentStep('exit');
    } else if (currentStep === 'exit') {
      const newLine: Line = {
        type: 'exit',
        orientation: lineOrientation,
        position: lineOrientation === 'horizontal' ? y : x,
        label: 'EXIT',
      };
      setExitLine(newLine);
      setCurrentStep('done');
    }
  };

  const handleConfirm = () => {
    if (entryLine && exitLine) {
      onLinesSet({ entryLine, exitLine });
    }
  };

  const handleReset = () => {
    setEntryLine(null);
    setExitLine(null);
    setCurrentStep('entry');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            {currentStep === 'entry' && 'Step 1: Click to set ENTRY line'}
            {currentStep === 'exit' && 'Step 2: Click to set EXIT line'}
            {currentStep === 'done' && '✓ Lines configured successfully'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {currentStep !== 'done' 
              ? `Draw a ${lineOrientation} line where vehicles ${currentStep === 'entry' ? 'enter' : 'exit'} the queue zone`
              : 'Click Confirm to proceed with analysis'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={lineOrientation === 'horizontal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLineOrientation('horizontal')}
            disabled={currentStep === 'done'}
            className="gap-2"
          >
            <MoveHorizontal className="h-4 w-4" />
            Horizontal
          </Button>
          <Button
            variant={lineOrientation === 'vertical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLineOrientation('vertical')}
            disabled={currentStep === 'done'}
            className="gap-2"
          >
            <MoveVertical className="h-4 w-4" />
            Vertical
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          {currentStep === 'done' && (
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Confirm & Analyze
            </Button>
          )}
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border-2 border-border">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          className={cn(
            'w-full h-auto cursor-crosshair bg-black',
            currentStep === 'done' && 'cursor-default'
          )}
        />
        
        {currentStep !== 'done' && (
          <div className="absolute top-4 right-4 px-3 py-2 rounded-md bg-black/70 border border-white/20">
            <p className="text-sm text-white font-medium">
              Click to place {currentStep.toUpperCase()} line
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className={cn(
          'p-3 rounded-lg border',
          entryLine ? 'border-green-500 bg-green-500/10' : 'border-border bg-secondary/50'
        )}>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="font-semibold">Entry Line</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {entryLine 
              ? `${entryLine.orientation === 'horizontal' ? 'Y' : 'X'}: ${entryLine.position.toFixed(1)}%`
              : 'Not set'
            }
          </p>
        </div>
        
        <div className={cn(
          'p-3 rounded-lg border',
          exitLine ? 'border-red-500 bg-red-500/10' : 'border-border bg-secondary/50'
        )}>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="font-semibold">Exit Line</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {exitLine 
              ? `${exitLine.orientation === 'horizontal' ? 'Y' : 'X'}: ${exitLine.position.toFixed(1)}%`
              : 'Not set'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
