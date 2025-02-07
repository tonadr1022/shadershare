import { getMe } from "@/api/auth-api";
import { useQuery } from "@tanstack/react-query";

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    retry: false,
    queryFn: getMe,
    staleTime: 1000 * 60,
  });
};
