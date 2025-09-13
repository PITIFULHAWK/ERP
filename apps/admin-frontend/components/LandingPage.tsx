"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  FileText,
  BookOpen,
  University,
  BarChart3,
  CreditCard,
  GraduationCap,
  Bell,
  Home,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: FileText,
      title: "Application Management",
      description: "Streamline student applications with comprehensive review, verification, and tracking capabilities.",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Efficiently manage system users with role-based access control and detailed user profiles.",
    },
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Organize and manage academic courses, curricula, and program structures seamlessly.",
    },
    {
      icon: University,
      title: "University Management",
      description: "Centralize university data, partnerships, and institutional information management.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Generate comprehensive reports and analytics to drive data-informed decisions.",
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Secure payment tracking and management with detailed transaction histories.",
    },
    {
      icon: GraduationCap,
      title: "Academic Records",
      description: "Maintain comprehensive academic records and student performance tracking.",
    },
    {
      icon: Bell,
      title: "Notice Management",
      description: "Publish and manage system-wide notices and important announcements.",
    },
    {
      icon: Home,
      title: "Hostel Management",
      description: "Efficiently manage accommodation facilities and student housing arrangements.",
    },
  ];

  const highlights = [
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control",
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description: "Optimized performance for handling large-scale operations",
    },
    {
      icon: Globe,
      title: "Cloud-Based",
      description: "Access your ERP system from anywhere, anytime",
    },
  ];

  const handleLoginRedirect = () => {
    // Navigate to the admin login page
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">ERP Admin</h1>
            </div>
            <Button onClick={handleLoginRedirect} className="bg-primary hover:bg-primary/90">
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Comprehensive ERP
            <span className="text-primary block">Management System</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Streamline your educational institution&apos;s operations with our powerful, 
            cloud-based ERP solution designed for modern administrative efficiency.
          </p>
          <Button 
            onClick={handleLoginRedirect}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <highlight.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive ERP system provides everything you need to manage 
              your educational institution efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card shadow-sm hover:shadow-md transition-all duration-300 border border-border">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of educational institutions already using our ERP system 
            to streamline their operations and improve efficiency.
          </p>
          <Button 
            onClick={handleLoginRedirect}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
          >
            Access Admin Dashboard
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 ERP Admin System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;