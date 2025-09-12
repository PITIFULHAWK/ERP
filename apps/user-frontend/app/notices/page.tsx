"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Bell,
    Search,
    Filter,
    Calendar,
    AlertTriangle,
    Info,
    GraduationCap,
    Home,
    BookOpen,
    Megaphone,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Notice } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.getNotices();

            if (response.success && response.data) {
                setNotices(response.data);
            } else {
                setError(response.message || "Failed to fetch notices");
            }
        } catch (err) {
            setError("An error occurred while fetching notices");
            console.error("Error fetching notices:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredNotices = notices.filter((notice) => {
        const matchesSearch =
            notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || notice.type === typeFilter;
        const matchesPriority =
            priorityFilter === "all" || notice.priority === priorityFilter;

        return matchesSearch && matchesType && matchesPriority;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return "destructive";
            case "MEDIUM":
                return "default";
            case "LOW":
                return "secondary";
            default:
                return "secondary";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "ACADEMIC":
                return <BookOpen className="h-4 w-4" />;
            case "HOSTEL":
                return <Home className="h-4 w-4" />;
            case "EXAM":
                return <GraduationCap className="h-4 w-4" />;
            case "URGENT":
                return <AlertTriangle className="h-4 w-4" />;
            case "GENERAL":
            default:
                return <Megaphone className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "URGENT":
                return "destructive";
            case "ACADEMIC":
                return "default";
            case "EXAM":
                return "default";
            case "HOSTEL":
                return "secondary";
            case "GENERAL":
            default:
                return "outline";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">
                                University Notices
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Stay updated with the latest announcements and
                            important information from the university.
                        </p>
                    </div>

                    {/* Filters Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter Notices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search notices..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Type
                                    </label>
                                    <Select
                                        value={typeFilter}
                                        onValueChange={setTypeFilter}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Types
                                            </SelectItem>
                                            <SelectItem value="GENERAL">
                                                General
                                            </SelectItem>
                                            <SelectItem value="ACADEMIC">
                                                Academic
                                            </SelectItem>
                                            <SelectItem value="EXAM">
                                                Exam
                                            </SelectItem>
                                            <SelectItem value="HOSTEL">
                                                Hostel
                                            </SelectItem>
                                            <SelectItem value="URGENT">
                                                Urgent
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Priority
                                    </label>
                                    <Select
                                        value={priorityFilter}
                                        onValueChange={setPriorityFilter}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Priorities
                                            </SelectItem>
                                            <SelectItem value="HIGH">
                                                High
                                            </SelectItem>
                                            <SelectItem value="MEDIUM">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="LOW">
                                                Low
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {(searchTerm ||
                                typeFilter !== "all" ||
                                priorityFilter !== "all") && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {filteredNotices.length} of{" "}
                                        {notices.length} notices
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setTypeFilter("all");
                                            setPriorityFilter("all");
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Error State */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-6 w-1/3" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-6 w-16" />
                                                <Skeleton className="h-6 w-16" />
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
                    )}

                    {/* Notices List */}
                    {!loading && !error && (
                        <div className="space-y-4">
                            {filteredNotices.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No notices found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm ||
                                            typeFilter !== "all" ||
                                            priorityFilter !== "all"
                                                ? "Try adjusting your filters to see more notices."
                                                : "There are no notices available at the moment."}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredNotices.map((notice) => (
                                    <Card
                                        key={notice.id}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="mt-1">
                                                        {getTypeIcon(
                                                            notice.type
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg mb-2">
                                                            {notice.title}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                Published{" "}
                                                                {formatDistanceToNow(
                                                                    new Date(
                                                                        notice.publishedAt
                                                                    ),
                                                                    {
                                                                        addSuffix: true,
                                                                    }
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge
                                                        variant={getTypeColor(
                                                            notice.type
                                                        )}
                                                    >
                                                        {notice.type}
                                                    </Badge>
                                                    <Badge
                                                        variant={getPriorityColor(
                                                            notice.priority
                                                        )}
                                                    >
                                                        {notice.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                                {notice.content}
                                            </p>
                                            {notice.university && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <p className="text-sm text-muted-foreground">
                                                        From:{" "}
                                                        {notice.university.name}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {/* Refresh Button */}
                    {!loading && (
                        <div className="mt-8 text-center">
                            <Button onClick={fetchNotices} variant="outline">
                                <Bell className="h-4 w-4 mr-2" />
                                Refresh Notices
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
