"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Bell, Mail, MessageSquare, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NotificationSettings {
  emailNotifications: boolean
  applicationUpdates: boolean
  documentVerification: boolean
  admissionResults: boolean
  feeReminders: boolean
  systemMaintenance: boolean
  marketingEmails: boolean
  smsNotifications: boolean
  pushNotifications: boolean
}

export function NotificationTab() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    applicationUpdates: true,
    documentVerification: true,
    admissionResults: true,
    feeReminders: true,
    systemMaintenance: false,
    marketingEmails: false,
    smsNotifications: false,
    pushNotifications: true,
  })

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="text-sm text-muted-foreground">Receive notifications via email</span>
            </Label>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(value) => handleSettingChange("emailNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="application-updates" className="flex flex-col space-y-1">
              <span>Application Updates</span>
              <span className="text-sm text-muted-foreground">
                Status changes and important updates about your application
              </span>
            </Label>
            <Switch
              id="application-updates"
              checked={settings.applicationUpdates}
              onCheckedChange={(value) => handleSettingChange("applicationUpdates", value)}
              disabled={!settings.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="document-verification" className="flex flex-col space-y-1">
              <span>Document Verification</span>
              <span className="text-sm text-muted-foreground">Updates about document verification status</span>
            </Label>
            <Switch
              id="document-verification"
              checked={settings.documentVerification}
              onCheckedChange={(value) => handleSettingChange("documentVerification", value)}
              disabled={!settings.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="admission-results" className="flex flex-col space-y-1">
              <span>Admission Results</span>
              <span className="text-sm text-muted-foreground">Final admission decisions and results</span>
            </Label>
            <Switch
              id="admission-results"
              checked={settings.admissionResults}
              onCheckedChange={(value) => handleSettingChange("admissionResults", value)}
              disabled={!settings.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="fee-reminders" className="flex flex-col space-y-1">
              <span>Fee Reminders</span>
              <span className="text-sm text-muted-foreground">Payment due dates and fee-related notifications</span>
            </Label>
            <Switch
              id="fee-reminders"
              checked={settings.feeReminders}
              onCheckedChange={(value) => handleSettingChange("feeReminders", value)}
              disabled={!settings.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="system-maintenance" className="flex flex-col space-y-1">
              <span>System Maintenance</span>
              <span className="text-sm text-muted-foreground">Scheduled maintenance and system updates</span>
            </Label>
            <Switch
              id="system-maintenance"
              checked={settings.systemMaintenance}
              onCheckedChange={(value) => handleSettingChange("systemMaintenance", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
              <span>Push Notifications</span>
              <span className="text-sm text-muted-foreground">Browser notifications for important updates</span>
            </Label>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(value) => handleSettingChange("pushNotifications", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Marketing & SMS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Marketing & SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
              <span>Marketing Emails</span>
              <span className="text-sm text-muted-foreground">Promotional content and course recommendations</span>
            </Label>
            <Switch
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={(value) => handleSettingChange("marketingEmails", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
              <span>SMS Notifications</span>
              <span className="text-sm text-muted-foreground">Critical updates via text message</span>
            </Label>
            <Switch
              id="sms-notifications"
              checked={settings.smsNotifications}
              onCheckedChange={(value) => handleSettingChange("smsNotifications", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  )
}
