export type RenderPass = {
  code: string;
  pass_index: number;
  name: string;
  id?: string;
};

export type ShaderData = {
  shader: {
    id: string;
    title: string;
    description: string;
    created_at: string;
    preview_img_url: string | undefined;
    user_id: string;
  };
  render_passes: RenderPass[];
};

export type ShaderDataWithUsernameResponse = {
  shaders: ShaderData[];
  usernames: string[];
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
  renderData: RenderPass[];
};

export type ShaderUpdateCreatePayload = {
  id?: string;
  title?: string;
  user_id?: string;
  preview_img_url?: string;
  description?: string;
  render_passes?: RenderPass[];
};
