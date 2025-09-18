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
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertHTMLToPDF, downloadBlob, generateFilename } from '@/lib/pdfUtils';
import { toast } from '@/hooks/use-toast';

export const EnhancedPDFViewer: React.FC<PDFViewerProps> = ({
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Convert to image and download
  const convertToImage = useCallback(async () => {
    try {
      setIsDownloading(true);
      
      if (!iframeRef.current?.contentDocument?.body) {
        throw new Error('PDF content not loaded');
      }

      const pdfElement = iframeRef.current.contentDocument.body;
      const blob = await convertHTMLToPDF(pdfElement, {
        filename: generateFilename(fileName.replace('.pdf', ''), 'pdf'),
        orientation: 'portrait',
        format: 'a4'
      });

      const filename = generateFilename(fileName.replace('.pdf', ''), 'pdf');
      downloadBlob(blob, filename);
      
      toast({
        title: "Conversion complete",
        description: `PDF converted and downloaded as ${filename}`,
      });
    } catch (error) {
      console.error('Failed to convert PDF:', error);
      toast({
        title: "Conversion failed",
        description: "Failed to convert PDF to image",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [fileName]);

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
        case '/':
          event.preventDefault();
          setShowSearch(true);
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

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setLoading(false);
    setError(null);
    onLoad?.();
  }, [onLoad]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    const errorMsg = 'Failed to load PDF document';
    setError(errorMsg);
    setLoading(false);
    onError?.(new Error(errorMsg));
  }, [onError]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                  className={showSearch ? 'bg-muted' : ''}
                >
                  <Search className="h-4 w-4" />
                </Button>
                {showSearch && (
                  <input
                    type="text"
                    placeholder="Search in PDF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-2 py-1 text-sm border rounded w-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSearch(false);
                        setSearchQuery('');
                      }
                    }}
                  />
                )}
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

              {/* Fit controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fitToWidth}
                  aria-label="Fit to width"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Fit Width
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fitToHeight}
                  aria-label="Fit to height"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Fit Height
                </Button>
              </div>

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
              </div>
            )}
            
            <div
              className="w-full h-full"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={fileName}
              />
            </div>
          </div>
          
          {/* Keyboard shortcuts hint */}
          {showControls && (
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
