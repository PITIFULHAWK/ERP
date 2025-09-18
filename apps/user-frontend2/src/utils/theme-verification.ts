/**
 * Manual verification utilities for theme persistence and system detection
 * This file provides utilities to manually test theme functionality
 */

import { 
  safeGetLocalStorage, 
  safeSetLocalStorage, 
  validateTheme, 
  getSystemTheme,
  isLocalStorageAvailable,
  createSystemThemeListener,
  migrateThemeStorage
} from '@/lib/theme-utils';

export interface ThemeVerificationResult {
  test: string;
  passed: boolean;
  details: string;
  error?: string;
}

/**
 * Verify localStorage persistence functionality
 */
export function verifyLocalStoragePersistence(): ThemeVerificationResult[] {
  const results: ThemeVerificationResult[] = [];

  // Test 1: Basic localStorage availability
  try {
    const isAvailable = isLocalStorageAvailable();
    results.push({
      test: 'localStorage availability',
      passed: isAvailable,
      details: isAvailable ? 'localStorage is available' : 'localStorage is not available'
    });
  } catch (error) {
    results.push({
      test: 'localStorage availability',
      passed: false,
      details: 'Error checking localStorage availability',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 2: Safe get/set operations
  try {
    const testKey = 'theme-test-key';
    const testValue = 'dark';
    
    const setSuccess = safeSetLocalStorage(testKey, testValue);
    const getValue = safeGetLocalStorage(testKey);
    
    const passed = setSuccess && getValue === testValue;
    
    results.push({
      test: 'localStorage get/set operations',
      passed,
      details: passed 
        ? `Successfully stored and retrieved value: ${getValue}`
        : `Failed to store/retrieve value. Set: ${setSuccess}, Get: ${getValue}`
    });

    // Clean up
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(testKey);
    }
  } catch (error) {
    results.push({
      test: 'localStorage get/set operations',
      passed: false,
      details: 'Error during get/set operations',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 3: Theme validation
  try {
    const validThemes = ['light', 'dark', 'system'];
    const invalidThemes = ['invalid', '', null, undefined, 'auto', 'night'];
    
    let allValid = true;
    let details = '';

    validThemes.forEach(theme => {
      const validated = validateTheme(theme);
      if (validated !== theme) {
        allValid = false;
        details += `Valid theme ${theme} was changed to ${validated}. `;
      }
    });

    invalidThemes.forEach(theme => {
      const validated = validateTheme(theme as any);
      if (!['light', 'dark', 'system'].includes(validated)) {
        allValid = false;
        details += `Invalid theme ${theme} was not properly validated to ${validated}. `;
      }
    });

    results.push({
      test: 'Theme validation',
      passed: allValid,
      details: allValid ? 'All theme validation tests passed' : details
    });
  } catch (error) {
    results.push({
      test: 'Theme validation',
      passed: false,
      details: 'Error during theme validation',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return results;
}

/**
 * Verify system theme detection functionality
 */
export function verifySystemThemeDetection(): ThemeVerificationResult[] {
  const results: ThemeVerificationResult[] = [];

  // Test 1: matchMedia availability
  try {
    const hasMatchMedia = typeof window !== 'undefined' && !!window.matchMedia;
    results.push({
      test: 'matchMedia availability',
      passed: hasMatchMedia,
      details: hasMatchMedia ? 'matchMedia is available' : 'matchMedia is not available'
    });
  } catch (error) {
    results.push({
      test: 'matchMedia availability',
      passed: false,
      details: 'Error checking matchMedia availability',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 2: System theme detection
  try {
    const systemTheme = getSystemTheme();
    const isValidTheme = ['light', 'dark'].includes(systemTheme);
    
    results.push({
      test: 'System theme detection',
      passed: isValidTheme,
      details: `Detected system theme: ${systemTheme}`
    });
  } catch (error) {
    results.push({
      test: 'System theme detection',
      passed: false,
      details: 'Error detecting system theme',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  // Test 3: System theme listener creation
  try {
    let listenerCalled = false;
    const cleanup = createSystemThemeListener((theme) => {
      listenerCalled = true;
    });

    const hasCleanup = typeof cleanup === 'function';
    
    results.push({
      test: 'System theme listener creation',
      passed: hasCleanup,
      details: hasCleanup 
        ? 'System theme listener created successfully'
        : 'Failed to create system theme listener'
    });

    // Clean up
    if (cleanup) {
      cleanup();
    }
  } catch (error) {
    results.push({
      test: 'System theme listener creation',
      passed: false,
      details: 'Error creating system theme listener',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return results;
}

/**
 * Verify theme migration functionality
 */
export function verifyThemeMigration(): ThemeVerificationResult[] {
  const results: ThemeVerificationResult[] = [];

  if (!isLocalStorageAvailable()) {
    results.push({
      test: 'Theme migration',
      passed: false,
      details: 'localStorage not available for migration testing'
    });
    return results;
  }

  try {
    // Set up old theme data
    const oldKey = 'test-old-theme';
    const newKey = 'test-new-theme';
    const themeValue = 'dark';

    // Clean up any existing data
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(oldKey);
      window.localStorage.removeItem(newKey);
      
      // Set old theme
      window.localStorage.setItem(oldKey, themeValue);
      
      // Perform migration
      migrateThemeStorage(oldKey, newKey);
      
      // Check results
      const newValue = window.localStorage.getItem(newKey);
      const oldValueExists = window.localStorage.getItem(oldKey) !== null;
      
      const passed = newValue === themeValue && !oldValueExists;
      
      results.push({
        test: 'Theme migration',
        passed,
        details: passed 
          ? `Successfully migrated theme from ${oldKey} to ${newKey}`
          : `Migration failed. New value: ${newValue}, Old key exists: ${oldValueExists}`
      });

      // Clean up
      window.localStorage.removeItem(oldKey);
      window.localStorage.removeItem(newKey);
    }
  } catch (error) {
    results.push({
      test: 'Theme migration',
      passed: false,
      details: 'Error during theme migration test',
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return results;
}

/**
 * Run all theme verification tests
 */
export function runAllThemeVerifications(): {
  localStorage: ThemeVerificationResult[];
  systemDetection: ThemeVerificationResult[];
  migration: ThemeVerificationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
} {
  const localStorage = verifyLocalStoragePersistence();
  const systemDetection = verifySystemThemeDetection();
  const migration = verifyThemeMigration();

  const allResults = [...localStorage, ...systemDetection, ...migration];
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;

  return {
    localStorage,
    systemDetection,
    migration,
    summary: {
      total: allResults.length,
      passed,
      failed
    }
  };
}

/**
 * Log verification results to console
 */
export function logVerificationResults(): void {
  console.group('🎨 Theme Persistence & System Detection Verification');
  
  const results = runAllThemeVerifications();
  
  console.group('📦 localStorage Persistence Tests');
  results.localStorage.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.details}`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
  });
  console.groupEnd();

  console.group('🖥️ System Theme Detection Tests');
  results.systemDetection.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.details}`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
  });
  console.groupEnd();

  console.group('🔄 Theme Migration Tests');
  results.migration.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.details}`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
  });
  console.groupEnd();

  console.log(`\n📊 Summary: ${results.summary.passed}/${results.summary.total} tests passed`);
  
  if (results.summary.failed > 0) {
    console.warn(`⚠️ ${results.summary.failed} tests failed`);
  } else {
    console.log('🎉 All tests passed!');
  }
  
  console.groupEnd();
}

// Auto-run verification in development
if (typeof window !== 'undefined' && 
    ((window as any).__DEV__ !== false || import.meta.env?.DEV !== false)) {
  // Run verification after a short delay to ensure everything is loaded
  setTimeout(() => {
    logVerificationResults();
  }, 1000);
}