import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, GraduationCap, Building2, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-3 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,456</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-3 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3 new this semester
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Universities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-4">Active institutions</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-playfair">Recent Applications</CardTitle>
            <CardDescription>Latest application submissions requiring review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Sarah Johnson", course: "Computer Science", status: "pending", time: "2 hours ago" },
                { name: "Michael Chen", course: "Electrical Engineering", status: "under_review", time: "4 hours ago" },
                { name: "Emily Davis", course: "Business Administration", status: "verified", time: "6 hours ago" },
                { name: "David Wilson", course: "Mechanical Engineering", status: "pending", time: "8 hours ago" },
                { name: "Lisa Anderson", course: "Data Science", status: "incomplete", time: "1 day ago" },
              ].map((application, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{application.name}</p>
                      <p className="text-sm text-muted-foreground">{application.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        application.status === "verified"
                          ? "default"
                          : application.status === "under_review"
                            ? "secondary"
                            : application.status === "incomplete"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {application.status === "verified" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {application.status === "under_review" && <Clock className="w-3 h-3 mr-1" />}
                      {application.status === "incomplete" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {application.status.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{application.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full bg-transparent">
                View All Applications
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-playfair">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Review Applications
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Add University
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <GraduationCap className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">Application Status Overview</CardTitle>
          <CardDescription>Current status distribution of all applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-chart-4">342</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-chart-2">156</div>
              <div className="text-sm text-muted-foreground">Under Review</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-chart-3">689</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-chart-1">60</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
