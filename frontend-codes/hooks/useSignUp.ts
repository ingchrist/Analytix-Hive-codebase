"use client"

import { useMutation } from '@tanstack/react-query'
import { signupUser } from '@/services/auth'
import { SignupFormData } from '@/lib/validations'
import { toast } from 'sonner'

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      // Store tokens if registration includes them
      if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
      }

      toast.success(`Welcome ${data.user.first_name}! Your account has been created successfully.`)
      console.log('Signup successful:', data)
    },
    onError: (error: any) => {
      console.error('Signup failed:', error)

      // Handle different error response structures
      let errorMessage = 'Registration failed. Please try again.'

      if (error.response?.data) {
        const errorData = error.response.data

        // Handle field-specific errors
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0]
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0]
          } else if (typeof firstError === 'string') {
            errorMessage = firstError
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    },
  })
}