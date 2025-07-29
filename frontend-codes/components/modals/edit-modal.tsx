// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Switch } from "@/components/ui/switch"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { toast } from "sonner"
// import { Edit, Save, AlertCircle, Upload, X, User, BookOpen, Award, FileText, Settings } from "lucide-react"

// interface EditItem {
//   id: string
//   type: "profile" | "course" | "achievement" | "certificate" | "setting"
//   title: string
//   data: any
// }

// interface EditModalProps {
//   isOpen: boolean
//   onClose: () => void
//   item: EditItem | null
//   onSave: (updatedItem: EditItem) => void
// }

// interface FormErrors {
//   [key: string]: string
// }

// export default function EditModal({ isOpen, onClose, item, onSave }: EditModalProps) {
//   const [formData, setFormData] = useState<any>({})
//   const [errors, setErrors] = useState<FormErrors>({})
//   const [isLoading, setIsLoading] = useState(false)
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)
//   const [previewUrl, setPreviewUrl] = useState<string>("")

//   useEffect(() => {
//     if (item) {
//       setFormData({ ...item.data })
//       setErrors({})
//       setSelectedFile(null)
//       setPreviewUrl("")
//     }
//   }, [item])

//   if (!item) return null

//   const validateForm = (): boolean => {
//     const newErrors: FormErrors = {}

//     switch (item.type) {
//       case "profile":
//         if (!formData.name?.trim()) newErrors.name = "Name is required"
//         if (!formData.email?.trim()) newErrors.email = "Email is required"
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//           newErrors.email = "Invalid email format"
//         }
//         break

//       case "course":
//         if (!formData.title?.trim()) newErrors.title = "Course title is required"
//         if (!formData.description?.trim()) newErrors.description = "Description is required"
//         if (!formData.instructor?.name?.trim()) newErrors.instructor = "Instructor name is required"
//         if (!formData.price || formData.price < 0) newErrors.price = "Valid price is required"
//         break

//       case "achievement":
//         if (!formData.title?.trim()) newErrors.title = "Achievement title is required"
//         if (!formData.description?.trim()) newErrors.description = "Description is required"
//         if (!formData.points || formData.points < 0) newErrors.points = "Valid points value is required"
//         break

//       case "certificate":
//         if (!formData.name?.trim()) newErrors.name = "Certificate name is required"
//         if (!formData.issuingOrganization?.trim()) newErrors.issuingOrganization = "Issuing organization is required"
//         if (!formData.issueDate) newErrors.issueDate = "Issue date is required"
//         break

//       case "setting":
//         // Settings validation depends on the specific setting type
//         break
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {

//             toast.error("File too large", {
//   description: "Please select a file smaller than 5MB"
// })
//         return
//       }

//       setSelectedFile(file)
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         setPreviewUrl(e.target?.result as string)
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleSave = async () => {
//     if (!validateForm()) {
    
//       toast.error("Validation Error", {
//   description: "Please fix the errors below"
// })
//       return
//     }

//     setIsLoading(true)
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1500))

//       const updatedItem: EditItem = {
//         ...item,
//         data: {
//           ...formData,
//           ...(selectedFile && {
//             avatar: previewUrl,
//             thumbnail: previewUrl,
//             fileUrl: previewUrl,
//           }),
//         },
//       }

//       onSave(updatedItem)

//           toast.success("Changes saved", {
//   description: `${item.title} has been updated successfully`
// })

//       onClose()
//     } catch (error) {
     
//           toast.error("Save failed", {
//   description: "Failed to save changes. Please try again."
// })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const getIcon = () => {
//     switch (item.type) {
//       case "profile":
//         return User
//       case "course":
//         return BookOpen
//       case "achievement":
//         return Award
//       case "certificate":
//         return FileText
//       case "setting":
//         return Settings
//       default:
//         return Edit
//     }
//   }

//   const Icon = getIcon()

//   const renderFormFields = () => {
//     switch (item.type) {
//       case "profile":
//         return (
//           <div className="space-y-4">
//             {/* Avatar Upload */}
//             <div className="flex items-center space-x-4">
//               <Avatar className="h-16 w-16">
//                 <AvatarImage src={previewUrl || formData.avatar || "/placeholder.svg"} />
//                 <AvatarFallback>{formData.name?.charAt(0) || "U"}</AvatarFallback>
//               </Avatar>
//               <div>
//                 <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="avatar-upload" />
//                 <Label htmlFor="avatar-upload" className="cursor-pointer">
//                   <Button variant="outline" size="sm" asChild>
//                     <span>
//                       <Upload className="h-4 w-4 mr-2" />
//                       Change Avatar
//                     </span>
//                   </Button>
//                 </Label>
//                 {selectedFile && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => {
//                       setSelectedFile(null)
//                       setPreviewUrl("")
//                     }}
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="name">Full Name *</Label>
//                 <Input
//                   id="name"
//                   value={formData.name || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
//                   className={errors.name ? "border-red-500" : ""}
//                 />
//                 {errors.name && (
//                   <p className="text-sm text-red-500 mt-1 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.name}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="email">Email Address *</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={formData.email || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
//                   className={errors.email ? "border-red-500" : ""}
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-500 mt-1 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.email}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="bio">Bio</Label>
//               <Textarea
//                 id="bio"
//                 value={formData.bio || ""}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
//                 placeholder="Tell us about yourself..."
//                 className="h-20"
//                 maxLength={500}
//               />
//               <p className="text-sm text-gray-500 mt-1">{(formData.bio || "").length}/500</p>
//             </div>

