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
  Users,
  GraduationCap,
  FileText,
  Home,
  BookOpen,
  Bell,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CreditCard,
  Briefcase,
  UserCheck,
  MessageSquareMore,
  Calendar,
  type LucideIcon,
} from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

// Organize navigation into logical groups for better UX
const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ]
  },
  {
    label: "Management",
    items: [
      {
        name: "Applications",
        href: "/admin/applications",
        icon: FileText,
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        name: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
      },
      {
        name: "Placements",
        href: "/admin/placements",
        icon: Briefcase,
      },
    ]
  },
  {
    label: "Academic",
    items: [
      {
        name: "Courses",
        href: "/admin/courses",
        icon: GraduationCap,
      },
      {
        name: "Academic Calendar",
        href: "/admin/academic-calendar",
        icon: Calendar,
      },
      {
        name: "Academic",
        href: "/admin/academic",
        icon: BookOpen,
      },
    ]
  },
  {
    label: "Operations",
    items: [
      {
        name: "Sections",
        href: "/admin/sections",
        icon: UserCheck,
      },
      {
        name: "Timetables",
        href: "/admin/timetables",
        icon: Calendar,
      },
      {
        name: "Hostels",
        href: "/admin/hostels",
        icon: Home,
      },
    ]
  },
  {
    label: "Communication",
    items: [
      {
        name: "Notices",
        href: "/admin/notices",
        icon: Bell,
      },
      {
        name: "Complaints",
        href: "/admin/complaints",
        icon: MessageSquareMore,
      },
    ]
  }
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const renderNavItem = (item: NavigationItem, isInGroup: boolean = false) => {
    const isActive = pathname === item.href
    
    const navButton = (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full group relative overflow-hidden transition-all duration-300 cursor-pointer",
          "text-sidebar-foreground hover:text-sidebar-foreground",
          !collapsed && "justify-start px-3 py-2.5 h-11",
          collapsed && "justify-center px-0 py-2.5 h-11 w-11 mx-auto",
          isActive 
            ? "bg-gradient-to-r from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground shadow-elegant" 
            : "hover:bg-sidebar-accent/10 hover:translate-x-1",
          !isActive && "hover:border-sidebar-accent/20",
          isInGroup && !collapsed && "ml-2" // Slight indent for grouped items
        )}
      >
        <item.icon className={cn(
          "w-4 h-4 transition-all duration-300 flex-shrink-0", 
          !collapsed && "mr-3",
          isActive && "text-sidebar-primary-foreground",
          !isActive && "group-hover:text-sidebar-accent"
        )} />
        {!collapsed && (
          <span className={cn(
            "font-medium transition-all duration-300 text-sm truncate",
            isActive && "text-sidebar-primary-foreground",
          )}>
            {item.name}
          </span>
        )}
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-accent-foreground rounded-r-full" />
        )}
        {/* Hover effect overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-sidebar-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Button>
    )

    if (collapsed) {
      return (
        <TooltipProvider key={item.name}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Link href={item.href}>
                {navButton}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Link key={item.name} href={item.href}>
        {navButton}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar backdrop-blur-md border-r border-sidebar-border transition-all duration-300 shadow-elegant",
        "h-screen overflow-hidden", // Force full height and hide overflow at container level
        collapsed ? "w-20" : "w-72",
        className,
      )}
    >
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border/50 flex-shrink-0 bg-sidebar">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sidebar-accent to-sidebar-primary rounded-xl flex items-center justify-center shadow-elegant">
              <GraduationCap className="w-5 h-5 text-sidebar-accent-foreground" />
            </div>
            <div>
              <span className="font-playfair font-bold text-lg text-sidebar-foreground">ERP</span>
              <p className="text-xs text-sidebar-foreground/70 font-medium">Admin Portal</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground transition-all duration-300 rounded-xl h-9 w-9 flex-shrink-0 cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation - Scrollable middle section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll bg-sidebar">
        <div className="px-3 py-4 space-y-4">
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2 sticky top-0 bg-sidebar py-1 z-10">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => renderNavItem(item, true))}
              </div>
              {groupIndex < navigationGroups.length - 1 && !collapsed && (
                <div className="my-4">
                  <Separator className="bg-sidebar-border/30" />
                </div>
              )}
            </div>
          ))}
          {/* Add some bottom padding to ensure last item is accessible */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  )
}
