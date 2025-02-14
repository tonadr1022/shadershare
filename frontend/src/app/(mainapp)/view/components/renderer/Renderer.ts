import {
  ErrMsg,
  IRendererInitPararms,
  RenderData,
  Result,
  ShaderOutput,
} from "@/types/shader";
import { createEmptyResult } from "../util";
import { webgl2Utils, WebGL2Utils } from "./Util";

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
// precision highp sampler3D;
precision mediump sampler2D;
#endif
void main() {
    vec2 out_uv = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(out_uv * 4.0f - 1.0f, 0.1f, 1.0f);
}`;

const fragmentHeader = `#version 300 es
#ifdef GL_ES
precision highp float;
precision highp int;
// precision mediump sampler3D;
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

out vec4 fC;


void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main() {
    fC = vec4(1.0,1.0,1.0,1.0);
    mainImage(fC, gl_FragCoord.xy);
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
  doubleBuffer: boolean;
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

  constructor(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    doubleBuffer: boolean,
  ) {
    this.doubleBuffer = doubleBuffer;
    this.textures = [];
    this.currentTextureIndex = 0;
    const cnt = doubleBuffer ? 2 : 1;
    for (let i = 0; i < cnt; i++) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const internalFormat = gl.RGBA32F;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.FLOAT;
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        width,
        height,
        border,
        format,
        type,
        null,
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
    if (this.doubleBuffer) {
      this.currentTextureIndex = 1 - this.currentTextureIndex;
      this.#bindAndSetTex(gl);
    }
  }
}

enum IChannelType {
  Image,
  Buffer,
}
class BufferIChannel {
  idx: number;
  constructor(idx: number) {
    this.idx = idx;
  }
}

enum FilterMode {
  NEAREST = 0x2600,
  LINEAR = 0x2601,
}

enum WrapMode {
  CLAMP_TO_EDGE = 0x812f,
  REPEAT = 0x2901,
}
enum TextureType {
  D2 = 0x0de1,
  D3 = 0x806f,
  CUBE = 0x8513,
}

class Texture {
  filterMode: FilterMode = FilterMode.NEAREST;
  wrapMode: WrapMode = WrapMode.CLAMP_TO_EDGE;
  texture: WebGLTexture = 0;
  type: TextureType = TextureType.D2;

  create(gl: WebGL2RenderingContext, type: TextureType) {
    if (this.texture !== 0) {
      throw new Error("Texture already initialized");
    }
    this.texture = gl.createTexture();
    this.type = type;
    this.bind(gl);
    this.setFilterMode(gl, this.filterMode);
    this.setWrapMode(gl, this.wrapMode);
  }

  setData(
    gl: WebGL2RenderingContext,
    data: ArrayBufferView | null,
    height: number,
    width: number,
  ) {
    this.bind(gl);
    gl.texImage2D(
      this.type,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );
  }

  setFilterMode(gl: WebGL2RenderingContext, mode: FilterMode) {
    this.filterMode = mode;
    gl.texParameteri(this.type, gl.TEXTURE_MIN_FILTER, mode);
    gl.texParameteri(this.type, gl.TEXTURE_MAG_FILTER, mode);
  }

  setWrapMode(gl: WebGL2RenderingContext, mode: WrapMode) {
    this.wrapMode = mode;
    gl.texParameteri(this.type, gl.TEXTURE_WRAP_S, mode);
    gl.texParameteri(this.type, gl.TEXTURE_WRAP_T, mode);
  }

  assertValid() {
    if (this.texture === 0) {
      throw new Error("Texture not initialized");
    }
  }

  bind(gl: WebGL2RenderingContext) {
    this.assertValid();
    gl.bindTexture(this.type, this.texture);
  }
  unbind(gl: WebGL2RenderingContext) {
    gl.bindTexture(this.type, null);
  }

  destroy(gl: WebGL2RenderingContext) {
    this.assertValid();
    gl.deleteTexture(this.texture);
  }
}

class RRenderPass {
  dirty: boolean = true;
  program: WebGLProgram;
  uniformLocs: FragShaderUniforms;
  type: IChannelType = IChannelType.Buffer;
  renderTarget: RenderTarget;
  constructor(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    width: number,
    height: number,
    doubleBuffer: boolean,
  ) {
    if (program == 0) {
      throw new Error("Invalid program");
    }
    this.program = program;
    this.uniformLocs = new FragShaderUniforms(program, gl);
    this.renderTarget = new RenderTarget(gl, width, height, doubleBuffer);
  }
}

