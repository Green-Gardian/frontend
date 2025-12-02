import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";

const SuperAdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'Muhammad',
    lastName: 'Hassan',
    email: 'hassanamr@gmail.com',
    phone: '+1234567890'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    systemAlerts: true,
    userReports: true,
    securityAlerts: true
  });

  const handleProfileUpdate = () => {
    // Handle profile update logic
    console.log('Profile updated:', profileData);
  };

  const handlePasswordChange = () => {
    // Handle password change logic
    console.log('Password changed:', passwordData);
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'system', label: 'System', icon: <SettingsIcon className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-2">Manage your account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-[#1a1a1a] border-zinc-800">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card className="bg-[#1a1a1a] border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Settings</span>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-zinc-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-zinc-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>

                <Separator className="bg-zinc-800" />

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-[#1a1a1a] border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-zinc-300">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-zinc-300">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-zinc-900 border-zinc-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange} className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Change Password</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-[#1a1a1a] border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Email Notifications</h3>
                      <p className="text-zinc-400 text-sm">Receive notifications via email</p>
                    </div>
                    <Button
                      variant={notifications.emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNotificationToggle('emailNotifications')}
                    >
                      {notifications.emailNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">System Alerts</h3>
                      <p className="text-zinc-400 text-sm">Important system notifications</p>
                    </div>
                    <Button
                      variant={notifications.systemAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNotificationToggle('systemAlerts')}
                    >
                      {notifications.systemAlerts ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">User Reports</h3>
                      <p className="text-zinc-400 text-sm">Reports about user activities</p>
                    </div>
                    <Button
                      variant={notifications.userReports ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNotificationToggle('userReports')}
                    >
                      {notifications.userReports ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Security Alerts</h3>
                      <p className="text-zinc-400 text-sm">Security-related notifications</p>
                    </div>
                    <Button
                      variant={notifications.securityAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNotificationToggle('securityAlerts')}
                    >
                      {notifications.securityAlerts ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card className="bg-[#1a1a1a] border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5" />
                  <span>System Settings</span>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Auto Backup</h3>
                      <p className="text-zinc-400 text-sm">Automatically backup system data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Maintenance Mode</h3>
                      <p className="text-zinc-400 text-sm">Enable maintenance mode for system updates</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Disabled
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Debug Mode</h3>
                      <p className="text-zinc-400 text-sm">Enable debug logging for troubleshooting</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Disabled
                    </Button>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                <div className="space-y-4">
                  <h3 className="text-white font-medium">Danger Zone</h3>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-red-400 font-medium">Reset System</h4>
                        <p className="text-red-400/70 text-sm">This will reset all system settings to default</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Reset System
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
