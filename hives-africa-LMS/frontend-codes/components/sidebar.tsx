"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  ShoppingCart,
  Settings,
  BarChart3,
  Award,
  CreditCard,
  HelpCircle,
  Eye,
} from "lucide-react"
import Link from "next/link"

interface SidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  className?: string
}

const sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "learning",
    label: "My Learning",
    icon: BookOpen,
  },
  {
    id: "wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    id: "cart",
    label: "Shopping Cart",
    icon: ShoppingCart,
  },
  {
    id: "courses",
    label: "View All",
    icon: Eye,
  },
  {
    id: "purchases",
    label: "Purchase History",
    icon: CreditCard,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Award,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
  {
    id: "help",
    label: "Help & Support",
    icon: HelpCircle,
  },
]

export default function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {


  return (
    <div className={cn("w-64 min-h-screen bg-white border-r border-gray-200 h-full overflow-y-auto", className)}>
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200",
                  "min-h-[44px] px-3 py-2",
                  isActive
                    ? "bg-[#fdb606] hover:bg-[#f39c12] text-white shadow-sm"
                    : "hover:bg-gray-100 text-gray-700 hover:text-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-[#fdb606] focus:ring-offset-2",
                )}
               
                aria-current={isActive ? "page" : undefined}
             asChild >
              <Link href={`/${item.id}`}>
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="text-left">{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
