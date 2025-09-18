import React, { useState } from 'react';
import { DocumentViewer } from './DocumentViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentType } from '@/types/document-viewer';

export const DocumentViewerDemo: React.FC = () => {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType>('pdf');
  const [fileName, setFileName] = useState<string>('');
  const [showViewer, setShowViewer] = useState<boolean>(false);

  // Sample URLs for testing
  const sampleUrls = {
    pdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    image: 'https://picsum.photos/800/600'
  };

  const handleLoadSample = () => {
    setDocumentUrl(sampleUrls[documentType]);
    setFileName(`sample-${documentType}`);
    setShowViewer(true);
  };

  const handleLoadCustom = () => {
    if (documentUrl.trim()) {
      setShowViewer(true);
    }
  };

  const handleError = (error: Error) => {
    console.error('Document viewer error:', error);
  };

  const handleLoad = () => {
    console.log('Document loaded successfully');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Viewer Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file-name">File Name (optional)</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-url">Document URL</Label>
            <Input
              id="document-url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="Enter document URL"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleLoadSample}>
              Load Sample {documentType.toUpperCase()}
            </Button>
            <Button 
              onClick={handleLoadCustom} 
              disabled={!documentUrl.trim()}
              variant="outline"
            >
              Load Custom URL
            </Button>
            <Button 
              onClick={() => setShowViewer(false)} 
              variant="secondary"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {showViewer && documentUrl && (
        <DocumentViewer
          documentUrl={documentUrl}
          documentType={documentType}
          fileName={fileName || undefined}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
};