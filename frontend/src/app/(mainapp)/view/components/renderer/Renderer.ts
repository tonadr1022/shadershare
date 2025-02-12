import {
  ErrMsg,
  IRendererInitPararms,
  RenderData,
  Result,
} from "@/types/shader";
import { createEmptyResult } from "../util";
import { webgl2Utils, WebGL2Utils } from "./Util";

export const getScreenshotObjectURL = (canvas: HTMLCanvasElement) => {
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject("Failed to capture canvas as blob");
        return;
      }
      const url = window.URL.createObjectURL(blob!);
      resolve(url);
    }, "image/png");
  });
};

export const promptSaveScreenshot = (canvas: HTMLCanvasElement) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error("Failed to capture canvas as blob");
      return;
    }

    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blob!);
    a.style.display = "none";
    a.download = "shader.png";
    a.href = url;
    a.click();
  }, "image/png");
};

const checkGLError = (gl: WebGL2RenderingContext) => {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    // console.error("WebGL Error:", error);
    switch (error) {
      case gl.INVALID_ENUM:
        console.error("INVALID_ENUM: An enum argument is out of range.");
        break;
      case gl.INVALID_VALUE:
        console.error("INVALID_VALUE: A numeric argument is out of range.");
        break;
      case gl.INVALID_OPERATION:
        console.error(
          "INVALID_OPERATION: The operation is not allowed in the current state.",
        );
        break;
      case gl.OUT_OF_MEMORY:
        console.error(
          "OUT_OF_MEMORY: There is not enough memory to execute the command.",
        );
        break;
      case gl.INVALID_FRAMEBUFFER_OPERATION:
        console.error(
          "INVALID_FRAMEBUFFER_OPERATION: The framebuffer is not complete.",
        );
        break;
      case gl.CONTEXT_LOST_WEBGL:
        console.error("CONTEXT_LOST_WEBGL: The WebGL context is lost.");
      default:
        console.error("Unknown WebGL error.", error);
        break;
    }
  }
};
const vertexCode = `#version 300 es
#ifdef GL_ES
precision highp float;
precision highp int;
precision mediump sampler3D;
#endif
void main() {
    vec2 out_uv = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(out_uv * 4.0f - 1.0f, 0.1f, 1.0f);
}`;
const fragmentHeader = `#version 300 es
#ifdef GL_ES
precision highp float;
precision highp int;
precision mediump sampler3D;
#endif

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

uniform vec3 iResolution;
uniform float iTime; // seconds
uniform float iTimeDelta;
uniform int iFrame;
uniform float iChannelTime[4];
uniform vec3 iChannelResolution[4];
uniform vec4 iMouse; // xy = curr pixel coords, zw = click pixel coords

out vec4 fragColor;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main() {
    mainImage(fragColor, vec2(gl_FragCoord.xy));
}
`;

class FragShaderUniforms {
  iResolution: WebGLUniformLocation | null = null;
  iTime: WebGLUniformLocation | null = null;
  iTimeDelta: WebGLUniformLocation | null = null;
  iFrame: WebGLUniformLocation | null = null;
  iChannelTimes: WebGLUniformLocation | null = null;
  // TODO: array
  iChannelResolutions: (WebGLUniformLocation | null)[] = [
    null,
    null,
    null,
    null,
  ];
  iMouse: WebGLUniformLocation | null = null;
  iChannels: (WebGLUniformLocation | null)[] = [null, null, null, null];

  setLocs(shaderProgram: WebGLProgram, gl: WebGL2RenderingContext) {
    if (shaderProgram == 0) {
      throw new Error("Invalid shader program");
    }
    gl.useProgram(shaderProgram);
    this.iResolution = gl.getUniformLocation(shaderProgram, "iResolution");
    this.iTime = gl.getUniformLocation(shaderProgram, "iTime");
    this.iTimeDelta = gl.getUniformLocation(shaderProgram, "iTimeDelta");
    this.iFrame = gl.getUniformLocation(shaderProgram, "iFrame");
    this.iMouse = gl.getUniformLocation(shaderProgram, "iMouse");

    this.iChannelTimes = gl.getUniformLocation(
      shaderProgram,
      `iChannelTime[0]`,
    );
    for (let i = 0; i < 4; i++) {
      this.iChannelResolutions[i] = gl.getUniformLocation(
        shaderProgram,
        `iChannelResolution[${i}]`,
      );
      this.iChannels[i] = gl.getUniformLocation(
        shaderProgram,
        FragShaderUniforms.iChannelNames[i],
      );
    }
  }
  static iChannelNames = ["iChannel0", "iChannel1", "iChannel2", "iChannel3"];
  constructor(shaderProgram: WebGLProgram, gl: WebGL2RenderingContext) {
    this.setLocs(shaderProgram, gl);
  }
}

