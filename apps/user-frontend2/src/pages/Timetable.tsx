import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Calendar, 
  RefreshCw, 
  AlertCircle,
  Download,
  Eye,
  EyeOff,
  ExternalLink
} from "lucide-react";

import { documentService } from "@/lib/documentService";
import { useAuth } from "@/contexts/AuthContext";
import { TimetableDocument, StudentEnrollment } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

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

// Types for component state
interface TimetableState {
  document: TimetableDocument | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
  viewMode: 'document' | 'schedule';
  enrollments: StudentEnrollment[];
  selectedSection: string | null;
  apiAvailable: boolean; // Track if APIs are available
}

const getSubjectTypeColor = (subject: string) => {
  if (subject.includes("Lab")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (subject.includes("Break")) return "bg-gray-100 text-gray-600 border-gray-200";
  if (subject.includes("Project") || subject.includes("Seminar")) return "bg-purple-100 text-purple-800 border-purple-200";
  if (subject.includes("Library") || subject.includes("Extra")) return "bg-green-100 text-green-800 border-green-200";
  return "bg-primary/10 text-primary border-primary/20";
};

export default function Timetable() {
  const { user } = useAuth();
  const [state, setState] = useState<TimetableState>({
    document: null,
    loading: true,
    error: null,
    retryCount: 0,
    viewMode: 'schedule', // Start with schedule view during development
    enrollments: [],
    selectedSection: null,
    apiAvailable: true, // Assume available initially, will be set to false if APIs fail
  });

  // Fetch student enrollments and timetable document
  const fetchTimetableData = async (retryAttempt = 0) => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "User not authenticated",
        viewMode: 'schedule' // Fallback to schedule view
      }));
      return;
    }

    // Skip API calls if we know they're not available (unless this is a manual retry)
    if (!state.apiAvailable && retryAttempt === 0) {
      setState(prev => ({
        ...prev,
        loading: false,
        viewMode: 'schedule'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Try to get student enrollments to determine section
      let enrollments: StudentEnrollment[] = [];
      let hasEnrollmentData = false;
      let enrollmentApiAvailable = true;

      try {
        enrollments = await documentService.getStudentEnrollments(user.id);
        hasEnrollmentData = true;
        
        if (enrollments.length === 0) {
          console.warn("No active enrollments found, using fallback schedule");
        } else {
          // Use the first active enrollment
          const activeEnrollment = enrollments.find(e => e.status === 'ACTIVE') || enrollments[0];
          
          setState(prev => ({
            ...prev,
            enrollments,
            selectedSection: activeEnrollment.sectionId
          }));
        }
      } catch (enrollmentError) {
        console.warn("Failed to fetch student enrollments (API not available):", enrollmentError);
        
        // Check if this is an API unavailability error
        const isApiNotAvailable = enrollmentError instanceof Error && 
          (enrollmentError.message.includes("not found") || enrollmentError.message.includes("Route"));
        
        if (isApiNotAvailable) {
          enrollmentApiAvailable = false;
        }
        
        hasEnrollmentData = false;
      }

      // Try to fetch timetable document
      let timetableApiAvailable = true;
      
      try {
        const timetableDoc = await documentService.fetchTimetable(user.id);
        
        setState(prev => ({
          ...prev,
          document: timetableDoc,
          loading: false,
          error: null,
          retryCount: 0,
          viewMode: 'document',
          enrollments: hasEnrollmentData ? enrollments : [],
          apiAvailable: true // APIs are working
        }));

        // Cache the document
        documentService.cacheDocumentMetadata(timetableDoc);
        
        toast({
          title: "Timetable loaded",
          description: "Your section timetable has been loaded successfully.",
        });

      } catch (docError) {
        console.warn("Failed to fetch timetable document, using schedule view:", docError);
        
        // Check if this is a "not found" error (expected during development)
        const isApiNotAvailable = docError instanceof Error && 
          (docError.message.includes("not found") || docError.message.includes("Route"));
        
        if (isApiNotAvailable) {
          timetableApiAvailable = false;
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: null, // Don't show error for expected API unavailability
          viewMode: 'schedule',
          enrollments: hasEnrollmentData ? enrollments : [],
          apiAvailable: enrollmentApiAvailable && timetableApiAvailable // Mark APIs as unavailable
        }));

        // Only show toast if this isn't an expected API unavailability
        if (!isApiNotAvailable && retryAttempt === 0) {
          toast({
            title: "Using schedule view",
            description: "Timetable document not available, showing default schedule.",
            variant: "default"
          });
        }
      }

    } catch (error) {
      console.error("Error fetching timetable data:", error);
      
      // Check if this is an expected API unavailability during development
      const isApiNotAvailable = error instanceof Error && 
        (error.message.includes("not found") || error.message.includes("Route"));
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: isApiNotAvailable ? null : (error instanceof Error ? error.message : "Failed to load timetable data"),
        retryCount: retryAttempt,
        viewMode: 'schedule', // Fallback to schedule view on error
        apiAvailable: !isApiNotAvailable // Mark APIs as unavailable if this is an API error
      }));

      // Only show error toast for unexpected errors, not API unavailability
      if (retryAttempt === 0 && !isApiNotAvailable) {
        toast({
          title: "Error loading timetable",
          description: error instanceof Error ? error.message : "Failed to load timetable data",
          variant: "destructive",
        });
      }
    }
  };

  // Retry mechanism - reset API availability flag and try again
  const handleRetry = () => {
    // Reset API availability flag to allow retry
    setState(prev => ({
      ...prev,
      apiAvailable: true,
      retryCount: 0
    }));
    
    // Immediate retry for manual attempts
    fetchTimetableData(0);
  };

  // Toggle between document and schedule view
  const toggleViewMode = () => {
    setState(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'document' ? 'schedule' : 'document'
    }));
  };

  // Download timetable document
  const handleDownload = async () => {
    if (!state.document) return;

    try {
      const fileName = documentService.generateDownloadFilename(state.document, 'timetable');
      await documentService.downloadDocument(state.document.url, fileName);
      
      toast({
        title: "Download started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download timetable",
        variant: "destructive",
      });
    }
  };

  // Viewer handlers removed - using FileDetails component only

  // Load data on component mount
  useEffect(() => {
    fetchTimetableData();
  }, [user?.id]);

  // Debug logging (can be removed in production)
  useEffect(() => {
    console.log('Timetable State:', {
      viewMode: state.viewMode,
      apiAvailable: state.apiAvailable,
      hasDocument: !!state.document,
      loading: state.loading,
      error: state.error
    });
  }, [state.viewMode, state.apiAvailable, state.document, state.loading, state.error]);

  // Render loading state
  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Class Timetable</h1>
          <p className="text-lg text-muted-foreground">
            {state.document 
              ? `${state.document.section.name} - ${state.document.academicYear.year}`
              : "Regular class schedule for current semester - B.Tech CSE, 6th Semester"
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* View Mode Toggle */}
          {state.document && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleViewMode}
              className="flex items-center gap-2"
            >
              {state.viewMode === 'document' ? (
                <>
                  <Calendar className="w-4 h-4" />
                  Schedule View
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Document View
                </>
              )}
            </Button>
          )}

          {/* Download Button */}
          {state.document && state.viewMode === 'document' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}

          {/* Retry Button - only show for actual errors, not API unavailability */}
          {state.error && state.apiAvailable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Info Alert for Development Mode */}
      {!state.document && !state.loading && state.viewMode === 'schedule' && !state.apiAvailable && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>
                Showing default schedule. Official timetable documents will be available when the backend API is connected.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="flex items-center gap-2 shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Check API
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {state.error && state.viewMode === 'document' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{state.error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, viewMode: 'schedule' }))}
              className="ml-4"
            >
              View Schedule Instead
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Document View */}
      {state.viewMode === 'document' && state.document && (
        <Card>
          <CardHeader>
            <CardTitle>Timetable Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="font-medium">{state.document.fileName}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Section: {state.document.section?.name}</p>
                <p>Academic Year: {state.document.academicYear.year}</p>
                <p>Uploaded: {new Date(state.document.uploadedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={state.document.url} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View in new tab
                  </Button>
                </a>
                <Button onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Document
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule View (Fallback) */}
      {state.viewMode === 'schedule' && (

        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl">Weekly Schedule</CardTitle>
              {state.document && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  Fallback Schedule View
                </div>
              )}
            </div>
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
      )}

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {state.viewMode === 'document' ? 'Document View' : 'View Mode'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.viewMode === 'document' ? (
              <>
                <div className="text-2xl font-bold text-foreground">Active</div>
                <p className="text-sm text-muted-foreground">Viewing official timetable</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">Schedule</div>
                <p className="text-sm text-muted-foreground">
                  {state.document ? 'Fallback view' : 'Default view (31 classes/week)'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-blue-800 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {state.document ? 'Section Info' : 'Lab Sessions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.document ? (
              <>
                <div className="text-2xl font-bold text-blue-900">{state.document.section.name}</div>
                <p className="text-sm text-blue-600">{state.document.academicYear.year}</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900">8 per week</div>
                <p className="text-sm text-blue-600">Hands-on practical learning</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-800 flex items-center gap-2">
              <User className="w-4 h-4" />
              {state.enrollments.length > 0 ? 'Enrollment Status' : 'Academic Info'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.enrollments.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-green-900">
                  {state.enrollments.filter(e => e.status === 'ACTIVE').length}
                </div>
                <p className="text-sm text-green-600">Active enrollments</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900">B.Tech CSE</div>
                <p className="text-sm text-green-600">6th Semester (12 subjects)</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}