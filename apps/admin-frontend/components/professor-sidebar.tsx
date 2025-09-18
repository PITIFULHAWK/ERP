"use client"

import { useState } from "react"
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
  Users,
  Bell,
  Settings,
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
  activeTab: string
  onTabChange: (tab: string) => void
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
        href: "/professor#attendance",
        icon: ClipboardCheck,
      },
      {
        name: "Grades",
        href: "/professor#grades", 
        icon: Award,
      },
      {
        name: "Resources",
        href: "/professor#resources",
        icon: BookOpen,
      },
      {
        name: "Calendar",
        href: "/professor#calendar",
        icon: Calendar,
      },
    ]
  },
  {
    label: "Class Management",
    items: [
      {
        name: "My Sections",
        href: "/professor#sections",
        icon: Users,
      },
    ]
  }
]

export function ProfessorSidebar({ className, activeTab, onTabChange }: ProfessorSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  const getTabFromHref = (href: string) => {
    const hash = href.split('#')[1]
    return hash || 'overview'
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-md transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-72",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-playfair text-foreground">Professor</h2>
                <p className="text-xs text-muted-foreground">Academic Portal</p>
              </div>
            </div>
          )}
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
            <TooltipContent side="right" className="bg-card border-border">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const tabKey = getTabFromHref(item.href)
                  const isActive = activeTab === tabKey
                  
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          onClick={() => onTabChange(tabKey)}
                          className={cn(
                            "w-full justify-start gap-3 h-11 px-3 transition-all duration-200",
                            isCollapsed ? "px-0 justify-center" : "",
                            isActive
                              ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 shadow-sm"
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "")} />
                          {!isCollapsed && (
                            <span className={cn("font-medium", isActive ? "text-primary" : "")}>{item.name}</span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="bg-card border-border">
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

        {/* Bottom Section */}
        <div className="p-4 border-t border-border/50">
          <div className="space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 hover:bg-muted/50",
                    isCollapsed ? "px-0 justify-center" : ""
                  )}
                >
                  <Bell className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>Notifications</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-card border-border">
                  Notifications
                </TooltipContent>
              )}
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 hover:bg-muted/50",
                    isCollapsed ? "px-0 justify-center" : ""
                  )}
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>Settings</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-card border-border">
                  Settings
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}