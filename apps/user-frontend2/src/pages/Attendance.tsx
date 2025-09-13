import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const attendanceData = [
    {
        subjectCode: "CSE401",
        subjectName: "Machine Learning",
        attended: 42,
        total: 45,
        percentage: 93,
        status: "excellent",
    },
    {
        subjectCode: "CSE402",
        subjectName: "Database Management Systems",
        attended: 38,
        total: 45,
        percentage: 84,
        status: "good",
    },
    {
        subjectCode: "CSE403",
        subjectName: "Software Engineering",
        attended: 40,
        total: 45,
        percentage: 89,
        status: "good",
    },
    {
        subjectCode: "CSE404",
        subjectName: "Computer Networks",
        attended: 35,
        total: 45,
        percentage: 78,
        status: "good",
    },
    {
        subjectCode: "CSE405",
        subjectName: "Operating Systems",
        attended: 32,
        total: 45,
        percentage: 71,
        status: "warning",
    },
    {
        subjectCode: "CSE406",
        subjectName: "Web Technologies",
        attended: 29,
        total: 45,
        percentage: 64,
        status: "low",
    },
    {
        subjectCode: "HSS401",
        subjectName: "Professional Ethics",
        attended: 41,
        total: 45,
        percentage: 91,
        status: "excellent",
    },
    {
        subjectCode: "CSE407",
        subjectName: "Artificial Intelligence",
        attended: 43,
        total: 45,
        percentage: 96,
        status: "excellent",
    },
];

export default function Attendance() {
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

    const overallAttendance = Math.round(
        attendanceData.reduce((sum, subject) => sum + subject.percentage, 0) /
            attendanceData.length
    );

    const subjectsAbove75 = attendanceData.filter(
        (subject) => subject.percentage >= 75
    ).length;

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
                                {overallAttendance}%
                            </div>
                            <Progress
                                value={overallAttendance}
                                variant={getProgressVariant(overallAttendance)}
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
                                {subjectsAbove75}/{attendanceData.length}
                            </div>
                            <Progress
                                value={
                                    (subjectsAbove75 / attendanceData.length) *
                                    100
                                }
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
                                {
                                    attendanceData.filter(
                                        (s) => s.percentage < 75
                                    ).length
                                }
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {attendanceData.filter((s) => s.percentage < 75)
                                    .length === 0
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
                    {attendanceData.map((subject) => (
                        <Card
                            key={subject.subjectCode}
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
                                                    {subject.subjectCode}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`${
                                                        subject.percentage >= 75
                                                            ? "text-success border-success"
                                                            : subject.percentage >=
                                                                50
                                                              ? "text-warning border-warning"
                                                              : "text-destructive border-destructive"
                                                    }`}
                                                >
                                                    {getStatusIcon(
                                                        subject.status
                                                    )}
                                                    <span className="ml-1">
                                                        {getStatusText(
                                                            subject.status
                                                        )}
                                                    </span>
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground">
                                                {subject.subjectName}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-foreground">
                                                {subject.percentage}%
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {subject.attended} /{" "}
                                                {subject.total} classes
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <Progress
                                            value={subject.percentage}
                                            variant={getProgressVariant(
                                                subject.percentage
                                            )}
                                            className="h-3"
                                        />
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>
                                                Classes Attended:{" "}
                                                {subject.attended}
                                            </span>
                                            <span>
                                                Total Classes: {subject.total}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Warning for low attendance */}
                                    {subject.percentage < 75 && (
                                        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                            <AlertTriangle className="w-4 h-4 text-warning" />
                                            <div className="text-sm">
                                                <span className="font-medium text-warning">
                                                    Attention Required:
                                                </span>
                                                <span className="text-muted-foreground ml-1">
                                                    {subject.percentage < 50
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
