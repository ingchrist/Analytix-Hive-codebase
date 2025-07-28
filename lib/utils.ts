import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Storage utilities
export const storage = {
  get: (key: string) => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error(`Error getting item from localStorage:`, error)
        return null
      }
    }
    return null
  },

  set: (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error setting item to localStorage:`, error)
      }
    }
  },

  remove: (key: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error removing item from localStorage:`, error)
      }
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear()
      } catch (error) {
        console.error(`Error clearing localStorage:`, error)
      }
    }
  }
}

// Token utilities
export const tokenStorage = {
  getToken: () => storage.get('auth_token'),
  setToken: (token: string) => storage.set('auth_token', token),
  removeToken: () => storage.remove('auth_token'),
  
  getRefreshToken: () => storage.get('refresh_token'),
  setRefreshToken: (token: string) => storage.set('refresh_token', token),
  removeRefreshToken: () => storage.remove('refresh_token'),

  clearTokens: () => {
    storage.remove('auth_token')
    storage.remove('refresh_token')
    storage.remove('user')
  }
}

// User utilities
export const userStorage = {
  getUser: () => storage.get('user'),
  setUser: (user: any) => storage.set('user', user),
  removeUser: () => storage.remove('user'),
}

// Format utilities
export const formatError = (error: any): string => {
  if (typeof error === 'string') return error
  
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.response?.data?.error) return error.response.data.error
  if (error?.response?.data?.detail) return error.response.data.detail
  
  if (error?.message) return error.message
  
  return 'An unexpected error occurred'
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && 
         /[a-zA-Z]/.test(password) && 
         /[0-9]/.test(password) && 
         /[^a-zA-Z0-9]/.test(password)
}

// API utilities
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

// Route utilities
export const isProtectedRoute = (pathname: string): boolean => {
  const protectedRoutes = [
    '/dashboard',
    '/student',
    '/course',
    '/lecture',
    '/profile',
    '/settings',
    '/purchases',
    '/cart',
    '/wishlist'
  ]
  
  return protectedRoutes.some(route => pathname.startsWith(route))
}

export const getRedirectPath = (userType?: string): string => {
  // TODO: Implement separate dashboards for instructor and admin
  // For now, all users are redirected to student dashboard
  switch (userType) {
    case 'instructor':
      // TODO: return '/instructor/dashboard' when instructor dashboard is ready
      return '/student/dashboard' // Temporary redirect to prevent 404
    case 'admin':
      // TODO: return '/admin/dashboard' when admin dashboard is ready
      return '/student/dashboard' // Temporary redirect to prevent 404
    case 'student':
    default:
      return '/student/dashboard'
  }
}
