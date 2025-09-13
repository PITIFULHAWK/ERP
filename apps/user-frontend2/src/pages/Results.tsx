import { useState } from "react";
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
import { Trophy, TrendingUp, Award, Star } from "lucide-react";

const resultsData = [
    {
        semester: 1,
        sgpa: 8.5,
        status: "completed",
        subjects: [
            {
                code: "CSE101",
                name: "Programming Fundamentals",
                grade: "A",
                marks: 85,
            },
            {
                code: "MTH101",
                name: "Engineering Mathematics I",
                grade: "A-",
                marks: 78,
            },
            {
                code: "PHY101",
                name: "Engineering Physics",
                grade: "B+",
                marks: 72,
            },
            {
                code: "CHM101",
                name: "Engineering Chemistry",
                grade: "A",
                marks: 82,
            },
            {
                code: "ENG101",
                name: "Technical Communication",
                grade: "A+",
                marks: 92,
            },
            {
                code: "CSE102",
                name: "Computer Workshop",
                grade: "A",
                marks: 88,
            },
        ],
    },
    {
        semester: 2,
        sgpa: 8.8,
        status: "completed",
        subjects: [
            { code: "CSE201", name: "Data Structures", grade: "A+", marks: 94 },
            {
                code: "MTH201",
                name: "Engineering Mathematics II",
                grade: "A",
                marks: 85,
            },
            {
                code: "CSE202",
                name: "Digital Logic Design",
                grade: "A",
                marks: 87,
            },
            {
                code: "ECE201",
                name: "Electronics Engineering",
                grade: "B+",
                marks: 75,
            },
            {
                code: "MEE201",
                name: "Engineering Mechanics",
                grade: "A-",
                marks: 78,
            },
            {
                code: "CSE203",
                name: "Object Oriented Programming",
                grade: "A+",
                marks: 96,
            },
        ],
    },
    {
        semester: 3,
        sgpa: 9.1,
        status: "completed",
        subjects: [
            { code: "CSE301", name: "Algorithms", grade: "A+", marks: 98 },
            {
                code: "CSE302",
                name: "Computer Organization",
                grade: "A+",
                marks: 95,
            },
            { code: "CSE303", name: "Database Systems", grade: "A", marks: 89 },
            {
                code: "MTH301",
                name: "Discrete Mathematics",
                grade: "A",
                marks: 86,
            },
            {
                code: "CSE304",
                name: "Software Engineering",
                grade: "A+",
                marks: 93,
            },
            {
                code: "HSS301",
                name: "Professional Ethics",
                grade: "A",
                marks: 88,
            },
        ],
    },
    {
        semester: 4,
        sgpa: 8.9,
        status: "completed",
        subjects: [
            {
                code: "CSE401",
                name: "Operating Systems",
                grade: "A+",
                marks: 96,
            },
            {
                code: "CSE402",
                name: "Computer Networks",
                grade: "A",
                marks: 87,
            },
            {
                code: "CSE403",
                name: "Machine Learning",
                grade: "A+",
                marks: 94,
            },
            {
                code: "CSE404",
                name: "Web Technologies",
                grade: "A-",
                marks: 81,
            },
            {
                code: "CSE405",
                name: "Mobile App Development",
                grade: "A",
                marks: 90,
            },
            {
                code: "MGT401",
                name: "Engineering Economics",
                grade: "B+",
                marks: 76,
            },
        ],
    },
    {
        semester: 5,
        sgpa: 8.6,
        status: "completed",
        subjects: [
            {
                code: "CSE501",
                name: "Artificial Intelligence",
                grade: "A+",
                marks: 97,
            },
            {
                code: "CSE502",
                name: "Information Security",
                grade: "A",
                marks: 88,
            },
            { code: "CSE503", name: "Cloud Computing", grade: "A", marks: 85 },
            {
                code: "CSE504",
                name: "Human Computer Interaction",
                grade: "A-",
                marks: 79,
            },
            {
                code: "CSE505",
                name: "Project Management",
                grade: "B+",
                marks: 74,
            },
            {
                code: "HSS501",
                name: "Business Communication",
                grade: "A",
                marks: 86,
            },
        ],
    },
    {
        semester: 6,
        sgpa: 0,
        status: "ongoing",
        subjects: [
            { code: "CSE601", name: "Deep Learning", grade: "-", marks: 0 },
            {
                code: "CSE602",
                name: "Blockchain Technology",
                grade: "-",
                marks: 0,
            },
            {
                code: "CSE603",
                name: "IoT and Embedded Systems",
                grade: "-",
                marks: 0,
            },
            {
                code: "CSE604",
                name: "Big Data Analytics",
                grade: "-",
                marks: 0,
            },
            {
                code: "CSE605",
                name: "Capstone Project I",
                grade: "-",
                marks: 0,
            },
            {
                code: "INR601",
                name: "Industrial Training",
                grade: "-",
                marks: 0,
            },
        ],
    },
];

export default function Results() {
    const [expandedSemesters, setExpandedSemesters] = useState<string[]>([
        "semester-5",
    ]);

    const completedSemesters = resultsData.filter(
        (sem) => sem.status === "completed"
    );
    const cgpa =
        completedSemesters.length > 0
            ? (
                  completedSemesters.reduce((sum, sem) => sum + sem.sgpa, 0) /
                  completedSemesters.length
              ).toFixed(2)
            : "0.00";

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
                            <div className="text-3xl font-bold text-primary">
                                {cgpa}
                            </div>
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
                                {completedSemesters.length}
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
                                {Math.max(
                                    ...completedSemesters.map((s) => s.sgpa)
                                ).toFixed(1)}
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
                                Consistent
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Above 8.5 SGPA
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
                        {resultsData.map((semester) => (
                            <AccordionItem
                                key={`semester-${semester.semester}`}
                                value={`semester-${semester.semester}`}
                            >
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant={
                                                    semester.status ===
                                                    "completed"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                Semester {semester.semester}
                                            </Badge>
                                            <span className="font-medium">
                                                {semester.status === "completed"
                                                    ? `SGPA: ${semester.sgpa}`
                                                    : "Ongoing"}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={
                                                semester.status === "completed"
                                                    ? "outline"
                                                    : "secondary"
                                            }
                                        >
                                            {semester.status === "completed"
                                                ? "Completed"
                                                : "In Progress"}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                                            Subject Code
                                                        </th>
                                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                                            Subject Name
                                                        </th>
                                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                                            Grade
                                                        </th>
                                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                                            Marks
                                                        </th>
                                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                                                            Grade Points
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {semester.subjects.map(
                                                        (subject) => (
                                                            <tr
                                                                key={
                                                                    subject.code
                                                                }
                                                                className="border-b border-border/50 hover:bg-muted/50"
                                                            >
                                                                <td className="py-3 px-4 font-mono text-sm">
                                                                    {
                                                                        subject.code
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    {
                                                                        subject.name
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`font-bold ${getGradeColor(subject.grade)}`}
                                                                    >
                                                                        {
                                                                            subject.grade
                                                                        }
                                                                    </Badge>
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-medium">
                                                                    {subject.marks >
                                                                    0
                                                                        ? subject.marks
                                                                        : "-"}
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-medium">
                                                                    {subject.grade !==
                                                                    "-"
                                                                        ? getGradePoints(
                                                                              subject.grade
                                                                          )
                                                                        : "-"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {semester.status === "completed" && (
                                            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-primary">
                                                        Semester Grade Point
                                                        Average (SGPA)
                                                    </span>
                                                    <span className="text-2xl font-bold text-primary">
                                                        {semester.sgpa}
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
