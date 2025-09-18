import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Users, Star, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, Course } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper function to generate a rating based on course data
const generateCourseRating = (course: Course): number => {
    // Generate a rating between 4.0 and 5.0 based on enrollment count
    const baseRating = 4.0;
    const enrollmentFactor = Math.min(course.currentStudents / 1000, 1) * 1.0;
    return Math.round((baseRating + enrollmentFactor) * 10) / 10;
};

// Helper function to generate key subjects based on course name
const generateKeySubjects = (courseName: string): string[] => {
    const name = courseName.toLowerCase();
    
    if (name.includes('computer') || name.includes('cse') || name.includes('bca')) {
        return ['Data Structures', 'Algorithms', 'Database Systems', 'Software Engineering', 'Web Development', 'Programming'];
    } else if (name.includes('electronics') || name.includes('ece')) {
        return ['Circuit Design', 'Signal Processing', 'Communication Systems', 'Microprocessors', 'VLSI Design', 'Embedded Systems'];
    } else if (name.includes('mechanical') || name.includes('me')) {
        return ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing', 'CAD/CAM', 'Robotics'];
    } else if (name.includes('artificial') || name.includes('ai') || name.includes('machine learning')) {
        return ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Computer Vision', 'NLP', 'AI Ethics'];
    } else if (name.includes('business') || name.includes('mba') || name.includes('management')) {
        return ['Strategic Management', 'Financial Analysis', 'Marketing', 'Operations', 'Leadership', 'Business Analytics'];
    } else {
        return ['Core Subjects', 'Practical Training', 'Project Work', 'Industry Exposure', 'Research Methods', 'Professional Skills'];
    }
};

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiService.getCourses();
                
                if (response.success && response.data) {
                    setCourses(response.data);
                } else {
                    setError(response.message || 'Failed to fetch courses');
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        Browse Courses
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Discover our comprehensive range of academic programs
                        designed to shape your future.
                    </p>
                </div>
                
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Loading courses...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        Browse Courses
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Discover our comprehensive range of academic programs
                        designed to shape your future.
                    </p>
                </div>
                
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                    Browse Courses
                </h1>
                <p className="text-lg text-muted-foreground">
                    Discover our comprehensive range of academic programs
                    designed to shape your future.
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No courses available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {courses.map((course) => {
                        const rating = generateCourseRating(course);
                        const keySubjects = generateKeySubjects(course.name);
                        const duration = `${Math.ceil(course.totalSemester / 2)} Years | ${course.totalSemester} Semesters`;
                        
                        return (
                            <Card
                                key={course.id}
                                className="shadow-card hover:shadow-lg transition-all duration-300 group"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-primary bg-primary/10 font-medium"
                                                >
                                                    {course.code}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Star className="w-3 h-3 fill-warning text-warning" />
                                                    <span>{rating}</span>
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl leading-tight">
                                                {course.name}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    <CardDescription className="text-sm leading-relaxed">
                                        {course.university?.name && (
                                            <span className="text-primary font-medium">
                                                {course.university.name}
                                            </span>
                                        )}
                                        <br />
                                        Credits: {course.credits} | Total Fees: ₹{course.totalFees.toLocaleString()}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Duration and Stats */}
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>
                                                {course.currentStudents.toLocaleString()}{" "}
                                                enrolled
                                            </span>
                                        </div>
                                    </div>

                                    {/* Key Subjects */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            Key Subjects
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {keySubjects.map((subject) => (
                                                <Badge
                                                    key={subject}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {subject}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    {/* <div className="flex justify-end pt-4 border-t border-border">
                        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
                          Apply Now
                        </Button>
                      </div> */}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Info Card */}
            <Card className="bg-primary/5 border-primary/20 shadow-card">
                <CardHeader>
                    <CardTitle className="text-lg text-primary">
                        Need Help Choosing?
                    </CardTitle>
                    <CardDescription>
                        Our academic advisors are here to help you select the
                        right program for your career goals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                        Contact Academic Advisor
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
