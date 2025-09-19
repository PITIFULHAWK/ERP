import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CalendarDays,
    Download,
    RefreshCw,
    AlertCircle,
    FileText,
    Calendar,
    Clock,
    ExternalLink,
} from "lucide-react";

import { documentService } from "@/lib/documentService";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDocument } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface AcademicCalendarState {
    document: CalendarDocument | null;
    loading: boolean;
    error: string | null;
    retryCount: number;
    downloadProgress: number | null;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

export default function AcademicCalendar() {
    const { user } = useAuth();
    const [state, setState] = useState<AcademicCalendarState>({
        document: null,
        loading: true,
        error: null,
        retryCount: 0,
        downloadProgress: null,
    });
    const [contentLength, setContentLength] = useState<number | null>(null);

    // Exponential backoff retry delay
    const getRetryDelay = (retryCount: number): number => {
        return RETRY_DELAY_BASE * Math.pow(2, retryCount);
    };

    // Fetch academic calendar document
    const fetchCalendarDocument = useCallback(
        async (isRetry = false) => {
            if (!user?.id) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: "User not authenticated",
                }));
                return;
            }

            try {
                setState((prev) => ({
                    ...prev,
                    loading: true,
                    error: null,
                    retryCount: isRetry ? prev.retryCount + 1 : 0,
                }));

                const document = await documentService.fetchAcademicCalendar(
                    user.id
                );

                // Cache the document metadata
                documentService.cacheDocumentMetadata(document);

                setState((prev) => ({
                    ...prev,
                    document,
                    loading: false,
                    error: null,
                }));

                if (isRetry) {
                    toast({
                        title: "Success",
                        description: "Academic calendar loaded successfully",
                    });
                }
            } catch (error) {
                console.error("Error fetching academic calendar:", error);

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to load academic calendar";

                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: errorMessage,
                }));

                // Show error toast
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        },
        [] // Remove user?.id dependency to prevent infinite loops
    );

    // Auto-retry with exponential backoff
    const handleRetry = useCallback(async () => {
        if (state.retryCount >= MAX_RETRY_ATTEMPTS) {
            toast({
                title: "Maximum retries reached",
                description: "Please try again later or contact support",
                variant: "destructive",
            });
            return;
        }

        const delay = getRetryDelay(state.retryCount);

        toast({
            title: "Retrying...",
            description: `Attempting to reload in ${delay / 1000} seconds`,
        });

        setTimeout(() => {
            fetchCalendarDocument(true);
        }, delay);
    }, [state.retryCount]); // Remove fetchCalendarDocument dependency

    // Download document
    const handleDownload = useCallback(async () => {
        if (!state.document) return;

        try {
            setState((prev) => ({ ...prev, downloadProgress: 0 }));

            const fileName = documentService.generateDownloadFilename(
                state.document,
                "calendar"
            );

            await documentService.downloadDocument(
                state.document.url,
                fileName,
                (progress) => {
                    setState((prev) => ({
                        ...prev,
                        downloadProgress: progress.percentage,
                    }));
                }
            );

            setState((prev) => ({ ...prev, downloadProgress: null }));

            toast({
                title: "Download Complete",
                description: `${fileName} has been downloaded`,
            });
        } catch (error) {
            console.error("Download error:", error);
            setState((prev) => ({ ...prev, downloadProgress: null }));

            toast({
                title: "Download Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to download document",
                variant: "destructive",
            });
        }
    }, [state.document]);

    // Fetch file size via HEAD when backend returns 0 size
    useEffect(() => {
        const fetchSize = async () => {
            if (!state.document) return;
            if (state.document.fileSize && state.document.fileSize > 0) {
                setContentLength(state.document.fileSize);
                return;
            }
            try {
                const res = await fetch(state.document.url, { method: 'HEAD' });
                const len = res.headers.get('content-length');
                if (len) {
                    setContentLength(parseInt(len, 10));
                }
            } catch (e) {
                // ignore
            }
        };
        fetchSize();
    }, [state.document?.url]);

    // Initial load
    useEffect(() => {
        if (user?.id) {
            fetchCalendarDocument();
        }
    }, [user?.id]); // Only depend on user.id, not the callback

    // Loading state
    if (state.loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-7 h-7" />
                        Academic Calendar
                    </h1>
                    <p className="text-muted-foreground">
                        Loading academic calendar for the current academic year
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state with retry functionality
    if (state.error && !state.document) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <CalendarDays className="w-7 h-7" />
                        Academic Calendar
                    </h1>
                    <p className="text-muted-foreground">
                        View important academic dates and schedules
                    </p>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{state.error}</span>
                        <div className="flex gap-2">
                            {state.retryCount < MAX_RETRY_ATTEMPTS && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRetry}
                                    disabled={state.loading}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Retry ({state.retryCount + 1}/
                                    {MAX_RETRY_ATTEMPTS})
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchCalendarDocument()}
                                disabled={state.loading}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>

                {/* Fallback content when document is unavailable */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Academic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                The academic calendar document is currently
                                unavailable. Please try refreshing or contact
                                your academic office for the latest academic
                                dates and schedules.
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-medium mb-2">
                                        Important Dates
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Academic year dates, examination
                                        schedules, and holiday information will
                                        be available once the calendar document
                                        is loaded.
                                    </p>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-medium mb-2">
                                        Contact Information
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        For immediate assistance with academic
                                        dates, please contact your academic
                                        office or student services.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Success state with document viewer
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <CalendarDays className="w-7 h-7" />
                    Academic Calendar
                </h1>
                <p className="text-muted-foreground">
                    View important academic dates and schedules for{" "}
                    {state.document?.academicYear.year}
                </p>
            </div>

            {/* Document metadata and controls */}
            {state.document && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Academic Calendar - {state.document.academicYear.year}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary">
                                    {documentService.formatFileSize((contentLength ?? state.document.fileSize) || 0)}
                                </Badge>
                                <a href={state.document.url} target="_blank" rel="noreferrer">
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        View
                                    </Button>
                                </a>
                                <Button variant="outline" size="sm" onClick={handleDownload} disabled={state.downloadProgress !== null}>
                                    <Download className="w-4 h-4 mr-2" />
                                    {state.downloadProgress !== null ? `${state.downloadProgress}%` : "Download"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => fetchCalendarDocument()} disabled={state.loading}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Last updated: {documentService.formatDate(state.document.uploadedAt)}
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5" />
                                <span className="font-medium">{state.document.fileName}</span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>File Size: {documentService.formatFileSize((contentLength ?? state.document.fileSize) || 0)}</p>
                                <p>Type: {state.document.mimeType}</p>
                                <p>Uploaded: {documentService.formatDate(state.document.uploadedAt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

        {/* Additional academic information */}
        <div className="grid gap-6 md:grid-cols-1">
            <Card>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">If you're having trouble viewing the academic calendar or need additional information:</p>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>• Contact your academic office for printed copies</li>
                            <li>• Check the student portal for updates</li>
                            <li>• Reach out to student services for assistance</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
        </div>
    );
}
