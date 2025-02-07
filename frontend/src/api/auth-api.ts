import { LoginFormData, RegisterFormData, User } from "@/types/auth";
import axiosInstance from "./api";

export const registerUser = async (data: RegisterFormData) => {
  const res = await axiosInstance.post("/register", data);
  return res.data;
};

export const loginUser = async (data: LoginFormData) => {
  const res = await axiosInstance.post("/login", data);
  return res.data;
};

export const loginUserWithProvider = async (provider: string) => {
  const res = await axiosInstance.get(`/auth/${provider}`);
  return res.data;
};

export const getMe = async (): Promise<User> => {
  const res = await axiosInstance.get("/me");
  return res.data;
};
