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

type ErrMsg = {
  line: number;
  message: string;
};

type IRenderer = {
  initialize: (params: ShaderRendererParams) => void;
  setShader: (fragmentText: string) => EmptyResult;
  setData: (params: RenderData) => void;
  render: () => void;
  shutdown: () => void;
  onResize: (width: number, height: number) => void;
  getErrorMessages: (text: string) => ErrMsg[];
};
