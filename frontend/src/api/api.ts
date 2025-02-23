"use client";
export const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
export const apiPath = "/api/v1";
export const fullAPIPath = `${apiBaseURL}${apiPath}`;

import { ErrorResponse } from "@/types/base";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: `${apiBaseURL}${apiPath}`,
  timeout: 10000,
  withCredentials: true,
});

export const GetErrorMessage = (
  error: AxiosError,
): ErrorResponse | undefined => {
  return error.response?.data as ErrorResponse | undefined;
};

// sends toasts for each error message
export const SetToastErrors = (error: AxiosError, defaultMsg: string) => {
  const err = GetErrorMessage(error);
  if (err) {
    for (const msg of err.errors) {
      toast.error(msg);
    }
  } else {
    toast.error(defaultMsg);
  }
};

export default axiosInstance;
