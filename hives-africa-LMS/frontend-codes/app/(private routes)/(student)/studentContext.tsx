// context/DashboardContext.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { user, courses } from "./dummydata"
import type { Course, User } from "@/types"

interface DashboardContextProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: User
  handleTabChange: (tab: string) => void
  handleCartClick: () => void
  courses: Course[]
  enrolledCourses: Course[]
  wishlistCourses: Course[]
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider")
  return context
}

export const DashboardProvider = ({
  children,

}: {
  children: ReactNode
}) => {
  const [activeTab, setActiveTab] = useState("dashboard")

  const enrolledCourses = courses.filter((course) => user.enrolledCourses.includes(course.id))
  const wishlistCourses = courses.filter((course) => user.wishlist.includes(course.id))
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleCartClick = () => {
    setActiveTab("cart")
  }



  return (
    <DashboardContext.Provider
      value={{ activeTab, setActiveTab, user, enrolledCourses, wishlistCourses, courses, handleCartClick, handleTabChange }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
