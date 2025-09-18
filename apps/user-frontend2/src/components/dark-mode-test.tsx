import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Calendar,
  User,
  Mail,
  Phone
} from "lucide-react";

/**
 * Dark Mode Compatibility Test Component
 * This component tests all UI components in both light and dark themes
 * to identify and verify dark mode compatibility issues
 */
export function DarkModeTest() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dark Mode Compatibility Test</h1>
            <p className="text-muted-foreground mt-2">
              Testing all UI components for dark mode compatibility
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Testing all button variants and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled Outline</Button>
              <Button variant="secondary" disabled>Disabled Secondary</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Testing inputs, selects, and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Input</label>
                <Input placeholder="Enter text here..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Input</label>
                <Input type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Input</label>
                <Input type="password" placeholder="Password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Dropdown</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Disabled Input</label>
              <Input disabled placeholder="This input is disabled" />
            </div>
          </CardContent>
        </Card>

        {/* Badges and Status Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Badges and Status Indicators</CardTitle>
            <CardDescription>Testing badge variants and status colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-success text-success-foreground">Success</Badge>
              <Badge className="bg-warning text-warning-foreground">Warning</Badge>
              <Badge className="bg-primary text-primary-foreground">Primary</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicators</CardTitle>
            <CardDescription>Testing progress bars with different values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Default Progress</span>
                <span>65%</span>
              </div>
              <Progress value={65} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Success Progress</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="progress-success" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Warning Progress</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="progress-warning" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Danger Progress</span>
                <span>25%</span>
              </div>
              <Progress value={25} className="progress-danger" />
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Components</CardTitle>
            <CardDescription>Testing alert variants and visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is a default alert with information content.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                This is a destructive alert indicating an error or warning.
              </AlertDescription>
            </Alert>
            <Alert className="border-success/50 text-success dark:border-success [&>svg]:text-success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                This is a success alert indicating completion or success.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Table Components</CardTitle>
            <CardDescription>Testing table styling and readability</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-success border-success">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jane Smith</TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell>Professor</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-warning border-warning">
                      Pending
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bob Johnson</TableCell>
                  <TableCell>bob@example.com</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-destructive border-destructive">
                      Inactive
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Icons and Interactive Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Icons and Interactive Elements</CardTitle>
            <CardDescription>Testing icon visibility and interactive states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                <User className="h-5 w-5 text-primary" />
                <span className="text-sm">User Profile</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                <Mail className="h-5 w-5 text-success" />
                <span className="text-sm">Messages</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                <Calendar className="h-5 w-5 text-warning" />
                <span className="text-sm">Calendar</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                <Phone className="h-5 w-5 text-destructive" />
                <span className="text-sm">Contact</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Contrast Test */}
        <Card>
          <CardHeader>
            <CardTitle>Color Contrast Test</CardTitle>
            <CardDescription>Testing text readability and contrast ratios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Primary Text</h4>
                <p className="text-foreground">
                  This is primary text content that should have high contrast.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-muted-foreground">Muted Text</h4>
                <p className="text-muted-foreground">
                  This is muted text content for secondary information.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                <h5 className="font-semibold">Primary Background</h5>
                <p className="text-sm">Text on primary background</p>
              </div>
              <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                <h5 className="font-semibold">Secondary Background</h5>
                <p className="text-sm">Text on secondary background</p>
              </div>
              <div className="p-4 bg-muted text-muted-foreground rounded-lg">
                <h5 className="font-semibold">Muted Background</h5>
                <p className="text-sm">Text on muted background</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}