import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * Hook to manage smooth theme transitions and prevent layout shifts
 */
export function useThemeTransition() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const previousTheme = useRef<string | undefined>(resolvedTheme);
  const transitionTimeoutRef = useRef<number>();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track theme changes and manage transitions
  useEffect(() => {
    if (resolvedTheme !== previousTheme.current && previousTheme.current !== undefined) {
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Add transition class to body for enhanced theme switching
      if (typeof document !== 'undefined') {
        document.body.classList.add('theme-transitioning');
        setIsTransitioning(true);

        // Remove the class after transition completes
        transitionTimeoutRef.current = setTimeout(() => {
          document.body.classList.remove('theme-transitioning');
          setIsTransitioning(false);
        }, 300); // Match the CSS transition duration
      }
    }

    previousTheme.current = resolvedTheme;
  }, [resolvedTheme]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Set theme with smooth transition
   */
  const setThemeWithTransition = (newTheme: string) => {
    if (typeof window === 'undefined') {
      setTheme(newTheme);
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Skip transition for users who prefer reduced motion
      setTheme(newTheme);
      return;
    }

    // Add transition class before changing theme
    document.body.classList.add('theme-transitioning');
    setIsTransitioning(true);
    
    // Change theme
    setTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeWithTransition,
    isTransitioning,
  };
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}