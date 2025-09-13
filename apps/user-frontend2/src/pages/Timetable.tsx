import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";

const timeSlots = [
  "9:00 - 10:00",
  "10:00 - 11:00", 
  "11:15 - 12:15",
  "12:15 - 1:15",
  "2:00 - 3:00",
  "3:00 - 4:00",
  "4:15 - 5:15"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const timetableData = {
  "Monday": {
    "9:00 - 10:00": { subject: "Data Structures", code: "CS201", room: "LT-1", professor: "Dr. Smith" },
    "10:00 - 11:00": { subject: "Mathematics", code: "MA101", room: "CR-5", professor: "Prof. Johnson" },
    "11:15 - 12:15": { subject: "Database Systems", code: "CS301", room: "LAB-2", professor: "Dr. Wilson" },
    "12:15 - 1:15": { subject: "Lunch Break", code: "", room: "", professor: "" },
    "2:00 - 3:00": { subject: "Software Engineering", code: "CS401", room: "LT-3", professor: "Dr. Brown" },
    "3:00 - 4:00": { subject: "Operating Systems", code: "CS302", room: "CR-7", professor: "Prof. Davis" },
    "4:15 - 5:15": { subject: "Web Technologies", code: "CS501", room: "LAB-1", professor: "Dr. Miller" }
  },
  "Tuesday": {
    "9:00 - 10:00": { subject: "Algorithms", code: "CS202", room: "LT-2", professor: "Dr. Taylor" },
    "10:00 - 11:00": { subject: "Physics", code: "PH101", room: "CR-3", professor: "Prof. White" },
    "11:15 - 12:15": { subject: "Computer Networks", code: "CS303", room: "LAB-3", professor: "Dr. Anderson" },
    "12:15 - 1:15": { subject: "Lunch Break", code: "", room: "", professor: "" },
    "2:00 - 3:00": { subject: "Machine Learning", code: "CS502", room: "LT-1", professor: "Dr. Garcia" },
    "3:00 - 4:00": { subject: "Database Systems Lab", code: "CS301L", room: "LAB-2", professor: "Dr. Wilson" },
    "4:15 - 5:15": { subject: "Project Work", code: "CS601", room: "PROJECT-ROOM", professor: "Dr. Smith" }
  },
  "Wednesday": {
    "9:00 - 10:00": { subject: "Data Structures", code: "CS201", room: "LT-1", professor: "Dr. Smith" },
    "10:00 - 11:00": { subject: "Discrete Mathematics", code: "MA201", room: "CR-4", professor: "Prof. Lee" },
    "11:15 - 12:15": { subject: "Software Engineering Lab", code: "CS401L", room: "LAB-1", professor: "Dr. Brown" },
    "12:15 - 1:15": { subject: "Lunch Break", code: "", room: "", professor: "" },
    "2:00 - 3:00": { subject: "Computer Graphics", code: "CS503", room: "LAB-4", professor: "Dr. Martinez" },
    "3:00 - 4:00": { subject: "Technical Communication", code: "EN301", room: "CR-6", professor: "Prof. Thompson" },
    "4:15 - 5:15": { subject: "Seminar", code: "CS602", room: "SEMINAR-HALL", professor: "Various" }
  },
  "Thursday": {
    "9:00 - 10:00": { subject: "Algorithms", code: "CS202", room: "LT-2", professor: "Dr. Taylor" },
    "10:00 - 11:00": { subject: "Statistics", code: "MA301", room: "CR-8", professor: "Prof. Clark" },
    "11:15 - 12:15": { subject: "Operating Systems Lab", code: "CS302L", room: "LAB-3", professor: "Prof. Davis" },
    "12:15 - 1:15": { subject: "Lunch Break", code: "", room: "", professor: "" },
    "2:00 - 3:00": { subject: "Artificial Intelligence", code: "CS504", room: "LT-3", professor: "Dr. Rodriguez" },
    "3:00 - 4:00": { subject: "Computer Networks", code: "CS303", room: "CR-9", professor: "Dr. Anderson" },
    "4:15 - 5:15": { subject: "Industrial Training", code: "CS603", room: "INDUSTRY-CELL", professor: "Coordinator" }
  },
  "Friday": {
    "9:00 - 10:00": { subject: "Software Engineering", code: "CS401", room: "LT-3", professor: "Dr. Brown" },
    "10:00 - 11:00": { subject: "Environmental Science", code: "ES101", room: "CR-2", professor: "Prof. Green" },
    "11:15 - 12:15": { subject: "Web Technologies Lab", code: "CS501L", room: "LAB-1", professor: "Dr. Miller" },
    "12:15 - 1:15": { subject: "Lunch Break", code: "", room: "", professor: "" },
    "2:00 - 3:00": { subject: "Machine Learning Lab", code: "CS502L", room: "LAB-4", professor: "Dr. Garcia" },
    "3:00 - 4:00": { subject: "Library Session", code: "", room: "LIBRARY", professor: "Librarian" },
    "4:15 - 5:15": { subject: "Extra Curricular", code: "", room: "SPORTS-COMPLEX", professor: "Sports Officer" }
  }
};

const getSubjectTypeColor = (subject: string) => {
  if (subject.includes("Lab")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (subject.includes("Break")) return "bg-gray-100 text-gray-600 border-gray-200";
  if (subject.includes("Project") || subject.includes("Seminar")) return "bg-purple-100 text-purple-800 border-purple-200";
  if (subject.includes("Library") || subject.includes("Extra")) return "bg-green-100 text-green-800 border-green-200";
  return "bg-primary/10 text-primary border-primary/20";
};

export default function Timetable() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Class Timetable</h1>
        <p className="text-lg text-muted-foreground">
          Regular class schedule for current semester - B.Tech CSE, 6th Semester
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="font-semibold text-center py-3 text-muted-foreground">Time</div>
                {days.map((day) => (
                  <div key={day} className="font-semibold text-center py-3 text-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-6 gap-2 mb-2">
                  <div className="flex items-center justify-center py-4 text-sm font-medium text-muted-foreground bg-muted/50 rounded-lg">
                    <Clock className="w-4 h-4 mr-2" />
                    {timeSlot}
                  </div>
                  
                  {days.map((day) => {
                    const classData = timetableData[day]?.[timeSlot];
                    
                    if (!classData || !classData.subject) {
                      return (
                        <div key={`${day}-${timeSlot}`} className="p-2 border border-border rounded-lg bg-muted/30 min-h-[80px]">
                        </div>
                      );
                    }
                    
                    if (classData.subject === "Lunch Break") {
                      return (
                        <div key={`${day}-${timeSlot}`} className="p-3 border border-orange-200 rounded-lg bg-orange-50 min-h-[80px] flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-sm font-medium text-orange-800">🍽️ Lunch Break</div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={`${day}-${timeSlot}`} className="p-3 border border-border rounded-lg bg-card hover:shadow-md transition-shadow min-h-[80px]">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Badge className={`text-xs font-medium ${getSubjectTypeColor(classData.subject)}`}>
                              {classData.code}
                            </Badge>
                            <h4 className="text-sm font-semibold text-foreground leading-tight">
                              {classData.subject}
                            </h4>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {classData.room}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <User className="w-3 h-3 mr-1" />
                              {classData.professor}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">31 per week</div>
            <p className="text-sm text-muted-foreground">Including labs & practicals</p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-blue-800">Lab Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">8 per week</div>
            <p className="text-sm text-blue-600">Hands-on practical learning</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-800">Core Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">12 subjects</div>
            <p className="text-sm text-green-600">This semester curriculum</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}