export const initialFragmentShaderText = `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}`;

class RenderTarget {
  fbo: WebGLFramebuffer;
  textures: WebGLTexture[];
  currentTextureIndex: number;
  getPrevTex() {
    return this.textures[1 - this.currentTextureIndex];
  }
  getCurrTex() {
    return this.textures[this.currentTextureIndex];
  }

  cleanup(gl: WebGL2RenderingContext) {
    gl.deleteFramebuffer(this.fbo);
    for (const texture of this.textures) {
      gl.deleteTexture(texture);
    }
  }

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.textures = [];
    this.currentTextureIndex = 0;
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const internalFormat = gl.RGBA32F;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.FLOAT;
      const data = new Float32Array(width * height * 4);
      for (let i = 0; i < data.length; i++) {
        data[i] = 0;
      }
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        width,
        height,
        border,
        format,
        type,
        data,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this.textures.push(texture);
    }

    this.fbo = gl.createFramebuffer();
    this.#bindAndSetTex(gl);
  }

  #bindAndSetTex(gl: WebGL2RenderingContext) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.textures[this.currentTextureIndex],
      0,
    );
  }

  swapTextures(gl: WebGL2RenderingContext) {
    this.currentTextureIndex = 1 - this.currentTextureIndex;
    this.#bindAndSetTex(gl);
  }
}

type RenderPassType = "image" | "buffer";
class RRenderPass {
  dirty: boolean = true;
  program: WebGLProgram;
  uniformLocs: FragShaderUniforms;
  renderTarget: RenderTarget;
  type: RenderPassType;
  constructor(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    width: number,
    height: number,
    type: RenderPassType,
  ) {
    if (program == 0) {
      throw new Error("Invalid program");
    }
    this.type = type;
    this.program = program;
    this.uniformLocs = new FragShaderUniforms(program, gl);
    this.renderTarget = new RenderTarget(gl, width, height);
  }
}

export class AvgFpsCounter {
  private times: number[] = [];
  private size: number;
  constructor(size: number = 60) {
    this.size = size;
  }
  addTime(dt: number) {
    this.times.push(dt);
    if (this.times.length > this.size) {
      this.times.shift();
    }
  }
  getAvg() {
    return this.times.reduce((a, b) => a + b, 0) / this.times.length;
  }
}

