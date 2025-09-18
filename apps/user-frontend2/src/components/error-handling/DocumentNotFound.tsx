import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileX, 
  RefreshCw, 
  Home, 
  Calendar,
  Clock,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DocumentNotFoundProps {
  documentType: 'calendar' | 'timetable' | 'document';
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  showFallbackContent?: boolean;
  fallbackContent?: React.ReactNode;
  lastUpdated?: string;
  expectedLocation?: string;
}

export const DocumentNotFound: React.FC<DocumentNotFoundProps> = ({
  documentType,
  onRetry,
  onGoHome,
  className = '',
  showFallbackContent = false,
  fallbackContent,
  lastUpdated,
  expectedLocation
}) => {
  const getDocumentInfo = () => {
    switch (documentType) {
      case 'calendar':
        return {
          title: 'Academic Calendar Not Found',
          description: 'The academic calendar document is currently unavailable.',
          icon: <Calendar className="h-8 w-8 text-muted-foreground" />,
          suggestions: [
            'The academic calendar may not have been uploaded yet for this academic year',
            'Check with your academic office for the latest calendar',
            'Try refreshing the page in case of a temporary issue'
          ]
        };
      case 'timetable':
        return {
          title: 'Timetable Not Found',
          description: 'The timetable document is currently unavailable for your section.',
          icon: <Clock className="h-8 w-8 text-muted-foreground" />,
          suggestions: [
            'The timetable may not have been uploaded yet for your section',
            'Contact your academic coordinator for the latest timetable',
            'Check if you are enrolled in the correct section'
          ]
        };
      default:
        return {
          title: 'Document Not Found',
          description: 'The requested document is currently unavailable.',
          icon: <FileX className="h-8 w-8 text-muted-foreground" />,
          suggestions: [
            'The document may have been moved or deleted',
            'Check if you have the correct permissions to access this document',
            'Try refreshing the page or contact support'
          ]
        };
    }
  };

  const { title, description, icon, suggestions } = getDocumentInfo();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-muted-foreground">{description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Document Info */}
          {(lastUpdated || expectedLocation) && (
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>Document Information</AlertTitle>
              <AlertDescription className="space-y-1">
                {lastUpdated && (
                  <p>Last known update: {new Date(lastUpdated).toLocaleDateString()}</p>
                )}
                {expectedLocation && (
                  <p>Expected location: {expectedLocation}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Suggestions */}
          <div>
            <h4 className="font-medium mb-3">Possible reasons:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Fallback Content */}
          {showFallbackContent && fallbackContent && (
            <div>
              <h4 className="font-medium mb-3">Alternative Information:</h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                {fallbackContent}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={handleGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            If this problem persists, please contact your academic office or IT support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Specific components for different document types
export const CalendarNotFound: React.FC<Omit<DocumentNotFoundProps, 'documentType'>> = (props) => (
  <DocumentNotFound {...props} documentType="calendar" />
);

export const TimetableNotFound: React.FC<Omit<DocumentNotFoundProps, 'documentType'>> = (props) => (
  <DocumentNotFound {...props} documentType="timetable" />
);