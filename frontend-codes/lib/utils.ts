import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Token storage utilities
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', token)
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('refresh_token', token)
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

// User storage utilities
export const userStorage = {
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  setUser: (user: any): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('user', JSON.stringify(user))
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('user')
  }
}

// Route protection
export const isProtectedRoute = (pathname: string): boolean => {
  const protectedRoutes = ['/dashboard', '/learning', '/student']
  return protectedRoutes.some(route => pathname.startsWith(route))
}

// Get redirect path based on user type
export const getRedirectPath = (userType?: 'student' | 'instructor' | 'admin'): string => {
  switch (userType) {
    case 'instructor':
      return '/dashboard' // All users go to dashboard for now
    case 'admin':
      return '/dashboard'
    case 'student':
    default:
      return '/dashboard'
  }
}