"use client"

import React, { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { DashboardProvider } from "./studentContext"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export default function ResponsiveLayout({ children,  }: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Close mobile menu when switching to desktop
      if (!mobile && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [isMobileMenuOpen])

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }



   

  return (
    <>

    <DashboardProvider>
       
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     <Header   />

      <div className="flex relative">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block"><Sidebar  /></div>

        {/* Mobile Menu Button - Only visible on mobile */}
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "fixed top-20 left-4 z-50 md:hidden",
              "bg-white shadow-lg border-2 border-gray-200",
              "hover:bg-gray-50 hover:border-[#fdb606]",
              "active:bg-gray-100 active:scale-95",
              "transition-all duration-200 ease-in-out",
              "w-12 h-12 rounded-full",
              "focus:outline-none focus:ring-2 focus:ring-[#fdb606] focus:ring-offset-2",
            )}
            onClick={handleMobileMenuToggle}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
          </Button>
        )}

        {/* Mobile Sidebar Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent
            side="left"
            className={cn("p-0 w-72 sm:w-80", "bg-white border-r border-gray-200", "shadow-xl")}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <div className="text-xl font-bold text-[#fdb606]">LearnHub</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="hover:bg-gray-100 rounded-full"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Sheet Content */}
            <div className="bg-white h-full overflow-y-auto"><Sidebar/></div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className={cn("flex-1 transition-all duration-300", "p-4 md:p-6", isMobile ? "pt-20" : "pt-0")}>
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={closeMobileMenu} aria-hidden="true" />
      )}
    </div>
     </DashboardProvider>
     </>
  )
}
