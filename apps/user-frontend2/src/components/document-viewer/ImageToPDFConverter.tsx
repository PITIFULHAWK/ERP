import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  Settings
} from 'lucide-react';
import { convertImageToPDF, downloadBlob, generateFilename, ImageToPDFOptions } from '@/lib/pdfUtils';
import { toast } from '@/hooks/use-toast';

interface ImageToPDFConverterProps {
  imageUrl: string;
  fileName?: string;
  onConvert?: (pdfBlob: Blob) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const ImageToPDFConverter: React.FC<ImageToPDFConverterProps> = ({
  imageUrl,
  fileName = 'image',
  onConvert,
  onError,
  className = ''
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isConverted, setIsConverted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ImageToPDFOptions>({
    orientation: 'portrait',
    format: 'a4',
    imageQuality: 0.95,
    margin: 10
  });

  const handleConvert = useCallback(async () => {
    if (!imageUrl) return;

    setIsConverting(true);
    setError(null);
    setConversionProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const pdfBlob = await convertImageToPDF(imageUrl, {
        ...options,
        filename: generateFilename(fileName, 'pdf')
      });

      clearInterval(progressInterval);
      setConversionProgress(100);
      setIsConverted(true);

      onConvert?.(pdfBlob);

      toast({
        title: "Conversion successful",
        description: "Image has been converted to PDF successfully.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert image to PDF';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      
      toast({
        title: "Conversion failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  }, [imageUrl, fileName, options, onConvert, onError]);

  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;

    try {
      const pdfBlob = await convertImageToPDF(imageUrl, {
        ...options,
        filename: generateFilename(fileName, 'pdf')
      });

      const filename = generateFilename(fileName, 'pdf');
      downloadBlob(pdfBlob, filename);

      toast({
        title: "Download started",
        description: `Downloading ${filename}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download PDF';
      setError(errorMessage);
      
      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [imageUrl, fileName, options]);

  const handleOptionChange = useCallback((key: keyof ImageToPDFOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Convert to PDF
          </CardTitle>
          {isConverted && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Converted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Conversion Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Conversion Options</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Orientation</label>
              <select
                value={options.orientation}
                onChange={(e) => handleOptionChange('orientation', e.target.value)}
                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                disabled={isConverting}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Format</label>
              <select
                value={options.format}
                onChange={(e) => handleOptionChange('format', e.target.value)}
                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                disabled={isConverting}
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Quality</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={options.imageQuality}
                onChange={(e) => handleOptionChange('imageQuality', parseFloat(e.target.value))}
                className="w-full mt-1"
                disabled={isConverting}
              />
              <div className="text-xs text-muted-foreground text-center">
                {Math.round((options.imageQuality || 0.95) * 100)}%
              </div>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Margin (mm)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={options.margin}
                onChange={(e) => handleOptionChange('margin', parseInt(e.target.value))}
                className="w-full mt-1 px-2 py-1 border rounded text-sm"
                disabled={isConverting}
              />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isConverting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Converting...</span>
              <span>{conversionProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${conversionProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleConvert}
            disabled={isConverting || !imageUrl}
            className="flex-1"
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Convert to PDF
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isConverting || !imageUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Preview Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Source: {fileName}</div>
          <div>Target: {generateFilename(fileName, 'pdf')}</div>
          <div>Settings: {options.orientation} {options.format.toUpperCase()}</div>
        </div>
      </CardContent>
    </Card>
  );
};
