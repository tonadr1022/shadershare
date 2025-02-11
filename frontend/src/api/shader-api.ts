"use client";
import { fakeDelay } from "@/lib/utils";
import axiosInstance from "./api";

// TODO: type
export const createShader = async (data: unknown) => {
  await fakeDelay(1000);
  const res = await axiosInstance.post("/shader", data);
  return res.data;
};
