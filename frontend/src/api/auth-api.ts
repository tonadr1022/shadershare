"use client";
import { LoginFormData, RegisterFormData, User } from "@/types/auth";
import axiosInstance from "./api";
import { AxiosResponse } from "axios";

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

export const getMeAuth = async (): Promise<AxiosResponse<User, undefined>> => {
  const res = await axiosInstance.get("/me");
  return res;
};

export const logoutUser = async () => {
  await axiosInstance.post("/logout");
};

export const updateUser = async (data: Partial<User>): Promise<User> => {
  const res = await axiosInstance.put("/profile", data);
  return res.data;
};
