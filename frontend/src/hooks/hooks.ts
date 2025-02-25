"use client";
import { getMe, getMeAuth, logoutUser } from "@/api/auth-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTheme } from "next-themes";
import { useMemo, useEffect, useState } from "react";
import { deleteShader } from "@/api/shader-api";

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    retry: false,
    queryFn: getMe,
    staleTime: 1000 * 60,
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
    staleTime: 1000 * 60,
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

export const useDeleteShader = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteShader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shaders"] });
      if (onSuccess) onSuccess();
    },
  });
};

export const assembleParams = (
  page: number,
  perPage: number,
  sort: string | null,
  desc: boolean,
) => {
  let res = `page=${page}&perpage=${perPage}&desc=${desc}`;
  if (sort) {
    res += `&sort=${sort}`;
  }
  return res;
};

export const useSortParams = (): {
  desc: boolean;
  sort: string | null;
  page: number;
  perPage: number;
} => {
  const p = useSearchParams();
  const page = parseInt(p.get("page") || "1");
  const sort = p.get("sort");
  const desc = p.get("desc");
  const perPage = parseInt(p.get("perpage") || "25");
  return {
    perPage,
    page,
    sort,
    desc: desc === "true",
  };
};
