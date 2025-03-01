import {
  ErrMsg,
  FilterMode,
  IRendererInitPararms,
  RenderData,
  ShaderData,
  ShaderInputType,
  ShaderOutput,
  TextureProps,
  TextureWrap,
  BufferName,
  ShaderOutputName,
  ShaderOutputFull,
  ShaderUpdateCreatePayload,
  ShaderOutputType,
  ShaderCompileErrMsgState,
} from "@/types/shader";
import { webgl2Utils, WebGL2Utils } from "./Util";

export type CompileReqCallback = (
  error: boolean,
  name: ShaderOutputName,
  errMsgs: ErrMsg[] | null,
) => void;
export type CompileShaderReq = {
  shaderOutput: ShaderOutputFull;
  callback?: CompileReqCallback;
};

// TODO: higher res?
export const getPreviewImgFile = async (
  shaderData: Partial<ShaderData> | ShaderUpdateCreatePayload,
): Promise<File | null> => {
  return new Promise(async (resolve, reject) => {
    if (!shaderData.shader_outputs) {
      reject();
    }
    const renderer = createRenderer();
    const canvas = document.createElement("canvas");
    const init = await renderer.initialize({
      ignoreInputs: true,
      canvas: canvas,
      shaderOutputs: shaderData.shader_outputs as ShaderOutputFull[],
    });
    if (!init) {
      console.error("failed to initialize renderer");
      reject();
    }

    renderer.onResize(320, 180);
    let tries = 0;
    let i = 0;
    let t = performance.now();
    while (i < 2 && tries < 100) {
      const t2 = performance.now();
      if (renderer.render({ checkResize: false, dt: t2 - t, print: true })) {
        i++;
      }
      t = t2;
      tries++;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        renderer.shutdown();
        resolve(null);
        return;
      }
      const file = new File([blob], "preview.png", {
        type: "image/png",
      });
      renderer.shutdown();
      resolve(file);
    });
  });
};

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
  return error;
};

export const defaultCommonBufferCode = `vec4 someFunction(vec4 a, float b) {
  return a + b;
}`;
export const defaultBufferFragmentCode = `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    fragColor = vec4(0.0,0.0,1.0,1.0);
}`;
const vertexCode = `#version 300 es
#ifdef GL_ES
precision highp float;
precision highp int;
// precision highp sampler3D;
precision highp sampler2D;
#endif
void main() {
    vec2 out_uv = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(out_uv * 4.0f - 1.0f, 0.1f, 1.0f);
}`;

const singleTextureFragmentCode = `#version 300 es
precision highp float; uniform sampler2D tex; out vec4 fC; void main() { fC = texelFetch(tex, ivec2(gl_FragCoord.xy),0); }`;

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
uniform sampler2D iChannel4;
uniform sampler2D iChannel5;
uniform sampler2D iChannel6;
uniform sampler2D iChannel7;
uniform sampler2D iChannel8;
uniform sampler2D iChannel9;
uniform sampler2D iChannel10;

uniform vec3 iResolution;
uniform float iTime; // seconds
uniform float iTimeDelta;
uniform int iFrame;
uniform float iChannelTime[10];
uniform vec3 iChannelResolution[10];
uniform vec4 iMouse; // xy = curr pixel coords, zw = click pixel coords
uniform vec4 iDate;
uniform float iFrameRate;

out vec4 fC;


void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main() {
    fC = vec4(1.0,1.0,1.0,1.0);
    mainImage(fC, gl_FragCoord.xy);
}
`;
const makeHeaderBase = () => {
  return `#version 300 es
#ifdef GL_ES
precision highp float;
precision highp int;
// precision mediump sampler3D;
#endif

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform sampler2D iChannel4;
uniform sampler2D iChannel5;
uniform sampler2D iChannel6;
uniform sampler2D iChannel7;
uniform sampler2D iChannel8;
uniform sampler2D iChannel9;
uniform sampler2D iChannel10;

uniform vec3 iResolution;
uniform float iTime; // seconds
uniform float iTimeDelta;
uniform int iFrame;
uniform float iChannelTime[10];
uniform vec3 iChannelResolution[10];
uniform vec4 iMouse; // xy = curr pixel coords, zw = click pixel coords
uniform vec4 iDate;
uniform float iFrameRate;

out vec4 out_frag_color_abcabc;


void mainImage(out vec4 fragColor, in vec2 fragCoord);

