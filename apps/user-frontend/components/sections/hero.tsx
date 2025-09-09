import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Award } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Your Gateway to
            <span className="text-primary"> Educational Excellence</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Streamline your academic journey with our comprehensive ERP system. Apply for courses, track applications,
            and manage your educational path all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Comprehensive Courses</h3>
              <p className="text-muted-foreground text-sm">
                Access detailed information about courses across multiple fields of study and specializations.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Expert Guidance</h3>
              <p className="text-muted-foreground text-sm">
                Get support throughout your application process with our dedicated student services team.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Track Progress</h3>
              <p className="text-muted-foreground text-sm">
                Monitor your application status and academic progress with real-time updates and notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
