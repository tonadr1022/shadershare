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

export function generatePagination(currentPage: number, totalPages: number) {
  const pagination = [];

  pagination.push(1);

  let start = Math.max(2, currentPage - 2);
  let end = Math.min(totalPages - 1, currentPage + 2);

  if (end - start < 4) {
    if (start === 2) {
      end = Math.min(totalPages - 1, start + 4);
    } else if (end === totalPages - 1) {
      start = Math.max(2, end - 4);
    }
  }

  if (start > 2) {
    pagination.push(-1);
  }

  for (let i = start; i <= end; i++) {
    pagination.push(i);
  }

  if (end < totalPages - 1) {
    pagination.push(-2);
  }

  if (totalPages > 1) {
    pagination.push(totalPages);
  }

  return pagination;
}
