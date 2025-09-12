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
    BookOpen,
    Search,
    Filter,
    Users,
    Clock,
    DollarSign,
    GraduationCap,
    MapPin,
    AlertTriangle,
    Building2,
    Calendar,
    Star,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Course } from "@/types";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [universityFilter, setUniversityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.getCourses();

            if (response.success && response.data) {
                setCourses(response.data);
            } else {
                setError(response.message || "Failed to fetch courses");
            }
        } catch (err) {
            setError("An error occurred while fetching courses");
            console.error("Error fetching courses:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedCourses = courses
        .filter((course) => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.university.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
            const matchesUniversity =
                universityFilter === "all" ||
                course.universityId === universityFilter;

            return matchesSearch && matchesUniversity;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "fees":
                    return a.totalFees - b.totalFees;
                case "students":
                    return b.currentStudents - a.currentStudents;
                case "duration":
                    return a.totalSemester - b.totalSemester;
                default:
                    return 0;
            }
        });

    const uniqueUniversities = Array.from(
        new Set(courses.map((course) => course.university.id))
    )
        .map(
            (id) =>
                courses.find((course) => course.university.id === id)
                    ?.university
        )
        .filter(Boolean);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getAvailabilityColor = (current: number, total: number = 100) => {
        const percentage = (current / total) * 100;
        if (percentage < 50) return "text-green-600";
        if (percentage < 80) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">
                                Available Courses
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Explore our comprehensive range of academic programs
                            and find the perfect course for your career goals.
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Total Courses
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {courses.length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Universities
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {uniqueUniversities.length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Total Students
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {courses.reduce(
                                                (sum, course) =>
                                                    sum +
                                                    course.currentStudents,
                                                0
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Avg. Fees
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {courses.length > 0
                                                ? formatCurrency(
                                                      courses.reduce(
                                                          (sum, course) =>
                                                              sum +
                                                              course.totalFees,
                                                          0
                                                      ) / courses.length
                                                  )
                                                : "₹0"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter & Sort Courses
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
                                            placeholder="Search courses, codes, or universities..."
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
                                        University
                                    </label>
                                    <Select
                                        value={universityFilter}
                                        onValueChange={setUniversityFilter}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select university" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Universities
                                            </SelectItem>
                                            {uniqueUniversities.map(
                                                (university) => (
                                                    <SelectItem
                                                        key={university!.id}
                                                        value={university!.id}
                                                    >
                                                        {university!.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Sort By
                                    </label>
                                    <Select
                                        value={sortBy}
                                        onValueChange={setSortBy}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">
                                                Course Name
                                            </SelectItem>
                                            <SelectItem value="fees">
                                                Fees (Low to High)
                                            </SelectItem>
                                            <SelectItem value="students">
                                                Most Popular
                                            </SelectItem>
                                            <SelectItem value="duration">
                                                Duration
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {(searchTerm || universityFilter !== "all") && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing{" "}
                                        {filteredAndSortedCourses.length} of{" "}
                                        {courses.length} courses
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setUniversityFilter("all");
                                            setSortBy("name");
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-6 w-16" />
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Courses Grid */}
                    {!loading && !error && (
                        <div className="space-y-6">
                            {filteredAndSortedCourses.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No courses found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm ||
                                            universityFilter !== "all"
                                                ? "Try adjusting your filters to see more courses."
                                                : "There are no courses available at the moment."}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAndSortedCourses.map((course) => (
                                        <Card
                                            key={course.id}
                                            className="hover:shadow-lg transition-shadow"
                                        >
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg mb-1">
                                                            {course.name}
                                                        </CardTitle>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Code: {course.code}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Building2 className="h-4 w-4" />
                                                            <span>
                                                                {
                                                                    course
                                                                        .university
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {course.credits} Credits
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                {
                                                                    course.totalSemester
                                                                }{" "}
                                                                Semesters
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                            <span
                                                                className={getAvailabilityColor(
                                                                    course.currentStudents
                                                                )}
                                                            >
                                                                {
                                                                    course.currentStudents
                                                                }{" "}
                                                                Students
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-semibold text-lg">
                                                                {formatCurrency(
                                                                    course.totalFees
                                                                )}
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline">
                                                            Total Fees
                                                        </Badge>
                                                    </div>

                                                    <div className="pt-3 border-t">
                                                        <Button
                                                            className="w-full"
                                                            size="sm"
                                                        >
                                                            <GraduationCap className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Refresh Button */}
                    {!loading && (
                        <div className="mt-8 text-center">
                            <Button onClick={fetchCourses} variant="outline">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Refresh Courses
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
