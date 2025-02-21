export type TextureWrap = "repeat" | "clamp";
export type FilterMode = "nearest" | "linear";
export type ShaderInputType = "texture" | "buffer";
export type ShaderOutputType = "common" | "image" | "buffer";
export type BufferName =
  | "Buffer A"
  | "Buffer B"
  | "Buffer C"
  | "Buffer D"
  | "Buffer E"
  | "Image";
export type ShaderOutputName = BufferName | "Common";

export const shaderOutputNames: ShaderOutputName[] = [
  "Common",
  "Buffer A",
  "Buffer B",
  "Buffer C",
  "Buffer D",
  "Buffer E",
  "Image",
];

export type TextureProps = {
  wrap: TextureWrap;
  filter: FilterMode;
  vflip: boolean;
};

export const DefaultTextureProps: TextureProps = {
  wrap: "repeat",
  filter: "linear",
  vflip: false,
};

export type ShaderInput = {
  id?: string;
  shader_id?: string;
  url?: string;
  // TODO: make type
  type: ShaderInputType;
  name: string;
  idx: number;
  properties?: TextureProps | undefined;
};

export type ShaderOutput = {
  id?: string;
  shader_id?: string;
  code: string;
  name: ShaderOutputName;
  type: ShaderOutputType;
};

export enum AccessLevel {
  PRIVATE = 0,
  PUBLIC = 1,
  UNLISTED = 2,
}
export type ShaderMetadata = {
  id: string;
  title: string;
  description: string;
  user_id: string;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
  preview_img_url: string;
};

export type ShaderData = {
  shader: ShaderMetadata;
  shader_inputs: ShaderInput[];
  shader_outputs: ShaderOutput[];
};

export type ShaderDataWithUser = ShaderData & {
  username?: string;
};
export type ShaderDataWithUsernameResponse = {
  shaders: ShaderDataWithUser[];
  total: number;
};

export type CompileResult = {
  success: boolean;
};
export type RenderData = {
  fragmentText: string;
};

export type EmptyResult = {
  message?: string;
  error: boolean;
};

export type Result<T> = {
  data?: T;
  message?: string;
  error: boolean;
};

export type ErrMsg = {
  line: number;
  message: string;
};

export type IRendererInitPararms = {
  canvas: HTMLCanvasElement;
  shaderInputs: ShaderInput[];
  shaderOutputs: ShaderOutput[];
};

export type ShaderUpdateCreatePayload = {
  id?: string;
  title?: string;
  user_id?: string;
  access_level?: AccessLevel;
  preview_img_url?: string;
  description?: string;
  shader_inputs?: ShaderInput[];
  shader_outputs?: ShaderOutput[];
};