//             <div>
//               <Label htmlFor="website">Website</Label>
//               <Input
//                 id="website"
//                 value={formData.website || ""}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
//                 placeholder="https://yourwebsite.com"
//               />
//             </div>
//           </div>
//         )

//       case "course":
//         return (
//           <div className="space-y-4">
//             {/* Course Thumbnail */}
//             <div className="space-y-2">
//               <Label>Course Thumbnail</Label>
//               <div className="flex items-center space-x-4">
//                 <img
//                   src={previewUrl || formData.thumbnail || "/placeholder.svg"}
//                   alt="Course thumbnail"
//                   className="w-24 h-16 object-cover rounded-lg border"
//                 />
//                 <div>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFileSelect}
//                     className="hidden"
//                     id="thumbnail-upload"
//                   />
//                   <Label htmlFor="thumbnail-upload" className="cursor-pointer">
//                     <Button variant="outline" size="sm" asChild>
//                       <span>
//                         <Upload className="h-4 w-4 mr-2" />
//                         Change Image
//                       </span>
//                     </Button>
//                   </Label>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="title">Course Title *</Label>
//               <Input
//                 id="title"
//                 value={formData.title || ""}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
//                 className={errors.title ? "border-red-500" : ""}
//               />
//               {errors.title && (
//                 <p className="text-sm text-red-500 mt-1 flex items-center">
//                   <AlertCircle className="h-4 w-4 mr-1" />
//                   {errors.title}
//                 </p>
//               )}
//             </div>

//             <div>
//               <Label htmlFor="description">Description *</Label>
//               <Textarea
//                 id="description"
//                 value={formData.description || ""}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//                 className={`h-24 ${errors.description ? "border-red-500" : ""}`}
//               />
//               {errors.description && (
//                 <p className="text-sm text-red-500 mt-1 flex items-center">
//                   <AlertCircle className="h-4 w-4 mr-1" />
//                   {errors.description}
//                 </p>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="instructor">Instructor Name *</Label>
//                 <Input
//                   id="instructor"
//                   value={formData.instructor?.name || ""}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       instructor: { ...prev.instructor, name: e.target.value },
//                     }))
//                   }
//                   className={errors.instructor ? "border-red-500" : ""}
//                 />
//                 {errors.instructor && (
//                   <p className="text-sm text-red-500 mt-1 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.instructor}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="price">Price ($) *</Label>
//                 <Input
//                   id="price"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={formData.price || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
//                   className={errors.price ? "border-red-500" : ""}
//                 />
//                 {errors.price && (
//                   <p className="text-sm text-red-500 mt-1 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.price}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="category">Category</Label>
//                 <Select
//                   value={formData.category || ""}
//                   onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="programming">Programming</SelectItem>
//                     <SelectItem value="design">Design</SelectItem>
//                     <SelectItem value="business">Business</SelectItem>
//                     <SelectItem value="marketing">Marketing</SelectItem>
//                     <SelectItem value="data-science">Data Science</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="level">Level</Label>
//                 <Select
//                   value={formData.level || ""}
//                   onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value }))}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select level" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Beginner">Beginner</SelectItem>
//                     <SelectItem value="Intermediate">Intermediate</SelectItem>
//                     <SelectItem value="Advanced">Advanced</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="duration">Duration (minutes)</Label>
//                 <Input
//                   id="duration"
//                   type="number"
//                   min="0"
//                   value={formData.duration || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 0 }))}
//                 />
//               </div>
//             </div>
//           </div>
//         )

//       case "achievement":
//         return (
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="title">Achievement Title *</Label>
//               <Input
//                 id="title"
//                 value={formData.title || ""}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
//                 className={errors.title ? "border-red-500" : ""}
//               />
//               {errors.title && (
//                 <p className="text-sm text-red-500 mt-1 flex items-center">
//                   <AlertCircle className="h-4 w-4 mr-1" />
//                   {errors.title}
//                 </p>
//               )}
//             </div>

