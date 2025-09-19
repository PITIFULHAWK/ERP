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
import { apiService, GradesSemesterSummary } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Trophy, TrendingUp, Award, Star } from "lucide-react";

export default function Results() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cgpa, setCgpa] = useState<number>(0);
    const [semesters, setSemesters] = useState<GradesSemesterSummary[]>([]);
    const [expandedSemesters, setExpandedSemesters] = useState<string[]>([]);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!user?.id) throw new Error("Not authenticated");
                const res = await apiService.getStudentGradesSummary(user.id);
                if (res.success && res.data) {
                    const gp = res.data.cgpa ?? 0;
                    setCgpa(Number(gp) || 0);
                    const sems = res.data.semesters || [];
                    setSemesters(sems);
                    setExpandedSemesters(
                        sems.map((s) => `semester-${s.semesterNumber ?? s.semesterId}`)
                    );
                } else {
                    setError(res.message || "Failed to load results");
                }
            } catch (e) {
                setError("Failed to load results. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [user?.id]);

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

    const best = useMemo(() => {
        let bestVal = 0;
        let bestSem: number | null = null;
        for (const s of semesters) {
            const sgpa = Number(s.sgpa || 0);
            if (sgpa > bestVal) {
                bestVal = sgpa;
                bestSem = s.semesterNumber ?? null;
            }
        }
        return { bestVal, bestSem };
    }, [semesters]);

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
                                {semesters.filter((s) => (s.sgpa || 0) > 0).length}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Out of {Math.max(...(semesters.map(s => s.semesterNumber || 0).filter(n => n > 0)), semesters.length)} total
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
                                {best.bestVal.toFixed(1)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {best.bestSem ? `Semester ${best.bestSem}` : "-"}
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
                                {best.bestVal >= 9 ? "Excellent" : best.bestVal >= 8 ? "Good" : best.bestVal > 0 ? "Average" : "N/A"}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {best.bestVal > 0 ? `Best SGPA ${best.bestVal.toFixed(1)}` : "No completed semesters yet"}
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
                        {semesters.map((sp) => (
                            <AccordionItem
                                key={`semester-${sp.semesterNumber ?? sp.semesterId}`}
                                value={`semester-${sp.semesterNumber ?? sp.semesterId}`}
                            >
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant={
                                                    (sp.sgpa || 0) > 0 ? "default" : "secondary"
                                                }
                                            >
                                                Semester {sp.semesterNumber ?? "-"}
                                            </Badge>
                                            <span className="font-medium">
                                                {(sp.sgpa || 0) > 0 ? `SGPA: ${(sp.sgpa || 0).toFixed(2)}` : "Ongoing"}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={(sp.sgpa || 0) > 0 ? "outline" : "secondary"}
                                        >
                                            {(sp.sgpa || 0) > 0 ? "Completed" : "In Progress"}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-4">
                                        {(sp.sgpa || 0) > 0 && (
                                            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-primary">Semester SGPA</span>
                                                    <span className="text-2xl font-bold text-primary">{(sp.sgpa || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Subject-wise marks */}
                                        {sp.subjects?.length ? (
                                            <div className="mt-4 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-muted-foreground">
                                                        <tr>
                                                            <th className="text-left py-2">Code</th>
                                                            <th className="text-left py-2">Subject</th>
                                                            <th className="text-right py-2">Credits</th>
                                                            <th className="text-right py-2">Marks</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sp.subjects.map((sub) => (
                                                            <tr key={sub.subjectId} className="border-t">
                                                                <td className="py-2 pr-2">{sub.subjectCode}</td>
                                                                <td className="py-2 pr-2">{sub.subjectName}</td>
                                                                <td className="py-2 text-right">{sub.credits}</td>
                                                                <td className="py-2 text-right">{sub.marksObtained}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">No subject-wise marks available.</div>
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
