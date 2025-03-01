const webgl2Utils = (gl: WebGL2RenderingContext) => {
  // err return: 0 = success,  1 = create module fail, 2 = vert fail, 3 = frag fail, 4 = link fail
  const createShaderProgram = async (
    vertexCode: string,
    fragmentCode: string,
    asyncCompile: KHR_parallel_shader_compile | null,
  ): Promise<{
    err: number;
    errString: string;
    program: WebGLProgram | null;
  }> => {
    return new Promise((resolve) => {
      const vertModule = gl.createShader(gl.VERTEX_SHADER);
      const fragModule = gl.createShader(gl.FRAGMENT_SHADER);
      if (!vertModule || !fragModule) {
        if (vertModule) {
          gl.deleteShader(vertModule);
        }
        resolve({
          err: 1,
          errString: "Failed to create modules",
          program: null,
        });
        return;
      }
      gl.shaderSource(vertModule, vertexCode);
      gl.shaderSource(fragModule, fragmentCode);
      gl.compileShader(vertModule);
      gl.compileShader(fragModule);

      const program = gl.createProgram();
      gl.attachShader(program, vertModule);
      gl.attachShader(program, fragModule);
      gl.linkProgram(program);

      const cleanup = () => {
        gl.deleteShader(vertModule);
        gl.deleteShader(fragModule);
        gl.deleteProgram(program);
      };

      const checkErrorsAndCallback = () => {
        // check link
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          // check vert
          if (!gl.getShaderParameter(vertModule, gl.COMPILE_STATUS)) {
            const err = gl.getShaderInfoLog(vertModule);
            resolve({
              errString: err || "failed to compile vertex module",
              err: 2,
              program: null,
            });
            cleanup();
          } else if (!gl.getShaderParameter(fragModule, gl.COMPILE_STATUS)) {
            const err = gl.getShaderInfoLog(fragModule);
            resolve({
              err: 3,
              errString: err || "failed to compile frag module ",
              program: null,
            });
            cleanup();
          } else {
            const err = gl.getProgramInfoLog(program);
            resolve({
              err: 4,
              errString: err || "failed to link program",
              program: null,
            });
            cleanup();
          }
        } else {
          resolve({ err: 0, errString: "", program });
        }
      };

      if (asyncCompile === null) {
        checkErrorsAndCallback();
        return;
      }

      const waitAndCheck = () => {
        if (
          gl.getProgramParameter(program, asyncCompile.COMPLETION_STATUS_KHR)
        ) {
          checkErrorsAndCallback();
        } else {
          setTimeout(waitAndCheck, 1);
        }
      };

      setTimeout(waitAndCheck, 1);
    });
  };

  return { createShaderProgram };
};

export type WebGL2Utils = ReturnType<typeof webgl2Utils>;
export { webgl2Utils };
