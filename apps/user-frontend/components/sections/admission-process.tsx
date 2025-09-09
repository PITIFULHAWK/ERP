import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, FileText, Upload, Eye, GraduationCap } from "lucide-react"

export function AdmissionProcess() {
  const steps = [
    {
      icon: FileText,
      title: "Register Account",
      description: "Create your account and complete your profile with basic information",
    },
    {
      icon: Upload,
      title: "Submit Application",
      description: "Fill out the application form with academic details and course preferences",
    },
    {
      icon: Eye,
      title: "Document Verification",
      description: "Upload required documents for verification by our admissions team",
    },
    {
      icon: CheckCircle,
      title: "Application Review",
      description: "Track your application status as it goes through the review process",
    },
    {
      icon: GraduationCap,
      title: "Admission Confirmation",
      description: "Receive admission decision and complete enrollment procedures",
    },
  ]

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Admission Process</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple and transparent admission process designed to make your journey smooth
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="text-center h-full">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-balance">{step.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
