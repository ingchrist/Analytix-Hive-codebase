import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

export type TLogin = z.infer<typeof loginSchema>;
export type TSignup = z.infer<typeof signupSchema>;

export interface TLoginResponse {
  user: {
    id: string;
    email: string;
  };
  refresh: string;
  access: string;
}

export interface TSignupResponse {
  user: {
    id:string;
    email: string;
  };
  refresh: string;
  access: string;
}

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
