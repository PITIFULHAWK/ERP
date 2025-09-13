import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Users, Star } from "lucide-react";

const courses = [
  {
    code: "B.Tech CSE",
    title: "Bachelor of Technology - Computer Science Engineering",
    description: "Comprehensive program covering software development, algorithms, data structures, and emerging technologies in computer science.",
    duration: "4 Years | 8 Semesters",
    keySubjects: ["Data Structures", "Algorithms", "Database Systems", "Software Engineering", "Machine Learning", "Web Development"],
    rating: 4.8,
    enrolled: 1250
  },
  {
    code: "B.Tech ECE",
    title: "Bachelor of Technology - Electronics & Communication Engineering",
    description: "Focus on electronic devices, communication systems, signal processing, and telecommunications technology.",
    duration: "4 Years | 8 Semesters",
    keySubjects: ["Circuit Design", "Signal Processing", "Communication Systems", "Microprocessors", "VLSI Design", "Embedded Systems"],
    rating: 4.6,
    enrolled: 980
  },
  {
    code: "B.Tech ME",
    title: "Bachelor of Technology - Mechanical Engineering",
    description: "Study of design, manufacturing, and maintenance of mechanical systems and thermal devices.",
    duration: "4 Years | 8 Semesters",
    keySubjects: ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing", "CAD/CAM", "Robotics"],
    rating: 4.5,
    enrolled: 890
  },
  {
    code: "M.Tech AI",
    title: "Master of Technology - Artificial Intelligence",
    description: "Advanced program focusing on machine learning, deep learning, natural language processing, and AI applications.",
    duration: "2 Years | 4 Semesters",
    keySubjects: ["Machine Learning", "Deep Learning", "Neural Networks", "Computer Vision", "NLP", "AI Ethics"],
    rating: 4.9,
    enrolled: 320
  },
  {
    code: "MBA",
    title: "Master of Business Administration",
    description: "Comprehensive business program covering management, finance, marketing, and strategic planning.",
    duration: "2 Years | 4 Semesters",
    keySubjects: ["Strategic Management", "Financial Analysis", "Marketing", "Operations", "Leadership", "Business Analytics"],
    rating: 4.7,
    enrolled: 450
  },
  {
    code: "BCA",
    title: "Bachelor of Computer Applications",
    description: "Undergraduate program focused on computer applications, programming, and software development.",
    duration: "3 Years | 6 Semesters",
    keySubjects: ["Programming", "Database Management", "Web Technologies", "Software Testing", "Mobile Apps", "System Analysis"],
    rating: 4.4,
    enrolled: 750
  }
];

export default function Courses() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Browse Courses</h1>
        <p className="text-lg text-muted-foreground">
          Discover our comprehensive range of academic programs designed to shape your future.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.code} className="shadow-card hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-primary bg-primary/10 font-medium">
                      {course.code}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl leading-tight">{course.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Duration and Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled.toLocaleString()} enrolled</span>
                </div>
              </div>

              {/* Key Subjects */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Key Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {course.keySubjects.map((subject) => (
                    <Badge key={subject} variant="outline" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Need Help Choosing?</CardTitle>
          <CardDescription>
            Our academic advisors are here to help you select the right program for your career goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Contact Academic Advisor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}