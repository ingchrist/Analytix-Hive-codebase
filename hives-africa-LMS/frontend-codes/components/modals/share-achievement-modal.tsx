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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { toast } from "sonner"
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Link,
  Copy,
  Download,
  Share2,
  Award,
  CheckCircle,
  Users,
  Globe,
  Lock,
} from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  points: number
  rarity: string
  unlockedAt?: string
}

interface ShareAchievementModalProps {
  isOpen: boolean
  onClose: () => void
  achievement: Achievement | null
}

export default function ShareAchievementModal({ isOpen, onClose, achievement }: ShareAchievementModalProps) {
  const [shareMethod, setShareMethod] = useState<"social" | "link" | "email" | "embed">("social")
  const [customMessage, setCustomMessage] = useState("")
  const [includeStats, setIncludeStats] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [shareLink, setShareLink] = useState("")

  if (!achievement) return null

  const generateShareLink = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const link = `https://lms.example.com/achievements/${achievement.id}?public=${isPublic}`
      setShareLink(link)

    
      toast.success("Share link generated", {
        description: "Your achievement share link is ready",
      })
    } catch (error) {
    
      toast.error("Error", {
        description: "Failed to generate share link",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard", {
        description: "Share link has been copied",
      })
    } catch (error) {
    
      toast.error("Copy failed", {
        description: "Failed to copy to clipboard",
      })
    }
  }

  const shareToSocial = (platform: string) => {
    const message = customMessage || `I just earned the "${achievement.title}" achievement! 🏆`
    const url = shareLink || `https://lms.example.com/achievements/${achievement.id}`

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
      case "instagram":
        copyToClipboard(`${message} ${url}`)
      
        toast.success("Ready for Instagram", {
        description: "Message copied! Paste it in your Instagram post",
      })
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  const sendEmail = async () => {
    if (!recipientEmail) {
      
      toast.error("Email required", {
        description: "Please enter a recipient email addressl",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Email sent", {
        description: `Achievement shared with ${recipientEmail}`,
      })

      setRecipientEmail("")
    } catch (error) {
      toast.error("Email failedr", {
        description: "Failed to send email. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCertificate = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate certificate download
      const link = document.createElement("a")
      link.href = "/placeholder-certificate.pdf"
      link.download = `${achievement.title.replace(/\s+/g, "_")}_Certificate.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Certificate downloaded", {
        description: `Your achievement certificate has been downloaded`,
      })
    } catch (error) {
        toast.success("Download failed", {
        description: `Failed to download certificate`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getEmbedCode = () => {
    return `<iframe src="https://lms.example.com/embed/achievement/${achievement.id}" width="400" height="200" frameborder="0"></iframe>`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Achievement</span>
          </DialogTitle>
          <DialogDescription>Share your {achievement.title} achievement with others</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achievement Preview */}
          <div className="bg-gradient-to-r from-[#fdb606]/10 to-[#f39c12]/10 border border-[#fdb606]/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#fdb606] rounded-full">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{achievement.title}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-[#fdb606] text-white">{achievement.points} points</Badge>
                  <Badge variant="outline">{achievement.rarity}</Badge>
                  <span className="text-xs text-gray-500">
                    Earned on {new Date(achievement.unlockedAt || "").toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Method Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: "social", label: "Social Media", icon: Users },
              { id: "link", label: "Share Link", icon: Link },
              { id: "email", label: "Email", icon: Mail },
              { id: "embed", label: "Embed", icon: Globe },
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
                  <p className="font-medium">Public Sharing</p>
                  <p className="text-sm text-gray-600">Allow others to view without login</p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* Include Stats */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Include Statistics</p>
                <p className="text-sm text-gray-600">Show points and rarity information</p>
              </div>
              <Switch checked={includeStats} onCheckedChange={setIncludeStats} />
            </div>

            {/* Custom Message */}
            <div>
              <Label htmlFor="customMessage">Custom Message (Optional)</Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={`I just earned the "${achievement.title}" achievement! 🏆`}
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("facebook")}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                >
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("twitter")}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                >
                  <Twitter className="h-6 w-6 text-blue-400" />
                  <span className="text-sm">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("linkedin")}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                >
                  <Linkedin className="h-6 w-6 text-blue-700" />
                  <span className="text-sm">LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial("instagram")}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                >
                  <Instagram className="h-6 w-6 text-pink-600" />
                  <span className="text-sm">Instagram</span>
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
                <div className="flex space-x-2">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button onClick={() => copyToClipboard(shareLink)} size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {shareMethod === "email" && (
            <div className="space-y-4">
              <h4 className="font-medium">Send via Email</h4>
              <div>
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="mt-1"
                />
              </div>
              <Button onClick={sendEmail} disabled={isLoading || !recipientEmail} className="w-full">
                {isLoading ? "Sending..." : "Send Email"}
              </Button>
            </div>
          )}

          {shareMethod === "embed" && (
            <div className="space-y-4">
              <h4 className="font-medium">Embed Code</h4>
              <div>
                <Label>HTML Embed Code</Label>
                <Textarea value={getEmbedCode()} readOnly className="mt-1 h-20 font-mono text-sm" />
              </div>
              <Button onClick={() => copyToClipboard(getEmbedCode())} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={downloadCertificate} variant="outline" disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? "Downloading..." : "Download Certificate"}
          </Button>
          <Button onClick={onClose} className="bg-[#fdb606] hover:bg-[#f39c12]">
            <CheckCircle className="h-4 w-4 mr-2" />
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
