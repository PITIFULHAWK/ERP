import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiService, AttendanceSummary } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Attendance() {
    const { user } = useAuth();
    const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user?.id) {
                setError("Not authenticated");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const res = await apiService.getStudentAttendance(user.id);
                if (res.success && res.data) {
                    setSummaries(res.data.summaries || []);
                } else {
                    setError(res.message || "Failed to load attendance");
                }
            } catch (e) {
                setError("Failed to load attendance. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [user?.id]);

    const computed = useMemo(() => {
        if (summaries.length === 0) {
            return {
                overall: 0,
                subjectsAbove75: 0,
                belowCount: 0,
            };
        }
        const percentages = summaries.map((s) => s.attendancePercentage || 0);
        const overall = Math.round(
            percentages.reduce((a, b) => a + b, 0) / percentages.length
        );
        const subjectsAbove75 = summaries.filter((s) => s.attendancePercentage >= 75).length;
        const belowCount = summaries.filter((s) => s.attendancePercentage < 75).length;
        return { overall, subjectsAbove75, belowCount };
    }, [summaries]);

    const getStatusFromPercentage = (p: number) => {
        if (p >= 90) return "excellent";
        if (p >= 75) return "good";
        if (p >= 50) return "warning";
        return "low";
    };
    const getStatusColor = (status: string) => {
        switch (status) {
            case "excellent":
                return "success";
            case "good":
                return "success";
            case "warning":
                return "warning";
            case "low":
                return "danger";
            default:
                return "default";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "excellent":
                return <CheckCircle className="w-4 h-4" />;
            case "good":
                return <CheckCircle className="w-4 h-4" />;
            case "warning":
                return <Clock className="w-4 h-4" />;
            case "low":
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "excellent":
                return "Excellent";
            case "good":
                return "Good";
            case "warning":
                return "Needs Attention";
            case "low":
                return "Low";
            default:
                return "Unknown";
        }
    };

    const getProgressVariant = (percentage: number) => {
        if (percentage >= 75) return "success";
        if (percentage >= 50) return "warning";
        return "danger";
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
                    <p className="text-lg text-muted-foreground">Loading your attendance...</p>
                </div>
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
                    <p className="text-lg text-muted-foreground">Track your class attendance across all subjects for the current semester.</p>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                    My Attendance
                </h1>
                <p className="text-lg text-muted-foreground">
                    Track your class attendance across all subjects for the
                    current semester.
                </p>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            Overall Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-primary">
                                {computed.overall}%
                            </div>
                            <Progress
                                value={computed.overall}
                                variant={getProgressVariant(computed.overall)}
                                className="h-3"
                            />
                            <p className="text-sm text-muted-foreground">
                                Across all subjects
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                            Subjects Above 75%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-success">
                                {computed.subjectsAbove75}/{summaries.length}
                            </div>
                            <Progress
                                value={summaries.length ? (computed.subjectsAbove75 / summaries.length) * 100 : 0}
                                variant="success"
                                className="h-3"
                            />
                            <p className="text-sm text-muted-foreground">
                                Meeting minimum requirement
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                            </div>
                            Action Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-warning">
                                {computed.belowCount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {computed.belowCount === 0
                                    ? "All subjects on track"
                                    : "Subjects need attention"}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Subject-wise Attendance */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                    Subject-wise Attendance
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    {summaries.map((s) => (
                        <Card
                            key={s.subject.id}
                            className="shadow-card hover:shadow-lg transition-shadow duration-200"
                        >
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                >
                                                    {s.subject.code}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`${
                                                        s.attendancePercentage >= 75
                                                            ? "text-success border-success"
                                                            : s.attendancePercentage >=
                                                                50
                                                              ? "text-warning border-warning"
                                                              : "text-destructive border-destructive"
                                                    }`}
                                                >
                                                    {getStatusIcon(getStatusFromPercentage(s.attendancePercentage))}
                                                    <span className="ml-1">
                                                        {getStatusText(getStatusFromPercentage(s.attendancePercentage))}
                                                    </span>
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {s.subject.name}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-foreground">
                                                {s.attendancePercentage}%
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {s.presentClasses} / {s.totalClasses} classes
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <Progress
                                            value={s.attendancePercentage}
                                            variant={getProgressVariant(s.attendancePercentage)}
                                            className="h-3"
                                        />
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>
                                                Classes Attended: {s.presentClasses}
                                            </span>
                                            <span>
                                                Total Classes: {s.totalClasses}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Warning for low attendance */}
                                    {s.attendancePercentage < 75 && (
                                        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                            <AlertTriangle className="w-4 h-4 text-warning" />
                                            <div className="text-sm">
                                                <span className="font-medium text-warning">
                                                    Attention Required:
                                                </span>
                                                <span className="text-muted-foreground ml-1">
                                                    {s.attendancePercentage < 50
                                                        ? "Critical - Immediate action needed to meet minimum attendance."
                                                        : "Below 75% threshold. Consider attending upcoming classes."}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Information Card */}
            <Card className="bg-primary/5 border-primary/20 shadow-card">
                <CardHeader>
                    <CardTitle className="text-lg text-primary">
                        Attendance Policy
                    </CardTitle>
                    <CardDescription>
                        Students must maintain a minimum of 75% attendance in
                        each subject to be eligible for end-semester
                        examinations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>
                            • Attendance is calculated based on classes
                            conducted up to the current date
                        </li>
                        <li>
                            • Medical leave and official university activities
                            are considered for attendance exemption
                        </li>
                        <li>
                            • Students falling below 75% will receive automated
                            notifications
                        </li>
                        <li>
                            • For attendance-related queries, contact your
                            respective faculty advisors
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
