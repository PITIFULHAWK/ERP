export interface DocumentViewerProps {
  documentUrl: string;
  documentType: 'pdf' | 'image';
  fileName?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  className?: string;
}

export interface PDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  className?: string;
}

export interface ImageViewerProps {
  imageUrl: string;
  fileName?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  className?: string;
}

export interface DocumentViewerState {
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  scale: number;
}

export interface ZoomControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  scale: number;
}

export interface NavigationControls {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  currentPage: number;
  totalPages: number;
}

export type DocumentType = 'pdf' | 'image' | 'auto';

export interface DocumentMetadata {
  fileName: string;
  fileSize?: number;
  mimeType: string;
  lastModified?: string;
}