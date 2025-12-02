import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { getUserNotificationPreferences, updateUserNotificationPreferences } from "@/services/alerts";

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await getUserNotificationPreferences();
      if (response.success && response.preferences) {
        setPreferences(response.preferences);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (alertTypeId, channel) => {
    try {
      const updatedPreferences = preferences.map(pref => {
        if (pref.alert_type_id === alertTypeId) {
          return {
            ...pref,
            [channel]: !pref[channel]
          };
        }
        return pref;
      });

      setPreferences(updatedPreferences);

      // Update backend
      const preferenceToUpdate = updatedPreferences.find(p => p.alert_type_id === alertTypeId);
      if (preferenceToUpdate) {
        await updateUserNotificationPreferences({
          alertTypeId,
          emailEnabled: preferenceToUpdate.email_enabled,
          smsEnabled: preferenceToUpdate.sms_enabled,
          pushEnabled: preferenceToUpdate.push_enabled
        });
      }
    } catch (error) {
      console.error("Error updating preference:", error);
      // Revert on error
      fetchPreferences();
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "push":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelLabel = (channel) => {
    switch (channel) {
      case "email":
        return "Email";
      case "sms":
        return "SMS";
      case "push":
        return "Push";
      default:
        return channel;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
        <p className="text-gray-600">Manage how you receive alerts and notifications</p>
      </div>

      <div className="grid gap-6">
        {preferences.map((preference) => (
          <Card key={preference.alert_type_id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                {preference.alert_type_name || "System Alerts"}
              </CardTitle>
              <CardDescription>
                Configure notification channels for {preference.alert_type_name?.toLowerCase() || "system"} alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getChannelIcon("email")}
                    <div>
                      <Label htmlFor={`email-${preference.alert_type_id}`} className="text-sm font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-xs text-gray-500">Receive alerts via email</p>
                    </div>
                  </div>
                  <Switch
                    id={`email-${preference.alert_type_id}`}
                    checked={preference.email_enabled}
                    onCheckedChange={() => handleToggle(preference.alert_type_id, "email_enabled")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getChannelIcon("sms")}
                    <div>
                      <Label htmlFor={`sms-${preference.alert_type_id}`} className="text-sm font-medium">
                        SMS Notifications
                      </Label>
                      <p className="text-xs text-gray-500">Receive alerts via text message</p>
                    </div>
                  </div>
                  <Switch
                    id={`sms-${preference.alert_type_id}`}
                    checked={preference.sms_enabled}
                    onCheckedChange={() => handleToggle(preference.alert_type_id, "sms_enabled")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getChannelIcon("push")}
                    <div>
                      <Label htmlFor={`push-${preference.alert_type_id}`} className="text-sm font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-xs text-gray-500">Receive alerts via push notifications</p>
                    </div>
                  </div>
                  <Switch
                    id={`push-${preference.alert_type_id}`}
                    checked={preference.push_enabled}
                    onCheckedChange={() => handleToggle(preference.alert_type_id, "push_enabled")}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {preference.alert_type_priority || "Medium"} Priority
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {preference.alert_type_description || "System generated alerts"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {preferences.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Alert Types Available</h3>
            <p className="text-gray-500">Contact your administrator to configure alert types.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationPreferences;
