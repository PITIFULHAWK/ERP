/**
 * Theme script to prevent FOUC (Flash of Unstyled Content)
 * This script should be injected into the HTML head to run before React hydration
 */

export const themeScript = `
(function() {
  try {
    // Get stored theme or default to system
    var storageKey = 'theme';
    var storedTheme = null;
    
    try {
      storedTheme = localStorage.getItem(storageKey);
    } catch (e) {
      // localStorage might not be available
    }
    
    // Validate stored theme
    var validThemes = ['light', 'dark', 'system'];
    var theme = 'system';
    
    if (storedTheme && validThemes.includes(storedTheme)) {
      theme = storedTheme;
    }
    
    // Resolve system theme
    var resolvedTheme = theme;
    if (theme === 'system') {
      try {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch (e) {
        resolvedTheme = 'light';
      }
    }
    
    // Apply theme to document
    var root = document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add the resolved theme class
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
    
    // Set color-scheme for better browser defaults
    root.style.colorScheme = resolvedTheme;
    
    // Add a data attribute to indicate theme is initialized
    root.setAttribute('data-theme-initialized', 'true');
    
  } catch (e) {
    // Fallback to light theme if anything goes wrong
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  }
})();
`;

/**
 * Get the theme script as a string for injection into HTML
 */
export function getThemeScript(): string {
  return themeScript;
}

/**
 * Create a script element with the theme script
 */
export function createThemeScriptElement(): HTMLScriptElement {
  const script = document.createElement('script');
  script.innerHTML = themeScript;
  return script;
}