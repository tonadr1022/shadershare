"use client";
import {
  ShaderData,
  ShaderDataWithUsernameResponse,
  ShaderUpdateCreatePayload,
} from "@/types/shader";
import axiosInstance from "./api";

// TODO: type
export const createShader = async (data: ShaderUpdateCreatePayload) => {
  const res = await axiosInstance.post("/shaders", data);
  return res.data;
};

export const createShaderWithPreview = async ({
  data,
  previewFile,
}: {
  data: ShaderUpdateCreatePayload;
  previewFile: File;
}): Promise<ShaderData> => {
  const formData = new FormData();
  formData.append("file", previewFile);
  formData.append("json", JSON.stringify(data));
  const res = await axiosInstance.post("/shaders", formData);
  return res.data;
};

export const updateShader = async (data: ShaderUpdateCreatePayload) => {
  const res = await axiosInstance.put(`/shaders/${data.id}`, data);
  return res.data;
};

export const updateShaderWithPreview = async ({
  data,
  previewFile,
}: {
  data: ShaderUpdateCreatePayload;
  previewFile?: File | null;
}) => {
  const formData = new FormData();
  if (previewFile) {
    formData.append("file", previewFile);
  }
  formData.append("json", JSON.stringify(data));
  const res = await axiosInstance.put(`/shaders/${data.id}`, formData);
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

// TODO: combine with other getshaders?
export const getShadersWithUsernames = async (
  offset?: number,
  limit?: number,
): Promise<ShaderDataWithUsernameResponse> => {
  const res = await axiosInstance.get("/shaders", {
    params: {
      include: "usernames",
      offset: offset || 0,
      limit: limit || 10,
    },
  });
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