const webGL2Renderer = () => {
  console.log("create wbgl2 renderer");
  const fragmentHeaderLineCnt = fragmentHeader.split(/\r\n|\r|\n/).length;
  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext;
  let currFrame = 0;
  let initialized = false;
  let validPipelines = false;
  let wasPaused = false;
  let currTime = 0;
  let timeDelta = 0;
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

  // const renderPasses: RRenderPass[] = [];

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
    gl.uniform1f(uniforms.iTime, shaderTime);
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
    if (state.finalImagePass === null) {
      console.error("no final image pass present");
      return;
    }
    for (const output of state.outputs) {
      if (output === null) {
        continue;
      }
      gl.useProgram(output.program);
      const uniforms = output.uniformLocs;
      bindUniforms(uniforms);
      gl.bindFramebuffer(gl.FRAMEBUFFER, output.renderTarget.fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        output.renderTarget.getCurrTex(),
        0,
      );
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // TODO: define max ichannels and make sure ichannels array is long enough
      for (let i = 0; i < 3; i++) {
        if (uniforms.iChannels[i]) {
          if (i >= state.iChannels.length) {
            throw new Error("invalid state");
          }
          const iChannel = state.iChannels[i];
          if (iChannel instanceof Texture) {
            bindTexture(uniforms.iChannels[i]!, iChannel.texture, i);
          } else if (iChannel instanceof BufferIChannel) {
            bindTexture(
              uniforms.iChannels[i]!,
              output.renderTarget.getPrevTex(),
              i,
            );
          }
        }
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const imagePass = state.finalImagePass;
    gl.useProgram(imagePass.program);
    bindUniforms(imagePass.uniformLocs);
    gl.bindFramebuffer(gl.FRAMEBUFFER, outFBO);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const uniforms = imagePass.uniformLocs;
    // TODO: consolidate into func
    for (let i = 0; i < 3; i++) {
      if (uniforms.iChannels[i]) {
        if (i >= state.iChannels.length) {
          throw new Error("invalid state");
        }
        const iChannel = state.iChannels[i];
        if (iChannel instanceof Texture) {
          bindTexture(uniforms.iChannels[i]!, iChannel.texture, i);
        } else if (iChannel instanceof BufferIChannel) {
          bindTexture(
            uniforms.iChannels[i]!,
            state.outputs[i]!.renderTarget.getPrevTex(),
            i,
          );
        }
      }
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    for (const output of state.outputs) {
      if (output === null) {
        continue;
      }
      output.renderTarget.swapTextures(gl);
    }
  };

  const render = (options?: { checkResize?: boolean; dt: number }) => {
    if (!initialized || !gl || !canvas) {
      return;
    }
    if (!validPipelines) {
      return;
    }
    // currTime = performance.now() / 1000;
    // timeDelta = currTime - lastTime;
    timeDelta = options?.dt || 0;
    fpsCounter.addTime(timeDelta);
    // const dt = newTime - time;
    // lastTime = currTime;

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

    gl.viewport(0, 0, canvas.width, canvas.height);

    renderInternal(null);

    currFrame++;
  };

  const compileShader = (fragmentText: string): Result<WebGLProgram> => {
    // TODO: dynamically create the header based on what is actually used in the shader
    const fragmentCode = `${fragmentHeader}${fragmentText}`;
    const compileRes = util.createShaderProgram(vertexCode, fragmentCode);
    if (compileRes.error) {
      return createEmptyResult(compileRes.message);
    }
    return compileRes;
  };

  const state: {
    finalImagePass: RRenderPass | null;
    iChannels: (BufferIChannel | Texture | null)[];
    outputs: (RRenderPass | null)[];
  } = {
    finalImagePass: null,
    iChannels: [],
    outputs: [],
  };

  // TODO: 3d textures?
  const addImageIChannel = (url: string) => {
    const texture = new Texture();
    texture.create(gl, TextureType.D2);
    const image = new Image();
    image.src = url;
    image.addEventListener("load", () => {
      texture.bind(gl);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      // TODO: only generate mipmap if setting is mipmap
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    state.iChannels.push(texture);
  };

  const addBufferIChannel = (idx: number) => {
    const buffer: BufferIChannel = { idx };
    state.iChannels.push(buffer);
  };

  const resizeBuffers = () => {
    // for each buffer, need to make new textures, copy the old data over
    for (const iChannel of state.iChannels) {
      if (!(iChannel instanceof BufferIChannel)) {
        continue;
      }
      const output = state.outputs[iChannel.idx];
      if (!output) {
        throw new Error(
          "Invalid state: iChannel refers to output that doesn't exist",
        );
      }

      output.renderTarget.cleanup(gl);
      output.renderTarget = new RenderTarget(
        gl,
        canvas.width,
        canvas.height,
        true,
      );

      // make new render targets
      // draw unit quad to them with minsize of new and old size
      // destroy old
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
  let shaderTime = 0;
  let lastRealTime = 0;
  return {
    addImageIChannel,
    addBufferIChannel,
    setShaderTime: (t: number) => {
      shaderTime = t;
    },
    getShaderTime: () => shaderTime,
    setLastRealTime: (t: number) => {
      lastRealTime = t;
    },
    getLastRealTime: () => lastRealTime,
    setWasPaused: (paused: boolean) => {
      wasPaused = paused;
    },
    getWasPaused: () => wasPaused,

    canvas: () => canvas,
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
      shaderTime = 0;
      lastRealTime = 0;
      wasPaused = true;
      for (const iChannel of state.iChannels) {
        if (!(iChannel instanceof BufferIChannel)) {
          continue;
        }
        const output = state.outputs[iChannel.idx];
        if (!output) {
          throw new Error(
            "Invalid state: iChannel refers to output that doesn't exist",
          );
        }
        output.renderTarget.cleanup(gl);
        output.renderTarget = new RenderTarget(
          gl,
          canvas.width,
          canvas.height,
          true,
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
    },

    // TODO: compilation stats and character counts and line counts
    setShaders: (
      shaderOutputs: ShaderOutput[],
    ): { error: boolean; errMsgs: (ErrMsg[] | null)[] } => {
      const programOrErrStrs: (string | WebGLProgram)[] = [];
      let anyError = false;
      let commonOutput = "";
      for (const output of shaderOutputs) {
        if (output.type == "common") {
          commonOutput = output.code;
          break;
        }
      }

      for (let i = 0; i < shaderOutputs.length; i++) {
        const output = shaderOutputs[i];
        // TODO: common buffer needs to be accounted for in fragment header. need a special line that
        // is searched for
        const fragmentCode = `${commonOutput}${fragmentHeader}${output.code}`;
        const compileRes = util.createShaderProgram(vertexCode, fragmentCode);
        if (compileRes.error) {
          anyError = true;
          programOrErrStrs.push(compileRes.message!);
        } else {
          programOrErrStrs.push(compileRes.data!);
        }
      }

      if (!anyError) {
        for (let i = 0; i < state.outputs.length; i++) {
          const output = state.outputs[i];
          if (output === null) continue;
          if (output.program) {
            gl.deleteProgram(output.program);
          }
          output.uniformLocs = new FragShaderUniforms(programOrErrStrs[i], gl);
          output.program = programOrErrStrs[i];
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

    setShaderDirty(idx: number) {
      if (idx < 0 || idx >= state.outputs.length) {
        throw new Error("Invalid pass index");
      }
      if (!state.outputs[idx]) {
        throw new Error("Invalid pass index");
      }
      state.outputs[idx].dirty = true;
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

      const { shaderInputs, shaderOutputs } = params;

      for (let i = 0; i < shaderInputs.length; i++) {
        const input = shaderInputs[i];
        if (input.type == "image") {
          addImageIChannel(input.url!);
        } else {
          addBufferIChannel(input.idx);
        }
      }

      // get the common output if exists
      // let commonOutput: ShaderOutput | null = null;
      // for (let i = 0; i < shaderOutputs.length; i++) {
      //   if (shaderOutputs[i].type == "common") {
      //     commonOutput = shaderOutputs[i];
      //     break;
      //   }
      // }

      const compileTasks = [];

      for (let i = 0; i < shaderOutputs.length; i++) {
        const output = shaderOutputs[i];
        const isFinalImage = output.type == "image";
        compileTasks.push({
          code: output.code,
          isFinalImage,
          passIdx: output.idx,
        });
      }

      compileTasks.sort((a, b) => a.passIdx - b.passIdx);
      // TODO: parallelize shader compilation
      for (const task of compileTasks) {
        // TODO: common buffer
        const res = compileShader(task.code);
        if (res.error) {
          console.error("error compiling shader", res.message);
          return;
        }

        const doubleBuffer = state.iChannels.some((ichannel) => {
          if (!(ichannel instanceof BufferIChannel)) return false;
          return task.passIdx === ichannel.idx;
        });

        const pass = new RRenderPass(
          gl,
          res.data!,
          canvas.width,
          canvas.height,
          doubleBuffer,
        );
        if (task.isFinalImage) {
          state.finalImagePass = pass;
        } else {
          state.outputs[task.passIdx] = pass;
        }
      }
      validPipelines = true;
      initialized = true;
    },

    onResize,
    render,
    getFps: () => {
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
