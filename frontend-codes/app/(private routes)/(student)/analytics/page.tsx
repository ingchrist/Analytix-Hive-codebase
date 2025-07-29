"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  TrendingUp,
  Clock,
  Target,
  Calendar,
  BarChart3,
  Award,
  BookOpen,
  Zap,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import type { User, Course } from "@/types"
import { useDashboard } from "../studentContext"
interface LearningGoal {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  category: "time" | "courses" | "skills" | "certificates"
  isCompleted: boolean
  createdAt: string
}

interface WeeklyData {
  week: string
  hoursLearned: number
  coursesCompleted: number
  quizzesCompleted: number
}

interface ProgressAnalyticsProps {
  user: User
  enrolledCourses: Course[]
}

const weeklyData: WeeklyData[] = [
  { week: "Week 1", hoursLearned: 8, coursesCompleted: 0, quizzesCompleted: 3 },
  { week: "Week 2", hoursLearned: 12, coursesCompleted: 1, quizzesCompleted: 5 },
  { week: "Week 3", hoursLearned: 15, coursesCompleted: 0, quizzesCompleted: 7 },
  { week: "Week 4", hoursLearned: 10, coursesCompleted: 1, quizzesCompleted: 4 },
]

const learningGoals: LearningGoal[] = [
  {
    id: "1",
    title: "Complete 5 Courses",
    description: "Finish 5 courses by the end of the month",
    targetValue: 5,
    currentValue: 3,
    unit: "courses",
    deadline: "2024-02-29",
    category: "courses",
    isCompleted: false,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    title: "Study 20 Hours Weekly",
    description: "Maintain consistent learning schedule",
    targetValue: 20,
    currentValue: 15,
    unit: "hours",
    deadline: "2024-02-07",
    category: "time",
    isCompleted: false,
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    title: "Master React Development",
    description: "Complete all React-related courses",
    targetValue: 3,
    currentValue: 3,
    unit: "skills",
    deadline: "2024-01-31",
    category: "skills",
    isCompleted: true,
    createdAt: "2024-01-01",
  },
]


