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
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      {/* Left side - Title and Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-foreground">{title}</h1>
          {breadcrumbs && (
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <span className={index === breadcrumbs.length - 1 ? "text-foreground" : ""}>{crumb.label}</span>
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Right side - Search, Notifications, User Menu */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search..." className="pl-10 w-64" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
            3
          </Badge>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/admin-avatar.png" alt={user?.name || "Admin"} />
                <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "Admin User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="w-fit text-xs mt-1">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
