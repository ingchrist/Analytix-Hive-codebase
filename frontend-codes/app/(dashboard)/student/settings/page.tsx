"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {toast} from "sonner"
import {
  UserIcon,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Upload,
  X,
} from "lucide-react"
import type { User } from "@/types"
import { useDashboard } from "../studentContext"
import Image from "next/image"
interface AccountSettingsProps {
  user?: User
  onUserUpdate?: (user: User) => void
}

interface FormErrors {
  [key: string]: string
}

interface NotificationSettings {
  courseUpdates: boolean
  priceDrops: boolean
  learningReminders: boolean
  marketingEmails: boolean
  emailFrequency: string
}

interface SecuritySettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  twoFactorSMS: boolean
  twoFactorApp: boolean
}

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  bio: string
  website: string
  avatar: string
}

interface LearningPreferences {
  language: string
  autoplay: boolean
  closedCaptions: boolean
  downloadQuality: string
  dailyGoal: number
  weeklyGoal: number
}

export default function AccountSettings() {
    const { user  } = useDashboard()
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  // Form states
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user.name.split(" ")[0] || "",
    lastName: user.name.split(" ")[1] || "",
    email: user.email,
    bio: "",
    website: "",
    avatar: user.avatar,
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    courseUpdates: true,
    priceDrops: true,
    learningReminders: false,
    marketingEmails: false,
    emailFrequency: "weekly",
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorSMS: false,
    twoFactorApp: false,
  })

  const [learningPreferences, setLearningPreferences] = useState<LearningPreferences>({
    language: user.preferences.language,
    autoplay: user.preferences.autoplay,
    closedCaptions: false,
    downloadQuality: user.preferences.quality,
    dailyGoal: 30,
    weeklyGoal: 5,
  })

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: Globe },
  ]

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  }

  const validateWebsite = (website: string): boolean => {
    if (!website) return true // Optional field
    try {
      new URL(website)
      return true
    } catch {
      return false
    }
  }

  const validateProfileForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!profileData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(profileData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (profileData.website && !validateWebsite(profileData.website)) {
      newErrors.website = "Please enter a valid URL (including http:// or https://)"
    }

    if (profileData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSecurityForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!securitySettings.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!securitySettings.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (!validatePassword(securitySettings.newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters with uppercase, lowercase, and number"
    }

    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast.error(
          "File too large",
          {description: "Please select a file smaller than 2MB"

        })
        return
      }

      if (!file?.type!.startsWith("image/")) {
               toast.error(
          "Invalid file type",
          {description: "Please select an image file (JPG, PNG, GIF)"

        })
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newAvatarUrl = previewUrl // In real app, this would be the uploaded URL
      setProfileData((prev) => ({ ...prev, avatar: newAvatarUrl }))

      toast.success(
         "Photo updated successfully",
        {description: "Your profile photo has been updated",
      })

      setIsPhotoDialogOpen(false)
      setSelectedFile(null)
      setPreviewUrl("")
    } catch (error) {
      toast("Upload failed",
        {description: "Failed to upload photo. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) {
      toast.error(
   "Validation Error",
        {description: "Please fix the errors below",
      
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedUser: User = {
        ...user,
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        avatar: profileData.avatar,
      }

     

      toast.success( "Profile updated successfully",
        {description: "Your profile information has been saved",
      })
    } catch (error) {
      toast( "Update failed",
        {description: "Failed to update profile. Please try again.",
     
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!validateSecurityForm()) {
      toast.error( "Validation Error",
        {description: "Please fix the errors below",

      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset form
      setSecuritySettings({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorSMS: securitySettings.twoFactorSMS,
        twoFactorApp: securitySettings.twoFactorApp,
      })

      toast( "Password updated successfully",
        {description: "Your password has been changed",
      })
    } catch (error) {
      toast( "Update failed",
        {description: "Failed to update password. Please try again.",
               })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast( "Notifications updated",
        {description: "Your notification preferences have been saved",
      })
    } catch (error) {
      toast( "Update failed",
        {description: "Failed to update notifications. Please try again.",
               })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const updatedUser: User = {
        ...user,
        preferences: {
          language: learningPreferences.language,
          autoplay: learningPreferences.autoplay,
          quality: learningPreferences.downloadQuality,
        },
      }

      

      toast( "Preferences updated",
        {description: "Your learning preferences have been saved",
      })
    } catch (error) {
      toast( "Update failed",
        {description: "Failed to update preferences. Please try again.",
               })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast( "Account deletion initiated",
        {description: "Your account will be deleted within 24 hours. You can cancel this action by contacting support.",
               })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast( "Deletion failed",
        {description: "Failed to delete account. Please try again.",
               })
    } finally {
      setIsLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast( "Session revoked",
        {description: "The session has been successfully revoked",
      })
    } catch (error) {
      toast( "Revoke failed",
        {description: "Failed to revoke session. Please try again.",
               })
    } finally {
      setIsLoading(false)
    }
  }

  // Clear errors when switching tabs
  useEffect(() => {
    setErrors({})
  }, [activeTab])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      activeTab === tab.id ? "bg-[#fdb606]/10 text-[#fdb606] border-r-2 border-[#fdb606]" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={profileData.avatar || "/ai.png"} alt={profileData.firstName} />
                    <AvatarFallback className="text-xl sm:text-2xl">{profileData.firstName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Update Profile Photo</DialogTitle>
                          <DialogDescription>
                            Choose a new profile photo. Max size 2MB. Supported formats: JPG, PNG, GIF.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex flex-col items-center space-y-4">
                            {previewUrl ? (
                              <div className="relative">
                                <Image
                                  src={previewUrl || "/ai.png"}
                                  alt="Preview"
                                  className="w-32 h-32 rounded-full object-cover"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="absolute -top-2 -right-2 rounded-full p-1 h-8 w-8"
                                  onClick={() => {
                                    setSelectedFile(null)
                                    setPreviewUrl("")
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                <Upload className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="photo-upload"
                              />
                              <Label htmlFor="photo-upload" className="cursor-pointer">
                                <Button variant="outline" size="sm" asChild>
                                  <span>Select Photo</span>
                                </Button>
                              </Label>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handlePhotoUpload}
                            disabled={!selectedFile || isLoading}
                            className="bg-[#fdb606] hover:bg-[#f39c12]"
                          >
                            {isLoading ? "Uploading..." : "Upload Photo"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <p className="text-sm text-gray-500">JPG, GIF or PNG. Max size of 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    className={`h-24 ${errors.bio ? "border-red-500" : ""}`}
                    value={profileData.bio}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.bio && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.bio}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">{profileData.bio.length}/500</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={profileData.website}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, website: e.target.value }))}
                    className={errors.website ? "border-red-500" : ""}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.website}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isLoading} className="bg-[#fdb606] hover:bg-[#f39c12]">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">Course Updates</h4>
                      <p className="text-sm text-gray-500">Get notified when instructors post new content</p>
                    </div>
                    <Switch
                      checked={notificationSettings.courseUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, courseUpdates: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">Price Drops</h4>
                      <p className="text-sm text-gray-500">Alert me when wishlist courses go on sale</p>
                    </div>
                    <Switch
                      checked={notificationSettings.priceDrops}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, priceDrops: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">Learning Reminders</h4>
                      <p className="text-sm text-gray-500">Remind me to continue my courses</p>
                    </div>
                    <Switch
                      checked={notificationSettings.learningReminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, learningReminders: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-gray-500">Receive promotional content and course recommendations</p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({ ...prev, marketingEmails: checked }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Email Frequency</h4>
                  <Select
                    value={notificationSettings.emailFrequency}
                    onValueChange={(value) => setNotificationSettings((prev) => ({ ...prev, emailFrequency: value }))}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleNotificationSave}
                    disabled={isLoading}
                    className="bg-[#fdb606] hover:bg-[#f39c12]"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className={errors.currentPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className={errors.newPassword ? "border-red-500" : ""}
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.newPassword}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className="bg-[#fdb606] hover:bg-[#f39c12]"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">SMS Authentication</h4>
                      <p className="text-sm text-gray-500">Receive verification codes via SMS</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorSMS}
                      onCheckedChange={(checked) => {
                        setSecuritySettings((prev) => ({ ...prev, twoFactorSMS: checked }))
                        toast(
                          checked ? "SMS 2FA Enabled" : "SMS 2FA Disabled",
                          {description: checked
                            ? "You will receive SMS codes for verification"
                            : "SMS verification has been disabled",
                        })
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">Authenticator App</h4>
                      <p className="text-sm text-gray-500">Use an authenticator app for verification</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorApp}
                      onCheckedChange={(checked) => {
                        setSecuritySettings((prev) => ({ ...prev, twoFactorApp: checked }))
                        toast( checked ? "App 2FA Enabled" : "App 2FA Disabled",
                          {description: checked
                            ? "Use your authenticator app for verification"
                            : "App verification has been disabled",
                        })
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-gray-500">Chrome on Windows • New York, NY</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <p className="font-medium">Mobile App</p>
                        <p className="text-sm text-gray-500">iPhone • 2 hours ago</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => revokeSession("mobile")} disabled={isLoading}>
                        Revoke
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <p className="font-medium">Safari on Mac</p>
                        <p className="text-sm text-gray-500">MacBook Pro • Yesterday</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => revokeSession("safari")} disabled={isLoading}>
                        Revoke
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing Settings */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/25</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge>Default</Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Add New Payment Method
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <p className="font-medium">Complete React Developer Course</p>
                        <p className="text-sm text-gray-500">January 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$89.99</p>
                        <Button variant="ghost" size="sm">
                          Download Receipt
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <p className="font-medium">JavaScript Fundamentals</p>
                        <p className="text-sm text-gray-500">January 10, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$69.99</p>
                        <Button variant="ghost" size="sm">
                          Download Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Learning Preferences */}
          {activeTab === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={learningPreferences.language}
                    onValueChange={(value) => setLearningPreferences((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">Autoplay Videos</h4>
                      <p className="text-sm text-gray-500">Automatically play next lecture</p>
                    </div>
                    <Switch
                      checked={learningPreferences.autoplay}
                      onCheckedChange={(checked) => setLearningPreferences((prev) => ({ ...prev, autoplay: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">Closed Captions</h4>
                      <p className="text-sm text-gray-500">Show subtitles by default</p>
                    </div>
                    <Switch
                      checked={learningPreferences.closedCaptions}
                      onCheckedChange={(checked) =>
                        setLearningPreferences((prev) => ({ ...prev, closedCaptions: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium">Download Quality</h4>
                      <p className="text-sm text-gray-500">Default quality for offline downloads</p>
                    </div>
                    <Select
                      value={learningPreferences.downloadQuality}
                      onValueChange={(value) => setLearningPreferences((prev) => ({ ...prev, downloadQuality: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="480p">480p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Learning Goals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dailyGoal">Daily Learning Goal (minutes)</Label>
                      <Input
                        id="dailyGoal"
                        type="number"
                        min="5"
                        max="480"
                        value={learningPreferences.dailyGoal}
                        onChange={(e) =>
                          setLearningPreferences((prev) => ({
                            ...prev,
                            dailyGoal: Number.parseInt(e.target.value) || 30,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="weeklyGoal">Weekly Learning Goal (hours)</Label>
                      <Input
                        id="weeklyGoal"
                        type="number"
                        min="1"
                        max="40"
                        value={learningPreferences.weeklyGoal}
                        onChange={(e) =>
                          setLearningPreferences((prev) => ({
                            ...prev,
                            weeklyGoal: Number.parseInt(e.target.value) || 5,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePreferencesSave}
                    disabled={isLoading}
                    className="bg-[#fdb606] hover:bg-[#f39c12]"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-gray-500">Permanently delete your account and all associated data</p>
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    from our servers including:
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• All course progress and certificates</p>
                  <p>• Purchase history and receipts</p>
                  <p>• Personal information and preferences</p>
                  <p>• Achievements and learning analytics</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This action is irreversible. Your account will be deleted within 24 hours.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      "Yes, delete my account"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
