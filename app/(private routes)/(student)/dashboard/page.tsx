"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Clock, Award, TrendingUp, Play } from "lucide-react"
import type { Course, User } from "@/types"

import { toast } from "sonner"
import { useDashboard } from "../studentContext"
import { useAuth } from "@/contexts/AuthContext"
import { UserTypeIndicator } from "@/components/shared/user-type-indicator"
import Link from "next/link"
import Image from "next/image"



export default function DashboardOverview() {

const {  user, enrolledCourses,  handleTabChange} = useDashboard()
const { user: authUser } = useAuth()
  const totalProgress = user.progress.reduce((acc, p) => acc + p.progress, 0) / user.progress.length
  const completedCourses = user.progress.filter((p) => p.progress === 100).length
  const inProgressCourses = user.progress.filter((p) => p.progress > 0 && p.progress < 100).length


//   const handleCourseClick = (course: Course) => {
//     onCourseSelect(course)
//   }

//   const handleViewAllCourses = () => {
//     if (onTabChange) {
//       onTabChange("view-all")
//     }
//     toast({
//       title: "Navigation",
//       description: "Opening View All page...",
//     })
//   }

//   const handleViewAchievements = () => {
//     if (onTabChange) {
//       onTabChange("achievements")
//     }
//     toast({
//       title: "Navigation",
//       description: "Opening Achievements page...",
//     })
//   }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#fdb606] to-[#f39c12] rounded-lg p-4 sm:p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-base sm:text-lg opacity-90">Continue your learning journey</p>
      </div>

      {/* User Type Indicator for non-student users */}
      {authUser && <UserTypeIndicator user={authUser} showMessage={true} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">{inProgressCourses} in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{completedCourses}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{Math.round(totalProgress)}%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">Continue Learning</CardTitle>
         
         
          <Button variant="outline" size="sm"  className="hidden sm:flex"  asChild>
             <Link href={"/learning"}>
            View All
            </Link>
          </Button>
  {/* onClick={() => handleCourseClick(course)} */}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.slice(0, 3).map((course) => {
              const progress = user.progress.find((p) => p.courseId === course.id)
              return (
                <div
                  key={course.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                
                >
                  <Image
                    src={course.thumbnail || "/ai.png"}
                    alt={course.title}
                    className="w-full h-24 sm:h-32 object-cover rounded mb-3"
                    width={100}
                    height={100}
                  />
                  <h3 className="font-semibold mb-2 line-clamp-2 text-sm sm:text-base">{course.title}</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                      <AvatarImage src={course.instructor.avatar || "/ai.png"} />
                      <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm text-gray-600">{course.instructor.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Progress</span>
                      <span>{progress?.progress || 0}%</span>
                    </div>
                    <Progress value={progress?.progress || 0} className="h-2" />
                  </div>
                  <Button
                    className="w-full mt-3 bg-[#fdb606] hover:bg-[#f39c12] text-sm"
                asChild
                  >
                        {/* onClick={(e) => {
                      e.stopPropagation()
                      handleCourseClick(course)
                    }} */}
                    <Link href={`/course/chapter/1`}>
                    <Play className="h-4 w-4 mr-2" />
                    Continue
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Mobile View All Button */}
          <div className="sm:hidden mt-4">
            <Button variant="outline" className="w-full"  asChild>
                <Link href={"/learning"}>
              View All Courses
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">Recent Achievements</CardTitle>
          <Button variant="outline" size="sm"  className="hidden sm:flex" asChild>
            <Link href={"/achievements"}>
               View All
            </Link>
         
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Link href={"/achievements"}>
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="bg-[#fdb606] p-2 rounded-full">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">First Course Completed</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Completed your first course - UI/UX Design Masterclass
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              </div>
            </Link>
            <Link href={"/achievements"}>
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="bg-green-500 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">7-Day Learning Streak</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Learned for 7 consecutive days</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile View All Button */}
          <div className="sm:hidden mt-4">
            <Button variant="outline" className="w-full"  asChild>
                <Link href={"/achievements"}>
              View All Achievements
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
