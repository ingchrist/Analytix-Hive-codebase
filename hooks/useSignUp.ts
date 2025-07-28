"use client"

import { useMutation } from '@tanstack/react-query'
import { SignupFormData } from '@/lib/validations'
import { signupUser } from '@/services/auth'
import { handleApiError, isApiError } from '@/lib/api-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Custom hook for signup mutation
export const useSignupMutation = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: signupUser,
    
    onSuccess: (data) => {
      console.log('Signup successful:', data)

      toast.success('Account Created!', {
        description: 'Please check your email to verify your account.',
        duration: 6000,
      })
      
      // Redirect to a verification pending page or login
      router.push('/auth?message=verification-sent')
    },
    
    onError: (error) => {
      console.error('Signup failed:', error)
      
      if (isApiError(error)) {
        // Handle field-specific validation errors
        if (error.field_errors) {
          Object.entries(error.field_errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages.join(', ')}`)
          })
        } else {
          toast.error('Signup Failed', {
            description: error.message,
            duration: 5000,
          })
        }
      } else {
        toast.error('Signup Failed', {
          description: 'Something went wrong. Please try again.',
          duration: 5000,
        })
      }
    },
  })
}
