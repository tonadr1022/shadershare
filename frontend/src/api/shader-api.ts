"use client";
import {
  ShaderData,
  ShaderDataWithUser,
  ShaderInput,
  ShaderListDetailedResp,
  ShaderListResp,
  ShaderOutputFull,
  ShaderToyShaderResp,
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

export const getShader = async (
  id: string,
  detailed: boolean,
): Promise<ShaderData> => {
  const res = await axiosInstance.get(`/shaders/${id}`, {
    params: {
      detailed,
    },
  });
  return res.data;
};

export const getShaderWithUsername = async (
  id: string,
  detailed?: boolean,
): Promise<ShaderDataWithUser> => {
  const res = await axiosInstance.get(`/shaders/${id}`, {
    params: { include: "username", detailed },
  });
  return res.data;
};

export const deleteShader = async (id: string) => {
  const res = await axiosInstance.delete(`/shaders/${id}`);
  return res.data;
};

const getShadersWithUsernamesImpl = async (
  detailed: boolean,
  user_id?: string,
  offset?: number,
  limit?: number,
): Promise<ShaderListResp | ShaderListDetailedResp> => {
  const res = await axiosInstance.get("/shaders", {
    params: {
      include: user_id ? undefined : "username",
      offset,
      limit,
      user_id,
      detailed,
    },
  });
  return res.data;
};

export const getUserShaders = async (
  offset: number,
  limit: number,
  detailed?: boolean,
  sort?: string | null,
  desc?: boolean | null,
): Promise<ShaderListResp> => {
  const res = await axiosInstance.get("/me/shaders", {
    params: { detailed, offset, limit, sort, desc },
  });
  return res.data;
};

export const getShadersWithUsernamesDetailed = async (
  offset?: number,
  limit?: number,
): Promise<ShaderListDetailedResp> => {
  return getShadersWithUsernamesImpl(
    true,
    undefined,
    offset,
    limit,
  ) as Promise<ShaderListDetailedResp>;
};

export const getShadersWithUsernames = async (
  detailed: boolean,
  offset?: number,
  limit?: number,
): Promise<ShaderListResp | ShaderListDetailedResp> => {
  if (detailed) {
    return getShadersWithUsernamesImpl(
      detailed,
      undefined,
      offset,
      limit,
    ) as Promise<ShaderListDetailedResp>;
  } else {
    return getShadersWithUsernamesImpl(
      detailed,
      undefined,
      offset,
      limit,
    ) as Promise<ShaderListResp>;
  }
};

export const deleteShaderInput = async (id: string) => {
  const res = await axiosInstance.delete(`/shaders/input/${id}`);
  return res.data;
};

export const deleteShaderOutput = async (id: string) => {
  const res = await axiosInstance.delete(`/shaders/output/${id}`);
  return res.data;
};

export const createShaderInput = async (data: ShaderInput) => {
  const res = await axiosInstance.post("/shaders/input", data);
  return res.data;
};
export const createShaderOutput = async (data: ShaderOutputFull) => {
  const res = await axiosInstance.post("/shaders/output", data);
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

export const getShadertoyShader = async (
  id: string,
): Promise<ShaderToyShaderResp> => {
  const res = await axiosInstance.get(`/shadertoy/${id}`);
  return res.data;
};
