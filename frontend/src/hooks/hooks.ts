"use client";
import { getMeAuth, logoutUser } from "@/api/auth-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTheme } from "next-themes";
import { useMemo, useEffect, useState } from "react";
import { createShaderWithPreview, deleteShader } from "@/api/shader-api";
import { toastAxiosErrors } from "@/lib/utils";
import axiosInstance from "@/api/api";
import { AxiosError } from "axios";
import { User } from "@/types/auth";

export const useGetMe = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["me"],
    retry: (failureCount, error) => {
      const err = error as AxiosError;
      if (err.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    queryFn: async (): Promise<User> => {
      try {
        const res = await axiosInstance.get("/me");
        return res.data;
      } catch (error) {
        const err = error as AxiosError;
        if (err.status === 401) {
          queryClient.setQueryData(["me"], { error: "Unauthorized" });
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetMeRedirect = () => {
  const router = useRouter();
  return useQuery({
    queryKey: ["me"],
    retry: false,
    queryFn: async () => {
      const res = await getMeAuth();
      if (res.status >= 400) {
        router.push("/login");
      }
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useLogout = () => {
  const router = useRouter();
  const client = useQueryClient();
  const logout = useCallback(async () => {
    await logoutUser();
    client.invalidateQueries({ queryKey: ["me"] });
    client.resetQueries({ queryKey: ["me"] });
    router.push("/");
  }, [router, client]);

  return logout;
};

export const useResolvedTheme = (): "light" | "dark" => {
  const { theme, resolvedTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setSystemTheme("dark");
    } else {
      setSystemTheme("light");
    }
  }, []);

  return useMemo(() => {
    switch (resolvedTheme || theme) {
      case "light":
        return "light";
      case "dark":
        return "dark";
      case "system":
        return systemTheme;
      default:
        return "light";
    }
  }, [theme, resolvedTheme, systemTheme]);
};

export const useSortParams = (): {
  desc: boolean;
  sort: string | null;
  page: number;
  perPage: number;
  query: string | null;
} => {
  const p = useSearchParams();
  const page = parseInt(p.get("page") || "1");
  const sort = p.get("sort");
  const desc = p.get("desc");
  const perPage = parseInt(p.get("perpage") || "25");

  return {
    perPage,
    query: p.get("query"),
    page,
    sort,
    desc: desc === "true",
  };
};

export const useDeleteShader = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  // const { page, perPage, sort, desc, query } = useSortParams();
  return useMutation({
    mutationFn: deleteShader,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shaders"],
      });
      router.refresh();
      if (onSuccess) onSuccess();
    },
  });
};

export const assembleParams = (
  page: number,
  perPage: number,
  sort: string | null,
  desc: boolean,
  query: string | null,
) => {
  let res = `page=${page}&perpage=${perPage}&desc=${desc}`;
  if (sort) {
    res += `&sort=${sort}`;
  }
  if (query) {
    res += `&query=${encodeURIComponent(query)}`;
  }
  return res;
};

export const useCreateShader = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: createShaderWithPreview,
    onError: toastAxiosErrors,
    onSuccess: (data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["shaders", data.id] });
      router.push(`/view/${data.id}`);
    },
  });
};
