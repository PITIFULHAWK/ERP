import React, { useState, useCallback, useEffect } from 'react';
import { PDFViewerProps } from '@/types/document-viewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  AlertCircle,
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadBlob, generateFilename } from '@/lib/pdfUtils';
import { toast } from '@/hooks/use-toast';

export const SimplePDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName = 'document.pdf',
  onError,
  onLoad,
  className = ''
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

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
    onLoad?.();
  }, [onLoad]);

  // Handle load error
  const handleLoadError = useCallback((errorMessage: string) => {
    console.error('PDF load error:', errorMessage);
    setError(errorMessage);
    setLoading(false);
    onError?.(new Error(errorMessage));
  }, [onError]);

  // Retry loading
  const retryLoad = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
    
    toast({
      title: "Retrying",
      description: "Retrying to load PDF...",
    });
  }, []);

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        retryLoad();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, retryLoad]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {fileName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {error && retryCount < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={retryLoad}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(pdfUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-muted/10" style={{ height: '75vh', minHeight: '400px' }}>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Retry attempt {retryCount}</p>
                )}
              </div>
            </div>
          )}

          {error && retryCount >= 3 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold mb-2">Unable to Load PDF</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="space-y-2">
                  <Button onClick={() => window.open(pdfUrl, '_blank')} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button variant="outline" onClick={downloadPDF} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="w-full h-full">
              {/* Try object tag first */}
              <object
                data={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=100`}
                type="application/pdf"
                className="w-full h-full"
                onLoad={handleLoadSuccess}
                onError={() => handleLoadError('Object tag failed to load PDF')}
              >
                {/* Fallback to embed */}
                <embed
                  src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=100`}
                  type="application/pdf"
                  className="w-full h-full"
                  onLoad={handleLoadSuccess}
                  onError={() => handleLoadError('Embed tag failed to load PDF')}
                />
                {/* Final fallback */}
                <div className="flex items-center justify-center h-full bg-muted/10">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">PDF Viewer Not Available</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Your browser cannot display PDFs directly. Click the button below to open in a new tab.
                    </p>
                    <Button onClick={() => window.open(pdfUrl, '_blank')} className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Open PDF in New Tab
                    </Button>
                  </div>
                </div>
              </object>
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
