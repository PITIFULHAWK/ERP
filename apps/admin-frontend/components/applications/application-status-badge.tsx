import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertCircle, FileText } from "lucide-react"

interface ApplicationStatusBadgeProps {
  status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "INCOMPLETE"
  showIcon?: boolean
}

export function ApplicationStatusBadge({ status, showIcon = true }: ApplicationStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return {
          variant: "default" as const,
          icon: CheckCircle,
          label: "Verified",
          className: "bg-chart-3 text-white hover:bg-chart-3/90",
        }
      case "UNDER_REVIEW":
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: "Under Review",
          className: "bg-chart-2 text-white hover:bg-chart-2/90",
        }
      case "REJECTED":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          label: "Rejected",
          className: "",
        }
      case "INCOMPLETE":
        return {
          variant: "destructive" as const,
          icon: AlertCircle,
          label: "Incomplete",
          className: "bg-chart-4 text-white hover:bg-chart-4/90",
        }
      default: // PENDING
        return {
          variant: "outline" as const,
          icon: FileText,
          label: "Pending",
          className: "",
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  )
}
