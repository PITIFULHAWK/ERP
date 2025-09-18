import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Router
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
  showConnectionStatus?: boolean;
  autoRetryOnReconnect?: boolean;
  title?: string;
  description?: string;
}

interface ConnectionStatus {
  isOnline: boolean;
  connectionType: string;
  downlink?: number;
  effectiveType?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  className = '',
  showConnectionStatus = true,
  autoRetryOnReconnect = true,
  title,
  description
}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown'
  });
  
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Monitor network status
  useEffect(() => {
    const updateConnectionStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      setConnectionStatus({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType
      });
      setLastChecked(new Date());
    };

    const handleOnline = () => {
      updateConnectionStatus();
      
      // Auto retry when connection is restored
      if (autoRetryOnReconnect && onRetry) {
        setTimeout(() => {
          handleRetry();
        }, 1000); // Small delay to ensure connection is stable
      }
    };

    const handleOffline = () => {
      updateConnectionStatus();
    };

    const handleConnectionChange = () => {
      updateConnectionStatus();
    };

    // Initial status check
    updateConnectionStatus();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [autoRetryOnReconnect, onRetry]);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'cellular':
        return <Globe className="h-4 w-4" />;
      case 'ethernet':
        return <Router className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getConnectionQuality = (effectiveType?: string) => {
    switch (effectiveType) {
      case 'slow-2g':
        return { label: 'Very Slow', color: 'destructive' as const };
      case '2g':
        return { label: 'Slow', color: 'destructive' as const };
      case '3g':
        return { label: 'Moderate', color: 'secondary' as const };
      case '4g':
        return { label: 'Fast', color: 'default' as const };
      default:
        return { label: 'Unknown', color: 'secondary' as const };
    }
  };

  const formatSpeed = (downlink?: number) => {
    if (!downlink) return 'Unknown';
    return `${downlink} Mbps`;
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-full',
            connectionStatus.isOnline 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          )}>
            {connectionStatus.isOnline ? (
              <Wifi className="h-6 w-6" />
            ) : (
              <WifiOff className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {title || (connectionStatus.isOnline ? 'Connection Issue' : 'No Internet Connection')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {description || (connectionStatus.isOnline 
                ? 'Unable to reach the server. Please check your connection.'
                : 'Please check your internet connection and try again.'
              )}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        {showConnectionStatus && (
          <Alert>
            <div className="flex items-center gap-2">
              {connectionStatus.isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <AlertTitle>Connection Status</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={connectionStatus.isOnline ? 'default' : 'destructive'}>
                    {connectionStatus.isOnline ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                
                {connectionStatus.isOnline && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Connection Type:</span>
                      <div className="flex items-center gap-1">
                        {getConnectionTypeIcon(connectionStatus.connectionType)}
                        <span className="capitalize">{connectionStatus.connectionType}</span>
                      </div>
                    </div>
                    
                    {connectionStatus.effectiveType && (
                      <div className="flex items-center justify-between">
                        <span>Quality:</span>
                        <Badge variant={getConnectionQuality(connectionStatus.effectiveType).color}>
                          {getConnectionQuality(connectionStatus.effectiveType).label}
                        </Badge>
                      </div>
                    )}
                    
                    {connectionStatus.downlink && (
                      <div className="flex items-center justify-between">
                        <span>Speed:</span>
                        <span>{formatSpeed(connectionStatus.downlink)}</span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last checked:</span>
                  <span>{lastChecked.toLocaleTimeString()}</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Troubleshooting Tips */}
        <div>
          <h4 className="font-medium mb-3">Troubleshooting Steps:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
              Check your Wi-Fi or mobile data connection
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
              Try moving to a location with better signal strength
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
              Restart your router or reconnect to Wi-Fi
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
              Check if other websites or apps are working
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying || !connectionStatus.isOnline}
            className="flex-1"
          >
            <RefreshCw className={cn(
              'h-4 w-4 mr-2',
              isRetrying && 'animate-spin'
            )} />
            {isRetrying ? 'Checking...' : 'Try Again'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
        </div>

        {/* Auto Retry Notice */}
        {autoRetryOnReconnect && !connectionStatus.isOnline && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              We'll automatically try again when your connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Restored Notice */}
        {connectionStatus.isOnline && autoRetryOnReconnect && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Connection Restored</AlertTitle>
            <AlertDescription>
              Your internet connection is back. The page will retry automatically.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};