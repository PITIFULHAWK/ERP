import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, GraduationCap, Home, Eye, Edit } from "lucide-react"
import Link from "next/link"
import type { University } from "@/types/university"

interface UniversityCardProps {
  university: University & {
    totalUsers: number
    totalCourses: number
    totalHostels: number
  }
}

export function UniversityCard({ university }: UniversityCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-playfair">{university.name}</CardTitle>
              <CardDescription>UID: {university.uid}</CardDescription>
            </div>
          </div>
          <Badge variant="outline">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-chart-1 mr-1" />
              <span className="text-sm font-medium">{university.totalUsers}</span>
            </div>
            <p className="text-xs text-muted-foreground">Users</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <GraduationCap className="w-4 h-4 text-chart-2 mr-1" />
              <span className="text-sm font-medium">{university.totalCourses}</span>
            </div>
            <p className="text-xs text-muted-foreground">Courses</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Home className="w-4 h-4 text-chart-3 mr-1" />
              <span className="text-sm font-medium">{university.totalHostels}</span>
            </div>
            <p className="text-xs text-muted-foreground">Hostels</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="text-xs text-muted-foreground">
          <p>Created: {formatDate(university.createdAt)}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
            <Link href={`/admin/universities/${university.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
            <Link href={`/admin/universities/${university.id}/edit`}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
