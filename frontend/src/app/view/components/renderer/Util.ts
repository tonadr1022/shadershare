import { EmptyResult, Result } from "@/types/shader";
import {
  createEmptyResult,
  createErrorResult,
  createSuccessResult,
} from "../util";

export type WebGL2Utils = {
  createShaderProgram: (
    vertexCode: string,
    fragmentCode: string,
  ) => Result<WebGLProgram>;
};
const webgl2Utils = (gl: WebGL2RenderingContext): WebGL2Utils => {
  const createShaderProgram = (
    vertexCode: string,
    fragmentCode: string,
  ): Result<WebGLProgram> => {
    const vertModule = gl.createShader(gl.VERTEX_SHADER);
    if (!vertModule) {
      return {
        data: 0,
        message: "Unable to create vertex module.",
        error: true,
      };
    }

    const deleteShaders = () => {
      gl.deleteShader(vertModule);
      gl.deleteShader(fragModule);
    };

    const checkShaderCompile = (module: WebGLShader): EmptyResult => {
      if (!gl.getShaderParameter(module, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(module);
        return createErrorResult(err || "");
      }
      return createEmptyResult();
    };

    gl.shaderSource(vertModule, vertexCode);
    gl.compileShader(vertModule);
    const compileRes = checkShaderCompile(vertModule);
    if (compileRes.error) {
      return { ...compileRes, data: 0 };
    }
    const fragModule = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragModule) {
      gl.deleteShader(vertModule);
      return createErrorResult("unable to create fragment module");
    }

    gl.shaderSource(fragModule, fragmentCode);
    gl.compileShader(fragModule);
    const fragCompileRes = checkShaderCompile(fragModule);
    if (fragCompileRes.error) {
      return fragCompileRes;
    }

    const program = gl.createProgram();
    if (!program) {
      deleteShaders();
      return createErrorResult("unable to create program");
    }

    gl.attachShader(program, vertModule);
    gl.attachShader(program, fragModule);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(program);
      console.error("ERROR linking program: " + err);
      deleteShaders();
      return createErrorResult(err || "");
    }
    deleteShaders();
    return createSuccessResult(program);
  };

  return { createShaderProgram };
};
export { webgl2Utils };
