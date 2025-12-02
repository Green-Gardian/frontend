"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Lock, Save, Eye, EyeOff, Loader2, ImagePlus, X, Mail, Phone, KeyRound, Shield } from "lucide-react"
import imageCompression from "browser-image-compression"

import { getProfileData, changePassword, updateProfile } from "../../services/auth"
import { uploadToCloudinary } from "../../utils/upload-to-cloudinary"
import MFASetup from "../../components/MFASetup"

export default function SettingsPage() {
  // Profile state
  const [profileData, setProfileData] = useState({})
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState("")
  const [initialProfileImageUrl, setInitialProfileImageUrl] = useState("")
  const [hasNewProfileImage, setHasNewProfileImage] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Security state
  const [securityBtnLoading, setSecurityBtnLoading] = useState(false)
  const [profileBtnLoading, setProfileBtnLoading] = useState(false)
  const [securityBtnDisabled, setSecurityBtnDisabled] = useState(false)
  const [profileBtnDisabled, setProfileBtnDisabled] = useState(false)

  // Notification state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    systemAlerts: true,
    userReports: true,
    securityAlerts: true,
  })

  // Error and success messages
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Default tab state
  const [defaultTab, setDefaultTab] = useState("profile")

  useEffect(() => {
    const fetchProfileData = async () => {
      const data = await getProfileData()

      console.log("Profile data fetched:", data.user)

      if (!data.error) {
        setProfileData(data.user)
        const backendImageUrl = (data.user && (data.user.profile_picture || data.user.avatar_url)) || ""
        setInitialProfileImageUrl(backendImageUrl)
        setProfileImagePreview(backendImageUrl)
      }
    }
    fetchProfileData()

    // Check if MFA setup is required from URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("mfa_setup") === "true") {
      setDefaultTab("security")
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleProfileUpdate = async () => {
    if (profileBtnLoading || profileBtnDisabled || isUploadingImage) return

    setProfileBtnLoading(true)
    setProfileBtnDisabled(true)

    let compressedFile = profileImageFile
    if (profileImageFile) {
      try {
        compressedFile = await imageCompression(profileImageFile, { quality: 0.6 })
      } catch (error) {
        console.error("Error compressing image:", error)
        setError("Failed to compress image.")
        setProfileBtnLoading(false)
        setProfileBtnDisabled(false)
        return
      }
    }

    const response = await updateProfile({
      ...profileData,
      profile_picture: compressedFile ? await uploadToCloudinary(compressedFile) : initialProfileImageUrl,
    })

    if (response.error) {
      setError(response.error)
    } else {
      setError("")
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
      setHasNewProfileImage(false)
      setIsUploadingImage(false)
    }

    setProfileBtnLoading(false)
    setProfileBtnDisabled(false)
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match!")
      return
    }

    const changePasswordFunc = async () => {
      setSecurityBtnLoading(true)
      setSecurityBtnDisabled(true)

      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      })

      if (response.error) {
        setError(response.error)
      } else {
        setError("")
        setSuccess("Password changed successfully!")
        setTimeout(() => setSuccess(""), 3000)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setShowPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
      }

      setSecurityBtnLoading(false)
      setSecurityBtnDisabled(false)
    }
    changePasswordFunc()
  }

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // Basic validation: limit to 5MB
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setError("Please choose an image smaller than 5MB.")
      setTimeout(() => setError(""), 3000)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setProfileImageFile(file)
    setHasNewProfileImage(true)

    // Create preview URL for immediate display
    const previewUrl = URL.createObjectURL(file)
    setProfileImagePreview(previewUrl)
  }

  const handleRemoveImage = () => {
    setProfileImageFile(null)
    setHasNewProfileImage(false)
    setProfileImagePreview(initialProfileImageUrl || "")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-[#121212]">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and system preferences</p>
      </div>

      {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">{error}</div>}

      {success && (
        <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">{success}</div>
      )}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          {/* <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Preferences
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#121212] flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-gray-700">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {(profileBtnLoading || isUploadingImage) && (
                      <div aria-hidden="true" className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
                    )}
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview || "/placeholder.svg"}
                        alt="Current profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src="/diverse-user-avatars.png"
                        alt="Default avatar"
                        className="h-full w-full object-cover"
                      />
                    )}
                    {(profileBtnLoading || isUploadingImage) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-gray-700 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      id="profilePictureInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <Label
                      htmlFor="profilePictureInput"
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                        profileBtnLoading || isUploadingImage
                          ? "opacity-60 pointer-events-none"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      <ImagePlus className="h-4 w-4" />
                      {hasNewProfileImage ? "Change" : "Upload"}
                    </Label>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={profileBtnLoading || isUploadingImage}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors ${
                        profileBtnLoading || isUploadingImage
                          ? "opacity-60 pointer-events-none"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  PNG or JPG, up to 5MB. {isUploadingImage && "Uploading to Cloudinary..."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profileData.first_name || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        first_name: e.target.value,
                      })
                    }
                    className="bg-white border-gray-300 text-[#121212] focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profileData.last_name || ""}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        last_name: e.target.value,
                      })
                    }
                    className="bg-white border-gray-300 text-[#121212] focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || ""}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="bg-white border-gray-300 text-[#121212] focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profileData.phone_number || ""}
                  onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                  className="bg-white border-gray-300 text-[#121212] focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Separator className="bg-gray-200" />

              <div className="flex justify-end">
                <Button
                  onClick={handleProfileUpdate}
                  className="flex items-center space-x-2"
                  disabled={profileBtnLoading || profileBtnDisabled || isUploadingImage}
                  aria-busy={profileBtnLoading ? "true" : "false"}
                >
                  {profileBtnLoading || isUploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isUploadingImage ? "Uploading..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password tab content */}
        <TabsContent value="password" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#121212] flex items-center space-x-2">
                <KeyRound className="h-5 w-5" />
                <span>Change Password</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Update your account password to keep it secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-700">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="bg-white border-gray-300 text-[#121212] focus:border-blue-500 focus:ring-blue-500 pr-10"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#121212]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="bg-white border-gray-300 text-[#121212] focus:border-blue-500 focus:ring-blue-500 pr-10"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#121212]"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="bg-white border-gray-300 text-[#121212] focus:border-blue-500 focus:ring-blue-500 pr-10"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#121212]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div className="flex justify-end">
                <Button
                  onClick={handlePasswordChange}
                  className="flex items-center space-x-2"
                  disabled={securityBtnLoading || securityBtnDisabled}
                >
                  {securityBtnLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security tab content */}
        <TabsContent value="security" className="mt-6">
          <MFASetup />
        </TabsContent>

        {/* Notifications tab content */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#121212] flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </div>
                  <Button
                    variant={notifications.emailNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle("emailNotifications")}
                  >
                    {notifications.emailNotifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">System Alerts</h4>
                      <p className="text-sm text-muted-foreground">Receive system alerts</p>
                    </div>
                  </div>
                  <Button
                    variant={notifications.systemAlerts ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle("systemAlerts")}
                  >
                    {notifications.systemAlerts ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">User Reports</h4>
                      <p className="text-sm text-muted-foreground">Receive user reports</p>
                    </div>
                  </div>
                  <Button
                    variant={notifications.userReports ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle("userReports")}
                  >
                    {notifications.userReports ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Security Alerts</h4>
                      <p className="text-sm text-muted-foreground">Receive security alerts</p>
                    </div>
                  </div>
                  <Button
                    variant={notifications.securityAlerts ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle("securityAlerts")}
                  >
                    {notifications.securityAlerts ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences tab content */}
        <TabsContent value="preferences" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#121212] flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Display Preferences</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Customize how the application looks and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
                  </div>
                  <Button variant="outline" size="sm">
                    System
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Language</h4>
                    <p className="text-sm text-muted-foreground">Select your preferred language</p>
                  </div>
                  <Button variant="outline" size="sm">
                    English
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Time Zone</h4>
                    <p className="text-sm text-muted-foreground">Set your local time zone</p>
                  </div>
                  <Button variant="outline" size="sm">
                    UTC-5
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
