"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { 
  CalendarDays, 
  ClipboardCheck, 
  BookOpen, 
  GraduationCap,
  Users,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Coffee,
  Sun,
  Moon,
  Zap,
  Star
} from "lucide-react"
import Link from "next/link"

export default function ProfessorPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    stats: {
      totalSections: 0
    }
  })

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: "Good morning", icon: Sun, color: "text-yellow-500" }
    if (hour < 17) return { text: "Good afternoon", icon: Coffee, color: "text-orange-500" }
    return { text: "Good evening", icon: Moon, color: "text-blue-500" }
  }

  const greeting = getGreeting()

  useEffect(() => {
    async function fetchDashboard() {
      if (!user?.id) return;
      setDashboardData((prev) => ({ ...prev, loading: true }));
      try {
        // Fetch sections
        const sectionRes = await apiClient.getProfessorSections(user.id) as { data: unknown[] };
        const sections = Array.isArray(sectionRes.data) ? sectionRes.data : [];
        const totalSections = sections.length;

        setDashboardData({
          loading: false,
          stats: {
            totalSections,
          },
        });
      } catch {
        setDashboardData({
          loading: false,
          stats: {
            totalSections: 0,
          },
        });
      }
    }
    fetchDashboard();
  }, [user?.id]);

  if (dashboardData.loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gradient-to-r from-muted to-muted/50 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-xl"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl"></div>
        <div className="relative p-8 rounded-xl border bg-background/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <greeting.icon className={`h-6 w-6 ${greeting.color}`} />
                <h1 className="text-3xl font-bold tracking-tight">
                  {greeting.text}, {user?.name}!
                </h1>
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-muted-foreground text-lg">
                Ready to inspire minds today? Here&apos;s your teaching dashboard.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                <GraduationCap className="h-4 w-4" />
                Professor Dashboard
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 opacity-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Sections</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {dashboardData.stats.totalSections}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active sections this semester
            </p>
            <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400">
              <Clock className="h-3 w-3 mr-1" />
              Currently teaching
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 opacity-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              Main features available
            </p>
            <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
              <ArrowRight className="h-3 w-3 mr-1" />
              Ready to use
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 opacity-50"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Focus</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {new Date().toLocaleDateString('en-US', { day: 'numeric' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="mt-3 flex items-center text-xs text-purple-600 dark:text-purple-400">
              <CalendarDays className="h-3 w-3 mr-1" />
              Teaching day
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Quick Actions */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Quick Actions</CardTitle>
                  <CardDescription className="text-base">
                    Everything you need for effective teaching ✨
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                <Star className="h-3 w-3 mr-1" />
                Essential
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/professor/attendance">
                <div className="group relative p-6 border rounded-2xl hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50/30 to-blue-50/50">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-blue-500 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      <ClipboardCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">
                        Mark Attendance
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
                        Track student presence and participation in your classes
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-blue-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
              
              <Link href="/professor/grades">
                <div className="group relative p-6 border rounded-2xl hover:shadow-md hover:border-green-200 transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50/30 to-green-50/50">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-green-500 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-semibold text-lg text-green-900 dark:text-green-100 mb-1">
                        Add Grades
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-300 leading-relaxed">
                        Evaluate and record student academic performance
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-green-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
              
              <Link href="/professor/resources">
                <div className="group relative p-6 border rounded-2xl hover:shadow-md hover:border-purple-200 transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50/30 to-purple-50/50">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-purple-500 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-semibold text-lg text-purple-900 dark:text-purple-100 mb-1">
                        Upload Resources
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-300 leading-relaxed">
                        Share course materials and learning resources
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-purple-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
              
              <Link href="/professor/calendar">
                <div className="group relative p-6 border rounded-2xl hover:shadow-md hover:border-orange-200 transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50/30 to-orange-50/50">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-orange-500 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-semibold text-lg text-orange-900 dark:text-orange-100 mb-1">
                        View Calendar
                      </h3>
                      <p className="text-sm text-orange-600 dark:text-orange-300 leading-relaxed">
                        Access academic schedules and important dates
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-orange-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Teaching Tips Sidebar */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Teaching Tips</CardTitle>
                <CardDescription>Quick reminders</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="p-1 bg-amber-500 rounded-full mt-1">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">Engagement Tip</h4>
                <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                  Start each class with a quick review of previous topics to boost retention.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="p-1 bg-blue-500 rounded-full mt-1">
                <Clock className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm">Time Management</h4>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Keep attendance records updated daily for better tracking.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="p-1 bg-green-500 rounded-full mt-1">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200 text-sm">Resource Sharing</h4>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Upload materials before class to help students prepare better.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}