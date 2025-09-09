import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

interface UserStatusBadgeProps {
  status: "VERIFIED" | "NOT_VERIFIED"
  showIcon?: boolean
}

export function UserStatusBadge({ status, showIcon = true }: UserStatusBadgeProps) {
  const isVerified = status === "VERIFIED"

  return (
    <Badge variant={isVerified ? "default" : "secondary"} className={isVerified ? "bg-chart-3 text-white" : ""}>
      {showIcon && (isVerified ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />)}
      {isVerified ? "Verified" : "Not Verified"}
    </Badge>
  )
}
