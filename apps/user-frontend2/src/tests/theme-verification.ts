/**
 * Manual verification script for theme persistence and system detection
 * This script tests all the edge cases and functionality required for task 6
 */

import { 
  safeGetLocalStorage, 
  safeSetLocalStorage, 
  isLocalStorageAvailable,
  validateTheme,
  getSystemTheme,
  getInitialTheme,
  createSystemThemeListener,
  migrateThemeStorage,
  debugThemeState
} from '@/lib/theme-utils';

export interface VerificationResult {
  test: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export class ThemeVerification {
  private results: VerificationResult[] = [];

  private addResult(test: string, passed: boolean, error?: string, details?: any) {
    this.results.push({ test, passed, error, details });
  }

  /**
   * Test localStorage persistence functionality
   */
  testLocalStoragePersistence(): VerificationResult[] {
    const tests: VerificationResult[] = [];

    // Test 1: Basic localStorage availability
    try {
      const isAvailable = isLocalStorageAvailable();
      tests.push({
        test: 'localStorage availability check',
        passed: typeof isAvailable === 'boolean',
        details: { isAvailable }
      });
    } catch (error) {
      tests.push({
        test: 'localStorage availability check',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Safe localStorage operations
    try {
      const testKey = 'theme-test-key';
      const testValue = 'dark';
      
      const setResult = safeSetLocalStorage(testKey, testValue);
      const getValue = safeGetLocalStorage(testKey);
      
      tests.push({
        test: 'Safe localStorage set/get operations',
        passed: setResult && getValue === testValue,
        details: { setResult, getValue, expected: testValue }
      });

      // Clean up
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(testKey);
      }
    } catch (error) {
      tests.push({
        test: 'Safe localStorage set/get operations',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Handle localStorage errors gracefully
    try {
      // Mock localStorage to throw errors
      const originalLocalStorage = window.localStorage;
      
      // Test with broken localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage disabled'); },
          setItem: () => { throw new Error('localStorage disabled'); }
        },
        configurable: true
      });

      const result1 = safeGetLocalStorage('test');
      const result2 = safeSetLocalStorage('test', 'value');

      tests.push({
        test: 'Handle localStorage errors gracefully',
        passed: result1 === null && result2 === false,
        details: { getResult: result1, setResult: result2 }
      });

      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true
      });
    } catch (error) {
      tests.push({
        test: 'Handle localStorage errors gracefully',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return tests;
  }

  /**
   * Test system theme detection functionality
   */
  testSystemThemeDetection(): VerificationResult[] {
    const tests: VerificationResult[] = [];

    // Test 1: Basic system theme detection
    try {
      const systemTheme = getSystemTheme();
      tests.push({
        test: 'System theme detection',
        passed: systemTheme === 'light' || systemTheme === 'dark',
        details: { systemTheme }
      });
    } catch (error) {
      tests.push({
        test: 'System theme detection',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: System theme listener creation
    try {
      let callbackCalled = false;
      const cleanup = createSystemThemeListener((theme) => {
        callbackCalled = true;
      });

      tests.push({
        test: 'System theme listener creation',
        passed: cleanup === null || typeof cleanup === 'function',
        details: { hasCleanup: cleanup !== null }
      });

      // Clean up if listener was created
      if (cleanup) {
        cleanup();
      }
    } catch (error) {
      tests.push({
        test: 'System theme listener creation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Handle missing matchMedia gracefully
    try {
      const originalMatchMedia = window.matchMedia;
      
      // Remove matchMedia support
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        configurable: true
      });

      const systemTheme = getSystemTheme();
      const listener = createSystemThemeListener(() => {});

      tests.push({
        test: 'Handle missing matchMedia gracefully',
        passed: systemTheme === 'light' && listener === null,
        details: { systemTheme, listener }
      });

      // Restore matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: originalMatchMedia,
        configurable: true
      });
    } catch (error) {
      tests.push({
        test: 'Handle missing matchMedia gracefully',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return tests;
  }

  /**
   * Test theme validation and edge cases
   */
  testThemeValidation(): VerificationResult[] {
    const tests: VerificationResult[] = [];

    // Test valid themes
    const validThemes = ['light', 'dark', 'system'];
    validThemes.forEach(theme => {
      try {
        const result = validateTheme(theme);
        tests.push({
          test: `Validate theme: ${theme}`,
          passed: result === theme,
          details: { input: theme, output: result }
        });
      } catch (error) {
        tests.push({
          test: `Validate theme: ${theme}`,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Test invalid themes
    const invalidThemes = [
      { input: 'invalid', expected: 'system' },
      { input: null, expected: 'system' },
      { input: '', expected: 'system' },
      { input: 'auto', expected: 'system' },
      { input: 'night', expected: 'dark' },
      { input: 'day', expected: 'light' }
    ];

    invalidThemes.forEach(({ input, expected }) => {
      try {
        const result = validateTheme(input);
        tests.push({
          test: `Validate invalid theme: ${input}`,
          passed: result === expected,
          details: { input, output: result, expected }
        });
      } catch (error) {
        tests.push({
          test: `Validate invalid theme: ${input}`,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    return tests;
  }

  /**
   * Test theme initialization and fallback chain
   */
  testThemeInitialization(): VerificationResult[] {
    const tests: VerificationResult[] = [];

    // Test 1: Initial theme with no stored value
    try {
      // Clear any stored theme
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('theme');
      }

      const initialTheme = getInitialTheme();
      tests.push({
        test: 'Initial theme with no stored value',
        passed: initialTheme === 'system',
        details: { initialTheme }
      });
    } catch (error) {
      tests.push({
        test: 'Initial theme with no stored value',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Initial theme with stored value
    try {
      safeSetLocalStorage('theme', 'dark');
      const initialTheme = getInitialTheme();
      tests.push({
        test: 'Initial theme with stored value',
        passed: initialTheme === 'dark',
        details: { initialTheme }
      });
    } catch (error) {
      tests.push({
        test: 'Initial theme with stored value',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Initial theme with invalid stored value
    try {
      safeSetLocalStorage('theme', 'invalid-theme');
      const initialTheme = getInitialTheme();
      tests.push({
        test: 'Initial theme with invalid stored value',
        passed: initialTheme === 'system',
        details: { initialTheme }
      });
    } catch (error) {
      tests.push({
        test: 'Initial theme with invalid stored value',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return tests;
  }

  /**
   * Test theme migration functionality
   */
  testThemeMigration(): VerificationResult[] {
    const tests: VerificationResult[] = [];

    // Test 1: Migrate from old theme key
    try {
      // Set up old theme data
      safeSetLocalStorage('old-theme', 'dark');
      
      // Remove new theme key
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('new-theme');
      }

      migrateThemeStorage('old-theme', 'new-theme');

      const migratedValue = safeGetLocalStorage('new-theme');
      const oldValueRemoved = safeGetLocalStorage('old-theme') === null;

      tests.push({
        test: 'Theme migration from old key',
        passed: migratedValue === 'dark' && oldValueRemoved,
        details: { migratedValue, oldValueRemoved }
      });
    } catch (error) {
      tests.push({
        test: 'Theme migration from old key',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Don't migrate if new key already exists
    try {
      safeSetLocalStorage('old-theme-2', 'light');
      safeSetLocalStorage('new-theme-2', 'dark');

      migrateThemeStorage('old-theme-2', 'new-theme-2');

      const newValue = safeGetLocalStorage('new-theme-2');
      
      tests.push({
        test: 'Don\'t migrate if new key exists',
        passed: newValue === 'dark',
        details: { newValue }
      });
    } catch (error) {
      tests.push({
        test: 'Don\'t migrate if new key exists',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return tests;
  }

  /**
   * Test quota exceeded error handling
   */
  testQuotaHandling(): VerificationResult[] {
    const tests: VerificationResult[] = [];

    try {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = window.localStorage.setItem;
      let callCount = 0;

      window.localStorage.setItem = function(key: string, value: string) {
        callCount++;
        if (callCount === 1) {
          throw new DOMException('QuotaExceededError');
        }
        return originalSetItem.call(this, key, value);
      };

      const result = safeSetLocalStorage('test-quota', 'value');

      tests.push({
        test: 'Handle localStorage quota exceeded',
        passed: result === true,
        details: { result, callCount }
      });

      // Restore original setItem
      window.localStorage.setItem = originalSetItem;
    } catch (error) {
      tests.push({
        test: 'Handle localStorage quota exceeded',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return tests;
  }

  /**
   * Run all verification tests
   */
  runAllTests(): VerificationResult[] {
    const allTests: VerificationResult[] = [];

    console.group('Theme Persistence and System Detection Verification');

    // Run all test suites
    const testSuites = [
      { name: 'localStorage Persistence', tests: this.testLocalStoragePersistence() },
      { name: 'System Theme Detection', tests: this.testSystemThemeDetection() },
      { name: 'Theme Validation', tests: this.testThemeValidation() },
      { name: 'Theme Initialization', tests: this.testThemeInitialization() },
      { name: 'Theme Migration', tests: this.testThemeMigration() },
      { name: 'Quota Handling', tests: this.testQuotaHandling() }
    ];

    testSuites.forEach(suite => {
      console.group(suite.name);
      suite.tests.forEach(test => {
        allTests.push(test);
        if (test.passed) {
          console.log(`✅ ${test.test}`, test.details);
        } else {
          console.error(`❌ ${test.test}`, test.error || 'Failed', test.details);
        }
      });
      console.groupEnd();
    });

    const passedTests = allTests.filter(t => t.passed).length;
    const totalTests = allTests.length;

    console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All theme persistence and system detection tests passed!');
    } else {
      console.warn(`⚠️  ${totalTests - passedTests} tests failed. Check implementation.`);
    }

    console.groupEnd();

    return allTests;
  }
}

// Export verification function for easy use
export function verifyThemePersistenceAndSystemDetection(): VerificationResult[] {
  const verification = new ThemeVerification();
  return verification.runAllTests();
}

// Debug helper
export function debugCurrentThemeState(): void {
  debugThemeState();
}