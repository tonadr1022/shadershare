import { ErrorResponse } from "@/types/base";
import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fakeDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const toastAxiosErrors = (error: AxiosError) => {
  const errs = (error.response?.data as ErrorResponse)?.errors || [];
  for (const err of errs) {
    toast.error("Error: " + err);
  }
};
