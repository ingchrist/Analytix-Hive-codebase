
"use client";
import { useMutation } from "@tanstack/react-query";
import { TLogin, TLoginResponse } from "@/types";
import { signin } from "@/services/auth";
import { toast } from "sonner";

export const useSignin = () => {
  return useMutation<TLoginResponse, Error, TLogin>({
    mutationFn: (data: TLogin) => signin(data),
    onSuccess: (data) => {
      localStorage.setItem("token", data.access);
      toast.success("Logged in successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "An unknown error occurred");
    },
  });
};