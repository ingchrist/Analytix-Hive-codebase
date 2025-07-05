export interface User {
  id: string
  name: string
  email: string
  avatar: string
  enrolledCourses: string[]
  wishlist: string[]
  progress: CourseProgress[]
  achievements: string[]
  preferences: UserPreferences
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: Instructor
  thumbnail: string
  duration: number
  lectures: Lecture[]
  rating: number
  price: number
  category: string
  level: string
  language: string
}

export interface Instructor {
  name: string
  avatar: string
}

export interface Lecture {
  id: string
  title: string
  duration: number
  completed: boolean
}

export interface CourseProgress {
  courseId: string
  progress: number
  lastAccessed: string
}

export interface UserPreferences {
  language: string
  autoplay: boolean
  quality: string
}
