"use client"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, ArrowRight, Save } from "lucide-react"
import { useApplication } from "@/contexts/application-context"
import { PersonalInfoForm } from "./forms/personal-info-form"
import { AddressInfoForm } from "./forms/address-info-form"
import { AcademicInfoForm } from "./forms/academic-info-form"
import { CoursePreferenceForm } from "./forms/course-preference-form"
import { DocumentUploadForm } from "./forms/document-upload-form"
import { ApplicationReview } from "./application-review"

const steps = [
  { id: 0, title: "Personal Information", component: PersonalInfoForm },
  { id: 1, title: "Address Information", component: AddressInfoForm },
  { id: 2, title: "Academic Records", component: AcademicInfoForm },
  { id: 3, title: "Course Preference", component: CoursePreferenceForm },
  { id: 4, title: "Document Upload", component: DocumentUploadForm },
  { id: 5, title: "Review & Submit", component: ApplicationReview },
]

export function ApplicationWizard() {
  const { currentStep, setCurrentStep, saveApplication, isLoading, application } = useApplication()

  const CurrentStepComponent = steps[currentStep]?.component || PersonalInfoForm
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = async () => {
    // Save current progress before moving to next step
    const saved = await saveApplication()
    if (saved && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex)
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return "completed"
    if (stepIndex === currentStep) return "current"
    return "upcoming"
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Application Form</h1>
            <p className="text-muted-foreground">Complete your application step by step</p>
            {application && (
              <Badge variant="outline" className="mt-2">
                Status: {application.status.replace("_", " ")}
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      getStepStatus(index) === "completed"
                        ? "bg-primary text-primary-foreground"
                        : getStepStatus(index) === "current"
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                    } ${index <= currentStep ? "cursor-pointer" : "cursor-not-allowed"}`}
                    disabled={index > currentStep}
                  >
                    {getStepStatus(index) === "completed" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </button>
                  <span
                    className={`text-xs text-center max-w-20 ${
                      getStepStatus(index) === "current" ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden md:block absolute h-0.5 w-16 mt-5 ${
                        index < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                      style={{ left: `${((index + 1) / steps.length) * 100}%` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep]?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent />
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={saveApplication} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={isLoading}>
                  Review Application
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