`;
};

const makeHeaderImage = () => {
  let ret = makeHeaderBase();
  ret += `void main() {
    out_frag_color_abcabc = vec4(1.0,1.0,1.0,1.0);
    mainImage(out_frag_color_abcabc, gl_FragCoord.xy);
    out_frag_color_abcabc.a = 1.0;
}
`;
  return ret;
};

const makeHeaderBuffer = () => {
  let ret = makeHeaderBase();
  ret += `void main() {
    out_frag_color_abcabc = vec4(1.0,1.0,1.0,1.0);
    mainImage(out_frag_color_abcabc, gl_FragCoord.xy);
}
`;
  return ret;
};

const getLineCnt = (text: string) => {
  return text.split(/\r\n|\r|\n/).length;
};
const fragHeaderLineCnt = getLineCnt(fragmentHeader);

class UniformLocs {
  #locs: Map<string, { info: WebGLActiveInfo; loc: WebGLUniformLocation }>;
  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.#locs = new Map();
    this.setLocs(gl, program);
  }

  get(v: string): WebGLUniformLocation | null {
    const loc = this.#locs.get(v);
    if (!v) {
      return null;
    }
    if (!loc) {
      return null;
    }
    return loc.loc;
  }

  setLocs(gl: WebGL2RenderingContext, program: WebGLProgram) {
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    this.#locs = new Map();
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        const loc = gl.getUniformLocation(program, info.name);
        if (loc) {
          this.#locs.set(info.name, { info, loc });
        }
      }
    }
  }
}

class Shader {
  uniformLocs: UniformLocs;
  #program: WebGLProgram;
  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.#program = program;
    gl.useProgram(program);
    this.uniformLocs = new UniformLocs(gl, program);
  }

  bind(gl: WebGL2RenderingContext) {
    if (!this.#program) {
      throw new Error("Shader: can't bind without a program");
    }
    gl.useProgram(this.#program);
  }
  setProgram(gl: WebGL2RenderingContext, program: WebGLProgram) {
    if (!program) {
      throw new Error("Shader: need a program to set");
    }
    if (this.#program) {
      gl.deleteProgram(this.#program);
    }
    this.#program = program;
    this.bind(gl);
    this.uniformLocs.setLocs(gl, program);
  }

  destroy(gl: WebGL2RenderingContext) {
    if (!this.#program) {
      throw new Error("Shader: need a program to destroy.");
    }
    if (this.#program) {
      gl.deleteProgram(this.#program);
    }
    this.#program = 0;
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
  textures: (Texture | null)[];
  currentTextureIndex: number;
  doubleBuffer: boolean;
  getPrevTex(): Texture | null {
    if (this.doubleBuffer) {
      return this.textures[1 - this.currentTextureIndex];
    }
    return this.textures[0];
  }
  getCurrTex(): Texture | null {
    return this.textures[this.currentTextureIndex];
  }

  destroy(gl: WebGL2RenderingContext) {
    if (this.fbo) {
      gl.deleteFramebuffer(this.fbo);
      this.fbo = 0;
    }
    for (let i = 0; i < this.textures.length; i++) {
      if (this.textures[i]) {
        gl.deleteTexture(this.textures[i]!.texture);
        this.textures[i] = null;
      }
    }
  }

  constructor(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    doubleBuffer: boolean,
  ) {
    if (width == 0 || height == 0) {
      throw new Error("no width or height for rendertarget!");
    }
    this.doubleBuffer = doubleBuffer;
    this.textures = [];
    this.currentTextureIndex = 0;
    const cnt = doubleBuffer ? 2 : 1;
    for (let i = 0; i < cnt; i++) {
      const tex = new Texture();
      tex.create(gl, TextureType.D2, width, height);
      tex.bind(gl);
      tex.setData(gl, null, height, width, gl.RGBA32F);
      tex.setFilterMode(gl, "nearest");
      tex.setWrapMode(gl, "clamp");
      this.textures.push(tex);
    }

    this.fbo = gl.createFramebuffer();
    this.bindAndSetTex(gl);
  }

  bindAndSetTex(gl: WebGL2RenderingContext) {
    const tex = this.textures[this.currentTextureIndex];
    if (!tex) {
      throw new Error("no texture when binding");
    }
    if (tex.width == 0 || tex.height == 0) {
      throw new Error("texture has no dimensions!");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex.texture,
      0,
    );
  }

  swapTextures() {
    if (this.doubleBuffer) {
      this.currentTextureIndex = 1 - this.currentTextureIndex;
      // this.bindAndSetTex(gl);
    }
  }
}

class BufferIChannel {
  bufferName: BufferName;
  constructor(bufferName: BufferName) {
    this.bufferName = bufferName;
  }
}

enum TextureType {
  D2 = 0x0de1,
  D3 = 0x806f,
  CUBE = 0x8513,
}

const formatFromInternalFormat = (
  gl: WebGL2RenderingContext,
  internalFormat: number,
): number => {
  switch (internalFormat) {
    case gl.RGBA32F:
      return gl.RGBA;
    case gl.RGBA:
      return gl.RGBA;
    case gl.RGB8UI:
      return gl.RGB_INTEGER;
    case gl.R8:
      return gl.RED;
    default:
      return gl.RGBA;
  }
};

const typeFromInternalFormat = (
  gl: WebGL2RenderingContext,
  internalFormat: number,
): number => {
  switch (internalFormat) {
    case gl.RGBA32F:
      return gl.FLOAT;
    case gl.RGBA:
    case gl.RGB8UI:
    case gl.RG8UI:
    default:
      return gl.UNSIGNED_BYTE;
  }
};

class Texture {
  filterMode: FilterMode = "nearest";
  wrapMode: TextureWrap = "clamp";
  texture: WebGLTexture = 0;
  vFlipOnLoad: boolean = true;
  type: TextureType = TextureType.D2;
  width: number = 0;
  height: number = 0;
  depth: number = 0;

  create3D(gl: WebGL2RenderingContext, x: number, y: number, z: number) {
    if (this.texture !== 0) {
      throw new Error("tex already initialized");
    }
    this.texture = gl.createTexture();
    this.width = x;
    this.height = y;
    this.depth = z;
    this.type = TextureType.D3;
    this.bind(gl);
    this.setFilterMode(gl, this.filterMode);
    this.setWrapMode(gl, this.wrapMode);
  }
  setData3D(
    gl: WebGL2RenderingContext,
    data: ArrayBufferView | null,
    x: number,
    y: number,
    z: number,
    internalFormat: number = gl.RGBA,
  ) {
    this.bind(gl);
    this.width = x;
    this.height = y;
    this.depth = z;

    gl.texImage3D(
      this.type,
      0,
      internalFormat,
      x,
      y,
      z,
      0,
      formatFromInternalFormat(gl, internalFormat),
      typeFromInternalFormat(gl, internalFormat),
      data,
    );
  }

  create(
    gl: WebGL2RenderingContext,
    type: TextureType,
    width: number = 0,
    height: number = 0,
    vFlipOnLoad: boolean = true,
  ) {
    if (this.texture !== 0) {
      throw new Error("Texture already initialized");
    }
    this.vFlipOnLoad = vFlipOnLoad;
    this.width = width;
    this.height = height;
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
    internalFormat: number = gl.RGBA,
  ) {
    this.bind(gl);
    this.width = width;
    this.height = height;

    gl.texImage2D(
      this.type,
      0,
      internalFormat,
      width,
      height,
      0,
      formatFromInternalFormat(gl, internalFormat),
      typeFromInternalFormat(gl, internalFormat),
      data,
    );
  }

  setFilterMode(gl: WebGL2RenderingContext, mode: FilterMode) {
    this.filterMode = mode;
    let glMode: number;
    switch (mode) {
      case "nearest":
        glMode = gl.NEAREST;
        break;
      case "linear":
        glMode = gl.LINEAR;
        break;
      default:
        throw new Error("Invalid filter mode");
    }
    gl.texParameteri(this.type, gl.TEXTURE_MIN_FILTER, glMode);
    gl.texParameteri(this.type, gl.TEXTURE_MAG_FILTER, glMode);
  }

  setWrapMode(gl: WebGL2RenderingContext, mode: TextureWrap) {
    this.wrapMode = mode;
    let glMode: number;
    switch (mode) {
      case "clamp":
        glMode = gl.CLAMP_TO_EDGE;
        break;
      case "repeat":
        glMode = gl.REPEAT;
        break;
      default:
        throw new Error("Invalid wrap mode");
    }
    gl.texParameteri(this.type, gl.TEXTURE_WRAP_S, glMode);
    gl.texParameteri(this.type, gl.TEXTURE_WRAP_T, glMode);
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

type RShaderInput = {
  type: "buffer" | "texture" | "keyboard";
  data: BufferIChannel | Texture | null;
};

const destroyShaderInput = (
  gl: WebGL2RenderingContext,
  input: RShaderInput,
) => {
  switch (input.type) {
    case "texture":
      (input.data as Texture).destroy(gl);
    default:
      break;
  }
};

class RenderPass {
  dirty: boolean = true;
  shader: Shader;
  type: ShaderInputType = "buffer";
  renderTarget: RenderTarget;
  shader_inputs: RShaderInput[];
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
    this.shader = new Shader(gl, program);
    this.shader_inputs = [];
    this.renderTarget = new RenderTarget(gl, width, height, doubleBuffer);
  }
  destroy(gl: WebGL2RenderingContext) {
    this.shader.destroy(gl);
    this.renderTarget.destroy(gl);
    for (const inp of this.shader_inputs) {
      destroyShaderInput(gl, inp);
    }
  }
}

class KeyboardTexture {
  state: Uint8Array = new Uint8Array(256 * 3);
  #initialized = false;
  texture = new Texture();
  isInitialized() {
    return this.#initialized;
  }
  initialize(gl: WebGL2RenderingContext) {
    if (this.isInitialized()) {
      throw new Error("KeyboardTexture initialized already");
    }
    this.texture.create(gl, TextureType.D2, 256, 3, false);
    for (let i = 0; i < 256 * 3; i++) {
      this.state[i] = 0;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R8,
      256,
      3,
      0,
      gl.RED,
      gl.UNSIGNED_BYTE,
      this.state,
    );
    if (checkGLError(gl)) {
      console.error("e");
    }
    this.#initialized = true;
    if (checkGLError(gl)) {
      console.error("e");
    }
  }

  clearPresses() {
    for (let i = 0; i < 256; i++) {
      this.state[i + 256] = 0;
    }
  }

  setKeyDown(key: number) {
    if (key < 0 || key >= 256 || this.state[key] === 255) return;
    this.state[key] = 255;
    this.state[key + 256] = 255;
    this.state[key + 256 * 2] = 255 - this.state[key + 256 * 2];
  }

  setKeyUp(key: number) {
    this.state[key] = 0;
    this.state[key + 256] = 0;
  }

  flush(gl: WebGL2RenderingContext) {
    if (true) {
      gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        256,
        3,
        gl.RED,
        gl.UNSIGNED_BYTE,
        this.state,
      );
    }
  }
}

const webGL2Renderer = () => {
  let asyncCompile: KHR_parallel_shader_compile | null = null;
  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext;
  let currFrame = 0;
  let initialized = false;
  let validPipelines = false;
  let wasPaused = false;
  let shaderTime = 0;
  let lastRealTime = 0;
  let currTime = 0;
  const kbTex = new KeyboardTexture();
  let timeDelta = 0;
  let singleTextureShader: Shader | null = null;
  let forceRender = false;
  let loadingImagesCnt = 0;
  const mouseState = {
    mouseOriginX: -1,
    mouseOriginY: -1,
    mouseCurrX: -1,
    mouseCurrY: -1,
    mouseDown: false,
    mouseSignalDown: false,
  };
  const fpsCounter = new AvgFpsCounter();

  const bindTexture = (
    location: WebGLUniformLocation,
    texture: Texture,
    index: number,
  ) => {
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(texture.type, texture.texture);
    gl.uniform1i(location, index);
  };

  let util: WebGL2Utils;

  const bindUniforms = (
    output: RenderPass,
    locs: UniformLocs,
    dates: number[],
    mouse: number[],
  ) => {
    gl.uniform3f(locs.get("iResolution"), canvas.width, canvas.height, 1);
    gl.uniform1f(locs.get("iTime"), shaderTime);
    gl.uniform1f(locs.get("iTimeDelta"), timeDelta);
    gl.uniform1fv(locs.get("iChannelTime"), [
      currTime,
      currTime,
      currTime,
      currTime,
    ]);
    gl.uniform4f(locs.get("iDate"), dates[0], dates[1], dates[2], dates[3]);
    gl.uniform4f(locs.get("iMouse"), mouse[0], mouse[1], mouse[2], mouse[3]);

    const dimsAll: number[] = [];
    for (let i = 0; i < output.shader_inputs.length * 3; i++) {
      dimsAll.push(0);
    }
    for (let i = 0; i < output.shader_inputs.length; i++) {
      const iChannel = output.shader_inputs[i].data;
      const dims: [number, number] = [canvas.width, canvas.height];
      if (iChannel instanceof Texture) {
        dims[0] = iChannel.width;
        dims[1] = iChannel.height;
      }
      dimsAll[i * 3] = dims[0];
      dimsAll[i * 3 + 1] = dims[1];
      dimsAll[i * 3 + 2] = 1;
    }
    if (dimsAll.length) {
      gl.uniform3fv(locs.get(`iChannelResolution[0]`), dimsAll);
    }

    gl.uniform1i(locs.get("iFrame"), currFrame);
  };

  const enableExtensions = () => {
    // get EXT_color_buffer_float extension
    gl.getExtension("OES_texture_float_linear");
    const ext = gl.getExtension("EXT_color_buffer_float");
    if (!ext) {
      return;
    }
    asyncCompile = gl.getExtension("KHR_parallel_shader_compile");

    // TODO: handle fail case
    return true;
  };
  const getBufferOutputsWithNames = (): {
    name: BufferName;
    output: RenderPass | null;
  }[] => {
    return [
      { name: "Buffer A", output: state.outputs["Buffer A"] },
      { name: "Buffer B", output: state.outputs["Buffer B"] },
      { name: "Buffer C", output: state.outputs["Buffer C"] },
      { name: "Buffer D", output: state.outputs["Buffer D"] },
      { name: "Buffer E", output: state.outputs["Buffer E"] },
      { name: "Image", output: state.outputs["Image"] },
    ];
  };
  const getBufferOutputs = () => {
    return [
      state.outputs["Buffer A"],
      state.outputs["Buffer B"],
      state.outputs["Buffer C"],
      state.outputs["Buffer D"],
      state.outputs["Buffer E"],
      state.outputs["Image"],
    ];
  };

  const bindIChannels = (output: RenderPass, uniforms: UniformLocs) => {
    for (let i = 0; i < output.shader_inputs.length; i++) {
      const iChannel = output.shader_inputs[i];
      if (!iChannel) {
        continue;
      }
      const loc = uniforms.get(`iChannel${i}`);
      if (!loc) continue;
      if (iChannel.type === "keyboard") {
        bindTexture(loc, kbTex.texture, i);
      } else if (iChannel.type === "buffer") {
        const output =
          state.outputs[(iChannel.data as BufferIChannel).bufferName];
        if (output === null) {
          continue;
        }
        if (output.renderTarget.getPrevTex()) {
          bindTexture(loc, output.renderTarget.getPrevTex()!, i);
        }
      } else if (iChannel.type === "texture") {
        bindTexture(loc, iChannel.data as Texture, i);
      }
    }
  };

  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];
  const startRecording = () => {
    const stream = canvas.captureStream(60);
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

    recordedChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    mediaRecorder.start();
  };
  const compileShaders = async (
    req: ShaderOutputFull[],
    parseErrors: boolean,
  ): Promise<{ res: ShaderCompileErrMsgState; error: boolean }> => {
    for (const out of req) {
      if (out.shader_inputs === null) {
        out.shader_inputs = [];
      }
    }

    const res: ShaderCompileErrMsgState = {
      "Buffer A": null,
      "Buffer B": null,
      "Buffer C": null,
      "Buffer D": null,
      "Buffer E": null,
      Image: null,
      Common: null,
    };

    //get the common output if exists
    let commonOutput: ShaderOutput | null = null;
    for (let i = 0; i < req.length; i++) {
      if (req[i].type === "common") {
        commonOutput = req[i];
        break;
      }
    }
    let anyError = false;
    await Promise.all(
      req.map(async (output) => {
        if (output.type === "common") return;
        const { err, errString, program, headerLineCnt } = await compileShader(
          output.type,
          commonOutput?.code || "",
          output.code,
        );
        anyError = anyError || err !== 0;
        if (parseErrors) {
          let msgs: ErrMsg[] = [];
          if (res.Common === null) {
            const commonBufferErrMsgs: ErrMsg[] = [];
            msgs = getErrorMessages(
              errString,
              headerLineCnt,
              true,
              commonBufferErrMsgs,
            );
            res.Common = commonBufferErrMsgs;
          } else {
            msgs = getErrorMessages(errString, headerLineCnt, false);
          }
          res[output.name] = msgs;
        }

        if (err || !program) return;
        const doubleBuffer = output.name !== "Image";
        if (output.name !== "Common") {
          const existing = state.outputs[output.name];
          if (existing) {
            existing.shader.setProgram(gl, program);
          } else {
            state.outputs[output.name] = new RenderPass(
              gl,
              program,
              canvas.width,
              canvas.height,
              doubleBuffer,
            );
          }
        }
      }),
    );
    return { res, error: anyError };
  };

  const stopRecording = () => {
    if (!mediaRecorder) {
      return;
    }
    mediaRecorder.stop();
    setTimeout(() => {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
      URL.revokeObjectURL(url);
    }, 0);
  };

  let screenshotRequested = false;
  let screenshotCallback: ((blob: Blob | null) => void) | null = null;
  const saveScreenshot = (callback: (blob: Blob | null) => void) => {
    if (screenshotRequested) {
      return;
    }
    screenshotRequested = true;
    screenshotCallback = callback;
  };

  const render = (options?: {
    checkResize?: boolean;
    dt: number;
    print?: boolean;
  }): boolean => {
    if (!initialized || !gl || !canvas) {
      console.log("not initialized");
      return false;
    }
    if (!validPipelines) {
      console.log("no valid pipelines");
      return false;
    }
    if (loadingImagesCnt > 0) {
      console.log("loading images");
      return false;
    }
    timeDelta = options?.dt || 0;
    fpsCounter.addTime(timeDelta);

    if (options?.checkResize) {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        if (canvas.width == 0 || canvas.height == 0) {
          console.log("no width or height");
          return false;
        }
        onResize(displayWidth, displayHeight, true);
      }
    }

    const d = new Date();
    const dates = [
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours() * 60.0 * 60 +
        d.getMinutes() * 60 +
        d.getSeconds() +
        d.getMilliseconds() / 1000.0,
    ];
    const mouse = [
      mouseState.mouseCurrX,
      mouseState.mouseCurrY,
      Math.abs(mouseState.mouseOriginX),
      Math.abs(mouseState.mouseOriginY),
    ];
    if (!mouseState.mouseDown) {
      mouse[2] = -mouse[2];
    }
    if (!mouseState.mouseSignalDown) {
      mouse[3] = -mouse[3];
    }
    mouseState.mouseSignalDown = false;
    kbTex.flush(gl);
    gl.bindTexture(gl.TEXTURE_2D, null);

    for (const { output, name: bufferName } of getBufferOutputsWithNames()) {
      if (output === null) {
        continue;
      }
      if (bufferName === "Image") {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        output.renderTarget.bindAndSetTex(gl);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      output.shader.bind(gl);
      bindUniforms(output, output.shader.uniformLocs, dates, mouse);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      bindIChannels(output, output.shader.uniformLocs);
      drawScreen();
      if (bufferName !== "Image") {
        output?.renderTarget.swapTextures();
      }
    }

    // for (const output of getBufferOutputs()) {
    //   output?.renderTarget.swapTextures(gl);
    // }

    kbTex.clearPresses();
    if (!forceRender) currFrame++;
    forceRender = false;

    if (screenshotRequested && screenshotCallback) {
      screenshotRequested = false;
      canvas.toBlob(screenshotCallback, "image/png");
      screenshotCallback = null;
    }
    if (options?.print) {
      console.log("rendered");
    }
    return true;
  };

  function drawScreen() {
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  const compileShader = async (
    outputType: ShaderOutputType,
    commonBufferText: string,
    fragmentText: string,
  ): Promise<{
    err: number;
    errString: string;
    program: WebGLProgram | null;
    headerLineCnt: number;
  }> => {
    let fragmentHeader = "";
    if (outputType === "buffer") {
      fragmentHeader = makeHeaderBuffer();
    } else if (outputType === "image") {
      fragmentHeader = makeHeaderImage();
    } else {
      throw new Error("can't compile: invalid output type" + outputType);
    }
    const completeHeader = `${fragmentHeader}
