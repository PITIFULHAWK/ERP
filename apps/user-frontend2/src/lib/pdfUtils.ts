import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
  quality?: number;
  scale?: number;
}

export interface ImageToPDFOptions extends PDFGenerationOptions {
  imageQuality?: number;
  margin?: number;
}

/**
 * Convert an image URL to PDF
 */
export const convertImageToPDF = async (
  imageUrl: string,
  options: ImageToPDFOptions = {}
): Promise<Blob> => {
  const {
    filename = 'converted-document.pdf',
    orientation = 'portrait',
    format = 'a4',
    imageQuality = 0.95,
    margin = 10
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const pdf = new jsPDF({
          orientation,
          unit: 'mm',
          format
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate dimensions with margins
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        // Calculate scaling to fit image within page
        const imgWidth = img.width;
        const imgHeight = img.height;
        const scaleX = maxWidth / imgWidth;
        const scaleY = maxHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        // Center the image on the page
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;
        
        pdf.addImage(
          img,
          'JPEG',
          x,
          y,
          scaledWidth,
          scaledHeight,
          undefined,
          'FAST'
        );
        
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        reject(new Error(`Failed to convert image to PDF: ${error}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Convert HTML element to PDF
 */
export const convertHTMLToPDF = async (
  element: HTMLElement,
  options: PDFGenerationOptions = {}
): Promise<Blob> => {
  const {
    filename = 'converted-document.pdf',
    orientation = 'portrait',
    format = 'a4',
    quality = 0.95,
    scale = 2
  } = options;

  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate scaling to fit image within page
    const scaleX = pageWidth / imgWidth;
    const scaleY = pageHeight / imgHeight;
    const scaleFactor = Math.min(scaleX, scaleY);
    
    const scaledWidth = imgWidth * scaleFactor;
    const scaledHeight = imgHeight * scaleFactor;
    
    // Center the image on the page
    const x = (pageWidth - scaledWidth) / 2;
    const y = (pageHeight - scaledHeight) / 2;
    
    pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);
    
    return pdf.output('blob');
  } catch (error) {
    throw new Error(`Failed to convert HTML to PDF: ${error}`);
  }
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Check if a URL is an image
 */
export const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
};

/**
 * Get file extension from URL
 */
export const getFileExtension = (url: string): string => {
  const urlWithoutParams = url.split('?')[0];
  const parts = urlWithoutParams.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Generate a filename with timestamp
 */
export const generateFilename = (baseName: string, extension: string): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${baseName}-${timestamp}.${extension}`;
};

