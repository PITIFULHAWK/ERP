import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";

export default function Loading() {
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

                    {/* Filters Section Skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notices List Skeleton */}
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Skeleton className="h-4 w-4" />
                                            <div className="flex-1">
                                                <Skeleton className="h-6 w-2/3 mb-2" />
                                                <Skeleton className="h-4 w-1/3" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-6 w-16" />
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
