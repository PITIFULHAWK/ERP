"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-11 w-11 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-muted-foreground group-hover:text-primary" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-muted-foreground group-hover:text-primary" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
