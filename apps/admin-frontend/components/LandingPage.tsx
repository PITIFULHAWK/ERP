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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 shadow-elegant sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-elegant">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-playfair font-bold text-primary">ERP System</h1>
                <p className="text-xs text-muted-foreground font-medium">Administrative Portal</p>
              </div>
            </div>
            <Button 
              onClick={handleLoginRedirect} 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-3 h-12 rounded-xl shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:scale-105"
            >
              Admin Access
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="mx-auto max-w-7xl text-center relative">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-white">Next-Generation</span>
              <span className="text-white block mt-2">ERP Management</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Transform your educational institution with our comprehensive, 
              cloud-native ERP solution designed for exceptional administrative efficiency and user experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Button 
                onClick={handleLoginRedirect}
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-xl px-12 py-8 h-16 rounded-xl shadow-elegant-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Launch Dashboard
              </Button>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-card/30 to-muted/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Choose Our Platform
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {highlights.map((highlight, index) => (
              <div key={index} className="text-center group hover-elegant">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                    <highlight.icon className="h-10 w-10 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Comprehensive Features for
              <span className="text-gradient block">Modern Education</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our comprehensive ERP system provides everything you need to manage 
              your educational institution with precision and ease.
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-8"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-card/50 backdrop-blur-sm shadow-elegant hover:shadow-elegant-lg border border-border/50 hover:border-primary/20 transition-all duration-500 hover-elegant rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                      <feature.icon className="h-8 w-8 text-primary group-hover:text-accent transition-colors duration-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="mx-auto max-w-5xl text-center relative">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Ready to Transform Your
              <span className="text-gradient block">Institution?</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Join thousands of educational institutions already using our ERP system 
              to streamline operations, enhance efficiency, and drive meaningful outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Button 
                onClick={handleLoginRedirect}
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-xl px-12 py-8 h-16 rounded-xl shadow-elegant-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Access Admin Dashboard
              </Button>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full border-2 border-background"></div>
                  <div className="w-8 h-8 bg-accent/20 rounded-full border-2 border-background"></div>
                  <div className="w-8 h-8 bg-secondary/20 rounded-full border-2 border-background"></div>
                </div>
                <span className="text-sm font-medium">Trusted by 1000+ institutions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-md border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-playfair font-bold text-foreground">ERP System</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Empowering educational institutions with cutting-edge technology
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 ERP Admin System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;