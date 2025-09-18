import {
    apiService,
    CalendarDocument,
    TimetableDocument,
    StudentEnrollment,
} from "./api";

export interface DocumentValidationResult {
    isValid: boolean;
    error?: string;
    documentType?: "pdf" | "image";
}

export interface DownloadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

// Custom error classes for better error handling
export class DocumentServiceError extends Error {
    constructor(message: string, public context?: any) {
        super(message);
        this.name = 'DocumentServiceError';
    }
}

export class DocumentNotFoundError extends DocumentServiceError {
    constructor(message: string, context?: any) {
        super(message);
        this.name = 'DocumentNotFoundError';
    }
}

export class NetworkError extends DocumentServiceError {
    constructor(message: string, context?: any) {
        super(message);
        this.name = 'NetworkError';
    }
}

export class ServerError extends DocumentServiceError {
    constructor(message: string, public statusCode?: number, context?: any) {
        super(message);
        this.name = 'ServerError';
    }
}

export class ValidationError extends DocumentServiceError {
    constructor(message: string, context?: any) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class DocumentService {
    private static readonly SUPPORTED_MIME_TYPES = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ];

    private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    /**
     * Fetch academic calendar document for a student
     */
    async fetchAcademicCalendar(studentId: string): Promise<CalendarDocument> {
        try {
            // Check cache first
            const cachedDocument = this.getCachedDocumentMetadata(`calendar_${studentId}`);
            if (cachedDocument && 'academicYear' in cachedDocument) {
                console.log("Returning cached calendar document");
                return cachedDocument as CalendarDocument;
            }

            const response = await apiService.getStudentCalendar(studentId);

            if (!response.success || !response.data) {
                const errorMessage = response.message || "Failed to fetch academic calendar";
                
                // Enhance error with more context
                if (response.status === 404) {
                    throw new DocumentNotFoundError("Academic calendar not found for this student", {
                        studentId,
                        documentType: 'calendar'
                    });
                } else if (response.status >= 500) {
                    throw new ServerError(errorMessage, response.status);
                } else if (!navigator.onLine) {
                    throw new NetworkError("No internet connection available");
                }
                
                throw new Error(errorMessage);
            }

            // Handle array response - take the first calendar document
            const calendarData = Array.isArray(response.data) ? response.data[0] : response.data;
            
            if (!calendarData) {
                throw new DocumentNotFoundError("No calendar document found", {
                    studentId,
                    documentType: 'calendar'
                });
            }

            // Extract the URL from the response (handle both url and calendarPdfUrl properties)
            const documentUrl = calendarData.url || calendarData.calendarPdfUrl;
            
            if (!documentUrl) {
                throw new Error("Document URL not found in response");
            }

            console.log("Calendar document URL:", documentUrl);
            console.log("Calendar data:", calendarData);

            // Validate the document URL
            const validation = this.validateDocumentUrl(documentUrl);
            console.log("URL validation result:", validation);
            
            if (!validation.isValid) {
                throw new ValidationError(validation.error || "Invalid document URL", {
                    url: documentUrl,
                    validation
                });
            }

            // Normalize the response to match CalendarDocument interface
            const normalizedDocument: CalendarDocument = {
                ...calendarData,
                url: documentUrl,
                fileName: calendarData.fileName || 'academic-calendar.pdf',
                mimeType: calendarData.mimeType || 'application/pdf',
                fileSize: calendarData.fileSize || 0,
                uploadedAt: calendarData.uploadedAt || new Date().toISOString(),
                lastModified: calendarData.lastModified || calendarData.uploadedAt || new Date().toISOString(),
                academicYear: calendarData.academicYear || {
                    id: 'default',
                    year: new Date().getFullYear().toString(),
                    startDate: new Date().toISOString(),
                    endDate: new Date().toISOString(),
                    isActive: true
                }
            };

            // Cache the document for future use
            this.cacheDocumentMetadata(normalizedDocument, 3600000); // 1 hour cache

            return normalizedDocument;
        } catch (error) {
            console.error("Error fetching academic calendar:", error);
            
            // Try to return cached version as fallback
            const cachedDocument = this.getCachedDocumentMetadata(`calendar_${studentId}`);
            if (cachedDocument && 'academicYear' in cachedDocument) {
                console.warn("Returning stale cached document due to error");
                return cachedDocument as CalendarDocument;
            }
            
            throw error;
        }
    }

