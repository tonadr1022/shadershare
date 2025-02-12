"use client";
import { getMe, logoutUser } from "@/api/auth-api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTheme } from "next-themes";
import { useMemo, useEffect, useState } from "react";

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
  const logout = useCallback(async () => {
    await logoutUser();
    router.refresh();
  }, [router]);

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
