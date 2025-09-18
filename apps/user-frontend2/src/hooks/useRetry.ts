import { useState, useCallback, useRef, useEffect } from 'react';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  exponentialBackoff?: boolean;
  maxDelay?: number;
  jitter?: boolean;
  autoRetry?: boolean;
  retryCondition?: (error: Error) => boolean;
}

export interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
  nextRetryIn: number;
  canRetry: boolean;
}

export interface RetryActions {
  retry: () => Promise<void>;
  reset: () => void;
  cancel: () => void;
  setAutoRetry: (enabled: boolean) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  exponentialBackoff: true,
  maxDelay: 30000,
  jitter: true,
  autoRetry: false,
  retryCondition: () => true
};

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {}
): [RetryState, RetryActions] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    nextRetryIn: 0,
    canRetry: true
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const autoRetryEnabledRef = useRef(opts.autoRetry);

  // Calculate delay with exponential backoff and jitter
  const calculateDelay = useCallback((retryCount: number): number => {
    let delay = opts.initialDelay;
    
    if (opts.exponentialBackoff) {
      delay = opts.initialDelay * Math.pow(2, retryCount);
    }
    
    // Add jitter to prevent thundering herd
    if (opts.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return Math.min(delay, opts.maxDelay);
  }, [opts.initialDelay, opts.exponentialBackoff, opts.jitter, opts.maxDelay]);

  // Check if we should retry based on error and retry count
  const shouldRetry = useCallback((error: Error, retryCount: number): boolean => {
    if (retryCount >= opts.maxRetries) return false;
    return opts.retryCondition(error);
  }, [opts.maxRetries, opts.retryCondition]);

  // Execute the async function with retry logic
  const executeWithRetry = useCallback(async (isAutoRetry = false): Promise<T | void> => {
    if (state.isRetrying && !isAutoRetry) return;

    setState(prev => ({
      ...prev,
      isRetrying: true,
      nextRetryIn: 0
    }));

    try {
      const result = await asyncFunction();
      
      // Success - reset state
      setState({
        isRetrying: false,
        retryCount: 0,
        lastError: null,
        nextRetryIn: 0,
        canRetry: true
      });
      
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const newRetryCount = state.retryCount + 1;
      const canRetryAgain = shouldRetry(err, newRetryCount);
      
      setState(prev => ({
        ...prev,
        isRetrying: false,
        retryCount: newRetryCount,
        lastError: err,
        canRetry: canRetryAgain
      }));

      // Schedule auto retry if enabled and possible
      if (canRetryAgain && autoRetryEnabledRef.current) {
        const delay = calculateDelay(newRetryCount);
        
        setState(prev => ({ ...prev, nextRetryIn: delay }));
        
        // Start countdown
        intervalRef.current = setInterval(() => {
          setState(prev => {
            const newNextRetryIn = prev.nextRetryIn - 1000;
            
            if (newNextRetryIn <= 0) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              return { ...prev, nextRetryIn: 0 };
            }
            
            return { ...prev, nextRetryIn: newNextRetryIn };
          });
        }, 1000);
        
        // Schedule retry
        timeoutRef.current = setTimeout(() => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          executeWithRetry(true);
        }, delay);
      }
      
      throw err;
    }
  }, [asyncFunction, state.isRetrying, state.retryCount, shouldRetry, calculateDelay]);

  // Manual retry function
  const retry = useCallback(async (): Promise<void> => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    await executeWithRetry();
  }, [executeWithRetry]);

  // Reset retry state
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      nextRetryIn: 0,
      canRetry: true
    });
  }, []);

  // Cancel pending retries
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setState(prev => ({
      ...prev,
      isRetrying: false,
      nextRetryIn: 0
    }));
  }, []);

  // Set auto retry enabled/disabled
  const setAutoRetry = useCallback((enabled: boolean) => {
    autoRetryEnabledRef.current = enabled;
    
    if (!enabled) {
      cancel();
    }
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return [
    state,
    {
      retry,
      reset,
      cancel,
      setAutoRetry
    }
  ];
}

// Predefined retry conditions for common scenarios
export const retryConditions = {
  // Retry on network errors
  networkErrors: (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('connection') ||
           message.includes('timeout');
  },
  
  // Retry on server errors (5xx)
  serverErrors: (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return message.includes('500') || 
           message.includes('502') || 
           message.includes('503') || 
           message.includes('504');
  },
  
  // Retry on temporary errors (network + server)
  temporaryErrors: (error: Error): boolean => {
    return retryConditions.networkErrors(error) || retryConditions.serverErrors(error);
  },
  
  // Don't retry on client errors (4xx)
  notClientErrors: (error: Error): boolean => {
    const message = error.message.toLowerCase();
    const isClientError = message.includes('400') || 
                         message.includes('401') || 
                         message.includes('403') || 
                         message.includes('404');
    return !isClientError;
  }
};

// Hook for document loading with appropriate retry conditions
export function useDocumentRetry<T>(
  asyncFunction: () => Promise<T>,
  options: Omit<RetryOptions, 'retryCondition'> & { 
    retryCondition?: (error: Error) => boolean 
  } = {}
) {
  return useRetry(asyncFunction, {
    maxRetries: 3,
    initialDelay: 2000,
    exponentialBackoff: true,
    retryCondition: retryConditions.temporaryErrors,
    ...options
  });
}