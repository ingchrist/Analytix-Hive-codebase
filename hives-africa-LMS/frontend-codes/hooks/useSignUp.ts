
"use client";
import { useMutation } from "@tanstack/react-query";
import { TSignup, TSignupResponse } from "@/types";
import { signup } from "@/services/auth";
import { toast } from "sonner";

export const useSignup = () => {
  return useMutation<TSignupResponse, Error, TSignup>({
    mutationFn: (data: TSignup) => signup(data),
    onSuccess: (data) => {
      toast.success("Account created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "An unknown error occurred");
    },
  });
};