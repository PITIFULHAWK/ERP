import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Bell,
    Calendar,
    Trophy,
    User,
    ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

// Mock user state - in real app this would come from auth context
const MOCK_USER = {
    isStudent: true, // Change to false to see applicant view
    name: "Shivam",
    studentId: "STU2023001",
    course: "B.Tech Computer Science Engineering",
    semester: "6th Semester",
};

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isStudent = user.role === "STUDENT";

    // Safely format current semester info, which may be an object from backend
    const renderCurrentSemesterInfo = () => {
        const info = user.currentSemesterInfo as any;
        if (!info) return null;
        if (typeof info !== "object") return <span>{String(info)}</span>;
        // Try to build a friendly label from known fields
        const parts: string[] = [];
        if (info.semesterInfo || info.currentSemester) {
            parts.push(info.semesterInfo ?? info.currentSemester);
        }
        if (info.academicYear?.year) {
            parts.push(`AY ${info.academicYear.year}`);
        }
        if (info.course?.code || info.course?.name) {
            parts.push(info.course.code ?? info.course.name);
        }
        if (parts.length === 0) {
            // Fallback to a concise JSON string (not as a raw object)
            try {
                return <span>{JSON.stringify(info)}</span>;
            } catch {
                return null;
            }
        }
        return <span>{parts.join(" • ")}</span>;
    };

    if (!isStudent) {
        // Applicant View
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        Welcome to AcademiaOS
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Your gateway to higher education. Explore our courses
                        and stay updated with university notices.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <Card
                        className="shadow-card hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                        onClick={() => navigate("/courses")}
                    >
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <BookOpen className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl">
                                Explore Courses
                            </CardTitle>
                            <CardDescription>
                                Discover our comprehensive range of
                                undergraduate and graduate programs
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Button
                                variant="outline"
                                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            >
                                Browse Courses{" "}
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card
                        className="shadow-card hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                        onClick={() => navigate("/notices")}
                    >
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                                <Bell className="w-8 h-8 text-warning" />
                            </div>
                            <CardTitle className="text-xl">
                                University Notices
                            </CardTitle>
                            <CardDescription>
                                Stay informed with the latest announcements and
                                important updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Button
                                variant="outline"
                                className="w-full group-hover:bg-warning group-hover:text-warning-foreground transition-colors"
                            >
                                View Notices{" "}
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Student View
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {user.name}! 👋
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {user.email}
                    </span>
                    {user.currentSemesterInfo && (
                        <>
                            <span className="hidden sm:block">•</span>
                            {renderCurrentSemesterInfo()}
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    className="shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate("/attendance")}
                >
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors">
                                <Calendar className="w-6 h-6 text-success" />
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <CardTitle className="text-lg">My Attendance</CardTitle>
                        <CardDescription>
                            Track your class attendance progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Overall
                                </span>
                                <span className="text-2xl font-bold text-success">
                                    85%
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                6/8 subjects above 75%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate("/results")}
                >
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Trophy className="w-6 h-6 text-primary" />
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <CardTitle className="text-lg">My Results</CardTitle>
                        <CardDescription>
                            View your academic performance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Current CGPA
                                </span>
                                <span className="text-2xl font-bold text-primary">
                                    8.7
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                5 semesters completed
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate("/notices")}
                >
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                                <Bell className="w-6 h-6 text-warning" />
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <CardTitle className="text-lg">
                            University Notices
                        </CardTitle>
                        <CardDescription>
                            Latest announcements and updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    New notices
                                </span>
                                <span className="text-2xl font-bold text-warning">
                                    3
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                2 unread important notices
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>
                        Frequently used actions for faster access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4 flex-col gap-2"
                            onClick={() => navigate("/attendance")}
                        >
                            <Calendar className="w-5 h-5" />
                            <span className="text-sm">Check Attendance</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4 flex-col gap-2"
                            onClick={() => navigate("/results")}
                        >
                            <Trophy className="w-5 h-5" />
                            <span className="text-sm">View Results</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4 flex-col gap-2"
                            onClick={() => navigate("/courses")}
                        >
                            <BookOpen className="w-5 h-5" />
                            <span className="text-sm">Course Catalog</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4 flex-col gap-2"
                            onClick={() => navigate("/notices")}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="text-sm">Latest Notices</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
