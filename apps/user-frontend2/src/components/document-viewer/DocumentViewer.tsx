import React, { useMemo, useState, useCallback } from 'react';
import { DocumentViewerProps, DocumentType } from '@/types/document-viewer';
import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ErrorBoundary, RetryableError, NetworkError } from '@/components/error-handling';

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  documentType,
  fileName,
  onError,
  onLoad,
  className = ''
}) => {
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

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
    onError?.(error);
  }, [onError]);

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
        return (
          <PDFViewer
            pdfUrl={documentUrl}
            fileName={fileName}
            onError={handleDocumentError}
            onLoad={handleDocumentLoad}
            className={className}
          />
        );
      
      case 'image':
        return (
          <ImageViewer
            imageUrl={documentUrl}
            fileName={fileName}
            onError={handleDocumentError}
            onLoad={handleDocumentLoad}
            className={className}
          />
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

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('DocumentViewer Error:', error, errorInfo);
        handleDocumentError(error);
      }}
      resetKeys={[documentUrl, detectedType]}
      resetOnPropsChange={true}
    >
      <ViewerComponent />
    </ErrorBoundary>
  );
};