"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Share2,
  Download,
  Calendar,
  CheckCircle,
  Lock,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  FileText,
  Eye,
  AlertCircle,
  Building,
  X,
} from "lucide-react"
import type { User } from "@/types"
import { useDashboard } from "../studentContext"
import ShareAchievementModal from "@/components/modals/share-achievement-modal"
import ExportDataModal from "@/components/modals/export-data-modal"
// import EditModal from "@/components/modals/edit-modal"

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  category: "learning" | "engagement" | "milestone" | "special"
  points: number
  unlockedAt?: string
  progress?: number
  maxProgress?: number
  rarity: "common" | "rare" | "epic" | "legendary"
  requirements: string[]
  isUnlocked: boolean
}

interface Certificate {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  description?: string
  skills: string[]
  fileUrl?: string
  fileName?: string
  isVerified: boolean
  createdAt: string
}

interface CertificateForm {
  name: string
  issuingOrganization: string
  issueDate: string
  expiryDate: string
  credentialId: string
  credentialUrl: string
  description: string
  skills: string
}

interface CertificateFormErrors {
  [key: string]: string
}

const achievements: Achievement[] = [
  {
    id: "first-course",
    title: "First Steps",
    description: "Complete your first course",
    icon: BookOpen,
    category: "milestone",
    points: 100,
    unlockedAt: "2024-01-15",
    rarity: "common",
    requirements: ["Complete 1 course"],
    isUnlocked: true,
  },
  {
    id: "week-streak",
    title: "Week Warrior",
    description: "Learn for 7 consecutive days",
    icon: Zap,
    category: "learning",
    points: 150,
    unlockedAt: "2024-01-20",
    rarity: "common",
    requirements: ["Learn for 7 consecutive days"],
    isUnlocked: true,
  },
  {
    id: "five-courses",
    title: "Knowledge Seeker",
    description: "Complete 5 courses",
    icon: Trophy,
    category: "milestone",
    points: 300,
    progress: 3,
    maxProgress: 5,
    rarity: "rare",
    requirements: ["Complete 5 courses"],
    isUnlocked: false,
  },
  {
    id: "perfect-score",
    title: "Perfectionist",
    description: "Score 100% on 3 quizzes",
    icon: Star,
    category: "engagement",
    points: 200,
    progress: 1,
    maxProgress: 3,
    rarity: "rare",
    requirements: ["Score 100% on 3 quizzes"],
    isUnlocked: false,
  },
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Complete lessons before 8 AM for 5 days",
    icon: Clock,
    category: "learning",
    points: 250,
    progress: 2,
    maxProgress: 5,
    rarity: "epic",
    requirements: ["Complete lessons before 8 AM for 5 days"],
    isUnlocked: false,
  },
  {
    id: "social-learner",
    title: "Social Learner",
    description: "Participate in 10 course discussions",
    icon: Users,
    category: "engagement",
    points: 180,
    progress: 4,
    maxProgress: 10,
    rarity: "rare",
    requirements: ["Participate in 10 course discussions"],
    isUnlocked: false,
  },
  {
    id: "speed-learner",
    title: "Speed Demon",
    description: "Complete a course in under 24 hours",
    icon: TrendingUp,
    category: "special",
    points: 500,
    rarity: "legendary",
    requirements: ["Complete a course in under 24 hours"],
    isUnlocked: false,
  },
  {
    id: "month-streak",
    title: "Dedication Master",
    description: "Learn for 30 consecutive days",
    icon: Target,
    category: "learning",
    points: 1000,
    progress: 12,
    maxProgress: 30,
    rarity: "legendary",
    requirements: ["Learn for 30 consecutive days"],
    isUnlocked: false,
  },
]

const certificates: Certificate[] = [
  {
    id: "cert-1",
    name: "React Developer Certification",
    issuingOrganization: "Meta",
    issueDate: "2024-01-15",
    credentialId: "META-REACT-2024-001",
    credentialUrl: "https://coursera.org/verify/META-REACT-2024-001",
    description: "Advanced React development certification covering hooks, context, and performance optimization",
    skills: ["React", "JavaScript", "Frontend Development", "Component Architecture"],
    isVerified: true,
    createdAt: "2024-01-15",
  },
  {
    id: "cert-2",
    name: "AWS Cloud Practitioner",
    issuingOrganization: "Amazon Web Services",
    issueDate: "2023-12-10",
    expiryDate: "2026-12-10",
    credentialId: "AWS-CP-2023-456",
    credentialUrl: "https://aws.amazon.com/verification/AWS-CP-2023-456",
    description: "Foundational understanding of AWS Cloud concepts, services, and terminology",
    skills: ["AWS", "Cloud Computing", "Infrastructure", "Security"],
    fileUrl: "/certificates/aws-cloud-practitioner.pdf",
    fileName: "AWS_Cloud_Practitioner_Certificate.pdf",
    isVerified: true,
    createdAt: "2023-12-10",
  },
  {
    id: "cert-3",
    name: "Google Analytics Certified",
    issuingOrganization: "Google",
    issueDate: "2024-02-01",
    expiryDate: "2025-02-01",
    credentialId: "GA-CERT-2024-789",
    description: "Proficiency in Google Analytics for measuring and analyzing website performance",
    skills: ["Google Analytics", "Data Analysis", "Digital Marketing", "Web Analytics"],
    isVerified: false,
    createdAt: "2024-02-01",
  },
]

