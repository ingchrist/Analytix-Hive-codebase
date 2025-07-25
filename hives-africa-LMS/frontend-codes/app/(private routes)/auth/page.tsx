"use client"

import { AuthContainer } from "@/components/auth/auth-container"
import type { LoginFormData, SignupFormData } from "@/lib/validations"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useEffect } from "react"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  
  // Check for verification message
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'verification-sent') {
      toast.info('Verification Email Sent', {
        description: 'Please check your email and click the verification link to activate your account.',
        duration: 8000,
      })
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/student/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async (data: LoginFormData) => {
    // Login logic is now handled by the login form and authentication context
    console.log('Login attempted with:', data)
  }

  const handleSignup = async (data: SignupFormData) => {
    // Signup logic is now handled by the signup form and hooks
    console.log('Signup attempted with:', data)
  }

  const handleForgotPassword = () => {
    toast.info('Forgot Password', {
      description: 'Password reset functionality will be available soon.',
    })
    // TODO: Implement forgot password flow
    // router.push('/auth/forgot-password')
  }

  const handleGoogleSignIn = async () => {
    toast.info('Google Sign In', {
      description: 'Google authentication will be available soon.',
    })
    // TODO: Implement Google OAuth
    // try {
    //   const result = await socialAuth('google', accessToken)
    //   // Handle successful authentication
    // } catch (error) {
    //   toast.error('Google sign in failed')
    // }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AuthContainer
        initialMode="login"
        onLogin={handleLogin}
        onSignup={handleSignup}
        onForgotPassword={handleForgotPassword}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </div>
  )
}
