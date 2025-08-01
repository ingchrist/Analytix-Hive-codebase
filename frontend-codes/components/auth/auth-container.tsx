"use client"

import * as React from "react"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import type { LoginFormData, SignupFormData } from "@/lib/validations"

type AuthMode = "login" | "signup"

interface AuthContainerProps {
  currentMode?: AuthMode
  onModeSwitch?: (mode: AuthMode) => void
  onLogin?: (data: LoginFormData) => Promise<void> | void
  onSignup?: (data: SignupFormData) => Promise<void> | void
  onForgotPassword?: () => void
  onGoogleSignIn?: () => Promise<void> | void
  isLoading?: boolean
  // Keep backward compatibility
  initialMode?: AuthMode
}

export function AuthContainer({
  currentMode,
  onModeSwitch,
  initialMode = "login",
  onLogin,
  onSignup,
  onForgotPassword,
  onGoogleSignIn,
  isLoading = false,
}: AuthContainerProps) {
  // Use external mode control if provided, otherwise use internal state
  const [internalMode, setInternalMode] = React.useState<AuthMode>(initialMode)
  const mode = currentMode || internalMode

  const handleModeSwitch = (newMode: AuthMode) => {
    if (onModeSwitch) {
      // Use external mode switching (URL-based)
      onModeSwitch(newMode)
    } else {
      // Use internal mode switching (component state)
      setInternalMode(newMode)
    }
  }

  if (mode === "signup") {
    return (
      <SignupForm
        onSubmit={onSignup}
        onLoginClick={() => handleModeSwitch("login")}
        onGoogleSignIn={onGoogleSignIn}
        isLoading={isLoading}
      />
    )
  }

  return (
    <LoginForm
      onSubmit={onLogin}
      onSignUpClick={() => handleModeSwitch("signup")}
      onForgotPasswordClick={onForgotPassword}
      onGoogleSignIn={onGoogleSignIn}
      isLoading={isLoading}
    />
  )
}
