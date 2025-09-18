import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Info, 
  ExternalLink,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GracefulDegradationProps {
  type: 'calendar' | 'timetable';
  fallbackData?: any;
  contactInfo?: {
    office?: string;
    phone?: string;
    email?: string;
    location?: string;
  };
  className?: string;
}

// Fallback academic calendar data
const fallbackCalendarData = {
  academicYear: '2024-2025',
  importantDates: [
    { date: 'August 15, 2024', event: 'Semester Registration Opens' },
    { date: 'September 1, 2024', event: 'Classes Begin' },
    { date: 'October 15, 2024', event: 'Mid-term Examinations' },
    { date: 'December 20, 2024', event: 'Winter Break Begins' },
    { date: 'January 8, 2025', event: 'Classes Resume' },
    { date: 'April 15, 2025', event: 'Final Examinations' },
    { date: 'May 1, 2025', event: 'Semester Ends' }
  ],
  holidays: [
    { date: 'September 15, 2024', name: 'Independence Day' },
    { date: 'October 2, 2024', name: 'Gandhi Jayanti' },
    { date: 'November 12, 2024', name: 'Diwali' },
    { date: 'December 25, 2024', name: 'Christmas' },
    { date: 'January 26, 2025', name: 'Republic Day' },
    { date: 'March 8, 2025', name: 'Holi' }
  ]
};

// Fallback timetable data
const fallbackTimetableData = {
  schedule: [
    { time: '9:00 - 10:00 AM', monday: 'Mathematics', tuesday: 'Physics', wednesday: 'Chemistry', thursday: 'English', friday: 'Computer Science' },
    { time: '10:00 - 11:00 AM', monday: 'Physics', tuesday: 'Chemistry', wednesday: 'Mathematics', thursday: 'Computer Science', friday: 'English' },
    { time: '11:00 - 12:00 PM', monday: 'Chemistry', tuesday: 'English', wednesday: 'Physics', thursday: 'Mathematics', friday: 'Laboratory' },
    { time: '12:00 - 1:00 PM', monday: 'Break', tuesday: 'Break', wednesday: 'Break', thursday: 'Break', friday: 'Break' },
    { time: '1:00 - 2:00 PM', monday: 'English', tuesday: 'Mathematics', wednesday: 'Computer Science', thursday: 'Physics', friday: 'Laboratory' },
    { time: '2:00 - 3:00 PM', monday: 'Computer Science', tuesday: 'Laboratory', wednesday: 'English', thursday: 'Chemistry', friday: 'Mathematics' }
  ]
};

export const GracefulDegradation: React.FC<GracefulDegradationProps> = ({
  type,
  fallbackData,
  contactInfo,
  className = ''
}) => {
  const isCalendar = type === 'calendar';
  const data = fallbackData || (isCalendar ? fallbackCalendarData : fallbackTimetableData);

  const defaultContactInfo = {
    office: 'Academic Office',
    phone: '+1 (555) 123-4567',
    email: 'academic@university.edu',
    location: 'Administration Building, Room 101'
  };

  const contact = { ...defaultContactInfo, ...contactInfo };

  const renderCalendarFallback = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Academic Calendar Information</AlertTitle>
        <AlertDescription>
          The official academic calendar document is currently unavailable. 
          Here are the key dates for the {data.academicYear} academic year:
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Important Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.importantDates?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start">
                  <span className="text-sm font-medium">{item.event}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.date}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.holidays?.map((holiday: any, index: number) => (
                <div key={index} className="flex justify-between items-start">
                  <span className="text-sm font-medium">{holiday.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {holiday.date}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTimetableFallback = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Class Schedule Information</AlertTitle>
        <AlertDescription>
          The official timetable document is currently unavailable. 
          Here's a general class schedule format:
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Time</th>
                  <th className="text-left p-2 font-medium">Monday</th>
                  <th className="text-left p-2 font-medium">Tuesday</th>
                  <th className="text-left p-2 font-medium">Wednesday</th>
                  <th className="text-left p-2 font-medium">Thursday</th>
                  <th className="text-left p-2 font-medium">Friday</th>
                </tr>
              </thead>
              <tbody>
                {data.schedule?.map((row: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium text-muted-foreground">{row.time}</td>
                    <td className="p-2">{row.monday}</td>
                    <td className="p-2">{row.tuesday}</td>
                    <td className="p-2">{row.wednesday}</td>
                    <td className="p-2">{row.thursday}</td>
                    <td className="p-2">{row.friday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={cn('w-full max-w-4xl mx-auto space-y-6', className)}>
      {isCalendar ? renderCalendarFallback() : renderTimetableFallback()}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Information?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                For the most up-to-date {isCalendar ? 'academic calendar' : 'timetable'} information, 
                please contact the academic office:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.office}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.location}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href={`tel:${contact.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Office
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Note:</strong> This is fallback information displayed when the official document 
          is unavailable. Please verify all dates and schedules with the academic office for accuracy.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Specific components for different types
export const CalendarFallback: React.FC<Omit<GracefulDegradationProps, 'type'>> = (props) => (
  <GracefulDegradation {...props} type="calendar" />
);

export const TimetableFallback: React.FC<Omit<GracefulDegradationProps, 'type'>> = (props) => (
  <GracefulDegradation {...props} type="timetable" />
);