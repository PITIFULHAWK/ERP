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
    type?: string;
    pinned?: boolean;
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
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>
                                                {formatDate(notice.createdAt)}
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
