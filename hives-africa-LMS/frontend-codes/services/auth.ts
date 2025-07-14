import { TLogin, TLoginResponse, TSignup, TSignupResponse } from "@/types";
import { apiClient } from "./api-client";

export const signup = async (data: TSignup): Promise<TSignupResponse> => {
  const response = await apiClient.post<TSignupResponse>("/auth/register/", data);
  return response.data;
};

export const signin = async (data: TLogin): Promise<TLoginResponse> => {
  const response = await apiClient.post<TLoginResponse>("/auth/login/", data);
  return response.data;
};