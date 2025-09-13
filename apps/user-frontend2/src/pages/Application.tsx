import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { apiService, CreateApplicationRequest, Application, Course, Document } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const REQUIRED_DOCUMENTS = [
  { type: "PHOTO", label: "Passport Size Photo", description: "Recent passport size photograph" },
  { type: "ID_PROOF", label: "ID Proof", description: "Aadhar Card, PAN Card, or Passport" },
  { type: "ACADEMIC_CERTIFICATE", label: "Academic Certificate", description: "10th/12th Mark Sheet or Degree Certificate" },
  { type: "INCOME_CERTIFICATE", label: "Income Certificate", description: "Family income certificate (if applicable)" },
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
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "MALE",
    nationality: "Indian",
    phoneNumber: "",
    alternatePhoneNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    class10Percentage: 0,
    class10Board: "",
    class10YearOfPassing: new Date().getFullYear() - 2,
    class12Percentage: 0,
    class12Board: "",
    class12YearOfPassing: new Date().getFullYear(),
    class12Stream: "",
    hasJeeMainsScore: false,
    jeeMainsScore: undefined,
    jeeMainsRank: undefined,
    jeeMainsYear: undefined,
    preferredCourseId: "",
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

  const handleInputChange = (field: keyof CreateApplicationRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
          description: "Your application has been submitted successfully. Please upload required documents.",
        });
      } else {
        throw new Error(response.message || "Failed to submit application");
      }
    } catch (error: any) {
      console.error("Failed to submit application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentUpload = async (docType: string, file: File) => {
    if (!application) return;

    try {
      setUploadingDoc(docType);
      
      const response = await apiService.uploadDocument(application.id, docType, file);
      
      if (response.success) {
        // Reload application data to get updated documents
        await loadData();
        toast({
          title: "Document Uploaded",
          description: "Your document has been uploaded successfully.",
        });
      } else {
        throw new Error(response.message || "Failed to upload document");
      }
    } catch (error: any) {
      console.error("Failed to upload document:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
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
        <div>
          <h1 className="text-3xl font-bold">Application Status</h1>
          <p className="text-muted-foreground">
            Track your application progress and upload required documents
          </p>
        </div>

        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Application Details
              {getStatusBadge(application.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">{application.firstName} {application.lastName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Course</Label>
                <p className="text-sm text-muted-foreground">{application.preferredCourse?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Application ID</Label>
                <p className="text-sm text-muted-foreground">{application.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Submitted</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload all required documents for verification
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const isUploaded = isDocumentUploaded(doc.type);
              const isUploading = uploadingDoc === doc.type;
              
              return (
                <div key={doc.type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isUploaded ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id={`file-${doc.type}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleDocumentUpload(doc.type, file);
                            }
                          }}
                          disabled={isUploading}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-${doc.type}`)?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
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
                onValueChange={(value) => handleInputChange("preferredCourseId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.code}) - ₹{course.totalFees.toLocaleString()}
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
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternatePhoneNumber">Alternate Phone Number</Label>
              <Input
                id="alternatePhoneNumber"
                value={formData.alternatePhoneNumber || ""}
                onChange={(e) => handleInputChange("alternatePhoneNumber", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="class10Percentage">Class 10 Percentage *</Label>
                <Input
                  id="class10Percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.class10Percentage}
                  onChange={(e) => handleInputChange("class10Percentage", parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class10Board">Class 10 Board *</Label>
                <Input
                  id="class10Board"
                  value={formData.class10Board}
                  onChange={(e) => handleInputChange("class10Board", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class10YearOfPassing">Class 10 Year of Passing *</Label>
                <Input
                  id="class10YearOfPassing"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={formData.class10YearOfPassing}
                  onChange={(e) => handleInputChange("class10YearOfPassing", parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="class12Percentage">Class 12 Percentage *</Label>
                <Input
                  id="class12Percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.class12Percentage}
                  onChange={(e) => handleInputChange("class12Percentage", parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class12Board">Class 12 Board *</Label>
                <Input
                  id="class12Board"
                  value={formData.class12Board}
                  onChange={(e) => handleInputChange("class12Board", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class12YearOfPassing">Class 12 Year of Passing *</Label>
                <Input
                  id="class12YearOfPassing"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={formData.class12YearOfPassing}
                  onChange={(e) => handleInputChange("class12YearOfPassing", parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class12Stream">Class 12 Stream *</Label>
              <Select
                value={formData.class12Stream}
                onValueChange={(value) => handleInputChange("class12Stream", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* JEE Mains Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasJeeMainsScore"
                  checked={formData.hasJeeMainsScore}
                  onChange={(e) => handleInputChange("hasJeeMainsScore", e.target.checked)}
                />
                <Label htmlFor="hasJeeMainsScore">I have JEE Mains score</Label>
              </div>

              {formData.hasJeeMainsScore && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="jeeMainsScore">JEE Mains Score</Label>
                    <Input
                      id="jeeMainsScore"
                      type="number"
                      min="0"
                      max="300"
                      value={formData.jeeMainsScore || ""}
                      onChange={(e) => handleInputChange("jeeMainsScore", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jeeMainsRank">JEE Mains Rank</Label>
                    <Input
                      id="jeeMainsRank"
                      type="number"
                      min="1"
                      value={formData.jeeMainsRank || ""}
                      onChange={(e) => handleInputChange("jeeMainsRank", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jeeMainsYear">JEE Mains Year</Label>
                    <Input
                      id="jeeMainsYear"
                      type="number"
                      min="2010"
                      max={new Date().getFullYear()}
                      value={formData.jeeMainsYear || ""}
                      onChange={(e) => handleInputChange("jeeMainsYear", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting Application...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </div>
  );
}