    /**
     * Fetch timetable document for a student
     */
    async fetchTimetable(studentId: string): Promise<TimetableDocument> {
        try {
            // Check cache first
            const cachedDocument = this.getCachedDocumentMetadata(`timetable_${studentId}`);
            if (cachedDocument && 'section' in cachedDocument) {
                console.log("Returning cached timetable document");
                return cachedDocument as TimetableDocument;
            }

            const response = await apiService.getStudentTimetable(studentId);

            if (!response.success || !response.data) {
                const errorMessage = response.message || "Failed to fetch timetable";
                
                // Enhance error with more context
                if (response.status === 404) {
                    throw new DocumentNotFoundError("Timetable not found for this student", {
                        studentId,
                        documentType: 'timetable'
                    });
                } else if (response.status >= 500) {
                    throw new ServerError(errorMessage, response.status);
                } else if (!navigator.onLine) {
                    throw new NetworkError("No internet connection available");
                }
                
                throw new Error(errorMessage);
            }

            // Validate the document URL
            const validation = this.validateDocumentUrl(response.data.url);
            if (!validation.isValid) {
                throw new ValidationError(validation.error || "Invalid document URL", {
                    url: response.data.url,
                    validation
                });
            }

            // Cache the document for future use
            this.cacheDocumentMetadata(response.data, 3600000); // 1 hour cache

            return response.data;
        } catch (error) {
            console.error("Error fetching timetable:", error);
            
            // Try to return cached version as fallback
            const cachedDocument = this.getCachedDocumentMetadata(`timetable_${studentId}`);
            if (cachedDocument && 'section' in cachedDocument) {
                console.warn("Returning stale cached document due to error");
                return cachedDocument as TimetableDocument;
            }
            
            throw error;
        }
    }

    /**
     * Fetch timetable by section ID
     */
    async fetchTimetableBySection(
        sectionId: string
    ): Promise<TimetableDocument> {
        try {
            const response = await apiService.getTimetableBySection(sectionId);

            if (!response.success || !response.data) {
                throw new Error(
                    response.message || "Failed to fetch section timetable"
                );
            }

            // Validate the document URL
            const validation = this.validateDocumentUrl(response.data.url);
            if (!validation.isValid) {
                throw new Error(validation.error || "Invalid document URL");
            }

            return response.data;
        } catch (error) {
            console.error("Error fetching section timetable:", error);
            throw error;
        }
    }

    /**
     * Get student enrollments to determine which documents to fetch
     */
    async getStudentEnrollments(
        studentId: string
    ): Promise<StudentEnrollment[]> {
        try {
            const response = await apiService.getStudentEnrollments(studentId);

            if (!response.success || !response.data) {
                throw new Error(
                    response.message || "Failed to fetch student enrollments"
                );
            }

            return response.data;
        } catch (error) {
            console.error("Error fetching student enrollments:", error);
            throw error;
        }
    }

