"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { toast } from "sonner"
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link,
  Copy,
  Share2,
  Heart,
  Users,
  Globe,
  Lock,
  Star,
  CheckCircle,
  QrCode,
} from "lucide-react"
import type { Course } from "@/types"
import Image from "next/image"

interface ShareWishlistModalProps {
  isOpen: boolean
  onClose: () => void
  courses: Course[]
}

export default function ShareWishlistModal({ isOpen, onClose, courses }: ShareWishlistModalProps) {
  const [shareMethod, setShareMethod] = useState<"social" | "link" | "email" | "qr">("social")
  const [customMessage, setCustomMessage] = useState("")
  const [includeDetails, setIncludeDetails] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [recipientEmails, setRecipientEmails] = useState("")
  const [wishlistTitle, setWishlistTitle] = useState("My Learning Wishlist")
  const [isLoading, setIsLoading] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  const generateShareLink = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const link = `https://lms.example.com/wishlist/shared/${Date.now()}?public=${isPublic}`
      setShareLink(link)

      // Generate QR code URL (in real app, this would be an actual QR code service)
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`)

      toast( "Share link generated",
        {description: "Your wishlist share link is ready",
      })
    } catch (error) {
      toast.error( "Error",
        {description: "Failed to generate share link",
      
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast( "Copied to clipboard",
        {description: "Share link has been copied",
      })
    } catch (error) {
      toast.error( "Copy failed",
        {description: "Please copy the link manually",
      
      })
    }
  }

  const shareToSocial = (platform: string) => {
    const message = customMessage || `Check out my learning wishlist with ${courses.length} amazing courses! 📚`
    const url = shareLink || `https://lms.example.com/wishlist/shared/${Date.now()}`

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const sendEmail = async () => {
    const emails = recipientEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email)

    if (emails.length === 0) {
      toast.error( "Email required",
        {description: "Please enter at least one recipient email address",
     
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast( "Emails sent",
        {description: `Wishlist shared with ${emails.length} recipient${emails.length > 1 ? "s" : ""}`,
      })

      setRecipientEmails("")
    } catch (error) {
      toast.error( "Email failed",
        {description: "Failed to send emails. Please try again.",
       
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalValue = courses.reduce((sum, course) => sum + course.price, 0)
  const totalDuration = courses.reduce((sum, course) => sum + course.duration, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Wishlist</span>
          </DialogTitle>
          <DialogDescription>Share your learning wishlist with friends, family, or colleagues</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wishlist Preview */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-pink-500 rounded-full">
                <Heart className="h-6 w-6 text-white fill-current" />
              </div>
              <div className="flex-1">
                <Input
                  value={wishlistTitle}
                  onChange={(e) => setWishlistTitle(e.target.value)}
                  className="text-lg font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                  placeholder="My Learning Wishlist"
                />
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>{courses.length} courses</span>
                  <span>${totalValue.toFixed(2)} total value</span>
                  <span>
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}m duration
                  </span>
                </div>
              </div>
            </div>

            {/* Course Preview */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {courses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center space-x-3 bg-white/50 rounded-lg p-2">
                  <Image
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={course.instructor.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{course.instructor.name}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">${course.price}</p>
                  </div>
                </div>
              ))}
              {courses.length > 3 && (
                <div className="text-center text-sm text-gray-500 py-2">+{courses.length - 3} more courses</div>
              )}
            </div>
          </div>

          {/* Share Method Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: "social", label: "Social Media", icon: Users },
              { id: "link", label: "Share Link", icon: Link },
              { id: "email", label: "Email", icon: Mail },
              { id: "qr", label: "QR Code", icon: QrCode },
            ].map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => setShareMethod(method.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    shareMethod === method.id
                      ? "bg-white text-[#fdb606] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{method.label}</span>
                </button>
              )
            })}
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            {/* Privacy Settings */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {isPublic ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-gray-600" />}
                <div>
                  <p className="font-medium">Public Wishlist</p>
                  <p className="text-sm text-gray-600">Allow anyone with the link to view</p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* Include Details */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Include Course Details</p>
                <p className="text-sm text-gray-600">Show prices, ratings, and instructor info</p>
              </div>
              <Switch checked={includeDetails} onCheckedChange={setIncludeDetails} />
            </div>

            {/* Custom Message */}
            <div>
              <Label htmlFor="customMessage">Custom Message (Optional)</Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={`Check out my learning wishlist with ${courses.length} amazing courses! 📚`}
                className="mt-1 h-20"
                maxLength={280}
              />
              <p className="text-sm text-gray-500 mt-1">{customMessage.length}/280</p>
            </div>
          </div>

          <Separator />

          {/* Share Method Content */}
          {shareMethod === "social" && (
            <div className="space-y-4">
              <h4 className="font-medium">Share on Social Media</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("facebook")}
                  className="flex items-center space-x-2 justify-start h-12"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span>Share on Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("twitter")}
                  className="flex items-center space-x-2 justify-start h-12"
                >
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <span>Share on Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("linkedin")}
                  className="flex items-center space-x-2 justify-start h-12"
                >
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <span>Share on LinkedIn</span>
                </Button>
              </div>
            </div>
          )}

          {shareMethod === "link" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Share Link</h4>
                <Button onClick={generateShareLink} disabled={isLoading} size="sm">
                  {isLoading ? "Generating..." : "Generate Link"}
                </Button>
              </div>
              {shareLink && (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input value={shareLink} readOnly className="flex-1" />
                    <Button onClick={() => copyToClipboard(shareLink)} size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Recipients can view your wishlist and even purchase courses as gifts for
                      you!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {shareMethod === "email" && (
            <div className="space-y-4">
              <h4 className="font-medium">Send via Email</h4>
              <div>
                <Label htmlFor="recipientEmails">Recipient Emails</Label>
                <Textarea
                  id="recipientEmails"
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  placeholder="friend1@example.com, friend2@example.com, family@example.com"
                  className="mt-1 h-20"
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple emails with commas</p>
              </div>
              <Button onClick={sendEmail} disabled={isLoading || !recipientEmails.trim()} className="w-full">
                {isLoading ? "Sending..." : "Send Emails"}
              </Button>
            </div>
          )}

          {shareMethod === "qr" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">QR Code</h4>
                <Button onClick={generateShareLink} disabled={isLoading} size="sm">
                  {isLoading ? "Generating..." : "Generate QR Code"}
                </Button>
              </div>
              {qrCodeUrl && (
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <Image src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-gray-600">Scan this QR code to view the wishlist on mobile devices</p>
                  <Button onClick={() => copyToClipboard(shareLink)} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-[#fdb606] hover:bg-[#f39c12]">
            <CheckCircle className="h-4 w-4 mr-2" />
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
