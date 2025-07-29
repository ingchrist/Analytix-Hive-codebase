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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Download,
  FileText,
  Database,
  FileSpreadsheet,
  File,
  User,
  BookOpen,
  Award,
  ShoppingCart,
  Heart,
  Settings,
  AlertCircle,
} from "lucide-react"

interface ExportDataModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ExportOption {
  id: string
  label: string
  description: string
  icon: any
  size: string
  selected: boolean
}

export default function ExportDataModal({ isOpen, onClose }: ExportDataModalProps) {
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf" | "xlsx">("json")
  const [dateRange, setDateRange] = useState<"all" | "year" | "month" | "custom">("all")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    {
      id: "profile",
      label: "Profile Information",
      description: "Personal details, preferences, and settings",
      icon: User,
      size: "2.1 KB",
      selected: true,
    },
    {
      id: "courses",
      label: "Course Progress",
      description: "Enrolled courses, completion status, and grades",
      icon: BookOpen,
      size: "45.3 KB",
      selected: true,
    },
    {
      id: "achievements",
      label: "Achievements & Certificates",
      description: "Earned achievements, badges, and certificates",
      icon: Award,
      size: "12.7 KB",
      selected: true,
    },
    {
      id: "purchases",
      label: "Purchase History",
      description: "Transaction history and payment records",
      icon: ShoppingCart,
      size: "8.9 KB",
      selected: false,
    },
    {
      id: "wishlist",
      label: "Wishlist",
      description: "Saved courses and learning goals",
      icon: Heart,
      size: "3.2 KB",
      selected: false,
    },
    {
      id: "analytics",
      label: "Learning Analytics",
      description: "Study time, progress charts, and statistics",
      icon: Database,
      size: "156.8 KB",
      selected: false,
    },
    {
      id: "settings",
      label: "Account Settings",
      description: "Privacy settings, notifications, and preferences",
      icon: Settings,
      size: "1.5 KB",
      selected: false,
    },
  ])

  const toggleExportOption = (optionId: string) => {
    setExportOptions((prev) =>
      prev.map((option) => (option.id === optionId ? { ...option, selected: !option.selected } : option)),
    )
  }

  const selectAll = () => {
    setExportOptions((prev) => prev.map((option) => ({ ...option, selected: true })))
  }

  const selectNone = () => {
    setExportOptions((prev) => prev.map((option) => ({ ...option, selected: false })))
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "json":
        return FileText
      case "csv":
        return FileSpreadsheet
      case "pdf":
        return File
      case "xlsx":
        return FileSpreadsheet
      default:
        return FileText
    }
  }

  const getFormatDescription = (format: string) => {
    switch (format) {
      case "json":
        return "Machine-readable format, best for developers"
      case "csv":
        return "Spreadsheet format, compatible with Excel"
      case "pdf":
        return "Document format, best for viewing and printing"
      case "xlsx":
        return "Excel format with advanced formatting"
      default:
        return ""
    }
  }

  const calculateTotalSize = () => {
    const selectedOptions = exportOptions.filter((option) => option.selected)
    const totalKB = selectedOptions.reduce((sum, option) => {
      const sizeValue = Number.parseFloat(option.size.replace(/[^\d.]/g, ""))
      const unit = option.size.includes("MB") ? 1024 : 1
      return sum + sizeValue * unit
    }, 0)

    if (totalKB > 1024) {
      return `${(totalKB / 1024).toFixed(1)} MB`
    }
    return `${totalKB.toFixed(1)} KB`
  }

  const startExport = async () => {
    const selectedOptions = exportOptions.filter((option) => option.selected)

    if (selectedOptions.length === 0) {
          toast.error("No data selected", {
  description: "Please select at least one data type to export"
})
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setExportProgress(i)
      }

      // Simulate file download
      const fileName = `lms_data_export_${new Date().toISOString().split("T")[0]}.${exportFormat}`
      const link = document.createElement("a")
      link.href = "/placeholder-export-file.json" // In real app, this would be the actual export file
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)


          toast.success("Export completed", {
  description: `Your data has been exported as ${fileName}`
})

      onClose()
    } catch (error) {

          toast.error("Export failed", {
  description: "Failed to export data. Please try again."
})
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const selectedCount = exportOptions.filter((option) => option.selected).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Your Data</span>
          </DialogTitle>
          <DialogDescription>Download your learning data in various formats for backup or analysis</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "json", label: "JSON", icon: FileText },
                { id: "csv", label: "CSV", icon: FileSpreadsheet },
                { id: "pdf", label: "PDF", icon: File },
                { id: "xlsx", label: "Excel", icon: FileSpreadsheet },
              ].map((format) => {
                const Icon = format.icon
                return (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id as any)}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-colors ${
                      exportFormat === format.id
                        ? "border-[#fdb606] bg-[#fdb606]/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{format.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-sm text-gray-600">{getFormatDescription(exportFormat)}</p>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Data Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Data to Export</Label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Select None
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {exportOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      option.selected ? "border-[#fdb606] bg-[#fdb606]/5" : "border-gray-200"
                    }`}
                  >
                    <Checkbox checked={option.selected} onCheckedChange={() => toggleExportOption(option.id)} />
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {option.size}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Export Summary</span>
              <Badge className="bg-[#fdb606] text-white">
                {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Format:</span>
                <span className="ml-2 font-medium">{exportFormat.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-gray-600">Size:</span>
                <span className="ml-2 font-medium">{calculateTotalSize()}</span>
              </div>
              <div>
                <span className="text-gray-600">Date Range:</span>
                <span className="ml-2 font-medium">
                  {dateRange === "all"
                    ? "All Time"
                    : dateRange === "year"
                      ? "Last 12 Months"
                      : dateRange === "month"
                        ? "Last 30 Days"
                        : "Custom Range"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Privacy Notice</p>
                <p>
                  Your exported data will contain personal information. Please store it securely and be mindful of
                  privacy when sharing. The export file will be downloaded to your device only.
                </p>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Exporting Data...</span>
                <span className="text-sm text-gray-600">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
              <p className="text-sm text-gray-600">Please don&apos;t close this window while the export is in progress.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={startExport}
            disabled={isExporting || selectedCount === 0}
            className="bg-[#fdb606] hover:bg-[#f39c12]"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
