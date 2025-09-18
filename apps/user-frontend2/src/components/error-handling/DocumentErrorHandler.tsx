import React, { useState, useCallback, useEffect } from 'react';
import { ErrorBoundary, RetryableError, NetworkError, DocumentNotFound } from './index';
import { DocumentNotFoundError, NetworkError as NetworkErrorClass, ServerError } from '@/lib/documentService';
import { useDocumentRetry } from '@/hooks/useRetry';

export interface DocumentErrorHandlerProps {
  children: React.ReactNode;
  documentType: 'calendar' | 'timetable';
  onRetry?: () => Promise<void>;
  fallbackContent?: React.ReactNode;
  className?: string;
}

export const DocumentErrorHandler: React.FC<DocumentErrorHandlerProps> = ({
  children,
  documentType,
  onRetry,
  fallbackContent,
  className = ''
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Retry logic with exponential backoff
  const [retryState, retryActions] = useDocumentRetry(
    async () => {
      if (onRetry) {
        await onRetry();
      }
    },
    {
      maxRetries: 3,
      initialDelay: 2000,
      autoRetry: false // Manual retry only for document loading
    }
  );

  const handleError = useCallback((error: Error) => {
    console.error(`${documentType} document error:`, error);
    setError(error);
  }, [documentType]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setError(null);
    
    try {
      await retryActions.retry();
      setError(null);
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      setError(retryError instanceof Error ? retryError : new Error(String(retryError)));
    } finally {
      setIsRetrying(false);
    }
  }, [retryActions]);

  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  // Reset error when children change (e.g., new document loaded)
  useEffect(() => {
    setError(null);
    retryActions.reset();
  }, [children, retryActions]);

  // Render error UI based on error type
  const renderError = () => {
    if (!error) return null;

    // Document not found error
    if (error instanceof DocumentNotFoundError || error.name === 'DocumentNotFoundError') {
      return (
        <DocumentNotFound
          documentType={documentType}
          onRetry={onRetry ? handleRetry : undefined}
          onGoHome={handleGoHome}
          className={className}
          showFallbackContent={!!fallbackContent}
          fallbackContent={fallbackContent}
        />
      );
    }

    // Network error
    if (error instanceof NetworkErrorClass || 
        error.name === 'NetworkError' || 
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch') ||
        !navigator.onLine) {
      return (
        <NetworkError
          onRetry={onRetry ? handleRetry : undefined}
          className={className}
          autoRetryOnReconnect={true}
          title={`${documentType === 'calendar' ? 'Academic Calendar' : 'Timetable'} Connection Issue`}
          description={`Unable to load the ${documentType}. Please check your connection and try again.`}
        />
      );
    }

    // Server error or other retryable errors
    if (error instanceof ServerError || 
        error.name === 'ServerError' ||
        error.message.includes('500') ||
        error.message.includes('502') ||
        error.message.includes('503')) {
      return (
        <RetryableError
          error={error}
          onRetry={handleRetry}
          maxRetries={3}
          currentRetry={retryState.retryCount}
          autoRetry={false}
          className={className}
          title={`${documentType === 'calendar' ? 'Academic Calendar' : 'Timetable'} Server Error`}
          description="The server is temporarily unavailable. We'll keep trying to load your document."
          showErrorDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    // Generic retryable error
    return (
      <RetryableError
        error={error}
        onRetry={handleRetry}
        maxRetries={3}
        currentRetry={retryState.retryCount}
        autoRetry={false}
        className={className}
        title={`Failed to Load ${documentType === 'calendar' ? 'Academic Calendar' : 'Timetable'}`}
        description="An unexpected error occurred while loading the document."
        showErrorDetails={process.env.NODE_ENV === 'development'}
      />
    );
  };

  // Show error UI if there's an error
  if (error) {
    return renderError();
  }

  // Show loading state during retry
  if (isRetrying) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Retrying...</p>
        </div>
      </div>
    );
  }

  // Wrap children in error boundary
  return (
    <ErrorBoundary
      onError={handleError}
      resetKeys={[documentType]}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
};

// Higher-order component for easier usage
export const withDocumentErrorHandler = <P extends object>(
  Component: React.ComponentType<P>,
  documentType: 'calendar' | 'timetable',
  options?: {
    fallbackContent?: React.ReactNode;
    className?: string;
  }
) => {
  const WrappedComponent = (props: P & { onRetry?: () => Promise<void> }) => {
    const { onRetry, ...componentProps } = props;
    
    return (
      <DocumentErrorHandler
        documentType={documentType}
        onRetry={onRetry}
        fallbackContent={options?.fallbackContent}
        className={options?.className}
      >
        <Component {...(componentProps as P)} />
      </DocumentErrorHandler>
    );
  };

  WrappedComponent.displayName = `withDocumentErrorHandler(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};