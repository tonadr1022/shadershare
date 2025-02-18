"use client";
import { getMe, logoutUser } from "@/api/auth-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
