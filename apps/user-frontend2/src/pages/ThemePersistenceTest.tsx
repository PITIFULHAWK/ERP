import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  safeGetLocalStorage, 
  getSystemTheme, 
  isLocalStorageAvailable,
  validateTheme 
} from '@/lib/theme-utils';
import { logVerificationResults } from '@/utils/theme-verification';

const ThemePersistenceTest: React.FC = () => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [storageInfo, setStorageInfo] = React.useState<{
    stored: string | null;
    isAvailable: boolean;
    systemDetected: string;
  }>({
    stored: null,
    isAvailable: false,
    systemDetected: 'unknown'
  });

  // Update storage info
  const updateStorageInfo = React.useCallback(() => {
    setStorageInfo({
      stored: safeGetLocalStorage('theme'),
      isAvailable: isLocalStorageAvailable(),
      systemDetected: getSystemTheme()
    });
  }, []);

  React.useEffect(() => {
    updateStorageInfo();
    
    // Update info when theme changes
    const interval = setInterval(updateStorageInfo, 1000);
    return () => clearInterval(interval);
  }, [updateStorageInfo]);

  const testThemeValidation = () => {
    const testCases = [
      'light', 'dark', 'system', 
      'invalid', '', null, undefined, 
      'auto', 'night', 'day'
    ];
    
    console.group('Theme Validation Tests');
    testCases.forEach(testCase => {
      const validated = validateTheme(testCase as any);
      console.log(`Input: ${testCase} → Output: ${validated}`);
    });
    console.groupEnd();
  };

  const testLocalStoragePersistence = () => {
    const themes = ['light', 'dark', 'system'];
    
    console.group('localStorage Persistence Test');
    themes.forEach(testTheme => {
      console.log(`Setting theme to: ${testTheme}`);
      setTheme(testTheme);
      
      setTimeout(() => {
        const stored = safeGetLocalStorage('theme');
        console.log(`Stored value: ${stored}`);
      }, 100);
    });
    console.groupEnd();
  };

  const clearThemeStorage = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('theme');
      updateStorageInfo();
      console.log('Theme storage cleared');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Theme Persistence Test</h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Theme Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Theme Status</CardTitle>
            <CardDescription>Real-time theme information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Theme:</span>
              <Badge variant="outline">{theme || 'undefined'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Resolved:</span>
              <Badge variant="outline">{resolvedTheme || 'undefined'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>System:</span>
              <Badge variant="outline">{systemTheme || 'undefined'}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Storage Information */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Information</CardTitle>
            <CardDescription>localStorage persistence status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Available:</span>
              <Badge variant={storageInfo.isAvailable ? "default" : "destructive"}>
                {storageInfo.isAvailable ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Stored:</span>
              <Badge variant="outline">{storageInfo.stored || 'null'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>System Detected:</span>
              <Badge variant="outline">{storageInfo.systemDetected}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Theme Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Controls</CardTitle>
            <CardDescription>Manual theme switching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => setTheme('light')} 
              variant={theme === 'light' ? 'default' : 'outline'}
              className="w-full"
            >
              Light Theme
            </Button>
            <Button 
              onClick={() => setTheme('dark')} 
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="w-full"
            >
              Dark Theme
            </Button>
            <Button 
              onClick={() => setTheme('system')} 
              variant={theme === 'system' ? 'default' : 'outline'}
              className="w-full"
            >
              System Theme
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>Run various theme persistence tests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={logVerificationResults} variant="outline">
              Run All Verifications
            </Button>
            <Button onClick={testThemeValidation} variant="outline">
              Test Validation
            </Button>
            <Button onClick={testLocalStoragePersistence} variant="outline">
              Test Persistence
            </Button>
            <Button onClick={clearThemeStorage} variant="destructive">
              Clear Storage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
          <CardDescription>How to verify theme persistence and system detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">localStorage Persistence Test:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Change the theme using the controls above</li>
              <li>Refresh the page (F5 or Ctrl+R)</li>
              <li>Verify the theme persists across page reloads</li>
              <li>Open the browser's developer tools and check the Console for verification results</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">System Theme Detection Test:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Set theme to "System Theme"</li>
              <li>Change your OS theme preference (Windows: Settings → Personalization → Colors)</li>
              <li>Verify the app theme changes automatically</li>
              <li>Check the "System Detected" value updates correctly</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Edge Cases Test:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Clear Storage" to remove theme preference</li>
              <li>Refresh the page and verify it defaults to system theme</li>
              <li>Open browser's developer tools → Application → Local Storage</li>
              <li>Manually edit the theme value to something invalid (e.g., "invalid-theme")</li>
              <li>Refresh and verify it falls back to a valid theme</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Visual Theme Test */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Theme Test</CardTitle>
          <CardDescription>Verify theme colors are applied correctly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background border rounded">
              <div className="text-foreground">Background</div>
            </div>
            <div className="p-4 bg-card border rounded">
              <div className="text-card-foreground">Card</div>
            </div>
            <div className="p-4 bg-primary text-primary-foreground rounded">
              Primary
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground rounded">
              Secondary
            </div>
            <div className="p-4 bg-muted text-muted-foreground rounded">
              Muted
            </div>
            <div className="p-4 bg-accent text-accent-foreground rounded">
              Accent
            </div>
            <div className="p-4 bg-destructive text-destructive-foreground rounded">
              Destructive
            </div>
            <div className="p-4 border border-border rounded">
              <div className="text-foreground">Border</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemePersistenceTest;