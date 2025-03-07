"use client";
import {
  BulkDeleteResp,
  ShaderData,
  ShaderDataWithUser,
  ShaderInput,
  ShaderListDetailedResp,
  ShaderListResp,
  ShaderOutputFull,
  ShaderPlaylist,
  ShaderPlaylistCreateUpdatePayload,
  ShaderToyShaderResp,
  ShaderUpdateCreatePayload,
} from "@/types/shader";
import axiosInstance from "./api";
import { User } from "@/types/auth";

// TODO: type
export const createShader = async (data: ShaderUpdateCreatePayload) => {
  const res = await axiosInstance.post("/shaders", data);
  return res.data;
};

export type ShaderFullUpload = {
  shader: ShaderUpdateCreatePayload;
  previewFile: File;
};
export const createShaderWithPreview = async ({
  shader,
  previewFile,
}: ShaderFullUpload): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append("file", previewFile);
  formData.append("json", JSON.stringify(shader));
  const res = await axiosInstance.post("/shaders", formData);
  return res.data;
};

export const bulkCreateShaderWithPreview = async (
  upload: ShaderFullUpload[],
): Promise<{ ids: string[] }> => {
  const formData = new FormData();
  const shaders: ShaderUpdateCreatePayload[] = [];
  for (const u of upload) {
    shaders.push(u.shader);
  }
  formData.append("json", JSON.stringify({ shaders }));

  let i = 0;
  for (const u of upload) {
    formData.append(`file_${i++}`, u.previewFile);
  }
  const res = await axiosInstance.post("/shaders", formData, {
    params: { bulk: true },
  });
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

export const deleteShaderBulk = async (
  ids: string[],
): Promise<BulkDeleteResp> => {
  const res = await axiosInstance.post(`/shaders/delete-bulk`, ids);
  return res.data;
};

export const deleteShader = async (id: string) => {
  const res = await axiosInstance.delete(`/shaders/${id}`);
  return res.data;
};

export const getShadersWithUsernamesImpl = async (
  detailed: boolean,
  user_id?: string,
  offset?: number,
  limit?: number,
  query?: string | null,
): Promise<ShaderListResp | ShaderListDetailedResp> => {
  const res = await axiosInstance.get("/shaders", {
    params: {
      include: user_id ? undefined : "username",
      offset,
      limit,
      user_id,
      detailed,
      query,
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
  query?: string | null,
): Promise<ShaderListResp> => {
  const queryParam = query ? encodeURIComponent(query) : null;
  const res = await axiosInstance.get("/me/shaders", {
    params: { detailed, offset, limit, sort, desc, query: queryParam },
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
  query?: string | null,
): Promise<ShaderListResp | ShaderListDetailedResp> => {
  if (detailed) {
    return getShadersWithUsernamesImpl(
      detailed,
      undefined,
      offset,
      limit,
      query,
    ) as Promise<ShaderListDetailedResp>;
  } else {
    return getShadersWithUsernamesImpl(
      detailed,
      undefined,
      offset,
      limit,
      query,
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
export const shaderPerPages = [12, 25, 50];

export const getUser = async (
  id: string,
  includeDetails?: boolean,
): Promise<User> => {
  const res = await axiosInstance.get(`/user/${id}`, {
    params: { details: includeDetails },
  });
  return res.data;
};
export const createShaderPlaylist = async (
  data: ShaderPlaylistCreateUpdatePayload,
): Promise<ShaderPlaylist> => {
  const res = await axiosInstance.post("/playlists/shaders", data);
  return res.data;
};

export const updateShaderPlaylist = async (
  data: ShaderPlaylistCreateUpdatePayload,
): Promise<void> => {
  if (!data.id) {
    throw new Error("no id to update playlist");
  }
  const res = await axiosInstance.post(`/playlists/shaders/${data.id}`, data);
  return res.data;
};

export const addShadersToPlaylist = async ({
  playlistID,
  shaderIDs,
}: {
  playlistID: string;
  shaderIDs: string[];
}): Promise<void> => {
  const res = await axiosInstance.post(
    `/playlists/shaders/${playlistID}/batch-add`,
    {
      shader_ids: shaderIDs,
    },
  );
  return res.data;
};

export const getPlaylist = async (
  id: string,
  includeShaders?: boolean,
): Promise<ShaderPlaylist> => {
  const res = await axiosInstance.get(`/playlists/shaders/${id}`, {
    params: { shaders: includeShaders },
  });
  return res.data;
};

export const getPlaylists = async (
  userID: string,
): Promise<ShaderPlaylist[]> => {
  const res = await axiosInstance.get(`/playlists/shaders?user_id=${userID}`);
  return res.data;
};
export const deletePlaylist = async (id: string) => {
  const res = await axiosInstance.delete(`/playlists/shaders/${id}`);
  return res.data;
};
export const playlistRemoveShaders = async ({
  ids,
  playlistID,
}: {
  ids: string[];
  playlistID: string;
}) => {
  const res = await axiosInstance.post(
    `/playlists/shaders/${playlistID}/bulk-delete`,
    { shader_ids: ids },
  );
  return res.data;
};
