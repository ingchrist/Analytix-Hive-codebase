"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, ShoppingCart, Star, Clock, Users, Share2, Filter, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Course } from "@/types"
import ShareWishlistModal from "@/components/modals/share-wishlist-modal"
import Image from "next/image"
import { useDashboard } from "../studentContext"
interface WishlistProps {
  courses: Course[]
  onCourseSelect: (course: Course) => void
}




const Wishlist = () => {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [isShareWishlistModalOpen, setIsShareWishlistModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
const {courses}=useDashboard()
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]))
  }

  const addToCart = (courseId: string) => {
    console.log("Added to cart:", courseId)
  }

  const removeFromWishlist = (courseId: string) => {
    console.log("Removed from wishlist:", courseId)
  }

  const addAllToCart = () => {
    selectedCourses.forEach((courseId) => addToCart(courseId))
    setSelectedCourses([])
  }

  const handleCourseClick = (course: Course) => {
    // onCourseSelect(course)
  }

  const handleShareWishlist = () => {
    setIsShareWishlistModalOpen(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Wishlist</h1>
            <p className="text-gray-600">{courses.length} courses saved</p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-2">
            {selectedCourses.length > 0 && (
              <Button onClick={addAllToCart} className="bg-[#fdb606] hover:bg-[#f39c12]">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add {selectedCourses.length} to Cart
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" onClick={handleShareWishlist}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Wishlist
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="sm:hidden w-full">
            <div className="flex gap-2 mb-2">
              {selectedCourses.length > 0 && (
                <Button onClick={addAllToCart} className="flex-1 bg-[#fdb606] hover:bg-[#f39c12]">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add {selectedCourses.length} to Cart
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareWishlist}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Wishlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Browse courses and add them to your wishlist to keep track of what you want to learn.
            </p>
            <Button className="bg-[#fdb606] hover:bg-[#f39c12]">Browse Courses</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={course.thumbnail || "/ai.png"}
                    alt={course.title}
                    width={100}
                    height={100}
                    className="w-full h-32 sm:h-48 object-cover rounded-t-lg cursor-pointer"
                    onClick={() => handleCourseClick(course)}
                  />
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="w-4 h-4 text-[#fdb606] bg-white border-gray-300 rounded focus:ring-[#fdb606]"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                      onClick={() => removeFromWishlist(course.id)}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                  {course.price < 100 && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-red-500 text-xs">50% OFF</Badge>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4 space-y-3">
                  <h3
                    className="font-semibold text-sm sm:text-lg line-clamp-2 cursor-pointer hover:text-[#fdb606] transition-colors"
                    onClick={() => handleCourseClick(course)}
                  >
                    {course.title}
                  </h3>

                  <div className="flex items-center space-x-2">
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                      <AvatarImage src={course.instructor.avatar || "/ai.png"} />
                      <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm text-gray-600">{course.instructor.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{Math.floor(course.duration / 60)}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>1.2k</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg sm:text-2xl font-bold text-[#fdb606]">${course.price}</span>
                      {course.price < 100 && (
                        <span className="text-xs sm:text-sm text-gray-500 line-through">
                          ${(course.price * 2).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-[#fdb606] hover:bg-[#f39c12] text-sm"
                      onClick={() => addToCart(course.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCourseClick(course)}
                      className="text-xs sm:text-sm"
                    >
                      Preview
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Price tracking: Last updated 2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Price Alert Banner */}
      {courses.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-green-800 text-sm sm:text-base">Price Drop Alert!</h3>
                <p className="text-xs sm:text-sm text-green-700">
                  2 courses in your wishlist are now on sale. Save up to 50%!
                </p>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                View Deals
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Wishlist Modal */}
      <ShareWishlistModal
        isOpen={isShareWishlistModalOpen}
        onClose={() => setIsShareWishlistModalOpen(false)}
        courses={courses}
      />
    </div>
  )
}

export default Wishlist