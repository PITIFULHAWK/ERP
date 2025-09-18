"use client"

import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"

interface ProfessorHeaderProps {
  title?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function ProfessorHeader({ title = "Dashboard", breadcrumbs }: ProfessorHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-card/50 backdrop-blur-md border-b border-border/50 shadow-elegant sticky top-0 z-40">
      {/* Left side - Title and Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-playfair font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {breadcrumbs && (
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-border">•</span>}
                  <span className={index === breadcrumbs.length - 1 ? "text-primary font-medium" : "hover:text-foreground transition-colors"}>
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Right side - Search, Notifications, User Menu */}
      <div className="flex items-center space-x-6">

        {/* Theme Toggle */}
        <div className="border-l border-border/50 pl-6">
          <ThemeToggle />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-105 cursor-pointer">
              <Avatar className="h-9 w-9 ring-2 ring-border hover:ring-primary transition-all duration-300">
                <AvatarImage src="/professor-avatar.png" alt={user?.name || "Professor"} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user?.name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2 mt-2 bg-card/95 backdrop-blur-md border-border/50 shadow-elegant-lg" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold leading-none text-foreground">
                  Prof. {user?.name || "Professor"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <Badge variant="secondary" className="w-fit text-xs mt-2 bg-primary/10 text-primary border-primary/20">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <User className="mr-3 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem 
              className="p-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer" 
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}