export type RenderPass = {
  code: string;
  pass_idx: number;
  name: string;
};

export type ShaderData = {
  title: string;
  description: string;
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
export type IRenderer = {
  initialize: (params: IRendererInitPararms) => void;
  setShader: (passIdx: number, fragmentText: string) => EmptyResult;
  setData: (params: RenderData) => void;
  render: () => void;
  shutdown: () => void;
  onResize: (width: number, height: number) => void;
  restart: () => void;
  screenshot: () => void;
  getErrorMessages: (text: string) => ErrMsg[];
};
