import React, { useMemo, useState, useCallback } from 'react';
import { DocumentViewerProps, DocumentType } from '@/types/document-viewer';
import { PDFViewer } from './PDFViewer';
import { ImprovedPDFViewer } from './ImprovedPDFViewer';
import { SimplePDFViewer } from './SimplePDFViewer';
import { ImageViewer } from './ImageViewer';
import { ImageToPDFConverter } from './ImageToPDFConverter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, Image as ImageIcon, Download, FileImage } from 'lucide-react';
import { isImageUrl, downloadBlob, generateFilename } from '@/lib/pdfUtils';
import { ErrorBoundary, RetryableError, NetworkError } from '@/components/error-handling';
import { toast } from '@/hooks/use-toast';

export const EnhancedDocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  documentType,
  fileName,
  onError,
  onLoad,
  className = ''
}) => {
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('viewer');
  const [convertedPdfBlob, setConvertedPdfBlob] = useState<Blob | null>(null);
  const [useSimpleViewer, setUseSimpleViewer] = useState<boolean>(false);

  // Determine document type from URL if not explicitly provided
  const detectedType = useMemo((): DocumentType => {
    if (documentType) return documentType;
    
    const url = documentUrl.toLowerCase();
    const extension = url.split('.').pop()?.split('?')[0]; // Remove query params
    
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    
    // Default to PDF if uncertain
    return 'pdf';
  }, [documentUrl, documentType]);

  // Check if the document is an image
  const isImage = useMemo(() => {
    return detectedType === 'image' || isImageUrl(documentUrl);
  }, [detectedType, documentUrl]);

  // Validate document URL
  const isValidUrl = useMemo(() => {
    try {
      new URL(documentUrl);
      return true;
    } catch {
      return false;
    }
  }, [documentUrl]);

  const handleDocumentError = useCallback((error: Error) => {
    setLoadError(error);
    // If the improved viewer fails, try the simple viewer
    if (detectedType === 'pdf' && !useSimpleViewer) {
      setUseSimpleViewer(true);
      toast({
        title: "Switching to simple viewer",
        description: "Advanced viewer failed, trying simple PDF viewer...",
      });
    } else {
      onError?.(error);
    }
  }, [onError, detectedType, useSimpleViewer]);

  const handleDocumentLoad = useCallback(() => {
    setLoadError(null);
    setRetryCount(0);
    onLoad?.();
  }, [onLoad]);

  const handleRetry = useCallback(async () => {
    setLoadError(null);
    setRetryCount(prev => prev + 1);
    // The actual retry will be handled by re-rendering the viewer components
  }, []);

  const handleImageConverted = useCallback((pdfBlob: Blob) => {
    setConvertedPdfBlob(pdfBlob);
    setActiveTab('converted');
    toast({
      title: "Conversion successful",
      description: "Image has been converted to PDF. You can now view or download it.",
    });
  }, []);

  const handleConvertError = useCallback((error: Error) => {
    console.error('Image conversion error:', error);
    toast({
      title: "Conversion failed",
      description: error.message,
      variant: "destructive",
    });
  }, []);

  const downloadConvertedPDF = useCallback(() => {
    if (convertedPdfBlob) {
      const filename = generateFilename(fileName?.replace(/\.[^/.]+$/, '') || 'converted', 'pdf');
      downloadBlob(convertedPdfBlob, filename);
      toast({
        title: "Download started",
        description: `Downloading ${filename}`,
      });
    }
  }, [convertedPdfBlob, fileName]);

  // Error states
  if (!documentUrl) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No document URL provided
        </AlertDescription>
      </Alert>
    );
  }

  if (!isValidUrl) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid document URL format
        </AlertDescription>
      </Alert>
    );
  }

  // Show retry error if document loading failed
  if (loadError) {
    const errorMessage = loadError.message.toLowerCase();
    
    // Show network error for connection issues
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || !navigator.onLine) {
      return (
        <NetworkError
          onRetry={handleRetry}
          className={className}
          autoRetryOnReconnect={true}
        />
      );
    }
    
    // Show retryable error for other issues
    return (
      <RetryableError
        error={loadError}
        onRetry={handleRetry}
        maxRetries={3}
        currentRetry={retryCount}
        autoRetry={false}
        className={className}
        showErrorDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  // Render appropriate viewer based on document type with error boundary
  const ViewerComponent = () => {
    switch (detectedType) {
      case 'pdf':
        return useSimpleViewer ? (
          <SimplePDFViewer
            pdfUrl={documentUrl}
            fileName={fileName}
            onError={handleDocumentError}
            onLoad={handleDocumentLoad}
            className={className}
          />
        ) : (
          <ImprovedPDFViewer
            pdfUrl={documentUrl}
            fileName={fileName}
            onError={handleDocumentError}
            onLoad={handleDocumentLoad}
            className={className}
          />
        );
      
      case 'image':
        return (
          <div className="space-y-4">
            {/* Image Viewer */}
            <ImageViewer
              imageUrl={documentUrl}
              fileName={fileName}
              onError={handleDocumentError}
              onLoad={handleDocumentLoad}
              className={className}
            />
            
            {/* Image to PDF Converter */}
            <ImageToPDFConverter
              imageUrl={documentUrl}
              fileName={fileName}
              onConvert={handleImageConverted}
              onError={handleConvertError}
            />
          </div>
        );
      
      default:
        return (
          <Alert className={className}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unsupported document type: {detectedType}
            </AlertDescription>
          </Alert>
        );
    }
  };

  // If we have a converted PDF, show tabs
  if (convertedPdfBlob && isImage) {
    return (
      <div className={className}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="viewer" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Original Image
            </TabsTrigger>
            <TabsTrigger value="converted" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Converted PDF
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="viewer" className="mt-4">
            <ViewerComponent />
          </TabsContent>
          
          <TabsContent value="converted" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Converted PDF
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadConvertedPDF}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    PDF has been generated successfully. Click the download button to save it.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    File: {generateFilename(fileName?.replace(/\.[^/.]+$/, '') || 'converted', 'pdf')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('EnhancedDocumentViewer Error:', error, errorInfo);
        handleDocumentError(error);
      }}
      resetKeys={[documentUrl, detectedType]}
      resetOnPropsChange={true}
    >
      <ViewerComponent />
    </ErrorBoundary>
  );
};
