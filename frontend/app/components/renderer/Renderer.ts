type ShaderData = {
  fragmentCode: string;
  vertexCode: string;
};

type ShaderErrorCallbackParams = {
  lineNumber: number;
};

type ShaderRendererParams = {
  shaderDatas: ShaderData[];
  shaderErrorCallback?: (params: ShaderErrorCallbackParams) => void;
};
type ShaderRendererImpl = {
  initialize: (params: ShaderRendererParams) => void;
  render: () => void;
  onResize: (width: number, height: number) => void;
  exists: () => boolean;
};

const webGL2Renderer = (gl: WebGL2RenderingContext): ShaderRendererImpl => {
  let time: number;
  let initialized = false;
  let shaderProgram: WebGLShader = 0;

  const render = () => {
    if (!initialized) {
      console.error("not initialized");
      return;
    }
    const newTime = performance.now();
    // const dt = newTime - time;
    time = newTime;
    gl.clearColor(0.1, 0.2, 0.0, 0.5);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (shaderProgram) {
      gl.useProgram(shaderProgram);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
  // Define the triangle vertices
  const vertices = new Float32Array([
    0.0,
    0.5,
    0.0, // Top vertex
    -0.5,
    -0.5,
    0.0, // Bottom-left vertex
    0.5,
    -0.5,
    0.0, // Bottom-right vertex
  ]);

  const createShaderProgram = ({
    vertexCode,
    fragmentCode,
  }: ShaderData): WebGLProgram => {
    const vertModule = gl.createShader(gl.VERTEX_SHADER);
    if (!vertModule) {
      return 0;
    }

    const deleteShaders = () => {
      gl.deleteShader(vertModule);
      gl.deleteShader(fragModule);
    };

    const checkShaderCompile = (module: WebGLShader) => {
      if (!gl.getShaderParameter(module, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(module);
        console.error("Error compiling shader: " + err);
        return false;
      }
      return true;
    };

    gl.shaderSource(vertModule, vertexCode);
    gl.compileShader(vertModule);
    if (!checkShaderCompile(vertModule)) {
      return 0;
    }
    const fragModule = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragModule) {
      gl.deleteShader(vertModule);
      return 0;
    }

    gl.shaderSource(fragModule, fragmentCode);
    gl.compileShader(fragModule);
    if (!checkShaderCompile(fragModule)) {
      deleteShaders();
      return 0;
    }

    shaderProgram = gl.createProgram();
    if (!shaderProgram) {
      deleteShaders();
      return 0;
    }

    gl.attachShader(shaderProgram, vertModule);
    gl.attachShader(shaderProgram, fragModule);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(
        "ERROR linking program: " + gl.getProgramInfoLog(shaderProgram),
      );
      deleteShaders();
      return 0;
    }
    deleteShaders();
    return shaderProgram;
  };

  const initialize = (params: ShaderRendererParams) => {
    console.log("initalizing webGL2Renderer");
    const { shaderDatas } = params;
    if (shaderDatas.length === 0) {
      return;
    }
    const shaderProgram = createShaderProgram(shaderDatas[0]);
    if (!shaderProgram) {
      return;
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosLocation = gl.getAttribLocation(shaderProgram, "aPos");
    gl.vertexAttribPointer(
      aPosLocation,
      3,
      gl.FLOAT,
      false,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.enableVertexAttribArray(aPosLocation);

    time = performance.now();
    initialized = true;
  };

  const onResize = (width: number, height: number) => {
    if (!initialized) return;
    gl.viewport(0, 0, width, height);
  };

  return {
    initialize: initialize,
    render: render,
    onResize: onResize,
    exists: () => true,
  };
};

const createRenderer = (
  canvas: HTMLCanvasElement,
): ShaderRendererImpl | null => {
  const gl2 = canvas.getContext("webgl2");
  if (gl2) {
    return webGL2Renderer(gl2);
  }
  return null;
};

export { createRenderer };
