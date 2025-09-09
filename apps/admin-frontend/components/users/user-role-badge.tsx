import { Badge } from "@/components/ui/badge"
import { Shield, Users, GraduationCap, UserCheck, User } from "lucide-react"

interface UserRoleBadgeProps {
  role: "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER"
  showIcon?: boolean
}

export function UserRoleBadge({ role, showIcon = true }: UserRoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          variant: "default" as const,
          icon: Shield,
          label: "Admin",
          className: "bg-chart-1 text-white hover:bg-chart-1/90",
        }
      case "VERIFIER":
        return {
          variant: "secondary" as const,
          icon: UserCheck,
          label: "Verifier",
          className: "bg-chart-2 text-white hover:bg-chart-2/90",
        }
      case "PROFESSOR":
        return {
          variant: "outline" as const,
          icon: GraduationCap,
          label: "Professor",
          className: "bg-chart-3 text-white hover:bg-chart-3/90",
        }
      case "STUDENT":
        return {
          variant: "outline" as const,
          icon: Users,
          label: "Student",
          className: "bg-chart-4 text-white hover:bg-chart-4/90",
        }
      default: // USER
        return {
          variant: "outline" as const,
          icon: User,
          label: "User",
          className: "",
        }
    }
  }

  const config = getRoleConfig(role)
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  )
}
