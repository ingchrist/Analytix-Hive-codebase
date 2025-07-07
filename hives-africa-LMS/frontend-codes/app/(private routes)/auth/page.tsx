"use client"
import { AuthContainer } from "@/components/auth/auth-container"
import type { LoginFormData, SignupFormData } from "@/lib/validations"
import { signinUser, signupUser } from "@/services/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AuthPage() {
  const router = useRouter()

  const handleLogin = async (data: LoginFormData) => {
    try {
      await signinUser(data)
      toast.success("Login successful")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSignup = async (data: SignupFormData) => {
    try {
      await signupUser(data)
      toast.success("Signup successful")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleForgotPassword = () => {
    console.log("Forgot password clicked")
    // Implement forgot password logic
    // Example: redirect to forgot password page
  }

  const handleGoogleSignIn = async () => {
    console.log("Google sign in clicked")
    // Implement Google OAuth logic
    // Example: await signInWithGoogle()
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