const webGL2Renderer = () => {
  console.log("create wbgl2 renderer");
  const fragmentHeaderLineCnt = fragmentHeader.split(/\r\n|\r|\n/).length;
  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext;
  let lastTime = 0;
  let timeDelta = 0;
  let currTime = 0;
  let currFrame = 0;
  let initialized = false;
  let validPipelines = false;
  const fpsCounter = new AvgFpsCounter();
  // const devicePixelRatio = window.devicePixelRatio;

  const bindTexture = (
    location: WebGLUniformLocation,
    texture: WebGLTexture,
    index: number,
  ) => {
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, index);
  };

  const renderPasses: RRenderPass[] = [];

  let util: WebGL2Utils;

  /*
   *
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    fragColor = vec4(col,1.0); 
}
   */
  const bindUniforms = (uniforms: FragShaderUniforms) => {
    gl.uniform3f(
      uniforms.iResolution,
      canvas.width,
      canvas.height,
      window.devicePixelRatio,
    );
    gl.uniform1f(uniforms.iTime, currTime);
    gl.uniform1f(uniforms.iTimeDelta, timeDelta);
    //  fragColor = vec4(fragCoord.xy/iChannelResolution[0].xy,0.,1.)
    gl.uniform1fv(uniforms.iChannelTimes, [
      currTime,
      currTime,
      currTime,
      currTime,
    ]);
    for (let i = 0; i < 4; i++) {
      gl.uniform3fv(uniforms.iChannelResolutions[i], [
        canvas.width,
        canvas.height,
        window.devicePixelRatio,
      ]);
    }
    gl.uniform1i(uniforms.iFrame, currFrame);
    gl.uniform4f(uniforms.iMouse, 0, 0, 0, 0);
  };

  const enableExtensions = () => {
    // get EXT_color_buffer_float extension
    const ext = gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("OES_texture_float_linear");
    if (!ext) {
      alert('"EXT_color_buffer_float" not supported');
      return false;
    }
    return true;
  };
  const renderInternal = (outFBO: WebGLFramebuffer | null) => {
    for (let i = 0; i < renderPasses.length - 1; i++) {
      const renderPass = renderPasses[i];
      gl.useProgram(renderPass.program);
      const uniforms = renderPass.uniformLocs;
      bindUniforms(uniforms);
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderPass.renderTarget.fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        renderPass.renderTarget.getCurrTex(),
        0,
      );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (uniforms.iChannels[0]) {
        bindTexture(
          uniforms.iChannels[0]!,
          renderPasses[i].renderTarget.getPrevTex(),
          0,
        );
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const imagePass = renderPasses[renderPasses.length - 1];
    gl.useProgram(imagePass.program);
    bindUniforms(imagePass.uniformLocs);
    gl.bindFramebuffer(gl.FRAMEBUFFER, outFBO);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    bindTexture(
      imagePass.uniformLocs.iChannels[0]!,
      renderPasses[0].renderTarget.getCurrTex(),
      0,
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    for (let i = 0; i < renderPasses.length - 1; i++) {
      renderPasses[i].renderTarget.swapTextures(gl);
    }
  };

  const render = (options?: { checkResize?: boolean }) => {
    if (!initialized || !gl || !canvas) {
      return;
    }
    if (!validPipelines) {
      return;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    checkGLError(gl);
    if (options?.checkResize) {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width != displayWidth || canvas.height != displayHeight) {
        onResize(displayWidth, displayHeight);
      }
    }

    currTime = performance.now() / 1000;
    timeDelta = currTime - lastTime;
    fpsCounter.addTime(timeDelta);
    // const dt = newTime - time;
    lastTime = currTime;
    gl.viewport(0, 0, canvas.width, canvas.height);

    renderInternal(null);

    currFrame++;
  };

  const compileShader = (fragmentText: string): Result<WebGLProgram> => {
    const fragmentCode = `${fragmentHeader}${fragmentText}`;
    const compileRes = util.createShaderProgram(vertexCode, fragmentCode);
    if (compileRes.error) {
      return createEmptyResult(compileRes.message);
    }
    return compileRes;
  };
  const resizeBuffers = () => {
    // for each buffer, need to make new textures, copy the old data over
    for (const renderPass of renderPasses) {
      if (renderPass.type == "image") continue;

      // make new render targets
      // draw unit quad to them with minsize of new and old size
      // destroy old
      renderPass.renderTarget.cleanup(gl);
      renderPass.renderTarget = new RenderTarget(
        gl,
        canvas.width,
        canvas.height,
      );
    }
  };
  const onResize = (width: number, height: number) => {
    if (!initialized || !canvas) {
      return;
    }
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    resizeBuffers();
  };

  const getErrorMessages = (text: string): ErrMsg[] => {
    const lines = text.split(/\r\n|\r|\n/);
    const res: ErrMsg[] = [];
    for (const lineText of lines) {
      if (lineText.length <= 12) {
        continue;
      }
      const match = lineText.match(/ERROR: \d+:(\d+): (.*)/);
      if (match) {
        const line = parseInt(match[1], 10) - fragmentHeaderLineCnt + 1;
        const message = match[2];
        res.push({ line: line, message });
      }
    }
    return res;
  };
  return {
    screenshot: () => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to capture canvas as blob");
          return;
        }

        const a = document.createElement("a");
        const url = window.URL.createObjectURL(blob!);
        a.style.display = "none";
        a.download = "shader.png";
        a.href = url;
        a.click();
      }, "image/png");
    },

    setData: (params: RenderData) => {
      console.error("unimplemented", params);
    },

    restart: () => {
      timeDelta = 0;
      currTime = 0;
      lastTime = 0;
      for (const renderPass of renderPasses) {
        renderPass.renderTarget = new RenderTarget(
          gl,
          canvas.width,
          canvas.height,
        );
      }
    },
    shutdown: () => {
      if (!initialized) return;
      initialized = false;
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) {
        ext.loseContext();
      } else {
        console.error("Failed to get WEBGL_lose_context extension");
      }
      console.log("shutdown renderer done");
      gl = undefined as any;
      canvas = undefined as any;
    },

    // TODO: compilation stats and character counts and line counts
    setShaders: (
      shaders: string[],
    ): { error: boolean; errMsgs: (ErrMsg[] | null)[] } => {
      if (shaders.length != renderPasses.length) {
        throw new Error("Invalid");
      }
      const programOrErrStrs: (string | WebGLProgram)[] = [];
      let anyError = false;
      for (let i = 0; i < shaders.length; i++) {
        const fragmentCode = `${fragmentHeader}${shaders[i]}`;
        const compileRes = util.createShaderProgram(vertexCode, fragmentCode);
        if (compileRes.error) {
          anyError = true;
          programOrErrStrs.push(compileRes.message!);
        } else {
          programOrErrStrs.push(compileRes.data!);
        }
      }

      if (!anyError) {
        for (let i = 0; i < renderPasses.length; i++) {
          const pass = renderPasses[i];

          if (pass.program) {
            gl.deleteProgram(pass.program);
          }
          pass.uniformLocs = new FragShaderUniforms(programOrErrStrs[i], gl);
          pass.program = programOrErrStrs[i];
        }
        validPipelines = true;
      }

      return {
        error: anyError,
        errMsgs: programOrErrStrs.map((r) =>
          typeof r === "string" ? getErrorMessages(r) : null,
        ),
      };
    },

    setShader: (passIdx: number, fragmentText: string) => {
      if (passIdx >= renderPasses.length) {
        throw new Error("Invalid pass index");
      }
      const fragmentCode = `${fragmentHeader}${fragmentText}`;
      const compileRes = util.createShaderProgram(vertexCode, fragmentCode);
      if (compileRes.error) {
        return createEmptyResult(compileRes.message!);
      }
      const pass = renderPasses[passIdx];
      if (pass.program) {
        gl.deleteProgram(pass.program);
      }
      pass.uniformLocs = new FragShaderUniforms(compileRes.data!, gl);
      pass.program = compileRes.data!;
      return createEmptyResult();
    },

    setShaderDirty(idx: number) {
      if (idx < 0 || idx >= renderPasses.length) {
        throw new Error("Invalid pass index");
      }
      renderPasses[idx].dirty = true;
    },
    // TODO: initialize should return shader compile errors
    initialize: (params: IRendererInitPararms) => {
      if (initialized) return;
      canvas = params.canvas;
      if (!canvas) {
        return;
      }
      if (!gl) {
        const glResult = canvas.getContext("webgl2", {
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        });
        if (!glResult) {
          return;
        }
        gl = glResult;
      }
      checkGLError(gl);
      util = webgl2Utils(gl);
      if (!enableExtensions()) {
        return;
      }

      const { renderData } = params;

      // TODO: use other compile func to get err msgs
      // TODO: handle invalid shader for first initialization
      for (let i = 0; i < renderData.length; i++) {
        const type: RenderPassType =
          i < renderData.length - 1 ? "buffer" : "image";
        const shader = compileShader(renderData[i].code);
        // TODO: cleanup broken unused!
        if (shader.error) {
          console.error("error compiling shader", shader.message);
          return;
        }
        renderPasses.push(
          new RRenderPass(gl, shader.data!, canvas.width, canvas.height, type),
        );
      }
      validPipelines = true;
      console.log("inisializing renderer");

      lastTime = performance.now();
      initialized = true;
    },

    onResize: onResize,
    render: render,
    fps: () => {
      const avgFrameTime = fpsCounter.getAvg();
      if (avgFrameTime == 0) return 0;
      return 1.0 / avgFrameTime;
    },
  };
};

const createRenderer = () => {
  return webGL2Renderer();
};
export type IRenderer = ReturnType<typeof createRenderer>;

export { createRenderer };
