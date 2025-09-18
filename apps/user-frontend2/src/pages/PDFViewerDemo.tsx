import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { EnhancedDocumentViewer } from '@/components/document-viewer/EnhancedDocumentViewer';
import { PDFViewerTest } from '@/components/document-viewer/PDFViewerTest';
import { toast } from '@/hooks/use-toast';

// Sample URLs for testing
const SAMPLE_URLS = {
  pdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  image: 'https://picsum.photos/800/600',
  timetable: 'https://via.placeholder.com/800x1000/4F46E5/FFFFFF?text=Timetable+Sample',
  calendar: 'https://via.placeholder.com/800x1000/059669/FFFFFF?text=Academic+Calendar+Sample'
};

export default function PDFViewerDemo() {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [documentType, setDocumentType] = useState<'pdf' | 'image' | 'auto'>('auto');
  const [error, setError] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
  const [showTest, setShowTest] = useState<boolean>(false);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    setDocumentUrl(url);
    const isValid = validateUrl(url);
    setIsValidUrl(isValid);
    setError(isValid ? null : 'Invalid URL format');
  };

  const loadSampleDocument = (type: keyof typeof SAMPLE_URLS) => {
    const url = SAMPLE_URLS[type];
    setDocumentUrl(url);
    setFileName(type === 'pdf' ? 'sample-document.pdf' : `${type}-sample.jpg`);
    setDocumentType(type === 'pdf' ? 'pdf' : 'image');
    setIsValidUrl(true);
    setError(null);
    
    toast({
      title: "Sample loaded",
      description: `Loaded ${type} sample document`,
    });
  };

  const handleLoadDocument = () => {
    if (!documentUrl || !isValidUrl) {
      setError('Please enter a valid URL');
      return;
    }

    if (!fileName.trim()) {
      setFileName('document');
    }

    toast({
      title: "Document loaded",
      description: "Document viewer updated with new content",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-7 h-7" />
          PDF Viewer Demo
        </h1>
        <p className="text-muted-foreground">
          Test the enhanced PDF viewer with image-to-PDF conversion capabilities
        </p>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setShowTest(!showTest)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {showTest ? 'Hide' : 'Show'} PDF Test Suite
          </Button>
        </div>
      </div>

      {/* PDF Test Suite */}
      {showTest && <PDFViewerTest />}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Document Viewer Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="document-url">Document URL</Label>
            <div className="flex gap-2">
              <Input
                id="document-url"
                type="url"
                placeholder="Enter PDF or image URL..."
                value={documentUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={error ? 'border-red-500' : ''}
              />
              <Button onClick={handleLoadDocument} disabled={!isValidUrl}>
                Load Document
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* File Name Input */}
          <div className="space-y-2">
            <Label htmlFor="file-name">File Name (optional)</Label>
            <Input
              id="file-name"
              placeholder="Enter file name..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>

          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label>Document Type</Label>
            <div className="flex gap-2">
              <Button
                variant={documentType === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDocumentType('auto')}
              >
                Auto Detect
              </Button>
              <Button
                variant={documentType === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDocumentType('pdf')}
              >
                PDF
              </Button>
              <Button
                variant={documentType === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDocumentType('image')}
              >
                Image
              </Button>
            </div>
          </div>

          {/* Sample Documents */}
          <div className="space-y-2">
            <Label>Sample Documents</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSampleDocument('pdf')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Sample PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSampleDocument('image')}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Sample Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSampleDocument('timetable')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Timetable Sample
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSampleDocument('calendar')}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Calendar Sample
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer */}
      {documentUrl && isValidUrl && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {documentType === 'image' ? (
                  <ImageIcon className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                Document Viewer
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {documentType === 'auto' ? 'Auto' : documentType.toUpperCase()}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(documentUrl, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Original
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EnhancedDocumentViewer
              documentUrl={documentUrl}
              documentType={documentType}
              fileName={fileName || 'document'}
              onError={(error) => {
                console.error('Document viewer error:', error);
                toast({
                  title: "Viewer Error",
                  description: error.message,
                  variant: "destructive",
                });
              }}
              onLoad={() => {
                console.log('Document loaded successfully');
                toast({
                  title: "Document Loaded",
                  description: "Document viewer is ready",
                });
              }}
              className="min-h-[600px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">PDF Viewer Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Zoom in/out with mouse wheel or controls</li>
                <li>• Fullscreen mode (F key)</li>
                <li>• Download PDF files</li>
                <li>• Keyboard shortcuts (H to hide controls)</li>
                <li>• Fit to width/height options</li>
                <li>• Search functionality</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Image to PDF Conversion</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Convert images to PDF format</li>
                <li>• Customizable PDF settings</li>
                <li>• Portrait/landscape orientation</li>
                <li>• Quality and margin controls</li>
                <li>• Download converted PDFs</li>
                <li>• Tabbed view for original and converted</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
