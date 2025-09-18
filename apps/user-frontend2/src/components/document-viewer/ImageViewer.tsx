import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageViewerProps } from '@/types/document-viewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  AlertCircle,
  Image as ImageIcon,
  Move
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  fileName = 'image',
  onError,
  onLoad,
  className = ''
}) => {
  const [scale, setScale] = useState<number>(1.0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setLoading(false);
    setError(null);
    onLoad?.();
  }, [onLoad]);

  const onImageError = useCallback(() => {
    const errorMsg = 'Failed to load image';
    setError(errorMsg);
    setLoading(false);
    onError?.(new Error(errorMsg));
  }, [onError]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 5.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !imageDimensions.width || !imageDimensions.height) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32; // Account for padding
    const containerHeight = container.clientHeight - 32;
    
    const scaleX = containerWidth / imageDimensions.width;
    const scaleY = containerHeight / imageDimensions.height;
    const newScale = Math.min(scaleX, scaleY, 1.0); // Don't scale up beyond original size
    
    setScale(newScale);
    setPosition({ x: 0, y: 0 });
  }, [imageDimensions]);

  // Pan functionality
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (scale <= 1.0) return; // Only allow panning when zoomed in
    
    setIsDragging(true);
    setDragStart({
      x: event.clientX - position.x,
      y: event.clientY - position.y
    });
  }, [scale, position]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || scale <= 1.0) return;
    
    setPosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    });
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1 && scale > 1.0) {
      const touch = event.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  }, [scale, position]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1 && isDragging && scale > 1.0) {
      event.preventDefault();
      const touch = event.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Download functionality
  const downloadImage = useCallback(async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get file extension from URL or use jpg as default
      const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const downloadFileName = fileName.includes('.') ? fileName : `${fileName}.${extension}`;
      
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }, [imageUrl, fileName]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        case '0':
          event.preventDefault();
          resetZoom();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          fitToScreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom, fitToScreen]);

  // Reset position when scale changes to prevent image from going off-screen
  useEffect(() => {
    if (scale <= 1.0) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  if (error) {
    return (
      <Alert className={cn('max-w-2xl mx-auto', className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Document info */}
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <span className="font-medium truncate">{fileName}</span>
            {imageDimensions.width > 0 && (
              <span className="text-sm text-muted-foreground">
                ({imageDimensions.width} × {imageDimensions.height})
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                disabled={scale <= 0.25}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 min-w-[4rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                disabled={scale >= 5.0}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Fit to screen button */}
            <Button
              variant="outline"
              size="sm"
              onClick={fitToScreen}
              aria-label="Fit to screen"
            >
              <Move className="h-4 w-4 mr-1" />
              Fit
            </Button>

            {/* Download button */}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadImage}
              aria-label="Download image"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div 
          ref={containerRef}
          className="relative overflow-hidden border rounded-lg bg-muted/10"
          style={{ height: '60vh', minHeight: '400px' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {loading && (
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading image...</p>
              </div>
            )}
            
            <img
              ref={imageRef}
              src={imageUrl}
              alt={fileName}
              onLoad={onImageLoad}
              onError={onImageError}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={cn(
                'max-w-none transition-transform duration-200',
                scale > 1.0 && 'cursor-grab',
                isDragging && 'cursor-grabbing',
                loading && 'opacity-0'
              )}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          </div>
          
          {/* Pan hint */}
          {scale > 1.0 && !isDragging && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Click and drag to pan
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};