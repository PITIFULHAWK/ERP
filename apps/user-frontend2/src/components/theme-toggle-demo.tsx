import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Demo component to verify ThemeToggle functionality
 * This can be used for testing and development purposes
 */
export function ThemeToggleDemo() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Theme Toggle Variants</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-32">Dropdown (default):</span>
            <ThemeToggle />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="w-32">Dropdown with label:</span>
            <ThemeToggle showLabel />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="w-32">Simple toggle:</span>
            <ThemeToggle variant="simple" />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="w-32">Simple with label:</span>
            <ThemeToggle variant="simple" showLabel />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Accessibility Features</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Keyboard navigation support (Tab, Enter, Space)</li>
          <li>Screen reader friendly with proper ARIA labels</li>
          <li>Visual feedback for current theme selection</li>
          <li>Smooth transitions between themes</li>
          <li>Hover states for better user experience</li>
        </ul>
      </div>
    </div>
  );
}