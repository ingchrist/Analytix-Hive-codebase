import { apiClient, ApiError, handleApiError } from '@/lib/api-client'
import { SignupFormData, LoginFormData, ForgotPasswordFormData, ResetPasswordFormData } from '@/lib/validations'
import { User } from '@/contexts/AuthContext'

// Authentication response types
interface AuthResponse {
  access: string
  refresh: string
  user: User
}

interface SignupResponse {
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    user_type: string
    is_verified: boolean
    profile_picture?: string
  }
  access: string
  refresh: string
}

interface UserResponse {
  user: User
}

// Sign up user
export const signupUser = async (data: SignupFormData): Promise<SignupResponse> => {
  try {
    const response = await apiClient.post<SignupResponse>('/api/auth/register/', {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      password_confirm: data.confirmPassword,
      user_type: data.user_type || 'student', // Use provided user_type or default to student
      phone_number: '', // Optional field
    })
    return response
  } catch (error) {
    throw error
  }
}

// Sign in user
export const signinUser = async (data: LoginFormData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/api/auth/login/', {
      email: data.email,
      password: data.password,
    })
    return response
  } catch (error) {
    throw error
  }
}

// Sign out user
export const signoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout/')
  } catch (error) {
    // Even if logout fails on server, we should clear client-side data
    console.warn('Logout request failed:', error)
  }
}

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/api/users/profile/')
    return response
  } catch (error) {
    throw error
  }
}

// Verify email
export const verifyEmail = async (key: string): Promise<{ detail: string }> => {
  try {
    const response = await apiClient.post('/api/auth/registration/verify-email/', { key })
    return response
  } catch (error) {
    throw error
  }
}

// Resend email verification
export const resendEmailVerification = async (email: string): Promise<{ detail: string }> => {
  try {
    const response = await apiClient.post('/api/auth/registration/resend-email/', { email })
    return response
  } catch (error) {
    throw error
  }
}

// Forgot password
export const forgotPassword = async (data: ForgotPasswordFormData): Promise<{ detail: string }> => {
  try {
    const response = await apiClient.post('/api/auth/password/reset/', data)
    return response
  } catch (error) {
    throw error
  }
}

// Reset password
export const resetPassword = async (data: ResetPasswordFormData): Promise<{ detail: string }> => {
  try {
    const response = await apiClient.post('/api/auth/password/reset/confirm/', {
      uid: data.token.split('-')[0], // Extract uid from token
      token: data.token.split('-')[1], // Extract token from token
      new_password1: data.password,
      new_password2: data.confirmPassword,
    })
    return response
  } catch (error) {
    throw error
  }
}

// Change password
export const changePassword = async (oldPassword: string, newPassword: string): Promise<{ detail: string }> => {
  try {
    const response = await apiClient.post('/api/auth/password/change/', {
      old_password: oldPassword,
      new_password1: newPassword,
      new_password2: newPassword,
    })
    return response
  } catch (error) {
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.patch<User>('/api/users/me/', data)
    return response
  } catch (error) {
    throw error
  }
}

// Social authentication (Google, Facebook, etc.)
export const socialAuth = async (provider: string, accessToken: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(`/api/auth/${provider}/`, {
      access_token: accessToken,
    })
    return response
  } catch (error) {
    throw error
  }
}
