
"use client"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginFormData } from '@/lib/validations';
import { signinUser } from '@/services/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';



type SignupResponse = any



// Custom hook for signup mutation
export const useSigninMutation = () => {
    const router = useRouter();

  return useMutation<SignupResponse, Error, LoginFormData>({
    mutationFn: signinUser,
    
    onSuccess: (data) => {
   
      console.log('Login successful:', data);

      toast.success('Welcome!', {
        description: `Account created successfully for`,
      });
      router.push('/(private routes)/(student)/dashboard');
    },
    
    onError: (error) => {
    console.error('Signin failed:', error.message);
    toast.error('Signup Failed', {
        description: error.message || 'Something went wrong. Please try again.',
        duration: 5000,
      });
    },
    
  
  } );
};