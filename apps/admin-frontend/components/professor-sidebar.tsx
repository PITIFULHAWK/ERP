"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  ClipboardCheck,
  Award,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  isActive?: boolean
}

interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

interface ProfessorSidebarProps {
  className?: string
}

// Navigation for professor dashboard
const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/professor",
        icon: LayoutDashboard,
      },
    ]
  },
  {
    label: "Academic Management",
    items: [
      {
        name: "Attendance",
        href: "/professor/attendance",
        icon: ClipboardCheck,
      },
      {
        name: "Grades",
        href: "/professor/grades", 
        icon: Award,
      },
      {
        name: "Resources",
        href: "/professor/resources",
        icon: BookOpen,
      },
      {
        name: "Calendar",
        href: "/professor/calendar",
        icon: Calendar,
      },
    ]
  }
]

export function ProfessorSidebar({ className }: ProfessorSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-md transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "w-16" : "w-72",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className={cn(
            "flex items-center space-x-3 transition-all duration-300 ease-in-out",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold font-playfair text-foreground truncate whitespace-nowrap">Professor</h2>
              <p className="text-xs text-muted-foreground truncate whitespace-nowrap">Academic Portal</p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground border-border shadow-md">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3 transition-all duration-300 ease-in-out whitespace-nowrap",
                isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              )}>
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-3 h-11 px-3 transition-all duration-200",
                              isCollapsed ? "px-0 justify-center" : "",
                              isActive
                                ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 shadow-sm"
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "")} />
                            <span className={cn(
                              "font-medium transition-all duration-300 ease-in-out whitespace-nowrap",
                              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                              isActive ? "text-primary" : ""
                            )}>
                              {item.name}
                            </span>
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="bg-popover text-popover-foreground border-border shadow-md">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </div>
              {group.label !== "Class Management" && <Separator className="bg-border/50" />}
            </div>
          ))}
        </nav>
      </div>
    </TooltipProvider>
  )
}