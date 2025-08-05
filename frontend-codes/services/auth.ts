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
      user_type: data.user_type || 'student',
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
export const verifyEmail = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post('/api/users/verify-email/')
    return response
  } catch (error) {
    throw error
  }
}

// Forgot password
export const forgotPassword = async (data: ForgotPasswordFormData): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post('/api/auth/password-reset/', { email: data.email })
    return response
  } catch (error) {
    throw error
  }
}

// Reset password
export const resetPassword = async (data: ResetPasswordFormData, uid: string, token: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post(`/api/auth/password-reset-confirm/${uid}/${token}/`, {
      new_password: data.password,
      confirm_password: data.confirmPassword,
    })
    return response
  } catch (error) {
    throw error
  }
}

// Change password
export const changePassword = async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post('/api/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    return response
  } catch (error) {
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.patch<User>('/api/users/profile/', data)
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
