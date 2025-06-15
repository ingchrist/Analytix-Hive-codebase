import axios from 'axios';
import { SignupFormData } from '@/lib/validations';
import { LoginFormData } from '@/lib/validations';

const apiurl = ''; 
export const signupUser = async (data: SignupFormData) => {
  try {
    const response = await axios.post(`${apiurl}/api/auth/register`, data);
    return response.data;
  } catch (err: any) {
   
    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error(err.message || 'An unknown error occurred');
  }
};

export const signinUser = async (data: LoginFormData) => {
  try {
    const response = await axios.post(`${apiurl}/api/auth/login`, data);
    return response.data;
  } catch (err: any) {
   
    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error(err.message || 'An unknown error occurred');
  }
};