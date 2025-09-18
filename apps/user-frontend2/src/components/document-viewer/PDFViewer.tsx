import React, { useState, useCallback, useEffect } from 'react';
// Replaced react-pdf with a native iframe-based viewer to avoid worker/version issues

import { PDFViewerProps } from '@/types/document-viewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName = 'document.pdf',
  onError,
  onLoad,
  className = ''
}) => {
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Download functionality
  const downloadPDF = useCallback(async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  }, [pdfUrl, fileName]);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  if (error) {
    return (
      <Alert className={cn('max-w-2xl mx-auto', className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load PDF: {error}
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
            <FileText className="h-5 w-5" />
            <span className="font-medium truncate">{fileName}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
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

            {/* Download button */}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              aria-label="Download PDF"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-center">
          <div className="border rounded-lg overflow-hidden shadow-sm w-full max-w-4xl">
            <div
              className="relative"
              style={{ width: '100%', height: '75vh', backgroundColor: '#ffffff' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                <embed
                  src={pdfUrl}
                  type="application/pdf"
                  style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' }}
                  onLoad={() => { setLoading(false); setError(null); onLoad?.(); }}
                />
              </div>
            </div>
            {/* Fallback action */}
            <div className="mt-2 text-right">
              <a className="text-sm text-primary underline" href={pdfUrl} target="_blank" rel="noreferrer">
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};