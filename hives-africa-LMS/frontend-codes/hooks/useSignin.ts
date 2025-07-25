"use client"

import { useMutation } from '@tanstack/react-query'
import { LoginFormData } from '@/lib/validations'
import { signinUser } from '@/services/auth'
import { useAuth } from '@/contexts/AuthContext'
import { handleApiError, isApiError } from '@/lib/api-client'
import { toast } from 'sonner'

// Custom hook for signin mutation
export const useSigninMutation = () => {
  const { login } = useAuth()

  return useMutation({
    mutationFn: signinUser,
    
    onSuccess: (data) => {
      console.log('Login successful:', data)
      
      // Use the auth context login method
      login(data.key, data.user)
      
      toast.success('Welcome back!', {
        description: `Successfully logged in as ${data.user.first_name}`,
      })
    },
    
    onError: (error) => {
      console.error('Signin failed:', error)
      
      if (isApiError(error)) {
        // Handle field-specific validation errors
        if (error.field_errors) {
          Object.entries(error.field_errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages.join(', ')}`)
          })
        } else {
          toast.error('Login Failed', {
            description: error.message,
            duration: 5000,
          })
        }
      } else {
        toast.error('Login Failed', {
          description: 'Something went wrong. Please try again.',
          duration: 5000,
        })
      }
    },
  })
}
