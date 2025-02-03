"use client";

import { createEmptyResult } from "../util";
import { webgl2Utils, WebGL2Utils } from "./Util";

type ShaderRendererParams = {
  canvas: HTMLCanvasElement;
  renderData: RenderData;
};

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

export const initialFragmentShaderText = `void imageMain(vec2 fragCoord, vec3 iResolution) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    FragColor = vec4(col,1.0);
}
`;
const webGL2Renderer = (): IRenderer => {
  const fragmentHeaderLC = fragmentHeader.split(/\r\n|\r|\n/).length;
  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext;
  let time: number;
  let program: WebGLProgram = 0;
  let uboBuffer: WebGLBuffer;
  let initialized = false;

  const uboVariableInfo: Record<string, { index: number; offset: number }> = {};

  let util: WebGL2Utils;

  const render = () => {
    // TODO: refactor
    if (!initialized || !gl || !canvas) {
      return;
    }
    const newTime = performance.now();
    // const dt = newTime - time;
    time = newTime / 1000;
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
          time,
        ]),
        0,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };

  const initialize = (params: ShaderRendererParams) => {
    console.log("init params", params);
    if (initialized) return;
    canvas = params.canvas;
    if (!canvas) {
      return;
    }
    const glResult = canvas.getContext("webgl2");
    if (!glResult) {
      return;
    }
    gl = glResult;
    util = webgl2Utils(gl);
    const { renderData } = params;

    // TODO: handle invalid shader for first initialization
    const res = setShader(renderData.fragmentText);
    if (res.error) {
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

  const setShader = (fragmentText: string) => {
    const fragmentCode = `${fragmentHeader}${fragmentText}`;
    const compileRes = util.createShaderProgram(vertexCode, fragmentCode);
    if (compileRes.error) {
      return createEmptyResult(compileRes.message!);
    }
    if (program) {
      gl.deleteProgram(program);
    }
    program = compileRes.data!;
    return createEmptyResult();
  };

  const onResize = (width: number, height: number) => {
    if (!initialized || !canvas) {
      console.log("not initialized", width, height);
      return;
    }
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
  };

  return {
    setData: (params: RenderData) => {
      console.error("unimplemented", params);
    },
    getErrorMessages: (text: string): ErrMsg[] => {
      const lines = text.split(/\r\n|\r|\n/);
      const res: ErrMsg[] = [];
      for (const lineText of lines) {
        if (lineText.length <= 12) {
          continue;
        }
        const match = lineText.match(/ERROR: \d+:(\d+): (.*)/);
        if (match) {
          const line = parseInt(match[1], 10) - fragmentHeaderLC + 1;
          const message = match[2];
          res.push({ line: line, message });
        }
      }
      return res;
    },
    shutdown: () => {
      if (!initialized) return;
      console.log("shutting down webGL2Renderer");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
    setShader: setShader,
    initialize: initialize,
    render: render,
    onResize: onResize,
  };
};

const createRenderer = (): IRenderer => {
  return webGL2Renderer();
};

export { createRenderer };
