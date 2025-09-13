import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import {
    apiService,
    CreateApplicationRequest,
    Application,
    Course,
    Document,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const REQUIRED_DOCUMENTS = [
    {
        type: "PHOTO",
        label: "Passport Size Photo",
        description: "Recent passport size photograph",
    },
    {
        type: "ID_PROOF",
        label: "ID Proof",
        description: "Aadhar Card, PAN Card, or Passport",
    },
    {
        type: "ACADEMIC_CERTIFICATE",
        label: "Academic Certificate",
        description: "10th/12th Mark Sheet or Degree Certificate",
    },
    {
        type: "INCOME_CERTIFICATE",
        label: "Income Certificate",
        description: "Family income certificate (if applicable)",
    },
];

export default function Application() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [application, setApplication] = useState<Application | null>(null);
    const [hasApplication, setHasApplication] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateApplicationRequest>({
        preferredCourseId: "",
        personalInfo: {
            fullName: "",
            dateOfBirth: "",
            gender: "",
            phoneNumber: "",
            address: "",
            emergencyContact: "",
        },
        academicInfo: {
            previousEducation: "",
            marks: 0,
            passingYear: new Date().getFullYear(),
            board: "",
        },
    });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Load courses
            const coursesResponse = await apiService.getCourses();
            if (coursesResponse.success && coursesResponse.data) {
                setCourses(coursesResponse.data);
            }

            // Check if user already has an application
            const applicationCheck = await apiService.checkApplicationExists();
            if (applicationCheck.success && applicationCheck.data) {
                setHasApplication(applicationCheck.data.exists);
                if (applicationCheck.data.application) {
                    setApplication(applicationCheck.data.application);
                }
            }
        } catch (error) {
            console.error("Failed to load data:", error);
            toast({
                title: "Error",
                description: "Failed to load application data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        section: keyof CreateApplicationRequest,
        field: string,
        value: any
    ) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        try {
            setSubmitting(true);

            const response = await apiService.createApplication(formData);

            if (response.success && response.data) {
                setApplication(response.data);
                setHasApplication(true);
                toast({
                    title: "Application Submitted",
                    description:
                        "Your application has been submitted successfully. Please upload required documents.",
                });
            } else {
                throw new Error(
                    response.message || "Failed to submit application"
                );
            }
        } catch (error) {
            console.error("Application submission error:", error);
            toast({
                title: "Submission Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to submit application",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDocumentUpload = async (documentType: string, file: File) => {
        if (!application) return;

        try {
            setUploadingDoc(documentType);

            const response = await apiService.uploadDocument(
                application.id,
                file,
                documentType
            );

            if (response.success && response.data) {
                // Refresh application data to show uploaded document
                await loadData();
                toast({
                    title: "Document Uploaded",
                    description: `${documentType} has been uploaded successfully`,
                });
            } else {
                throw new Error(
                    response.message || "Failed to upload document"
                );
            }
        } catch (error) {
            console.error("Document upload error:", error);
            toast({
                title: "Upload Failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to upload document",
                variant: "destructive",
            });
        } finally {
            setUploadingDoc(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VERIFIED":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge className="bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
        }
    };

    const isDocumentUploaded = (docType: string) => {
        return application?.documents?.some((doc) => doc.type === docType);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (hasApplication && application) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Application</h1>
                    {getStatusBadge(application.status)}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Application Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">
                                    Application ID
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {application.id}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">
                                    Preferred Course
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {application.preferredCourse?.name} (
                                    {application.preferredCourse?.code})
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">
                                    Status
                                </Label>
                                <div className="mt-1">
                                    {getStatusBadge(application.status)}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">
                                    Submitted On
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        application.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Document Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Required Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {REQUIRED_DOCUMENTS.map((doc) => (
                                <div
                                    key={doc.type}
                                    className="border rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium">
                                                {doc.label}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {doc.description}
                                            </p>
                                        </div>
                                        {isDocumentUploaded(doc.type) ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>

                                    {!isDocumentUploaded(doc.type) && (
                                        <div className="mt-2">
                                            <Input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (file) {
                                                        handleDocumentUpload(
                                                            doc.type,
                                                            file
                                                        );
                                                    }
                                                }}
                                                disabled={
                                                    uploadingDoc === doc.type
                                                }
                                            />
                                            {uploadingDoc === doc.type && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Uploading...
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Course Application</h1>
                <p className="text-muted-foreground">
                    Apply for admission to your preferred course
                </p>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-6">
                {/* Course Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="course">Preferred Course *</Label>
                            <Select
                                value={formData.preferredCourseId}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        preferredCourseId: value,
                                    }))
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem
                                            key={course.id}
                                            value={course.id}
                                        >
                                            {course.name} ({course.code}) - ₹
                                            {course.totalFees.toLocaleString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    value={formData.personalInfo.fullName}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "personalInfo",
                                            "fullName",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">
                                    Date of Birth *
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.personalInfo.dateOfBirth}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "personalInfo",
                                            "dateOfBirth",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender *</Label>
                                <Select
                                    value={formData.personalInfo.gender}
                                    onValueChange={(value) =>
                                        handleInputChange(
                                            "personalInfo",
                                            "gender",
                                            value
                                        )
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="FEMALE">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="OTHER">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">
                                    Phone Number *
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    value={formData.personalInfo.phoneNumber}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "personalInfo",
                                            "phoneNumber",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Textarea
                                id="address"
                                value={formData.personalInfo.address}
                                onChange={(e) =>
                                    handleInputChange(
                                        "personalInfo",
                                        "address",
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyContact">
                                Emergency Contact *
                            </Label>
                            <Input
                                id="emergencyContact"
                                value={formData.personalInfo.emergencyContact}
                                onChange={(e) =>
                                    handleInputChange(
                                        "personalInfo",
                                        "emergencyContact",
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Academic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="previousEducation">
                                    Previous Education *
                                </Label>
                                <Select
                                    value={
                                        formData.academicInfo.previousEducation
                                    }
                                    onValueChange={(value) =>
                                        handleInputChange(
                                            "academicInfo",
                                            "previousEducation",
                                            value
                                        )
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select education level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10TH">
                                            10th Grade
                                        </SelectItem>
                                        <SelectItem value="12TH">
                                            12th Grade
                                        </SelectItem>
                                        <SelectItem value="DIPLOMA">
                                            Diploma
                                        </SelectItem>
                                        <SelectItem value="GRADUATION">
                                            Graduation
                                        </SelectItem>
                                        <SelectItem value="POST_GRADUATION">
                                            Post Graduation
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="marks">
                                    Marks/Percentage *
                                </Label>
                                <Input
                                    id="marks"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.academicInfo.marks}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "academicInfo",
                                            "marks",
                                            parseFloat(e.target.value)
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="passingYear">
                                    Passing Year *
                                </Label>
                                <Input
                                    id="passingYear"
                                    type="number"
                                    min="1990"
                                    max={new Date().getFullYear()}
                                    value={formData.academicInfo.passingYear}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "academicInfo",
                                            "passingYear",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="board">
                                    Board/University *
                                </Label>
                                <Input
                                    id="board"
                                    value={formData.academicInfo.board}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "academicInfo",
                                            "board",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Submitting..." : "Submit Application"}
                </Button>
            </form>
        </div>
    );
}
