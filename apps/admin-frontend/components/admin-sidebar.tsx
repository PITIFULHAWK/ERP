"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Building2,
  Home,
  BookOpen,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CreditCard,
  Briefcase,
  ClipboardCheck,
  UserCheck,
  Share2,
  MessageSquareMore,
  Calendar,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Applications",
    href: "/admin/applications",
    icon: FileText,
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
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Universities",
    href: "/admin/universities",
    icon: Building2,
  },
  {
    name: "Courses",
    href: "/admin/courses",
    icon: GraduationCap,
  },
  {
    name: "Sections",
    href: "/admin/sections",
    icon: UserCheck,
  },
  {
    name: "Attendance",
    href: "/admin/attendance",
    icon: ClipboardCheck,
  },
  {
    name: "Resources",
    href: "/admin/resources",
    icon: Share2,
  },
  {
    name: "Complaints",
    href: "/admin/complaints",
    icon: MessageSquareMore,
  },
  {
    name: "Academic Calendar",
    href: "/admin/academic-calendar",
    icon: Calendar,
  },
  {
    name: "Hostels",
    href: "/admin/hostels",
    icon: Home,
  },
  {
    name: "Academic",
    href: "/admin/academic",
    icon: BookOpen,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Notices",
    href: "/admin/notices",
    icon: Bell,
  },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border/50 transition-all duration-300 shadow-elegant",
        collapsed ? "w-20" : "w-72",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border/30">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sidebar-accent to-sidebar-primary rounded-xl flex items-center justify-center shadow-elegant">
              <GraduationCap className="w-6 h-6 text-sidebar-accent-foreground" />
            </div>
            <div>
              <span className="font-playfair font-bold text-xl text-sidebar-foreground">ERP</span>
              <p className="text-xs text-sidebar-foreground/70 font-medium">Admin Portal</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground transition-all duration-300 rounded-xl h-10 w-10"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full group relative overflow-hidden transition-all duration-300",
                    "text-sidebar-foreground hover:text-sidebar-foreground",
                    !collapsed && "justify-start px-4 py-3 h-12",
                    collapsed && "justify-center px-0 py-3 h-12 w-12 mx-auto",
                    isActive 
                      ? "bg-gradient-to-r from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground shadow-elegant hover:shadow-elegant-lg" 
                      : "hover:bg-sidebar-accent/10 hover:translate-x-1",
                    !isActive && "hover:border-sidebar-accent/20"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-300", 
                    !collapsed && "mr-4",
                    isActive && "text-sidebar-primary-foreground",
                    !isActive && "group-hover:text-sidebar-accent"
                  )} />
                  {!collapsed && (
                    <span className={cn(
                      "font-medium transition-all duration-300",
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
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-sidebar-foreground text-sidebar px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap shadow-elegant">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/30">
        <Link href="/admin/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full group transition-all duration-300 hover:bg-sidebar-accent/10 hover:translate-x-1",
              "text-sidebar-foreground hover:text-sidebar-accent",
              !collapsed && "justify-start px-4 py-3 h-12",
              collapsed && "justify-center px-0 py-3 h-12 w-12 mx-auto",
            )}
          >
            <Settings className={cn("w-5 h-5 transition-colors duration-300", !collapsed && "mr-4")} />
            {!collapsed && <span className="font-medium">Settings</span>}
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-sidebar-foreground text-sidebar px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap shadow-elegant">
                Settings
              </div>
            )}
          </Button>
        </Link>
      </div>
    </div>
  )
}
