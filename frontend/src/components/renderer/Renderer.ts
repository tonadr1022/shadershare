"use client";
type ShaderErrorCallbackParams = {
  lineNumber: number;
};
type RenderData = {
  fragmentCode: string;
};

type ShaderRendererParams = {
  renderData: RenderData;
  shaderErrorCallback?: (params: ShaderErrorCallbackParams) => void;
};
type ShaderRendererImpl = {
  initialize: (params: ShaderRendererParams) => void;
  setData: (params: RenderData) => void;
  render: () => void;
  onResize: (width: number, height: number) => void;
  exists: () => boolean;
};
const webgl2Utils = (gl: WebGL2RenderingContext) => {
  const createShaderProgram = (
    fragmentCode: string,
    vertexCode: string,
  ): WebGLProgram => {
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

    const shaderProgram = gl.createProgram();
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

  return { createShaderProgram };
};

const webGL2Renderer = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
): ShaderRendererImpl => {
  let time: number;
  let initialized = false;
  let program: WebGLShader = 0;
  let uboBuffer: WebGLBuffer = 0;
  const uboVariableInfo = { iResolution: { index: 0, offset: 0 } };
  const util = webgl2Utils(gl);

  const render = () => {
    // TODO: refactor
    if (!initialized || !program) {
      return;
    }
    const newTime = performance.now();
    // const dt = newTime - time;
    time = newTime;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.0, 0.5);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (program) {
      gl.useProgram(program);
      gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer);
      const info = uboVariableInfo.iResolution;
      gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        info.offset,
        new Float32Array([
          canvas.width,
          canvas.height,
          canvas.width / canvas.height,
        ]),
        0,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };

  const initialize = (params: ShaderRendererParams) => {
    const { renderData } = params;

    const vertexCode = `#version 300 es
#ifdef GL_ES
precision mediump float;
#endif
void main() {
    vec2 out_uv = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(out_uv * 4.0f - 1.0f, 0.1f, 1.0f);
}`;
    const fragmentHeader = `#version 300 es
#ifdef GL_ES
precision mediump float;
#endif

uniform Uniforms {
  vec3 iResolution;
  float iTime; // seconds
};

out vec4 FragColor;

void imageMain(vec2 fragCoord, vec3 iResolution);

void main() {
    imageMain(vec2(gl_FragCoord.xy), iResolution);
}

`;
    const fragmentCode = `${fragmentHeader}${renderData.fragmentCode}`;
    program = util.createShaderProgram(fragmentCode, vertexCode);
    if (!program) {
      return;
    }

    uboBuffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboBuffer);
    gl.bufferData(
      gl.UNIFORM_BUFFER,
      Float32Array.BYTES_PER_ELEMENT * 10,
      gl.DYNAMIC_DRAW,
    );
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uboBuffer);
    const uboVariableNames = ["iResolution"];
    const uboVariableIndices = gl.getUniformIndices(program, uboVariableNames)!;
    const uboVariableOffsets = gl.getActiveUniforms(
      program,
      uboVariableIndices,
      gl.UNIFORM_OFFSET,
    );

    uboVariableNames.forEach((name, index) => {
      uboVariableInfo[name] = {
        index: uboVariableIndices[index],
        offset: uboVariableOffsets[index],
      };
    });
    gl.uniformBlockBinding(
      program,
      gl.getUniformBlockIndex(program, "Uniforms"),
      0,
    );

    time = performance.now();
    initialized = true;
  };

  const onResize = (width: number, height: number) => {
    if (!initialized) {
      console.log("not initialized", width, height);
      return;
    }
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
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
    return webGL2Renderer(gl2, canvas);
  }
  return null;
};

export { createRenderer };
