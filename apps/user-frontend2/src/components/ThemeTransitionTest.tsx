import React from 'react';
import { useThemeTransition, usePrefersReducedMotion } from '@/hooks/useThemeTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Test component to verify theme transitions are working correctly
 */
export function ThemeTransitionTest() {
  const { theme, resolvedTheme, setTheme, isTransitioning } = useThemeTransition();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Theme Transition Test</CardTitle>
        <CardDescription>
          Test smooth theme transitions and motion preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Current Theme:</strong> {theme}</p>
          <p><strong>Resolved Theme:</strong> {resolvedTheme}</p>
          <p><strong>Is Transitioning:</strong> {isTransitioning ? 'Yes' : 'No'}</p>
          <p><strong>Prefers Reduced Motion:</strong> {prefersReducedMotion ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setTheme('light')}
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
          >
            Light
          </Button>
          <Button 
            onClick={() => setTheme('dark')}
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
          >
            Dark
          </Button>
          <Button 
            onClick={() => setTheme('system')}
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
          >
            System
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-muted theme-transition">
          <p className="text-sm">
            This box should transition smoothly when themes change.
            The transition respects your motion preferences.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-primary text-primary-foreground enhanced-theme-transition">
          <p className="text-sm">
            This box has enhanced transitions (slower, more noticeable).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}