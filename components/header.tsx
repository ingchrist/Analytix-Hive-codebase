"use client"

import type React from "react"

import { useState } from "react"
import { Bell, Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboard } from "@/app/(private routes)/(student)/studentContext"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"



export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const { activeTab, handleTabChange, handleCartClick } = useDashboard()
  // Default user data to prevent undefined errors
  const defaultUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/ai.png?height=40&width=40",
  }

  const handleNotificationClick = (notification: string) => {
    console.log("Notification clicked:", notification)
    // Add toast notification here if needed
  }



  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
      // Implement search functionality here
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-xl sm:text-2xl font-bold text-[#fdb606]">Hive Africa</div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#fdb606] focus:ring-[#fdb606]"
              />
            </form>
          </div>

          {/* Mobile Search Toggle */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="relative hover:bg-gray-100"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/auth">
              <Button variant="ghost" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-[#FDB606] hover:bg-[#fd9a06] text-white text-sm font-medium">
                Sign Up
              </Button>
            </Link>
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100"
                  aria-label="View notifications"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <DropdownMenuItem
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleNotificationClick("course-available")}
                >
                  <div>
                    <p className="font-medium">New course available</p>
                    <p className="text-sm text-gray-500">Advanced React Patterns is now live</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleNotificationClick("course-completed")}
                >
                  <div>
                    <p className="font-medium">Course completed</p>
                    <p className="text-sm text-gray-500">Congratulations on finishing UI/UX Design</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleNotificationClick("price-drop")}
                >
                  <div>
                    <p className="font-medium">Price drop alert</p>
                    <p className="text-sm text-gray-500">Python for Data Science is now 50% off</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100"
              onClick={handleCartClick}
              aria-label="View shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#fdb606] text-white text-xs">
                2
              </Badge>
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={defaultUser.avatar || "/placeholder.svg"} alt={defaultUser.name} />
                    <AvatarFallback>{defaultUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block font-medium">{defaultUser.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  
                  className={cn(
                    "cursor-pointer",
                    activeTab === "dashboard" ? "bg-[#fdb606]/10 text-[#fdb606]" : "hover:bg-gray-50",
                  )}
                asChild>
                  <Link href="/dashboard">
                  Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
    
                  className={cn(
                    "cursor-pointer",
                    activeTab === "learning" ? "bg-[#fdb606]/10 text-[#fdb606]" : "hover:bg-gray-50",
                  )}
                  asChild>
                  <Link href="/dashboard">
              My learning
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  
                  className={cn(
                    "cursor-pointer",
                    activeTab === "wishlist" ? "bg-[#fdb606]/10 text-[#fdb606]" : "hover:bg-gray-50",
                  )}
                  asChild>
                  <Link href="/wishlist">
                  wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                 
                  className={cn(
                    "cursor-pointer",
                    activeTab === "settings" ? "bg-[#fdb606]/10 text-[#fdb606]" : "hover:bg-gray-50",
                  )}
                 asChild>
                  <Link href="/dashboard">
                 settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer",
                    activeTab === "help" ? "bg-[#fdb606]/10 text-[#fdb606]" : "hover:bg-gray-50",
                  )}
                   asChild>
                  <Link href="/help">
                  Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer hover:bg-red-50"
                   asChild>
                  <Link href="/dashboard">
                 signout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchExpanded && (
          <div className="sm:hidden mt-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#fdb606] focus:ring-[#fdb606]"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
