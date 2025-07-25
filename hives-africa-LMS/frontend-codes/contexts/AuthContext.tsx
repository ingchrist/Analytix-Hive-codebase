"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStorage, userStorage, getRedirectPath, isProtectedRoute } from '@/lib/utils'
import { toast } from 'sonner'

// Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  user_type: 'student' | 'instructor' | 'admin'
  phone_number?: string
  bio?: string
  profile_picture?: string
  date_of_birth?: string
  is_active: boolean
  is_verified: boolean
  email_notifications: boolean
  sms_notifications: boolean
  profile?: {
    address?: string
    city?: string
    country?: string
    timezone?: string
    language?: string
    linkedin_url?: string
    twitter_url?: string
    website_url?: string
  }
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  checkAuth: () => Promise<boolean>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      handleRouteProtection()
    }
  }, [isLoading, isAuthenticated, router])

  const initializeAuth = async () => {
    try {
      const storedToken = tokenStorage.getToken()
      const storedUser = userStorage.getUser()

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
        
        // Verify token validity
        const isValid = await verifyToken(storedToken)
        if (!isValid) {
          logout()
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const handleRouteProtection = () => {
    const currentPath = window.location.pathname

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && isProtectedRoute(currentPath)) {
      router.push('/auth')
      return
    }

    // If user is authenticated and on auth page, redirect to dashboard
    if (isAuthenticated && currentPath === '/auth') {
      const redirectPath = getRedirectPath(user?.user_type)
      router.push(redirectPath)
      return
    }
  }

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        userStorage.setUser(userData)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  const login = (authToken: string, userData: User) => {
    setToken(authToken)
    setUser(userData)
    
    // Store in localStorage
    tokenStorage.setToken(authToken)
    userStorage.setUser(userData)

    // Redirect to appropriate dashboard
    const redirectPath = getRedirectPath(userData.user_type)
    router.push(redirectPath)
    
    // Show user type-specific welcome message
    const userTypeDisplay = userData.user_type.charAt(0).toUpperCase() + userData.user_type.slice(1)
    
    if (userData.user_type === 'instructor' || userData.user_type === 'admin') {
      toast.success(`Welcome back, ${userData.first_name}!`, {
        description: `${userTypeDisplay} dashboard will be available soon. For now, you're redirected to the student dashboard.`,
        duration: 6000,
      })
    } else {
      toast.success(`Welcome back, ${userData.first_name}!`, {
        description: `You're now logged in to your ${userTypeDisplay} dashboard.`,
      })
    }
  }

  const logout = () => {
    // Clear state
    setToken(null)
    setUser(null)
    
    // Clear storage
    tokenStorage.clearTokens()
    userStorage.removeUser()
    
    // Redirect to auth page
    router.push('/auth')
    
    toast.success('Logged out successfully')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      userStorage.setUser(updatedUser)
    }
  }

  const checkAuth = async (): Promise<boolean> => {
    if (!token) return false
    
    try {
      const isValid = await verifyToken(token)
      if (!isValid) {
        logout()
        return false
      }
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
