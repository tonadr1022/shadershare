"use client";
import { fakeDelay } from "@/lib/utils";
import axiosInstance from "./api";

// TODO: type
export const createShader = async (data: unknown) => {
  const res = await axiosInstance.post("/shader", data);
  return res.data;
};

export const getUserShaders = async () => {
  const res = await axiosInstance.get("/profile?show=shaders");
  return res.data;
};