//             <div>
//               <Label htmlFor="description">Description *</Label>
//               <Textarea
//                 id="description"
//                 value={formData.description || ""}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//                 className={`h-20 ${errors.description ? "border-red-500" : ""}`}
//               />
//               {errors.description && (
//                 <p className="text-sm text-red-500 mt-1 flex items-center">
//                   <AlertCircle className="h-4 w-4 mr-1" />
//                   {errors.description}
//                 </p>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="points">Points *</Label>
//                 <Input
//                   id="points"
//                   type="number"
//                   min="0"
//                   value={formData.points || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, points: Number.parseInt(e.target.value) || 0 }))}
//                   className={errors.points ? "border-red-500" : ""}
//                 />
//                 {errors.points && (
//                   <p className="text-sm text-red-500 mt-1 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.points}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="category">Category</Label>
//                 <Select
//                   value={formData.category || ""}
//                   onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="learning">Learning</SelectItem>
//                     <SelectItem value="engagement">Engagement</SelectItem>
//                     <SelectItem value="milestone">Milestone</SelectItem>
//                     <SelectItem value="special">Special</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="rarity">Rarity</Label>
//                 <Select
//                   value={formData.rarity || ""}
//                   onValueChange={(value) => setFormData((prev) => ({ ...prev, rarity: value }))}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select rarity" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="common">Common</SelectItem>
//                     <SelectItem value="rare">Rare</SelectItem>
//                     <SelectItem value="epic">Epic</SelectItem>
//                     <SelectItem value="legendary">Legendary</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               <Switch
//                 checked={formData.isUnlocked || false}
//                 onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isUnlocked: checked }))}
//               />
//               <Label>Achievement Unlocked</Label>
//             </div>
//           </div>
//         )

//       case "certificate":
//         return (
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="name">Certificate Name *</Label>
//                 <Input
//                   id="name"
//                   value={formData.name || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
//                   className={errors.name ? "border-red-500" : ""}
//                 />
//                 {errors.name && (
//                   <p className="text-sm text-red-500 mt-1 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.name}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="issuingOrganization">Issuing Organization *</Label>
//                 <Input
//                   id="issuingOrganization"
//                   value={formData.issuingOrganization || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, issuingOrganization: e.target.value }))}
//                   className={errors.issuingOrganization ? "border-red-500" : ""}
//                 />
//                 {errors.issuingOrganization && (
//                   <p className="text-sm text-red-500 mt-1 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.issuingOrganization}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="issueDate">Issue Date *</Label>
//                 <Input
//                   id="issueDate"
//                   type="date"
//                   value={formData.issueDate || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, issueDate: e.target.value }))}
//                   className={errors.issueDate ? "border-red-500" : ""}
//                 />
//                 {errors.issueDate && (
//                   <p className="text-sm text-red-500 mt-1 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.issueDate}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="expiryDate">Expiry Date</Label>
//                 <Input
//                   id="expiryDate"
//                   type="date"
//                   value={formData.expiryDate || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="credentialId">Credential ID</Label>
//                 <Input
//                   id="credentialId"
//                   value={formData.credentialId || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, credentialId: e.target.value }))}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="credentialUrl">Verification URL</Label>
//                 <Input
//                   id="credentialUrl"
//                   type="url"
//                   value={formData.credentialUrl || ""}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, credentialUrl: e.target.value }))}
//                 />
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 value={formData.description || ""}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//                 className="h-20"
//                 maxLength={500}
//               />
//             </div>

//             <div>
//               <Label htmlFor="skills">Skills (comma-separated)</Label>
//               <Input
//                 id="skills"
//                 value={formData.skills?.join(", ") || ""}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     skills: e.target.value
//                       .split(",")
//                       .map((skill) => skill.trim())
//                       .filter((skill) => skill),
//                   }))
//                 }
//                 placeholder="React, JavaScript, Frontend Development"
//               />
//             </div>

//             <div className="flex items-center space-x-2">
//               <Switch
//                 checked={formData.isVerified || false}
//                 onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isVerified: checked }))}
//               />
//               <Label>Verified Certificate</Label>
//             </div>
//           </div>
//         )

//       default:
//         return (
//           <div className="text-center py-8">
//             <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-600">No edit form available for this item type.</p>
//           </div>
//         )
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center space-x-2">
//             <Icon className="h-5 w-5" />
//             <span>Edit {item.title}</span>
//           </DialogTitle>
//           <DialogDescription>Make changes to your {item.type}. Click save when you&apos;re done.</DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6">{renderFormFields()}</div>

//         <DialogFooter>
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave} disabled={isLoading} className="bg-[#fdb606] hover:bg-[#f39c12]">
//             {isLoading ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save className="h-4 w-4 mr-2" />
//                 Save Changes
//               </>
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
