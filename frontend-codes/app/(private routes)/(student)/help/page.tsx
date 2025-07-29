"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { toast } from "sonner"
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  HelpCircle,
  BookOpen,
  CreditCard,
  Settings,
  User,
  Send,
  AlertCircle,
  FileText,
  Video,
  Download,
  ExternalLink,
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

interface ContactForm {
  name: string
  email: string
  subject: string
  category: string
  message: string
  priority: string
}

interface FormErrors {
  [key: string]: string
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I enroll in a course?",
    answer:
      "To enroll in a course, browse our course catalog, click on the course you're interested in, and click the 'Enroll Now' button. You'll be guided through the payment process if it's a paid course, or you can start learning immediately if it's free.",
    category: "courses",
    tags: ["enrollment", "courses", "getting started"],
  },
  {
    id: "2",
    question: "Can I download course videos for offline viewing?",
    answer:
      "Yes! Premium subscribers can download course videos for offline viewing. Look for the download icon next to each video lesson. Downloaded content is available for 30 days and will be automatically renewed when you're online.",
    category: "courses",
    tags: ["download", "offline", "videos", "premium"],
  },
  {
    id: "3",
    question: "How do I get a refund for a course?",
    answer:
      "We offer a 30-day money-back guarantee for all paid courses. To request a refund, go to your Purchase History, find the course, and click 'Request Refund'. Refunds are processed within 5-7 business days.",
    category: "billing",
    tags: ["refund", "money-back", "billing"],
  },
  {
    id: "4",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. You can manage your payment methods in the Billing section of your account settings.",
    category: "billing",
    tags: ["payment", "credit card", "paypal", "billing"],
  },
  {
    id: "5",
    question: "How do I reset my password?",
    answer:
      "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. You can also change your password anytime in your Account Settings under the Security tab.",
    category: "account",
    tags: ["password", "reset", "security", "login"],
  },
  {
    id: "6",
    question: "Can I share my account with others?",
    answer:
      "Each account is for individual use only. Sharing accounts violates our Terms of Service. However, we offer team and enterprise plans for organizations that need multiple user access.",
    category: "account",
    tags: ["sharing", "team", "enterprise", "terms"],
  },
  {
    id: "7",
    question: "How do I track my learning progress?",
    answer:
      "Your learning progress is automatically tracked and displayed on your dashboard. You can view detailed analytics in the Progress section, including time spent, completion rates, and achievements earned.",
    category: "learning",
    tags: ["progress", "analytics", "tracking", "dashboard"],
  },
  {
    id: "8",
    question: "What browsers are supported?",
    answer:
      "Our platform works best on the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend keeping your browser updated and enabling JavaScript.",
    category: "technical",
    tags: ["browser", "compatibility", "technical", "requirements"],
  },
  {
    id: "9",
    question: "How do I contact an instructor?",
    answer:
      "You can contact instructors through the course discussion forums or by using the 'Message Instructor' feature available in each course. Instructors typically respond within 24-48 hours.",
    category: "learning",
    tags: ["instructor", "contact", "discussion", "support"],
  },
  {
    id: "10",
    question: "Can I get a certificate for completed courses?",
    answer:
      "Yes! You'll receive a certificate of completion for each course you finish. Certificates are available in your account dashboard and can be downloaded as PDF files or shared on LinkedIn.",
    category: "certificates",
    tags: ["certificate", "completion", "pdf", "linkedin"],
  },
]

const categories = [
  { id: "all", label: "All Categories", icon: HelpCircle },
  { id: "courses", label: "Courses & Learning", icon: BookOpen },
  { id: "billing", label: "Billing & Payments", icon: CreditCard },
  { id: "account", label: "Account & Settings", icon: User },
  { id: "technical", label: "Technical Support", icon: Settings },
  { id: "certificates", label: "Certificates", icon: FileText },
]

export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    priority: "medium",
  })

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateContactForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!contactForm.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!contactForm.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(contactForm.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!contactForm.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!contactForm.category) {
      newErrors.category = "Please select a category"
    }

    if (!contactForm.message.trim()) {
      newErrors.message = "Message is required"
    } else if (contactForm.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters long"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContactSubmit = async () => {
    if (!validateContactForm()) {
      toast( "Validation Error",
        {description: "Please fix the errors below",
    
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast( "Message sent successfully!",
        {description: "We'll get back to you within 24 hours.",
      })

      // Reset form
      setContactForm({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
        priority: "medium",
      })
      setIsContactModalOpen(false)
    } catch (error) {
      toast( "Failed to send message",
        {description: "Please try again later or contact us directly.",
       
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.icon : HelpCircle
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Help & Support</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 text-[#fdb606] mx-auto mb-2" />
                <h3 className="font-semibold">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help from our team</p>
              </CardContent>
            </Card>
          </DialogTrigger>
        </Dialog>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Video className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Watch how-to guides</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Download className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">User Guide</h3>
            <p className="text-sm text-gray-600">Download PDF guide</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <ExternalLink className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold">Community</h3>
            <p className="text-sm text-gray-600">Join our forum</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon
                const count =
                  category.id === "all" ? faqs.length : faqs.filter((faq) => faq.category === category.id).length

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedCategory === category.id
                        ? "bg-[#fdb606]/10 text-[#fdb606] border-r-2 border-[#fdb606]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{category.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* FAQs */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Frequently Asked Questions</span>
                <Badge variant="outline">
                  {filteredFAQs.length} {filteredFAQs.length === 1 ? "result" : "results"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq) => {
                    const Icon = getCategoryIcon(faq.category)
                    return (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-start space-x-3 flex-1">
                            <Icon className="h-5 w-5 text-[#fdb606] mt-0.5 flex-shrink-0" />
                            <span className="font-medium">{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-8">
                          <div className="space-y-3">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                            <div className="flex flex-wrap gap-2">
                              {faq.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search terms or browse different categories</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-[#fdb606]/10 p-3 rounded-full w-fit mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-[#fdb606]" />
                  </div>
                  <h4 className="font-semibold mb-2">Live Chat</h4>
                  <p className="text-sm text-gray-600 mb-3">Get instant help from our support team</p>
                  <Button size="sm" className="bg-[#fdb606] hover:bg-[#f39c12]">
                    Start Chat
                  </Button>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-3">support@learnhub.com</p>
                  <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>

                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Phone Support</h4>
                  <p className="text-sm text-gray-600 mb-3">+1 (555) 123-4567</p>
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Mon-Fri 9AM-6PM EST
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>Send us a message and we&apos;ll get back to you as soon as possible.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={contactForm.category}
                  onValueChange={(value) => setContactForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courses">Courses & Learning</SelectItem>
                    <SelectItem value="billing">Billing & Payments</SelectItem>
                    <SelectItem value="account">Account & Settings</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={contactForm.priority}
                  onValueChange={(value) => setContactForm((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or question in detail..."
                className={`h-32 ${errors.message ? "border-red-500" : ""}`}
                value={contactForm.message}
                onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.message && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 ml-auto">{contactForm.message.length}/1000</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContactSubmit} disabled={isLoading} className="bg-[#fdb606] hover:bg-[#f39c12]">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