${commonBufferText}
`;

    const fragmentCode = `${completeHeader}${fragmentText}`;
    const res = await util.createShaderProgram(
      vertexCode,
      fragmentCode,
      asyncCompile,
    );
    const headerLineCnt = getLineCnt(completeHeader);
    return {
      err: res.err,
      errString: res.errString,
      program: res.program,
      headerLineCnt,
    };
  };

  const state: {
    outputs: {
      Common: null;
      "Buffer A": RenderPass | null;
      "Buffer B": RenderPass | null;
      "Buffer C": RenderPass | null;
      "Buffer D": RenderPass | null;
      "Buffer E": RenderPass | null;
      Image: RenderPass | null;
    };
  } = {
    outputs: {
      Common: null,
      "Buffer A": null,
      "Buffer B": null,
      "Buffer C": null,
      "Buffer D": null,
      "Buffer E": null,
      Image: null,
    },
  };

  const addImageIChannel = (
    url: string,
    outputname: ShaderOutputName,
    inputIdx: number,
    props: TextureProps,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // TODO: wait on rendering until images are loaded fully
      const texture = new Texture();
      texture.create(gl, TextureType.D2);
      const image = new Image();
      image.src = url;
      image.crossOrigin = "Anonymous";
      image.addEventListener("load", () => {
        try {
          texture.bind(gl);
          texture.width = image.width;
          texture.height = image.height;
          texture.vFlipOnLoad = props.vflip;
          if (props.vflip) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          }
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image,
          );
          texture.setWrapMode(gl, props.wrap);
          texture.setFilterMode(gl, props.filter);
          gl.generateMipmap(gl.TEXTURE_2D);
          currFrame = 0;
          loadingImagesCnt--;
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      image.addEventListener("error", (e) => {
        reject(new Error(`Failed to load image from ${url}: ${e.message}`));
      });
      if (!state.outputs[outputname]) {
        throw new Error("invalid state");
      } else {
        state.outputs[outputname].shader_inputs.splice(inputIdx, 0, {
          type: "texture",
          data: texture,
        });
      }
    });
  };
  const setTextureData = (
    outputName: BufferName,
    idx: number,
    url: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const output = state.outputs[outputName];
      if (!output) {
        throw new Error("output not existent: " + outputName);
      }
      if (idx < 0 || idx >= output.shader_inputs.length) {
        reject(new Error("Invalid pass index, out of range"));
        return;
      }
      if (output.shader_inputs[idx].type === "texture") {
        const texture = output.shader_inputs[idx].data as Texture;
        fetch(url, { mode: "cors" })
          .then((resp) => resp.blob())
          .then((blob) => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            // image.crossOrigin = "Anonymous";
            img.addEventListener("load", () => {
              texture.bind(gl);
              if (texture.vFlipOnLoad) {
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
              }
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                img,
              );
              gl.generateMipmap(gl.TEXTURE_2D);
              resolve();
            });

            img.addEventListener("error", (e) => {
              reject(
                new Error(`Failed to load image from ${url}: ${e.message}`),
              );
            });
          })
          .catch((e) => {
            console.error("//////////////" + e);
            reject(e);
          });
      } else {
        reject(new Error("Invalid pass index, out of range"));
        return;
      }
    });
  };

  const removeBufferIChannel = (outputName: BufferName, idx: number) => {
    const output = state.outputs[outputName];
    if (!output) {
      throw new Error("output not existent");
    }
    if (idx < 0 || idx >= output.shader_inputs.length) {
      throw new Error("Invalid pass index, out of range");
    }

    // TODO: need to delete render pass?
    output.shader_inputs.splice(idx, 1);
  };

  const removeImageIChannel = (outputName: BufferName, idx: number) => {
    const output = state.outputs[outputName];
    if (!output) {
      throw new Error("output not existent");
    }
    if (idx < 0 || idx >= output.shader_inputs.length) {
      throw new Error("Invalid pass index, out of range");
    }
    if (output.shader_inputs[idx].type === "texture") {
      const c = output.shader_inputs[idx].data as Texture;
      c.destroy(gl);
    } else {
      throw new Error("Invalid channel type");
    }

    output.shader_inputs.splice(idx, 1);
  };
  const removeIChannel = (
    outputName: BufferName,
    inputType: ShaderInputType,
    idx: number,
  ) => {
    // TODO: refactor
    const output = state.outputs[outputName];
    if (!output) {
      throw new Error("output not existent");
    }
    if (idx < 0 || idx >= output.shader_inputs.length) {
      throw new Error("Invalid pass index, out of range");
    }

    if (inputType === "buffer") {
      removeBufferIChannel(outputName, idx);
    } else if (inputType === "texture") {
      removeImageIChannel(outputName, idx);
    } else if (inputType === "keyboard") {
      output.shader_inputs.splice(idx, 1);
    } else {
      throw new Error("Invalid input type");
    }
  };

  const setBufferIChannel = (
    outputName: BufferName,
    name: BufferName,
    idx: number,
  ) => {
    const input = getShaderInput(outputName, idx);
    if (!input) {
      throw new Error("input not existent");
    }
    if (input instanceof BufferIChannel) {
      input.bufferName = name;
    } else {
      throw new Error("invalid type for input");
    }
  };

  const addKeyboardIChannel = (outputName: BufferName, inputIdx: number) => {
    const output = state.outputs[outputName];
    if (!output) {
      throw new Error("output not existent:" + outputName);
    }
    output.shader_inputs.splice(inputIdx, 0, {
      type: "keyboard",
      data: null,
    });
  };

  const addBufferIChannel = (
    outputName: BufferName,
    name: BufferName,
    idx: number,
  ) => {
    const output = state.outputs[outputName];
    if (!output) {
      throw new Error("output not existent:" + outputName);
    }
    output.shader_inputs.splice(idx, 0, {
      type: "buffer",
      data: new BufferIChannel(name),
    });
  };

  const resizeBuffers = () => {
    if (!initialized || !canvas) {
      return;
    }
    if (canvas.width == 0 || canvas.height == 0) {
      return;
    }
    // for each buffer, need to make new textures, copy the old data over
    const newDims = [canvas.width, canvas.height];
    for (const { output } of getBufferOutputsWithNames()) {
      if (!output) {
        continue;
      }

      if (checkGLError(gl)) {
        throw new Error("GL error");
      }
      const newRenderTarget = new RenderTarget(
        gl,
        canvas.width,
        canvas.height,
        output.renderTarget.doubleBuffer,
      );

      if (singleTextureShader) {
        singleTextureShader.bind(gl);

        const oldDims = [
          output.renderTarget.getCurrTex()!.width,
          output.renderTarget.getCurrTex()!.height,
        ];

        if (oldDims[0] > 0 && oldDims[1] > 0) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, newRenderTarget.fbo);
          // draw previous
          const tex = output.renderTarget.getPrevTex()!;
          bindTexture(singleTextureShader.uniformLocs.get("tex")!, tex, 0);
          tex.setFilterMode(gl, "nearest");
          gl.uniform2f(
            singleTextureShader.uniformLocs.get("iResolution")!,
            newDims[0],
            newDims[1],
          );

          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            newRenderTarget.getPrevTex()!.texture,
            0,
          );
          drawScreen();

          if (output.renderTarget.doubleBuffer) {
            const tex = output.renderTarget.getCurrTex()!;
            bindTexture(singleTextureShader.uniformLocs.get("tex")!, tex, 0);
            tex.setFilterMode(gl, "nearest");
            gl.uniform2f(
              singleTextureShader.uniformLocs.get("iResolution")!,
              newDims[0],
              newDims[1],
            );
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.framebufferTexture2D(
              gl.FRAMEBUFFER,
              gl.COLOR_ATTACHMENT0,
              gl.TEXTURE_2D,
              newRenderTarget.getCurrTex()!.texture,
              0,
            );
            drawScreen();
          }

          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
      }

      const oldRenderTarget = output.renderTarget;
      output.renderTarget = newRenderTarget;

      oldRenderTarget.destroy(gl);
      output.renderTarget.swapTextures();
    }
  };
  const actualDims = [0, 0];

  const onResize = (width: number, height: number, force: boolean = false) => {
    if (!initialized || !canvas) {
      return;
    }
    canvas.height = height;
    canvas.width = width;
    // if (
    //   canvas.width === canvas.clientWidth &&
    //   canvas.height == canvas.clientHeight
    // ) {
    //   return;
    // }
    if (
      force ||
      canvas.width !== actualDims[0] ||
      canvas.height !== actualDims[1]
    ) {
      forceRender = true;
      resizeBuffers();
    }
    actualDims[0] = canvas.width;
    actualDims[1] = canvas.height;
  };

  const setKeyDown = (key: number) => {
    kbTex.setKeyDown(key);
  };

  const setKeyUp = (key: number) => {
    kbTex.setKeyUp(key);
  };

  const getErrorMessages = (
    text: string,
    completeHeaderLineCnt: number,
    processCommonBuffer: boolean,
    commonBufferErrMsgs?: ErrMsg[],
  ): ErrMsg[] => {
    const lines = text.split(/\r\n|\r|\n/);
    const res: ErrMsg[] = [];
    for (const lineText of lines) {
      if (lineText.length <= 12) {
        continue;
      }
      const match = lineText.match(/ERROR: \d+:(\d+): (.*)/);
      if (match) {
        let line = parseInt(match[1], 10);
        line -= completeHeaderLineCnt;
        const isCommonBufferErr = line < 0;
        if (isCommonBufferErr) {
          line += completeHeaderLineCnt - fragHeaderLineCnt;
        } else {
          line++;
        }
        const message = match[2];
        if (isCommonBufferErr && processCommonBuffer) {
          commonBufferErrMsgs?.push({ line, message });
        } else {
          res.push({ line, message });
        }
      }
    }
    return res;
  };
  const getShaderInput = (outputName: ShaderOutputName, idx: number) => {
    const output = state.outputs[outputName];
    if (!output) {
      throw new Error("output not existent: " + outputName);
    }
    if (idx < 0 || idx >= output.shader_inputs.length) {
      throw new Error(
        "shader input idx out of range: " + idx + " for output: " + outputName,
      );
    }
    return output.shader_inputs[idx];
  };
  return {
    setTextureWrap: (
      outputName: ShaderOutputName,
      idx: number,
      mode: TextureWrap,
    ) => {
      const iChannel = getShaderInput(outputName, idx).data;
      if (iChannel instanceof Texture) {
        iChannel.bind(gl);
        iChannel.setWrapMode(gl, mode);
      }
    },
    setTextureFilter: (
      outputName: ShaderOutputName,
      idx: number,
      mode: FilterMode,
    ) => {
      const iChannel = getShaderInput(outputName, idx).data;
      if (iChannel instanceof Texture) {
        iChannel.bind(gl);
        iChannel.setFilterMode(gl, mode);
      }
    },
    setTextureData,

    addImageIChannel,
    addBufferIChannel,
    addKeyboardIChannel,
    setBufferIChannel,
    setKeyDown,
    setKeyUp,
    removeIChannel,
    setShaderTime: (t: number) => {
      shaderTime = t;
    },
    setFrame: (t: number) => {
      currFrame = t;
    },
    getFrame: () => currFrame,
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
    saveScreenshot,
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
      currFrame = 0;
      wasPaused = true;
      for (const output of getBufferOutputs()) {
        if (!output) continue;
        for (const iChannel of output.shader_inputs) {
          if (!(iChannel instanceof BufferIChannel)) {
            continue;
          }
          const output = state.outputs[iChannel.bufferName];
          if (!output) {
            throw new Error(
              "Invalid state: iChannel refers to output that doesn't exist",
            );
          }
          output.renderTarget.destroy(gl);
          output.renderTarget = new RenderTarget(
            gl,
            canvas.width,
            canvas.height,
            true,
          );
        }
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
    },

    setShaderDirty(name: BufferName) {
      if (!state.outputs[name]) {
        throw new Error("Invalid state: shader output is null");
      }
      state.outputs[name].dirty = true;
    },
    // TODO: initialize should return shader compile errors
    initialize: async (params: IRendererInitPararms): Promise<boolean> => {
      if (initialized) return true;
      canvas = params.canvas;
      if (!canvas) {
        return false;
      }

      if (params.ignoreInputs) {
        // mouse state
        canvas.onmouseout = () => {
          mouseState.mouseSignalDown = false;
          mouseState.mouseDown = false;
        };
        canvas.onmousedown = (ev: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          mouseState.mouseOriginX = Math.floor(
            ((ev.clientX - rect.left) / (rect.right - rect.left)) *
              canvas.width,
          );
          mouseState.mouseOriginY = Math.floor(
            canvas.height -
              ((ev.clientY - rect.top) / (rect.bottom - rect.top)) *
                canvas.height,
          );
          mouseState.mouseCurrX = mouseState.mouseOriginX;
          mouseState.mouseCurrY = mouseState.mouseOriginY;
          mouseState.mouseDown = true;
          mouseState.mouseSignalDown = true;
        };
        canvas.onmousemove = (ev: MouseEvent) => {
          if (mouseState.mouseDown) {
            const rect = canvas.getBoundingClientRect();
            mouseState.mouseCurrX = Math.floor(
              ((ev.clientX - rect.left) / (rect.right - rect.left)) *
                canvas.width,
            );
            mouseState.mouseCurrY = Math.floor(
              canvas.height -
                ((ev.clientY - rect.top) / (rect.bottom - rect.top)) *
                  canvas.height,
            );
          }
        };
        canvas.onmouseup = () => {
          mouseState.mouseDown = false;
          mouseState.mouseSignalDown = false;
        };
      }

      if (!gl) {
        const glResult = canvas.getContext("webgl2", {
          stencil: false,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        });
        if (!glResult) {
          return false;
        }
        gl = glResult;
      }
      util = webgl2Utils(gl);
      if (!enableExtensions()) {
        return false;
      }
      const { shaderOutputs } = params;

      await compileShaders(shaderOutputs, false);

      if (checkGLError(gl)) {
        throw new Error("GL error");
      }

      const imageLoadPromises: Promise<void>[] = [];

      for (let outputIdx = 0; outputIdx < shaderOutputs.length; outputIdx++) {
        const output = shaderOutputs[outputIdx];
        for (
          let inputIdx = 0;
          inputIdx < output.shader_inputs!.length;
          inputIdx++
        ) {
          if (output.name === "Common" && output.shader_inputs!.length > 0) {
            throw new Error("common buffer can't have shader inputs");
          }
          if (output.name === "Common") continue;
          const input = output.shader_inputs![inputIdx];
          if (input.type === "texture") {
            loadingImagesCnt++;
            imageLoadPromises.push(
              addImageIChannel(
                input.url!,
                output.name,
                inputIdx,
                input.properties as TextureProps,
              ),
            );
          } else if (input.type === "keyboard") {
            addKeyboardIChannel(output.name, inputIdx);
          } else {
            if ("name" in input.properties) {
              addBufferIChannel(output.name, input.properties.name, inputIdx);
            } else {
              throw new Error("incorrect properties type");
            }
          }
        }
      }
      await Promise.all(imageLoadPromises);

      const res = await util.createShaderProgram(
        vertexCode,
        singleTextureFragmentCode,
        null,
      );
      if (!res.err) {
        singleTextureShader = new Shader(gl, res.program!);
      }

      kbTex.initialize(gl);

      currFrame = 0;
      validPipelines = true;
      initialized = true;
      return true;
    },

    onResize,
    render,
    flush: () => {
      gl.flush();
      gl.finish();
    },
    compileShaders,
    addOutput: async (
      shaderOutput: ShaderOutputFull,
      commonOutput?: ShaderOutputFull,
    ) => {
      await compileShaders(
        commonOutput ? [shaderOutput, commonOutput] : [shaderOutput],
        false,
      );
    },
    forceRender: () => forceRender || screenshotRequested,
    startRecording,
    removeOutput: (outputName: ShaderOutputName) => {
      if (outputName === "Image") return;
      const out = state.outputs[outputName];
      if (out === null) {
        return;
      }
      out.destroy(gl);
      state.outputs[outputName] = null;
    },
    stopRecording,
    getFps: () => {
      const avgFrameTime = fpsCounter.getAvg();
      if (avgFrameTime == 0) return 0;
      return 1.0 / avgFrameTime;
    },
    initializing: () => {
      return !initialized || !gl || !canvas || loadingImagesCnt > 0;
    },
  };
};

const createRenderer = () => {
  return webGL2Renderer();
};
export type IRenderer = ReturnType<typeof createRenderer>;

export { createRenderer };