interface AchievementsProps {
  user: User
}

export default function Achievements() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("achievements")
   const {user}= useDashboard()
  // Certificate management state
  const [certificateList, setCertificateList] = useState<Certificate[]>(certificates)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
  const [isCertificateFormOpen, setIsCertificateFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [certificateErrors, setCertificateErrors] = useState<CertificateFormErrors>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [certificateForm, setCertificateForm] = useState<CertificateForm>({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    description: "",
    skills: "",
  })

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAchievementForShare, setSelectedAchievementForShare] = useState<Achievement | null>(null)
  const [editItem, setEditItem] = useState<any>(null)

  // Certificate validation functions
  const validateCertificateForm = (): boolean => {
    const newErrors: CertificateFormErrors = {}

    if (!certificateForm.name.trim()) {
      newErrors.name = "Certificate name is required"
    }

    if (!certificateForm.issuingOrganization.trim()) {
      newErrors.issuingOrganization = "Issuing organization is required"
    }

    if (!certificateForm.issueDate) {
      newErrors.issueDate = "Issue date is required"
    } else if (new Date(certificateForm.issueDate) > new Date()) {
      newErrors.issueDate = "Issue date cannot be in the future"
    }

    if (certificateForm.expiryDate && new Date(certificateForm.expiryDate) <= new Date(certificateForm.issueDate)) {
      newErrors.expiryDate = "Expiry date must be after issue date"
    }

    if (certificateForm.credentialUrl && !isValidUrl(certificateForm.credentialUrl)) {
      newErrors.credentialUrl = "Please enter a valid URL"
    }

    setCertificateErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
       toast.error("File too large", {
  description: "Please select a file smaller than 5MB"
})
        return
      }

      if (!file.type.includes("pdf") && !file.type.includes("image")) {
      toast.error("Invalid file type", {
  description: "Please select a PDF or image file"
})
        return
      }

      setSelectedFile(file)
    }
  }

  const handleCreateCertificate = () => {
    setEditingCertificate(null)
    setCertificateForm({
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      description: "",
      skills: "",
    })
    setSelectedFile(null)
    setCertificateErrors({})
    setIsCertificateFormOpen(true)
  }

  const handleEditCertificate = (certificate: Certificate) => {
    setEditingCertificate(certificate)
    setCertificateForm({
      name: certificate.name,
      issuingOrganization: certificate.issuingOrganization,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate || "",
      credentialId: certificate.credentialId || "",
      credentialUrl: certificate.credentialUrl || "",
      description: certificate.description || "",
      skills: certificate.skills.join(", "),
    })
    setSelectedFile(null)
    setCertificateErrors({})
    setIsCertificateFormOpen(true)
  }

  const handleSaveCertificate = async () => {
    if (!validateCertificateForm()) {
   
      toast.error("Validation Error", {
  description: "Please fix the errors below"
})
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const skillsArray = certificateForm.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)

      const certificateData: Certificate = {
        id: editingCertificate?.id || `cert-${Date.now()}`,
        name: certificateForm.name,
        issuingOrganization: certificateForm.issuingOrganization,
        issueDate: certificateForm.issueDate,
        expiryDate: certificateForm.expiryDate || undefined,
        credentialId: certificateForm.credentialId || undefined,
        credentialUrl: certificateForm.credentialUrl || undefined,
        description: certificateForm.description || undefined,
        skills: skillsArray,
        fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : editingCertificate?.fileUrl,
        fileName: selectedFile ? selectedFile.name : editingCertificate?.fileName,
        isVerified: editingCertificate?.isVerified || false,
        createdAt: editingCertificate?.createdAt || new Date().toISOString(),
      }

      if (editingCertificate) {
        setCertificateList((prev) => prev.map((cert) => (cert.id === editingCertificate.id ? certificateData : cert)))
       
        toast.success("Certificate updated", {
  description: "Certificate has been updated successfully"
})
      } else {
        setCertificateList((prev) => [...prev, certificateData])
            toast.success("Certificate added", {
  description: "Certificate has been added successfully"
})
      }

      setIsCertificateFormOpen(false)
    } catch (error) {
    
      toast.error("Error", {
  description: "Failed to save certificate. Please try again."
})
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCertificate = async () => {
    if (!selectedCertificate) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCertificateList((prev) => prev.filter((cert) => cert.id !== selectedCertificate.id))

  
             toast.success("Certificate deleted", {
  description: "Certificate has been deleted successfully"
})

      setIsDeleteDialogOpen(false)
      setSelectedCertificate(null)
    } catch (error) {
   
      toast.error("Error", {
  description: "Failed to delete certificate. Please try again."
})
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsCertificateModalOpen(true)
  }

  const handleShareCertificate = (certificate: Certificate) => {
    if (certificate.credentialUrl) {
      navigator.clipboard.writeText(certificate.credentialUrl)
 
             toast.success("Link copied", {
  description: "Certificate verification link copied to clipboard"
})
    } else {
             toast.success("No verification link", {
  description: "This certificate doesn't have a verification URL"
})
    }
  }

  const handleDownloadCertificate = (certificate: Certificate) => {
    if (certificate.fileUrl) {
      const link = document.createElement("a")
      link.href = certificate.fileUrl
      link.download = certificate.fileName || `${certificate.name}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

             toast.success("Download started", {
  description: "Certificate file download has started"
})
    } else {
      toast.error("No file available", {
  description: "This certificate doesn't have a downloadable file"
})
    }
  }

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked)
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0)
  const completionRate = (unlockedAchievements.length / achievements.length) * 100

  const filteredAchievements = achievements.filter((achievement) => {
    if (activeCategory === "all") return true
    return achievement.category === activeCategory
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "rare":
        return "shadow-blue-200"
      case "epic":
        return "shadow-purple-200"
      case "legendary":
        return "shadow-yellow-200"
      default:
        return ""
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "learning":
        return BookOpen
      case "engagement":
        return Users
      case "milestone":
        return Trophy
      case "special":
        return Star
      default:
        return Award
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Achievements & Certificates</h1>
          <p className="text-gray-600">
            {unlockedAchievements.length} achievements unlocked • {certificateList.length} certificates earned
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-[#fdb606]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-[#fdb606]">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">Achievement points earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{certificateList.length}</div>
            <p className="text-xs text-muted-foreground">
              {certificateList.filter((c) => c.isVerified).length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Achievements and Certificates */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="mt-6">
          {/* Achievement Categories */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="milestone">Milestone</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredAchievements.map((achievement) => {
                  const Icon = achievement.icon
                  const isLocked = !achievement.isUnlocked

                  return (
                    <Dialog key={achievement.id}>
                      <DialogTrigger asChild>
                        <Card
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            isLocked ? "opacity-60" : ""
                          } ${achievement.rarity !== "common" && !isLocked ? `shadow-lg ${getRarityGlow(achievement.rarity)}` : ""}`}
                        >
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div
                                className={`p-3 rounded-full ${
                                  isLocked
                                    ? "bg-gray-100"
                                    : achievement.rarity === "legendary"
                                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                      : achievement.rarity === "epic"
                                        ? "bg-gradient-to-r from-purple-400 to-purple-600"
                                        : achievement.rarity === "rare"
                                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                                          : "bg-[#fdb606]"
                                }`}
                              >
                                {isLocked ? (
                                  <Lock className="h-6 w-6 text-gray-400" />
                                ) : (
                                  <Icon className="h-6 w-6 text-white" />
                                )}
                              </div>
                              <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
                            </div>

                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">{achievement.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{achievement.description}</p>

                              {achievement.progress !== undefined && achievement.maxProgress && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Progress</span>
                                    <span>
                                      {achievement.progress}/{achievement.maxProgress}
                                    </span>
                                  </div>
                                  <Progress
                                    value={(achievement.progress / achievement.maxProgress) * 100}
                                    className="h-2"
                                  />
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center space-x-1">
                                  <Award className="h-4 w-4 text-[#fdb606]" />
                                  <span className="text-sm font-medium">{achievement.points} pts</span>
                                </div>
                                {achievement.unlockedAt && (
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-gray-500">
                                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>

                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <div className="flex items-center space-x-3 mb-2">
                            <div
                              className={`p-3 rounded-full ${
                                isLocked
                                  ? "bg-gray-100"
                                  : achievement.rarity === "legendary"
                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                    : achievement.rarity === "epic"
                                      ? "bg-gradient-to-r from-purple-400 to-purple-600"
                                      : achievement.rarity === "rare"
                                        ? "bg-gradient-to-r from-blue-400 to-blue-600"
                                        : "bg-[#fdb606]"
                              }`}
                            >
                              {isLocked ? (
                                <Lock className="h-8 w-8 text-gray-400" />
                              ) : (
                                <Icon className="h-8 w-8 text-white" />
                              )}
                            </div>
                            <div>
                              <DialogTitle className="text-xl">{achievement.title}</DialogTitle>
                              <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
                            </div>
                          </div>
                          <DialogDescription className="text-base">{achievement.description}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">Points Reward</span>
                            <div className="flex items-center space-x-1">
                              <Award className="h-5 w-5 text-[#fdb606]" />
                              <span className="font-bold text-[#fdb606]">{achievement.points}</span>
                            </div>
                          </div>

                          {achievement.progress !== undefined && achievement.maxProgress && (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">Progress</span>
                                <span>
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                              </div>
                              <Progress
                                value={(achievement.progress / achievement.maxProgress) * 100}
                                className="h-3"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <h4 className="font-medium">Requirements:</h4>
                            <ul className="space-y-1">
                              {achievement.requirements.map((req, index) => (
                                <li key={index} className="flex items-center space-x-2 text-sm">
                                  <CheckCircle
                                    className={`h-4 w-4 ${achievement.isUnlocked ? "text-green-500" : "text-gray-300"}`}
                                  />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {achievement.unlockedAt && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-medium text-green-800">Achievement Unlocked!</span>
                              </div>
                              <p className="text-sm text-green-700 mt-1">
                                Earned on {new Date(achievement.unlockedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          {achievement.isUnlocked && (
                            <Button
                              className="bg-[#fdb606] hover:bg-[#f39c12]"
                              onClick={() => {
                                setSelectedAchievementForShare(achievement)
                                setIsShareModalOpen(true)
                              }}
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Achievement
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Recent Achievements */}
          {unlockedAchievements.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unlockedAchievements
                    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
                    .slice(0, 3)
                    .map((achievement) => {
                      const Icon = achievement.icon
                      return (
                        <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-[#fdb606] rounded-full">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Award className="h-4 w-4 text-[#fdb606]" />
                              <span className="font-medium">{achievement.points}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(achievement.unlockedAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">My Certificates</h3>
              <p className="text-sm text-gray-600">
                {certificateList.length} certificates • {certificateList.filter((c) => c.isVerified).length} verified
              </p>
            </div>
            <Button onClick={handleCreateCertificate} className="bg-[#fdb606] hover:bg-[#f39c12]">
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </div>

          {certificateList.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                <p className="text-gray-600 mb-4">
                  Add your professional certificates and certifications to showcase your achievements.
                </p>
                <Button onClick={handleCreateCertificate} className="bg-[#fdb606] hover:bg-[#f39c12]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Certificate
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificateList.map((certificate) => (
                <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold line-clamp-2">{certificate.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{certificate.issuingOrganization}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewCertificate(certificate)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditCertificate(certificate)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCertificate(certificate)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Issued</span>
                        <span>{new Date(certificate.issueDate).toLocaleDateString()}</span>
                      </div>

                      {certificate.expiryDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Expires</span>
                          <span className={new Date(certificate.expiryDate) < new Date() ? "text-red-500" : ""}>
                            {new Date(certificate.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {certificate.credentialId && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">ID</span>
                          <span className="font-mono text-xs">{certificate.credentialId}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        {certificate.isVerified ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>

                      {certificate.skills.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {certificate.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {certificate.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{certificate.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {certificate.credentialUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(certificate.credentialUrl, "_blank")}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        )}
                        {certificate.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCertificate(certificate)}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleShareCertificate(certificate)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Certificate Detail Modal */}
      <Dialog open={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCertificate && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedCertificate.name}</DialogTitle>
                    <p className="text-gray-600">{selectedCertificate.issuingOrganization}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Issue Date</Label>
                    <p className="mt-1">{new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                  </div>
                  {selectedCertificate.expiryDate && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Expiry Date</Label>
                      <p
                        className={`mt-1 ${new Date(selectedCertificate.expiryDate) < new Date() ? "text-red-500" : ""}`}
                      >
                        {new Date(selectedCertificate.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {selectedCertificate.credentialId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Credential ID</Label>
                    <p className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded">{selectedCertificate.credentialId}</p>
                  </div>
                )}

                {selectedCertificate.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="mt-1 text-gray-700">{selectedCertificate.description}</p>
                  </div>
                )}

                {selectedCertificate.skills.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Skills & Competencies</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCertificate.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  {selectedCertificate.isVerified ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Verified Certificate</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Unverified Certificate</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                {selectedCertificate.credentialUrl && (
                  <Button variant="outline" onClick={() => window.open(selectedCertificate.credentialUrl, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Verify Online
                  </Button>
                )}
                {selectedCertificate.fileUrl && (
                  <Button variant="outline" onClick={() => handleDownloadCertificate(selectedCertificate)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button
                  onClick={() => handleShareCertificate(selectedCertificate)}
                  className="bg-[#fdb606] hover:bg-[#f39c12]"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Certificate Form Modal */}
      <Dialog open={isCertificateFormOpen} onOpenChange={setIsCertificateFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCertificate ? "Edit Certificate" : "Add New Certificate"}</DialogTitle>
            <DialogDescription>
              {editingCertificate ? "Update your certificate information" : "Add a new certificate to your profile"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certName">Certificate Name *</Label>
                <Input
                  id="certName"
                  value={certificateForm.name}
                  onChange={(e) => setCertificateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={certificateErrors.name ? "border-red-500" : ""}
                  placeholder="e.g., AWS Cloud Practitioner"
                />
                {certificateErrors.name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {certificateErrors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="organization">Issuing Organization *</Label>
                <Input
                  id="organization"
                  value={certificateForm.issuingOrganization}
                  onChange={(e) => setCertificateForm((prev) => ({ ...prev, issuingOrganization: e.target.value }))}
                  className={certificateErrors.issuingOrganization ? "border-red-500" : ""}
                  placeholder="e.g., Amazon Web Services"
                />
                {certificateErrors.issuingOrganization && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {certificateErrors.issuingOrganization}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={certificateForm.issueDate}
                  onChange={(e) => setCertificateForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                  className={certificateErrors.issueDate ? "border-red-500" : ""}
                />
                {certificateErrors.issueDate && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {certificateErrors.issueDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={certificateForm.expiryDate}
                  onChange={(e) => setCertificateForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  className={certificateErrors.expiryDate ? "border-red-500" : ""}
                />
                {certificateErrors.expiryDate && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {certificateErrors.expiryDate}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                <Input
                  id="credentialId"
                  value={certificateForm.credentialId}
                  onChange={(e) => setCertificateForm((prev) => ({ ...prev, credentialId: e.target.value }))}
                  placeholder="e.g., AWS-CP-2024-001"
                />
              </div>

              <div>
                <Label htmlFor="credentialUrl">Verification URL (Optional)</Label>
                <Input
                  id="credentialUrl"
                  type="url"
                  value={certificateForm.credentialUrl}
                  onChange={(e) => setCertificateForm((prev) => ({ ...prev, credentialUrl: e.target.value }))}
                  className={certificateErrors.credentialUrl ? "border-red-500" : ""}
                  placeholder="https://verify.example.com/certificate"
                />
                {certificateErrors.credentialUrl && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {certificateErrors.credentialUrl}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={certificateForm.description}
                onChange={(e) => setCertificateForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this certificate covers..."
                className="h-20"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">{certificateForm.description.length}/500</p>
            </div>

            <div>
              <Label htmlFor="skills">Skills & Competencies (Optional)</Label>
              <Input
                id="skills"
                value={certificateForm.skills}
                onChange={(e) => setCertificateForm((prev) => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., React, JavaScript, Frontend Development (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">Separate multiple skills with commas</p>
            </div>

            <div>
              <Label htmlFor="certificateFile">Certificate File (Optional)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="certificateFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Label htmlFor="certificateFile" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setSelectedFile(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload certificate file</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCertificateFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCertificate} disabled={isLoading} className="bg-[#fdb606] hover:bg-[#f39c12]">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingCertificate ? "Update Certificate" : "Add Certificate"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCertificate?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCertificate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Achievement Modal */}
      <ShareAchievementModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false)
          setSelectedAchievementForShare(null)
        }}
        achievement={selectedAchievementForShare}
      />

      {/* Export Data Modal */}
      <ExportDataModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      {/* Edit Modal */}
      {/* <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditItem(null)
        }}
        item={editItem}
        onSave={(updatedItem) => {
          // Handle save logic here
          console.log("Updated item:", updatedItem)
        }}
      /> */}
    </div>
  )
}
