import { getMe, logoutUser } from "@/api/auth-api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

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
