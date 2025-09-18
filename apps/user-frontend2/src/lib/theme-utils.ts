/**
 * Theme utility functions for handling edge cases and persistence
 */

export type Theme = 'light' | 'dark' | 'system';

export const VALID_THEMES: Theme[] = ['light', 'dark', 'system'];
export const DEFAULT_THEME: Theme = 'system';
export const DEFAULT_STORAGE_KEY = 'theme';

/**
 * Safely get item from localStorage with error handling
 */
export function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to read from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Safely set item in localStorage with error handling
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to write to localStorage (key: ${key}):`, error);
    
    // Handle quota exceeded error by clearing old theme data
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        // Try to clear old theme data and retry
        const oldKeys = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const storageKey = window.localStorage.key(i);
          if (storageKey && storageKey.includes('theme')) {
            oldKeys.push(storageKey);
          }
        }
        
        // Remove old theme keys (except the current one)
        oldKeys.forEach(oldKey => {
          if (oldKey !== key) {
            window.localStorage.removeItem(oldKey);
          }
        });
        
        // Retry setting the value
        window.localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        console.warn('Failed to recover from localStorage quota error:', retryError);
        return false;
      }
    }
    
    return false;
  }
}

/**
 * Validate and sanitize theme value
 */
export function validateTheme(theme: string | null): Theme {
  if (!theme || typeof theme !== 'string') {
    return DEFAULT_THEME;
  }
  
  const normalizedTheme = theme.toLowerCase().trim();
  
  if (VALID_THEMES.includes(normalizedTheme as Theme)) {
    return normalizedTheme as Theme;
  }
  
  // Handle legacy or alternative theme names
  switch (normalizedTheme) {
    case 'auto':
    case 'os':
    case 'default':
      return 'system';
    case 'night':
    case 'black':
      return 'dark';
    case 'day':
    case 'white':
      return 'light';
    default:
      console.warn(`Invalid theme value: ${theme}. Falling back to ${DEFAULT_THEME}`);
      return DEFAULT_THEME;
  }
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  try {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return darkModeQuery.matches ? 'dark' : 'light';
  } catch (error) {
    console.warn('Failed to detect system theme:', error);
    return 'light';
  }
}

/**
 * Check if localStorage is available and functional
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    // Test localStorage functionality
    const testKey = '__theme_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get theme with fallback chain: localStorage -> system -> default
 */
export function getInitialTheme(storageKey: string = DEFAULT_STORAGE_KEY): Theme {
  // Try to get from localStorage first
  const storedTheme = safeGetLocalStorage(storageKey);
  if (storedTheme) {
    const validatedTheme = validateTheme(storedTheme);
    if (validatedTheme !== DEFAULT_THEME || storedTheme === 'system') {
      return validatedTheme;
    }
  }
  
  // Fallback to system theme detection
  return DEFAULT_THEME;
}

/**
 * Resolve theme to actual theme (convert 'system' to 'light' or 'dark')
 */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Create a theme change listener for system theme changes
 */
export function createSystemThemeListener(callback: (theme: 'light' | 'dark') => void): (() => void) | null {
  try {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return null;
    }
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };
    
    // Use addEventListener if available, fallback to addListener for older browsers
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleChange);
      return () => darkModeQuery.removeEventListener('change', handleChange);
    } else if (darkModeQuery.addListener) {
      darkModeQuery.addListener(handleChange);
      return () => darkModeQuery.removeListener(handleChange);
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to create system theme listener:', error);
    return null;
  }
}

/**
 * Migrate old theme storage keys
 */
export function migrateThemeStorage(oldKey: string, newKey: string): void {
  try {
    if (!isLocalStorageAvailable()) {
      return;
    }
    
    const oldValue = safeGetLocalStorage(oldKey);
    if (oldValue && !safeGetLocalStorage(newKey)) {
      const validatedTheme = validateTheme(oldValue);
      safeSetLocalStorage(newKey, validatedTheme);
      
      // Clean up old key
      try {
        window.localStorage.removeItem(oldKey);
      } catch (error) {
        console.warn(`Failed to remove old theme key ${oldKey}:`, error);
      }
    }
  } catch (error) {
    console.warn('Failed to migrate theme storage:', error);
  }
}

/**
 * Debug function to log theme state
 */
export function debugThemeState(storageKey: string = DEFAULT_STORAGE_KEY): void {
  // Only run in development mode
  if (typeof window !== 'undefined' && 
      (window as any).__DEV__ !== false && 
      import.meta.env?.DEV !== false) {
    
    console.group('Theme Debug Info');
    console.log('Storage Key:', storageKey);
    console.log('Stored Theme:', safeGetLocalStorage(storageKey));
    console.log('System Theme:', getSystemTheme());
    console.log('localStorage Available:', isLocalStorageAvailable());
    console.log('matchMedia Available:', typeof window !== 'undefined' && !!window.matchMedia);
    console.groupEnd();
  }
}