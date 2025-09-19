import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Notice {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    type?: "GENERAL" | "URGENT" | "ACADEMIC" | "HOSTEL" | "EXAM" | string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | string;
    targetAudience?: "ALL" | "STUDENTS" | "FACULTY" | "STAFF" | string;
    author?: string;
}
export default function Notices() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await apiService.getNotices();
                if (response.success && response.data) {
                    setNotices(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch notices:", error);
                toast({
                    title: "Error",
                    description:
                        "Failed to load notices. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const priorityVariant = (p?: string) => {
        switch (p) {
            case "HIGH":
                return "destructive" as const;
            case "MEDIUM":
                return "warning" as const;
            default:
                return "secondary" as const;
        }
    };

    const typeLabelColor = (t?: string) => {
        switch (t) {
            case "URGENT":
                return "bg-destructive/10 text-destructive border-destructive/20";
            case "EXAM":
                return "bg-primary/10 text-primary border-primary/20";
            case "ACADEMIC":
                return "bg-success/10 text-success border-success/20";
            case "HOSTEL":
                return "bg-warning/10 text-warning border-warning/20";
            default:
                return "bg-muted text-foreground/70 border-border";
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Notices & Announcements
                    </h1>
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Notices & Announcements
                </h1>
                <p className="text-muted-foreground">
                    Stay updated with the latest announcements and important
                    notices from the university.
                </p>
            </div>

            <div className="space-y-4">
                {notices.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-medium">
                                    No notices available
                                </h3>
                                <p className="text-muted-foreground">
                                    Check back later for new announcements.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    notices.map((notice) => (
                        <Card key={notice.id} className="shadow-card">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <CardTitle className="text-lg leading-tight">
                                            {notice.title}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            {/* Type badge */}
                                            {notice.type && (
                                                <span className={`px-2 py-0.5 rounded border ${typeLabelColor(notice.type)}`}>
                                                    {notice.type}
                                                </span>
                                            )}
                                            {/* Priority badge */}
                                            {notice.priority && (
                                                <span className={`px-2 py-0.5 rounded border ${
                                                    notice.priority === "HIGH"
                                                        ? "bg-destructive/10 text-destructive border-destructive/20"
                                                        : notice.priority === "MEDIUM"
                                                        ? "bg-warning/10 text-warning border-warning/20"
                                                        : "bg-muted text-foreground/70 border-border"
                                                }`}>
                                                    Priority: {notice.priority}
                                                </span>
                                            )}
                                            {/* Audience badge */}
                                            {notice.targetAudience && (
                                                <span className="px-2 py-0.5 rounded border bg-muted text-foreground/70 border-border">
                                                    Audience: {notice.targetAudience}
                                                </span>
                                            )}
                                            {/* Date */}
                                            <span className="text-muted-foreground ml-auto">
                                                {formatDate(notice.publishedAt || notice.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground leading-relaxed">
                                    {notice.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
