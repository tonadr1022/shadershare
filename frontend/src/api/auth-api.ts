import { RegisterFormData } from "@/types/auth";
import axiosInstance from "./api";

export const registerUser = async (data: RegisterFormData) => {
  const res = await axiosInstance.post("/register", data);
  return res.data;
};
