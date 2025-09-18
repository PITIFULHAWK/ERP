import React, { useMemo } from 'react';
import { DocumentViewerProps, DocumentType } from '@/types/document-viewer';
import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  documentType,
  fileName,
  onError,
  onLoad,
  className = ''
}) => {
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

  // Render appropriate viewer based on document type
  switch (detectedType) {
    case 'pdf':
      return (
        <PDFViewer
          pdfUrl={documentUrl}
          fileName={fileName}
          onError={onError}
          onLoad={onLoad}
          className={className}
        />
      );
    
    case 'image':
      return (
        <ImageViewer
          imageUrl={documentUrl}
          fileName={fileName}
          onError={onError}
          onLoad={onLoad}
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