    /**
     * Download a document with progress tracking
     */
    async downloadDocument(
        url: string,
        fileName: string,
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<void> {
        try {
            // Validate URL first
            const validation = this.validateDocumentUrl(url);
            if (!validation.isValid) {
                throw new Error(validation.error || "Invalid document URL");
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Failed to download document: ${response.statusText}`
                );
            }

            const contentLength = response.headers.get("content-length");
            const total = contentLength ? parseInt(contentLength, 10) : 0;

            if (!response.body) {
                throw new Error("Response body is null");
            }

            const reader = response.body.getReader();
            const chunks: Uint8Array[] = [];
            let loaded = 0;

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                chunks.push(value);
                loaded += value.length;

                if (onProgress && total > 0) {
                    onProgress({
                        loaded,
                        total,
                        percentage: Math.round((loaded / total) * 100),
                    });
                }
            }

            // Create blob and download
            const blob = new Blob(chunks);
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Error downloading document:", error);
            throw error;
        }
    }

    /**
     * Validate document URL and determine document type
     */
    validateDocumentUrl(url: string): DocumentValidationResult {
        if (!url || typeof url !== "string") {
            return {
                isValid: false,
                error: "URL is required and must be a string",
            };
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            return {
                isValid: false,
                error: "Invalid URL format",
            };
        }

        // Check if URL is from allowed domains (basic security check)
        const allowedDomains = [
            "localhost",
            "127.0.0.1",
            "res.cloudinary.com", // Cloudinary CDN
        ];

        // Add API base URL if available
        try {
            const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL;
            if (apiBaseUrl) {
                const apiDomain = apiBaseUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
                allowedDomains.push(apiDomain);
            }
        } catch (error) {
            // Ignore environment variable errors
            console.warn("Could not access VITE_API_BASE_URL:", error);
        }

        const urlObj = new URL(url);
        const isAllowedDomain = allowedDomains.some(
            (domain) =>
                urlObj.hostname === domain ||
                urlObj.hostname.endsWith(`.${domain}`)
        );

        if (!isAllowedDomain) {
            return {
                isValid: false,
                error: `URL domain '${urlObj.hostname}' is not allowed. Allowed domains: ${allowedDomains.join(', ')}`,
            };
        }

        // Determine document type from URL extension or content type
        const documentType = this.getDocumentTypeFromUrl(url);

        return {
            isValid: true,
            documentType,
        };
    }

    /**
     * Determine document type from URL
     */
    private getDocumentTypeFromUrl(url: string): "pdf" | "image" {
        const urlLower = url.toLowerCase();

        // Handle special case where PDFs are converted to images (e.g., .pdf.png)
        if (urlLower.includes(".pdf.png") || urlLower.includes(".pdf.jpg") || urlLower.includes(".pdf.jpeg")) {
            return "image"; // Backend converted PDF to image for display
        }

        if (urlLower.includes(".pdf") || urlLower.includes("pdf")) {
            return "pdf";
        }

        if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)/)) {
            return "image";
        }

        // Default to image if we can't determine (safer for converted documents)
        return "image";
    }

    /**
     * Validate MIME type
     */
    validateMimeType(mimeType: string): boolean {
        return DocumentService.SUPPORTED_MIME_TYPES.includes(
            mimeType.toLowerCase()
        );
    }

    /**
     * Validate file size
     */
    validateFileSize(fileSize: number): boolean {
        return fileSize <= DocumentService.MAX_FILE_SIZE;
    }

    /**
     * Get human-readable file size
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    /**
     * Format date for display
     */
    formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    }

    /**
     * Generate appropriate filename for download
     */
    generateDownloadFilename(
        document: CalendarDocument | TimetableDocument,
        type: "calendar" | "timetable"
    ): string {
        const academicYear = document.academicYear.year;
        const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        if (type === "calendar") {
            return `academic-calendar-${academicYear}-${timestamp}.${this.getFileExtension(document.fileName)}`;
        } else {
            const sectionName = (document as TimetableDocument).section.name
                .replace(/\s+/g, "-")
                .toLowerCase();
            return `timetable-${sectionName}-${academicYear}-${timestamp}.${this.getFileExtension(document.fileName)}`;
        }
    }

    /**
     * Get file extension from filename
     */
    private getFileExtension(filename: string): string {
        const extension = filename.split(".").pop()?.toLowerCase();
        return extension || "pdf";
    }

    /**
     * Check if document is cached and still valid
     */
    isDocumentCached(documentId: string): boolean {
        const cached = localStorage.getItem(`doc_cache_${documentId}`);
        if (!cached) return false;

        try {
            const { timestamp, ttl } = JSON.parse(cached);
            const now = Date.now();
            return now - timestamp < ttl;
        } catch {
            return false;
        }
    }

    /**
     * Cache document metadata
     */
    cacheDocumentMetadata(
        document: CalendarDocument | TimetableDocument,
        ttl: number = 3600000
    ): void {
        const cacheData = {
            document,
            timestamp: Date.now(),
            ttl,
        };

        try {
            localStorage.setItem(
                `doc_cache_${document.id}`,
                JSON.stringify(cacheData)
            );
        } catch (error) {
            console.warn("Failed to cache document metadata:", error);
        }
    }

    /**
     * Get cached document metadata
     */
    getCachedDocumentMetadata(
        documentId: string
    ): CalendarDocument | TimetableDocument | null {
        if (!this.isDocumentCached(documentId)) return null;

        try {
            const cached = localStorage.getItem(`doc_cache_${documentId}`);
            if (!cached) return null;

            const { document } = JSON.parse(cached);
            return document;
        } catch {
            return null;
        }
    }

    /**
     * Clear document cache
     */
    clearDocumentCache(documentId?: string): void {
        if (documentId) {
            localStorage.removeItem(`doc_cache_${documentId}`);
        } else {
            // Clear all document caches
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith("doc_cache_")) {
                    localStorage.removeItem(key);
                }
            });
        }
    }
}

// Create and export document service instance
export const documentService = new DocumentService();
