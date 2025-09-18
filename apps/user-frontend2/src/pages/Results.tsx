import { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { apiService } from "@/lib/api";
import { Loader2, Trophy, TrendingUp, Award, Star } from "lucide-react";

export default function Results() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cgpa, setCgpa] = useState<number>(0);
    const [semesterPerformance, setSemesterPerformance] = useState<
        { semester: { id: string; number: number; code: string }; gpa: number }[]
    >([]);
    const [expandedSemesters, setExpandedSemesters] = useState<string[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await apiService.getUserProfile();
                if (res.success && res.data) {
                    const gp = (res.data as any).cgpa ?? 0;
                    const perf = (res.data as any).academicRecord?.semesterPerformance ?? [];
                    setCgpa(gp);
                    setSemesterPerformance(perf);
                    setExpandedSemesters(perf.map((p: any) => `semester-${p.semester.number}`));
                } else {
                    setError(res.message || "Failed to load results");
                }
            } catch (e) {
                setError("Failed to load results. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const getGradeColor = (grade: string) => {
        if (grade === "A+" || grade === "A") return "text-success";
        if (grade === "A-" || grade === "B+") return "text-primary";
        if (grade === "B" || grade === "B-") return "text-warning";
        if (grade === "-") return "text-muted-foreground";
        return "text-destructive";
    };

    const getGradePoints = (grade: string) => {
        const gradeMap: { [key: string]: number } = {
            "A+": 10,
            A: 9,
            "A-": 8,
            "B+": 7,
            B: 6,
            "B-": 5,
            C: 4,
            F: 0,
        };
        return gradeMap[grade] || 0;
    };

    const bestGpa = useMemo(() => {
        if (!semesterPerformance.length) return 0;
        return Math.max(...semesterPerformance.map((s) => s.gpa || 0));
    }, [semesterPerformance]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">My Results</h1>
                    <p className="text-lg text-muted-foreground">Loading your academic record...</p>
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
                    <h1 className="text-3xl font-bold text-foreground">My Results</h1>
                    <p className="text-lg text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                    My Results
                </h1>
                <p className="text-lg text-muted-foreground">
                    View your academic performance and semester-wise results.
                </p>
            </div>

            {/* Overall Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            Current CGPA
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-primary">{cgpa?.toFixed ? cgpa.toFixed(2) : Number(cgpa).toFixed(2)}</div>
                            <p className="text-sm text-muted-foreground">
                                Out of 10.0
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-success" />
                            </div>
                            Semesters Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-success">
                                {semesterPerformance.filter((s) => (s.gpa || 0) > 0).length}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Out of 8 total
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-warning" />
                            </div>
                            Best SGPA
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-warning">
                                {bestGpa.toFixed(1)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Semester 3
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            Performance Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <div className="text-lg font-bold text-primary">
                                {bestGpa >= 9 ? "Excellent" : bestGpa >= 8 ? "Good" : bestGpa > 0 ? "Average" : "N/A"}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {bestGpa > 0 ? `Best SGPA ${bestGpa.toFixed(1)}` : "No completed semesters yet"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Semester-wise Results */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Semester-wise Results
                    </CardTitle>
                    <CardDescription>
                        Click on any semester to view detailed subject-wise
                        results
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion
                        type="multiple"
                        value={expandedSemesters}
                        onValueChange={setExpandedSemesters}
                    >
                        {semesterPerformance.map((sp) => (
                            <AccordionItem
                                key={`semester-${sp.semester.number}`}
                                value={`semester-${sp.semester.number}`}
                            >
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant={
                                                    sp.gpa > 0 ? "default" : "secondary"
                                                }
                                            >
                                                Semester {sp.semester.number}
                                            </Badge>
                                            <span className="font-medium">
                                                {sp.gpa > 0 ? `GPA: ${sp.gpa}` : "Ongoing"}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={sp.gpa > 0 ? "outline" : "secondary"}
                                        >
                                            {sp.gpa > 0 ? "Completed" : "In Progress"}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-4">
                                        {/* Detailed subject-wise grades not available from profile; show summary */}
                                        {sp.gpa > 0 && (
                                            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-primary">
                                                        Semester GPA
                                                    </span>
                                                    <span className="text-2xl font-bold text-primary">
                                                        {sp.gpa}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            {/* Grade Legend */}
            <Card className="bg-muted/50 shadow-card">
                <CardHeader>
                    <CardTitle className="text-lg">Grade Scale</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium">A+:</span>
                            <span>90-100 (10 points)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">A:</span>
                            <span>80-89 (9 points)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">A-:</span>
                            <span>75-79 (8 points)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">B+:</span>
                            <span>70-74 (7 points)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">B:</span>
                            <span>60-69 (6 points)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">B-:</span>
                            <span>55-59 (5 points)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">C:</span>
                            <span>50-54 (4 points)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">F:</span>
                            <span>0-49 (0 points)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
