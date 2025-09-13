"use client"

import { Bell, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface AdminHeaderProps {
  title?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function AdminHeader({ title = "Dashboard", breadcrumbs }: AdminHeaderProps) {
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
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search across system..." 
            className="pl-12 w-80 h-11 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl" 
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative h-11 w-11 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-105">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground border-2 border-background animate-pulse">
            3
          </Badge>
        </Button>

        {/* Theme Toggle */}
        <div className="border-l border-border/50 pl-6">
          <ThemeToggle />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-105">
              <Avatar className="h-9 w-9 ring-2 ring-border hover:ring-primary transition-all duration-300">
                <AvatarImage src="/admin-avatar.png" alt={user?.name || "Admin"} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2 mt-2 bg-card/95 backdrop-blur-md border-border/50 shadow-elegant-lg" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold leading-none text-foreground">
                  {user?.name || "Admin User"}
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
