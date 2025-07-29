"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Download,
  Receipt,
  CreditCard,
  Calendar,
  DollarSign,
  RefreshCw,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"

interface Purchase {
  id: string
  courseTitle: string
  instructor: string
  instructorAvatar: string
  courseThumbnail: string
  purchaseDate: string
  amount: number
  originalPrice: number
  discount: number
  paymentMethod: string
  status: "completed" | "pending" | "refunded"
  receiptUrl: string
  category: string
  rating?: number
}

const dummyPurchases: Purchase[] = [
  {
    id: "1",
    courseTitle: "Complete React Developer Course",
    instructor: "Sarah Johnson",
    instructorAvatar: "/ai.png?height=32&width=32",
    courseThumbnail: "/ai.png?height=120&width=200",
    purchaseDate: "2024-01-15",
    amount: 44.99,
    originalPrice: 89.99,
    discount: 50,
    paymentMethod: "Visa ****4242",
    status: "completed",
    receiptUrl: "#",
    category: "Web Development",
    rating: 4.8,
  },
  {
    id: "2",
    courseTitle: "JavaScript Fundamentals",
    instructor: "Mike Chen",
    instructorAvatar: "/ai.png?height=32&width=32",
    courseThumbnail: "/ai.png?height=120&width=200",
    purchaseDate: "2024-01-10",
    amount: 34.99,
    originalPrice: 69.99,
    discount: 50,
    paymentMethod: "Visa ****4242",
    status: "completed",
    receiptUrl: "#",
    category: "Programming",
    rating: 4.6,
  },
  {
    id: "3",
    courseTitle: "UI/UX Design Masterclass",
    instructor: "Emma Wilson",
    instructorAvatar: "/ai.png?height=32&width=32",
    courseThumbnail: "/ai.png?height=120&width=200",
    purchaseDate: "2024-01-05",
    amount: 129.99,
    originalPrice: 129.99,
    discount: 0,
    paymentMethod: "PayPal",
    status: "completed",
    receiptUrl: "#",
    category: "Design",
    rating: 4.9,
  },
  {
    id: "4",
    courseTitle: "Advanced Node.js Development",
    instructor: "David Kumar",
    instructorAvatar: "/ai.png?height=32&width=32",
    courseThumbnail: "/ai.png?height=120&width=200",
    purchaseDate: "2024-01-20",
    amount: 79.99,
    originalPrice: 99.99,
    discount: 20,
    paymentMethod: "Visa ****4242",
    status: "pending",
    receiptUrl: "#",
    category: "Backend Development",
  },
  {
    id: "5",
    courseTitle: "Digital Marketing Strategy",
    instructor: "Lisa Rodriguez",
    instructorAvatar: "/ai.png?height=32&width=32",
    courseThumbnail: "/ai.png?height=120&width=200",
    purchaseDate: "2023-12-28",
    amount: 39.99,
    originalPrice: 79.99,
    discount: 50,
    paymentMethod: "Visa ****4242",
    status: "refunded",
    receiptUrl: "#",
    category: "Marketing",
  },
]

export default function PurchaseHistory() {
  const [purchases] = useState<Purchase[]>(dummyPurchases)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.instructor.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    return matchesSearch && purchase.status === filterStatus
  })

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    }
    if (sortBy === "amount") {
      return b.amount - a.amount
    }
    if (sortBy === "alphabetical") {
      return a.courseTitle.localeCompare(b.courseTitle)
    }
    return 0
  })

  const totalSpent = purchases.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)

  const totalSaved = purchases
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.originalPrice - p.amount), 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "refunded":
        return <RefreshCw className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Purchase History</h1>
          <p className="text-gray-600">{purchases.length} total purchases</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <Badge className="bg-green-500 text-white">Savings</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">${totalSaved.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From discounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {purchases.filter((p) => p.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Successful purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Recent purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search purchases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase List */}
      <div className="space-y-4">
        {sortedPurchases.map((purchase) => (
          <Card key={purchase.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Course Image - Hidden on mobile, shown on larger screens */}
                <div className="hidden sm:block">
                  <Image
                    src={purchase.courseThumbnail || "/ai.png"}
                    alt={purchase.courseTitle}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                </div>

                {/* Course Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg line-clamp-2">{purchase.courseTitle}</h3>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={purchase.instructorAvatar || "/ai.png"} />
                          <AvatarFallback>{purchase.instructor.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{purchase.instructor}</span>
                        {purchase.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{purchase.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(purchase.status)}
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Purchase Date</p>
                      <p className="font-medium">{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount Paid</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-[#fdb606]">${purchase.amount}</p>
                        {purchase.discount > 0 && (
                          <span className="text-xs text-gray-500 line-through">${purchase.originalPrice}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment Method</p>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-4 w-4" />
                        <p className="font-medium">{purchase.paymentMethod}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <Badge variant="outline" className="text-xs">
                        {purchase.category}
                      </Badge>
                    </div>
                  </div>

                  {purchase.discount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        🎉 You saved ${(purchase.originalPrice - purchase.amount).toFixed(2)} ({purchase.discount}% off)
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedPurchase(purchase)}>
                          <Receipt className="h-4 w-4 mr-2" />
                          View Receipt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Purchase Receipt</DialogTitle>
                          <DialogDescription>Receipt for {purchase.courseTitle}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Course:</span>
                              <span className="text-sm font-medium">{purchase.courseTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Instructor:</span>
                              <span className="text-sm">{purchase.instructor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Purchase Date:</span>
                              <span className="text-sm">{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Original Price:</span>
                              <span className="text-sm">${purchase.originalPrice}</span>
                            </div>
                            {purchase.discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span className="text-sm">Discount ({purchase.discount}%):</span>
                                <span className="text-sm">
                                  -${(purchase.originalPrice - purchase.amount).toFixed(2)}
                                </span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Total Paid:</span>
                              <span className="text-[#fdb606]">${purchase.amount}</span>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="bg-[#fdb606] hover:bg-[#f39c12]">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>

                    {purchase.status === "completed" && (
                      <Button variant="outline" size="sm">
                        Rate Course
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedPurchases.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No purchases found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "You haven't made any purchases yet."}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Button className="bg-[#fdb606] hover:bg-[#f39c12]">Browse Courses</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
