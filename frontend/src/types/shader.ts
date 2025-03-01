export type TextureWrap = "repeat" | "clamp";
export type FilterMode = "nearest" | "linear";
export type ShaderInputType = "texture" | "buffer" | "keyboard";
export type ShaderOutputType = "common" | "image" | "buffer";
export type BufferName =
  | "Buffer A"
  | "Buffer B"
  | "Buffer C"
  | "Buffer D"
  | "Buffer E"
  | "Image";
export type ShaderOutputName = BufferName | "Common";
export type ShaderCompileErrMsgState = {
  [K in ShaderOutputName]: ErrMsg[] | null;
};

export const shaderOutputNamesStrs = [
  "Common",
  "Buffer A",
  "Buffer B",
  "Buffer C",
  "Buffer D",
  "Buffer E",
  "Image",
];
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
export type BufferProps = {
  name: BufferName;
};

export const DefaultTextureProps: TextureProps = {
  wrap: "repeat",
  filter: "linear",
  vflip: false,
};
export const DefaultBufferProps: BufferProps = {
  name: "Buffer A",
};

export type ShaderInput = {
  id?: string;
  shader_id?: string;
  output_id?: string;
  url?: string;
  // TODO: make type
  type: ShaderInputType;
  idx: number;
  properties: TextureProps | BufferProps | object;
  dirty?: boolean;
  new?: boolean;
};

export type ShaderSort = "updated_at" | "created_at" | "title";

export const DefaultShaderInputBuffer: ShaderInput = {
  type: "buffer",
  idx: 0,
  properties: {
    name: "Buffer A",
  },
};

export const DefaultShaderInputTexture: ShaderInput = {
  url: "https://dummyimage.com/64x64/ffffff/ffffff.png",
  type: "texture",
  idx: 0,
  properties: {
    wrap: "repeat",
    filter: "linear",
    vflip: true,
  },
};

export type ShaderOutput = {
  id?: string;
  shader_id?: string;
  code: string;
  name: ShaderOutputName;
  type: ShaderOutputType;
  flags: number;
  dirty?: boolean;
  new?: boolean;
};

export type ShaderOutputFull = ShaderOutput & {
  shader_inputs: ShaderInput[] | null;
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
  flags: number;
  created_at: string;
  updated_at: string;
  preview_img_url: string;
};

export type ShaderData = ShaderMetadata & {
  shader_outputs: ShaderOutputFull[];
};

export type ShaderDataWithUser = ShaderData & {
  username?: string;
};

export type ShaderWithUser = ShaderMetadata & {
  username?: string;
};

export type ShaderListResp = {
  shaders: ShaderWithUser[];
  total: number;
};

export type ShaderListDetailedResp = {
  shaders: ShaderDataWithUser[];
  total: number;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isShaderData = (data: any): data is ShaderData => {
  return data && Array.isArray(data.shader_outputs);
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
  shaderOutputs: ShaderOutputFull[];
};

export const SHADER_USE_KEYBOARD_BIT = 1;
export const OUTPUT_USE_KEYBOARD_BIT = 1;

export type ShaderUpdateCreatePayload = {
  id?: string;
  title?: string;
  user_id?: string;
  flags: number;
  access_level?: AccessLevel;
  preview_img_url?: string;
  description?: string;
  deleted_input_ids?: string[];
  shader_outputs?: ShaderOutputFull[];
};

export type ShadertoyInput = {
  channel: number;
  ctype: string | undefined;
  type: string | undefined;
  id: number;
  src: string | undefined;
  filepath: string | undefined;
  sampler: {
    filter: "linear" | "nearest" | "mipmap";
    vflip: boolean;
    wrap: "clamp" | "repeat";
  };
};

export type ShadertoyOutput = {
  channel: number;
  id: number;
};

export type ShadertoyRenderPass = {
  code: string;
  description: string;
  name: string;
  type: string;
  inputs: ShadertoyInput[];
  outputs: ShadertoyOutput[];
};

export type ShaderToyShader = {
  info: {
    date: Date;
    description: string;
    flags: number;
    hasliked: number;
    id: string;
    likes: number;
    name: string;
    published: number;
    tags: string[];
    usePreview: number;
    username: string;
    viewed: number;
  };
  renderpass: ShadertoyRenderPass[];
};

export type ShaderToyShaderResp = {
  Shader: ShaderToyShader;
};
