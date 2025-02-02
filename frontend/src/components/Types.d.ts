type CompileResult = {
  success: boolean;
};
type RenderData = {
  fragmentText: string;
};

type EmptyResult = {
  message?: string;
  error: boolean;
};

type Result<T> = {
  data?: T;
  message?: string;
  error: boolean;
};

type IRenderer = {
  initialize: (params: ShaderRendererParams) => void;
  setShader: (fragmentText: string) => EmptyResult;
  setData: (params: RenderData) => void;
  render: () => void;
  onResize: (width: number, height: number) => void;
  exists: () => boolean;
};
