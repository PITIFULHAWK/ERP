import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PDFViewerProps } from '@/types/document-viewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  AlertCircle,
  FileText,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadBlob, generateFilename } from '@/lib/pdfUtils';
import { toast } from '@/hooks/use-toast';

export const ImprovedPDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName = 'document.pdf',
  onError,
  onLoad,
  className = ''
}) => {
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'iframe' | 'embed' | 'object' | 'link'>('iframe');
  const [retryCount, setRetryCount] = useState<number>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const embedRef = useRef<HTMLEmbedElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const fitToWidth = useCallback(() => {
    setScale(1.0);
  }, []);

  const fitToHeight = useCallback(() => {
    setScale(1.0);
  }, []);

  // Fullscreen controls
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Download functionality
  const downloadPDF = useCallback(async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const filename = generateFilename(fileName.replace('.pdf', ''), 'pdf');
      downloadBlob(blob, filename);
      
      toast({
        title: "Download started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the PDF file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [pdfUrl, fileName]);

  // Handle load success
  const handleLoadSuccess = useCallback(() => {
    setLoading(false);
    setError(null);
    setRetryCount(0);
    onLoad?.();
  }, [onLoad]);

  // Handle load error
  const handleLoadError = useCallback((errorMessage: string) => {
    console.error('PDF load error:', errorMessage);
    setError(errorMessage);
    setLoading(false);
    onError?.(new Error(errorMessage));
  }, [onError]);

  // Try different view modes
  const tryNextViewMode = useCallback(() => {
    const modes: Array<'iframe' | 'embed' | 'object' | 'link'> = ['iframe', 'embed', 'object', 'link'];
    const currentIndex = modes.indexOf(viewMode);
    
    if (currentIndex < modes.length - 1) {
      const nextMode = modes[currentIndex + 1];
      setViewMode(nextMode);
      setRetryCount(prev => prev + 1);
      setLoading(true);
      setError(null);
      
      toast({
        title: "Trying alternative view mode",
        description: `Switching to ${nextMode} mode...`,
      });
    } else {
      handleLoadError('All view modes failed. PDF may be blocked by CORS policy.');
    }
  }, [viewMode, handleLoadError]);

  // Retry with current mode
  const retryCurrentMode = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
    
    toast({
      title: "Retrying",
      description: `Retrying ${viewMode} mode...`,
    });
  }, [viewMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showControls) return;
      
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
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
        case 'h':
        case 'H':
          event.preventDefault();
          setShowControls(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom, toggleFullscreen, isFullscreen, showControls]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount < 2) {
      const timer = setTimeout(() => {
        tryNextViewMode();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, tryNextViewMode]);

  // Render PDF based on view mode
  const renderPDF = () => {
    const commonProps = {
      className: "w-full h-full border-0",
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }
    };

    switch (viewMode) {
      case 'iframe':
        return (
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            onLoad={handleLoadSuccess}
            onError={() => handleLoadError('Iframe failed to load PDF')}
            title={fileName}
            {...commonProps}
          />
        );
      
      case 'embed':
        return (
          <embed
            ref={embedRef}
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            type="application/pdf"
            onLoad={handleLoadSuccess}
            onError={() => handleLoadError('Embed failed to load PDF')}
            {...commonProps}
          />
        );
      
      case 'object':
        return (
          <object
            ref={objectRef}
            data={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            type="application/pdf"
            onLoad={handleLoadSuccess}
            onError={() => handleLoadError('Object failed to load PDF')}
            {...commonProps}
          >
            <p>Your browser does not support PDFs. <a href={pdfUrl} target="_blank" rel="noreferrer">Click here to download</a></p>
          </object>
        );
      
      case 'link':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-muted/10">
            <FileText className="h-16 w-16 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">PDF Viewer Not Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Your browser cannot display PDFs directly. Click the button below to open in a new tab.
            </p>
            <Button onClick={() => window.open(pdfUrl, '_blank')} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open PDF in New Tab
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (error && viewMode === 'link') {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {fileName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Viewer Unavailable</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPDF}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-1" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderPDF()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      {/* Header with controls */}
      {showControls && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Document info */}
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium truncate">{fileName}</span>
              <Badge variant="secondary" className="text-xs">
                {Math.round(scale * 100)}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                {viewMode}
              </Badge>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* View mode selector */}
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'iframe' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('iframe')}
                  disabled={loading}
                >
                  Iframe
                </Button>
                <Button
                  variant={viewMode === 'embed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('embed')}
                  disabled={loading}
                >
                  Embed
                </Button>
                <Button
                  variant={viewMode === 'object' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('object')}
                  disabled={loading}
                >
                  Object
                </Button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
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
                  disabled={scale >= 3.0}
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

              {/* Retry button */}
              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryCurrentMode}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              )}

              {/* Fullscreen */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPDF}
                disabled={isDownloading}
                aria-label="Download PDF"
              >
                <Download className="h-4 w-4 mr-1" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>

              {/* Hide controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(false)}
                aria-label="Hide controls"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      {/* Show controls button when hidden */}
      {!showControls && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowControls(true)}
            className="bg-background/80 backdrop-blur-sm"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CardContent className="relative">
        <div 
          ref={containerRef}
          className="relative overflow-hidden border rounded-lg bg-muted/10"
          style={{ 
            height: isFullscreen ? '100vh' : '75vh',
            minHeight: isFullscreen ? '100vh' : '400px'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {loading && (
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
                <p className="text-xs text-muted-foreground mt-1">Mode: {viewMode}</p>
              </div>
            )}
            
            {error && viewMode !== 'link' && (
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <p className="text-xs text-muted-foreground">Trying alternative methods...</p>
              </div>
            )}
            
            {!loading && !error && (
              <div className="w-full h-full">
                {renderPDF()}
              </div>
            )}
          </div>
          
          {/* Keyboard shortcuts hint */}
          {showControls && !loading && !error && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Press H to hide controls, F for fullscreen, +/- for zoom
            </div>
          )}
        </div>

        {/* Fallback link */}
        <div className="mt-2 text-right">
          <a 
            className="text-sm text-primary underline" 
            href={pdfUrl} 
            target="_blank" 
            rel="noreferrer"
          >
            Open in new tab
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
