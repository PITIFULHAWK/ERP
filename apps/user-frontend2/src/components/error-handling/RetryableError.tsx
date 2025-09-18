import React, { useState, useCallback, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RetryableErrorProps {
  error: Error;
  onRetry: () => Promise<void> | void;
  maxRetries?: number;
  currentRetry?: number;
  autoRetry?: boolean;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  className?: string;
  title?: string;
  description?: string;
  showErrorDetails?: boolean;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  nextRetryIn: number;
  autoRetryEnabled: boolean;
}

export const RetryableError: React.FC<RetryableErrorProps> = ({
  error,
  onRetry,
  maxRetries = 3,
  currentRetry = 0,
  autoRetry = false,
  retryDelay = 1000,
  exponentialBackoff = true,
  className = '',
  title,
  description,
  showErrorDetails = false
}) => {
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: currentRetry,
    nextRetryIn: 0,
    autoRetryEnabled: autoRetry
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate retry delay with exponential backoff
  const calculateRetryDelay = useCallback((retryCount: number): number => {
    if (!exponentialBackoff) return retryDelay;
    
    // Exponential backoff: delay * (2 ^ retryCount) with jitter
    const baseDelay = retryDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.1 * baseDelay; // Add 10% jitter
    return Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
  }, [retryDelay, exponentialBackoff]);

  // Auto retry countdown
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (retryState.autoRetryEnabled && retryState.nextRetryIn > 0 && isOnline) {
      intervalId = setInterval(() => {
        setRetryState(prev => {
          const newCountdown = prev.nextRetryIn - 1000;
          
          if (newCountdown <= 0) {
            // Trigger retry
            handleRetry();
            return { ...prev, nextRetryIn: 0 };
          }
          
          return { ...prev, nextRetryIn: newCountdown };
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [retryState.autoRetryEnabled, retryState.nextRetryIn, isOnline]);

  // Start auto retry when component mounts (if enabled)
  useEffect(() => {
    if (autoRetry && retryState.retryCount < maxRetries && isOnline) {
      const delay = calculateRetryDelay(retryState.retryCount);
      setRetryState(prev => ({ 
        ...prev, 
        nextRetryIn: delay,
        autoRetryEnabled: true 
      }));
    }
  }, [autoRetry, retryState.retryCount, maxRetries, calculateRetryDelay, isOnline]);

  const handleRetry = useCallback(async () => {
    if (retryState.isRetrying || retryState.retryCount >= maxRetries) return;

    setRetryState(prev => ({
      ...prev,
      isRetrying: true,
      nextRetryIn: 0
    }));

    try {
      await onRetry();
      // If retry succeeds, the error component should be unmounted
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      
      const newRetryCount = retryState.retryCount + 1;
      
      setRetryState(prev => ({
        ...prev,
        isRetrying: false,
        retryCount: newRetryCount,
        autoRetryEnabled: autoRetry && newRetryCount < maxRetries,
        nextRetryIn: autoRetry && newRetryCount < maxRetries && isOnline 
          ? calculateRetryDelay(newRetryCount) 
          : 0
      }));
    }
  }, [onRetry, retryState.isRetrying, retryState.retryCount, maxRetries, autoRetry, calculateRetryDelay, isOnline]);

  const toggleAutoRetry = useCallback(() => {
    setRetryState(prev => {
      const newAutoRetryEnabled = !prev.autoRetryEnabled;
      
      return {
        ...prev,
        autoRetryEnabled: newAutoRetryEnabled,
        nextRetryIn: newAutoRetryEnabled && prev.retryCount < maxRetries && isOnline
          ? calculateRetryDelay(prev.retryCount)
          : 0
      };
    });
  }, [calculateRetryDelay, maxRetries, isOnline]);

  const getErrorType = (error: Error): 'network' | 'server' | 'client' | 'unknown' => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'server';
    }
    if (message.includes('400') || message.includes('401') || message.includes('403') || message.includes('404')) {
      return 'client';
    }
    
    return 'unknown';
  };

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'network':
        return isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />;
      case 'server':
        return <AlertCircle className="h-5 w-5" />;
      case 'client':
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getErrorMessage = (errorType: string): string => {
    switch (errorType) {
      case 'network':
        return isOnline 
          ? 'Network connection issue. Please check your internet connection.'
          : 'You appear to be offline. Please check your internet connection.';
      case 'server':
        return 'Server is temporarily unavailable. We\'re working to fix this.';
      case 'client':
        return 'There was an issue with your request. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const errorType = getErrorType(error);
  const canRetry = retryState.retryCount < maxRetries;
  const isMaxRetriesReached = retryState.retryCount >= maxRetries;

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-full',
            errorType === 'network' && !isOnline && 'bg-orange-100 text-orange-600',
            errorType === 'network' && isOnline && 'bg-blue-100 text-blue-600',
            errorType === 'server' && 'bg-red-100 text-red-600',
            errorType === 'client' && 'bg-yellow-100 text-yellow-600',
            errorType === 'unknown' && 'bg-gray-100 text-gray-600'
          )}>
            {getErrorIcon(errorType)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {title || (isMaxRetriesReached ? 'Unable to Load' : 'Loading Failed')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {description || getErrorMessage(errorType)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Retry Status */}
        {retryState.retryCount > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Retry Status</AlertTitle>
            <AlertDescription>
              Attempt {retryState.retryCount} of {maxRetries} failed.
              {canRetry && ' Trying again...'}
            </AlertDescription>
          </Alert>
        )}

        {/* Auto Retry Countdown */}
        {retryState.nextRetryIn > 0 && canRetry && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Auto retry in {Math.ceil(retryState.nextRetryIn / 1000)}s</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAutoRetry}
                className="h-auto p-1"
              >
                Cancel
              </Button>
            </div>
            <Progress 
              value={100 - (retryState.nextRetryIn / calculateRetryDelay(retryState.retryCount)) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Offline Status */}
        {!isOnline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You're Offline</AlertTitle>
            <AlertDescription>
              Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRetry}
            disabled={retryState.isRetrying || !canRetry || !isOnline}
            className="flex-1"
          >
            <RefreshCw className={cn(
              'h-4 w-4 mr-2',
              retryState.isRetrying && 'animate-spin'
            )} />
            {retryState.isRetrying 
              ? 'Retrying...' 
              : isMaxRetriesReached 
                ? 'Max Retries Reached'
                : 'Try Again'
            }
          </Button>

          {canRetry && !retryState.autoRetryEnabled && isOnline && (
            <Button
              variant="outline"
              onClick={toggleAutoRetry}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Enable Auto Retry
            </Button>
          )}
        </div>

        {/* Max Retries Reached */}
        {isMaxRetriesReached && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertTitle>Maximum Retries Reached</AlertTitle>
            <AlertDescription>
              We've tried {maxRetries} times but couldn't complete the request. 
              Please try again later or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Details (Development/Debug) */}
        {showErrorDetails && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">
              Error Details
            </summary>
            <Alert className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <code className="text-xs bg-muted p-2 rounded block mt-2">
                  {error.message}
                </code>
                {error.stack && (
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          </details>
        )}
      </CardContent>
    </Card>
  );
};