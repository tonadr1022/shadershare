"use client";
import { ShaderData, ShaderUpdateCreatePayload } from "@/types/shader";
import axiosInstance from "./api";

// TODO: type
export const createShader = async (data: ShaderUpdateCreatePayload) => {
  const res = await axiosInstance.post("/shaders", data);
  return res.data;
};

// TODO: type
export const updateShader = async (data: ShaderUpdateCreatePayload) => {
  const res = await axiosInstance.put(`/shaders/${data.id}`, data);
  return res.data;
};

export const getShader = async (id: string): Promise<ShaderData> => {
  const res = await axiosInstance.get(`/shaders/${id}`);
  return res.data;
};
export const getUserShaders = async () => {
  const res = await axiosInstance.get("/profile?show=shaders");
  return res.data;
};

export const getShaders = async (
  offset?: number,
  limit?: number,
): Promise<ShaderData[]> => {
  const res = await axiosInstance.get("/shaders", {
    params: {
      offset: offset || 0,
      limit: limit || 10,
    },
  });
  return res.data;
};
