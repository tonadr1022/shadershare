import { getMe } from "@/api/auth-api";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60,
  });
};
