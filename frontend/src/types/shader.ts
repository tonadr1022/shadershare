export type RenderPass = {
  code: string;
  pass_index: number;
  name: string;
};

export type ShaderData = {
  shader: {
    id: string;
    title: string;
    description: string;
    created_at: string;
    user_id: string;
  };
  render_passes: RenderPass[];
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
