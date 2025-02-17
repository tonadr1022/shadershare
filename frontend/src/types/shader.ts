export type TextureWrap = "repeat" | "clamp";
export type FilterMode = "nearest" | "linear";
export type ShaderInputType = "texture" | "buffer";
export type ShaderOutputType = "common" | "image" | "buffer";

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
  url?: string;
  // TODO: make type
  type: ShaderInputType;
  name: string;
  idx: number;
  properties?: TextureProps | undefined;
};

export type ShaderOutput = {
  id?: string;
  code: string;
  name: string;
  type: ShaderOutputType;
  idx: number;
};

export enum AccessLevel {
  PRIVATE = 0,
  PUBLIC = 1,
  UNLISTED = 2,
}

export type ShaderData = {
  shader: {
    id: string;
    title: string;
    description: string;
    created_at: string;
    access_level: AccessLevel;
    preview_img_url: string | undefined;
    user_id: string;
  };
  shader_inputs: ShaderInput[];
  shader_outputs: ShaderOutput[];
};

export type ShaderDataWithUsernameResponse = {
  shaders: ShaderData[];
  usernames: string[];
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