export default function ProgressAnalytics() {
   const { user, enrolledCourses}=useDashboard()
  const [timeRange, setTimeRange] = useState("month")
  const [goals, setGoals] = useState<LearningGoal[]>(learningGoals)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null)

  // Calculate statistics
  const totalHoursThisMonth = weeklyData.reduce((sum, week) => sum + week.hoursLearned, 0)
  const averageHoursPerWeek = totalHoursThisMonth / weeklyData.length
  const coursesCompletedThisMonth = user.progress.filter((p) => p.progress === 100).length
  const currentStreak = 7 // Mock data
  const completedGoals = goals.filter((g) => g.isCompleted).length
  const activeGoals = goals.filter((g) => !g.isCompleted).length

  const handleCreateGoal = () => {
    setEditingGoal(null)
    setIsGoalModalOpen(true)
  }

  const handleEditGoal = (goal: LearningGoal) => {
    setEditingGoal(goal)
    setIsGoalModalOpen(true)
  }

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "time":
        return Clock
      case "courses":
        return BookOpen
      case "skills":
        return Target
      case "certificates":
        return Award
      default:
        return Target
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "time":
        return "bg-blue-100 text-blue-800"
      case "courses":
        return "bg-green-100 text-green-800"
      case "skills":
        return "bg-purple-100 text-purple-800"
      case "certificates":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Progress Analytics</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalHoursThisMonth}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Weekly</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{averageHoursPerWeek.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Hours per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-[#fdb606]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-[#fdb606]">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{coursesCompletedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Courses this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Learning Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{week.week}</span>
                      <span>{week.hoursLearned} hours</span>
                    </div>
                    <Progress value={(week.hoursLearned / 20) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Learning Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Monday</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Wednesday</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={70} className="w-20 h-2" />
                      <span className="text-sm">70%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Saturday</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={60} className="w-20 h-2" />
                      <span className="text-sm">60%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferred Learning Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Morning (6-12 PM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-20 h-2" />
                      <span className="text-sm">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Afternoon (12-6 PM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={30} className="w-20 h-2" />
                      <span className="text-sm">30%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Evening (6-12 AM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={25} className="w-20 h-2" />
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrolledCourses.map((course) => {
                  const progress = user.progress.find((p) => p.courseId === course.id)
                  const progressValue = progress?.progress || 0

                  return (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-1">{course.title}</h4>
                          <p className="text-sm text-gray-600">{course.instructor.name}</p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-sm font-medium">{progressValue}%</span>
                          {progressValue === 100 && <Badge className="ml-2 bg-green-500">Completed</Badge>}
                        </div>
                      </div>
                      <Progress value={progressValue} className="h-2" />
                      {progress?.lastAccessed && (
                        <p className="text-xs text-gray-500">
                          Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Course Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Learning by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Web Development</span>
                    <span className="text-sm">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Design</span>
                    <span className="text-sm">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Programming</span>
                    <span className="text-sm">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Marketing</span>
                    <span className="text-sm">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Learning Goals</h3>
              <p className="text-sm text-gray-600">
                {completedGoals} completed, {activeGoals} active
              </p>
            </div>
            <Button onClick={handleCreateGoal} className="bg-[#fdb606] hover:bg-[#f39c12]">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const Icon = getCategoryIcon(goal.category)
              const progressPercentage = (goal.currentValue / goal.targetValue) * 100
              const isOverdue = new Date(goal.deadline) < new Date() && !goal.isCompleted

              return (
                <Card key={goal.id} className={`${goal.isCompleted ? "bg-green-50 border-green-200" : ""}`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${goal.isCompleted ? "bg-green-500" : "bg-[#fdb606]"}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{goal.title}</h4>
                          <Badge className={getCategoryColor(goal.category)}>{goal.category}</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditGoal(goal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{goal.description}</p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress value={Math.min(progressPercentage, 100)} className="h-2" />

                      <div className="flex justify-between items-center text-xs">
                        <span className={`flex items-center space-x-1 ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </span>
                        {goal.isCompleted && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Completed</span>
                          </div>
                        )}
                        {isOverdue && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span>Overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Goal Creation/Edit Modal */}
          <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
                <DialogDescription>Set up a learning goal to track your progress</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalTitle">Goal Title</Label>
                  <Input
                    id="goalTitle"
                    placeholder="e.g., Complete 5 courses"
                    defaultValue={editingGoal?.title || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="goalDescription">Description</Label>
                  <Input
                    id="goalDescription"
                    placeholder="Brief description of your goal"
                    defaultValue={editingGoal?.description || ""}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetValue">Target</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      placeholder="5"
                      defaultValue={editingGoal?.targetValue || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select defaultValue={editingGoal?.unit || "courses"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="courses">Courses</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="skills">Skills</SelectItem>
                        <SelectItem value="certificates">Certificates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" defaultValue={editingGoal?.deadline || ""} />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue={editingGoal?.category || "courses"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Time</SelectItem>
                      <SelectItem value="courses">Courses</SelectItem>
                      <SelectItem value="skills">Skills</SelectItem>
                      <SelectItem value="certificates">Certificates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGoalModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#fdb606] hover:bg-[#f39c12]">
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Peak Performance</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    You learn best on Monday mornings. Consider scheduling challenging topics during this time.
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Consistency Streak</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Great job maintaining a 7-day learning streak! Keep it up to build lasting habits.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Improvement Area</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Your weekend learning time has decreased. Try setting aside time for review sessions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-[#fdb606] rounded-full">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Set Weekly Goals</h4>
                      <p className="text-sm text-gray-600">
                        Break down your monthly targets into weekly milestones for better tracking.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-500 rounded-full">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Diversify Learning</h4>
                      <p className="text-sm text-gray-600">
                        Consider exploring new categories to broaden your skill set.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Optimize Schedule</h4>
                      <p className="text-sm text-gray-600">
                        Your most productive time is 9-11 AM. Schedule important lessons then.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Efficiency Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#fdb606] mb-2">92%</div>
                  <p className="text-sm text-gray-600">Course Completion Rate</p>
                  <p className="text-xs text-gray-500 mt-1">Above average</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">4.2</div>
                  <p className="text-sm text-gray-600">Avg. Quiz Score</p>
                  <p className="text-xs text-gray-500 mt-1">Out of 5.0</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
                  <p className="text-sm text-gray-600">Retention Rate</p>
                  <p className="text-xs text-gray-500 mt-1">Knowledge retained</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
