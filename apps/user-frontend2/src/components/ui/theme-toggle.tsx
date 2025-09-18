import * as React from "react";
import { Moon, Sun, Settings } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useThemeTransition } from "@/hooks/useThemeTransition";

interface ThemeToggleProps {
  variant?: "dropdown" | "simple";
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  variant = "dropdown", 
  showLabel = false, 
  className 
}: ThemeToggleProps) {
  const { theme, resolvedTheme } = useTheme();
  const { setTheme: setThemeWithTransition } = useThemeTransition();

  // Simple toggle that cycles through themes with smooth transitions
  const handleSimpleToggle = () => {
    if (theme === "light") {
      setThemeWithTransition("dark");
    } else if (theme === "dark") {
      setThemeWithTransition("system");
    } else {
      setThemeWithTransition("light");
    }
  };

  // Get current theme icon and label
  const getCurrentThemeInfo = () => {
    switch (resolvedTheme) {
      case "dark":
        return { icon: Moon, label: "Dark mode" };
      case "light":
        return { icon: Sun, label: "Light mode" };
      default:
        return { icon: Settings, label: "System theme" };
    }
  };

  const currentTheme = getCurrentThemeInfo();

  if (variant === "simple") {
    return (
      <Button
        variant="ghost"
        size={showLabel ? "default" : "icon"}
        onClick={handleSimpleToggle}
        className={cn("relative", className)}
        aria-label={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} theme`}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
        {showLabel && (
          <span className="ml-2 hidden sm:inline-block">
            {currentTheme.label}
          </span>
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={showLabel ? "default" : "icon"}
          className={cn("relative", className)}
          aria-label="Toggle theme menu"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
          {showLabel && (
            <span className="ml-2 hidden sm:inline-block">
              {currentTheme.label}
            </span>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem 
          onClick={() => setThemeWithTransition("light")}
          className={cn(
            "cursor-pointer",
            theme === "light" && "bg-accent text-accent-foreground"
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-xs opacity-60">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setThemeWithTransition("dark")}
          className={cn(
            "cursor-pointer",
            theme === "dark" && "bg-accent text-accent-foreground"
          )}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs opacity-60">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setThemeWithTransition("system")}
          className={cn(
            "cursor-pointer",
            theme === "system" && "bg-accent text-accent-foreground"
          )}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-xs opacity-60">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}