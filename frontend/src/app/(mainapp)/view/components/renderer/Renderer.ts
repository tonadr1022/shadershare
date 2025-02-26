import {
  ErrMsg,
  FilterMode,
  IRendererInitPararms,
  RenderData,
  Result,
  ShaderData,
  ShaderInputType,
  ShaderOutput,
  TextureProps,
  TextureWrap,
  BufferName,
  ShaderOutputName,
  ShaderOutputFull,
} from "@/types/shader";
import { createErrorResult, createSuccessResult } from "../util";
import { webgl2Utils, WebGL2Utils } from "./Util";

export const getPreviewImgFile = async (
  shaderData: ShaderData,
): Promise<File | null> => {
  return new Promise(async (resolve) => {
    const renderer = createRenderer();
    const canvas = document.createElement("canvas");
    for (const out of shaderData.shader_outputs) {
      out.shader_inputs?.sort((a, b) => a.idx - b.idx);
    }
    await renderer.initialize({
      canvas: canvas,
      shaderOutputs: shaderData.shader_outputs,
    });

    renderer.onResize(320, 180);
    for (let i = 0; i < 2; i++) {
      renderer.render({ checkResize: false, dt: 0.0007 });
    }
    await new Promise((resolve) => setTimeout(resolve, 100));

    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      const file = new File([blob], "preview.png", {
        type: "image/png",
      });
      resolve(file);
    });
    renderer.shutdown();
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

out vec4 fC;


void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main() {
    fC = vec4(1.0,1.0,1.0,1.0);
    mainImage(fC, gl_FragCoord.xy);
}
`;
const getLineCnt = (text: string) => {
  return text.split(/\r\n|\r|\n/).length;
};
const fragHeaderLineCnt = getLineCnt(fragmentHeader);

class UniformLocs {
  locs: Map<string, WebGLUniformLocation>;
  constructor(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    locs?: string[],
  ) {
    this.locs = new Map();
    if (locs) {
      for (const loc of locs) {
        const l = gl.getUniformLocation(program, loc);
        if (l === null) {
          console.error(`Failed to get uniform location for ${loc}`);
        } else {
          this.locs.set(loc, l);
        }
      }
    }
  }
}

class Shader {
  uniformLocs: UniformLocs;
  program: WebGLProgram;
  constructor(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    locs?: string[],
  ) {
    this.program = program;
    gl.useProgram(program);
    this.uniformLocs = new UniformLocs(gl, program, locs);
  }

  bind(gl: WebGL2RenderingContext) {
    gl.useProgram(this.program);
  }
}

class FragShaderUniforms {
  iDate: WebGLUniformLocation | null = null;
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
    this.iDate = gl.getUniformLocation(shaderProgram, "iDate");

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

  cleanup(gl: WebGL2RenderingContext) {
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
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.error("Framebuffer is incomplete after resizing!");
    }
  }

  swapTextures(gl: WebGL2RenderingContext) {
    if (this.doubleBuffer) {
      this.currentTextureIndex = 1 - this.currentTextureIndex;
      this.bindAndSetTex(gl);
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

class RenderPass {
  dirty: boolean = true;
  program: WebGLProgram;
  uniformLocs: FragShaderUniforms;
  type: ShaderInputType = "buffer";
  renderTarget: RenderTarget;
  shader_inputs: (BufferIChannel | Texture | null)[];
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
    this.shader_inputs = [];
    this.program = program;
    this.uniformLocs = new FragShaderUniforms(program, gl);
    this.renderTarget = new RenderTarget(gl, width, height, doubleBuffer);
  }
}

const webGL2Renderer = () => {
  console.log("create wbgl2 renderer");
  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext;
  let currFrame = 0;
  let initialized = false;
  let validPipelines = false;
  let wasPaused = false;
  let currTime = 0;
  let timeDelta = 0;
  let singleTextureShader: Shader | null = null;
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
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    gl.uniform1i(location, index);
  };

  let util: WebGL2Utils;

  const bindUniforms = (
    output: RenderPass,
    uniforms: FragShaderUniforms,
    dates: number[],
    mouse: number[],
  ) => {
    gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 1);
    gl.uniform1f(uniforms.iTime, shaderTime);
    gl.uniform1f(uniforms.iTimeDelta, timeDelta);
    gl.uniform1fv(uniforms.iChannelTimes, [
      currTime,
      currTime,
      currTime,
      currTime,
    ]);
    gl.uniform4f(uniforms.iDate, dates[0], dates[1], dates[2], dates[3]);
    gl.uniform4f(uniforms.iMouse, mouse[0], mouse[1], mouse[2], mouse[3]);

    for (let i = 0; i < output.shader_inputs.length; i++) {
      const iChannel = output.shader_inputs[i];
      const dims: [number, number] = [canvas.width, canvas.height];
      if (iChannel instanceof Texture) {
        dims[0] = iChannel.width;
        dims[1] = iChannel.height;
      }
      gl.uniform3fv(uniforms.iChannelResolutions[i], [dims[0], dims[1], 1]);
    }
    gl.uniform1i(uniforms.iFrame, currFrame);
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

  const bindIChannels = (output: RenderPass, uniforms: FragShaderUniforms) => {
    for (let i = 0; i < output.shader_inputs.length; i++) {
      const iChannel = output.shader_inputs[i];
      if (!iChannel || !uniforms.iChannels[i]) {
        continue;
      }

      if (iChannel instanceof Texture) {
        bindTexture(uniforms.iChannels[i]!, iChannel, i);
      } else if (iChannel instanceof BufferIChannel) {
        const output = state.outputs[iChannel.bufferName];
        if (output === null) {
          continue;
        }

        if (output.renderTarget.getPrevTex()) {
          bindTexture(
            uniforms.iChannels[i]!,
            output.renderTarget.getPrevTex()!,
            i,
          );
        }
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
  const render = (options?: { checkResize?: boolean; dt: number }): boolean => {
    if (!initialized || !gl || !canvas) {
      return false;
    }
    if (!validPipelines) {
      return false;
    }
    timeDelta = options?.dt || 0;
    fpsCounter.addTime(timeDelta);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    checkGLError(gl);
    if (options?.checkResize) {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width != displayWidth || canvas.height != displayHeight) {
        if (canvas.width == 0 || canvas.height == 0) {
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
      Math.abs(mouseState.mouseCurrX),
      Math.abs(mouseState.mouseCurrY),
      mouseState.mouseOriginX,
      mouseState.mouseOriginY,
    ];
    if (!mouseState.mouseDown) {
      mouse[2] = -mouse[2];
    }
    if (!mouseState.mouseSignalDown) {
      mouse[3] = -mouse[3];
    }
    mouseState.mouseSignalDown = false;

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
      gl.useProgram(output.program);
      const uniforms = output.uniformLocs;
      bindUniforms(output, uniforms, dates, mouse);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      bindIChannels(output, uniforms);
      drawScreen();
    }

    for (const output of getBufferOutputs()) {
      if (output === null) {
        continue;
      }
      output.renderTarget.swapTextures(gl);
    }

    currFrame++;
    return true;
  };

  function drawScreen() {
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  type CompileShaderResult = {
    program: WebGLProgram;
    headerLineCnt: number;
  };
  const compileShader = (
    commonBufferText: string,
    fragmentText: string,
  ): Result<CompileShaderResult> => {
    // TODO: dynamically create the header based on what is actually used in the shader
    const completeHeader = `${fragmentHeader}
${commonBufferText}
`;
    const fragmentCode = `${completeHeader}${fragmentText}`;

    const compileRes = util.createShaderProgram(vertexCode, fragmentCode);
    const headerLineCnt = getLineCnt(completeHeader);
    if (compileRes.error) {
      return createErrorResult(compileRes.message, {
        program: 0,
        headerLineCnt,
      });
    }

    return createSuccessResult<CompileShaderResult>({
      program: compileRes.data!,
      headerLineCnt,
    });
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
          // TODO: only mipmap if needed
          gl.generateMipmap(gl.TEXTURE_2D);
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
        state.outputs[outputname].shader_inputs.splice(inputIdx, 0, texture);
      }
    });
  };
  const setTextureData = (
    outputName: BufferName,
    idx: number,
    url: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!state.outputs[outputName]) {
        throw new Error("output not existent");
      }
      if (idx < 0 || idx >= state.outputs[outputName].shader_inputs.length) {
        reject(new Error("Invalid pass index, out of range"));
        return;
      }
      const texture = state.outputs[outputName].shader_inputs[idx];
      if (texture instanceof Texture) {
        fetch(url, { mode: "cors" })
          .then((resp) => resp.blob())
          .then((blob) => {
            console.log({ blob });
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
    const channel = output.shader_inputs[idx];
    if (!(channel instanceof Texture)) {
      throw new Error("Invalid channel type");
    }
    channel.destroy(gl);
    output.shader_inputs.splice(idx, 1);
  };
  const removeIChannel = (
    outputName: BufferName,
    inputType: ShaderInputType,
    idx: number,
  ) => {
    if (inputType === "buffer") {
      removeBufferIChannel(outputName, idx);
    } else if (inputType === "texture") {
      removeImageIChannel(outputName, idx);
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
  const addBufferIChannel = (
    outputName: BufferName,
    name: BufferName,
    idx: number,
  ) => {
    const output = state.outputs[outputName];
    if (!output) {
      throw new Error("output not existent");
    }
    output.shader_inputs.splice(idx, 0, new BufferIChannel(name));
  };

  const resizeBuffers = () => {
    if (!initialized || !canvas) {
      return;
    }
    if (canvas.width == 0 || canvas.height == 0) {
      return;
    }
    // for each buffer, need to make new textures, copy the old data over
    for (const output of getBufferOutputs()) {
      if (!output) continue;
      for (const iChannel of output?.shader_inputs) {
        if (!(iChannel instanceof BufferIChannel)) {
          continue;
        }
        const output = state.outputs[iChannel.bufferName];
        if (!output) {
          throw new Error(
            "Invalid state: iChannel refers to output that doesn't exist",
          );
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

          const newDims = [canvas.width, canvas.height];
          const oldDims = [
            output.renderTarget.getCurrTex()!.width,
            output.renderTarget.getCurrTex()!.height,
          ];

          if (oldDims[0] > 0 && oldDims[1] > 0) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, newRenderTarget.fbo);
            if (output.renderTarget.doubleBuffer) {
              // draw previous
              const tex = output.renderTarget.getPrevTex()!;
              bindTexture(
                singleTextureShader.uniformLocs.locs.get("tex")!,
                tex,
                0,
              );
              tex.setFilterMode(gl, "nearest");
              gl.uniform2f(
                singleTextureShader.uniformLocs.locs.get("iResolution")!,
                newDims[0],
                newDims[1],
              );

              gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                newRenderTarget.getPrevTex()!.texture,
                0,
              );
              drawScreen();
            }
            if (
              output.renderTarget.getCurrTex() &&
              output.renderTarget.getCurrTex() !==
                output.renderTarget.getPrevTex()
            ) {
              const tex = output.renderTarget.getCurrTex()!;
              bindTexture(
                singleTextureShader.uniformLocs.locs.get("tex")!,
                tex,
                0,
              );
              tex.setFilterMode(gl, "nearest");
              gl.uniform2f(
                singleTextureShader.uniformLocs.locs.get("iResolution")!,
                newDims[0],
                newDims[1],
              );
              // gl.clearColor(0.0, 0.0, 0.0, 1.0);
              // gl.clear(gl.COLOR_BUFFER_BIT);
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

        oldRenderTarget.cleanup(gl);
        output.renderTarget.swapTextures(gl);
      }
    }
  };
  const actualDims = [0, 0];
  const onResize = (width: number, height: number, force: boolean = false) => {
    if (!initialized || !canvas) {
      return;
    }
    const scale = 1;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    if (
      force ||
      canvas.width !== actualDims[0] ||
      canvas.height !== actualDims[1]
    ) {
      resizeBuffers();
    }
    actualDims[0] = canvas.width;
    actualDims[1] = canvas.height;
  };

  const getErrorMessages = (
    text: string,
    completeHeaderLineCnt: number,
    processCommonBuffer: boolean,
    commonBufferErrMsgs: ErrMsg[],
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
          commonBufferErrMsgs.push({ line, message });
        } else {
          res.push({ line, message });
        }
      }
    }
    return res;
  };
  let shaderTime = 0;
  let lastRealTime = 0;
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
      const iChannel = getShaderInput(outputName, idx);
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
      const iChannel = getShaderInput(outputName, idx);
      if (iChannel instanceof Texture) {
        iChannel.bind(gl);
        iChannel.setFilterMode(gl, mode);
      }
    },
    setTextureData,

    addImageIChannel,
    addBufferIChannel,
    setBufferIChannel,
    removeIChannel,
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
          output.renderTarget.cleanup(gl);
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
      console.log("shutdown");
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
    ): { error: boolean; errMsgs: Map<ShaderOutputName, ErrMsg[] | null> } => {
      const programOrErrStrs = new Map<
        ShaderOutputName,
        string | WebGLProgram
      >();
      let anyError = false;
      const commonBufferIdx = shaderOutputs.findIndex(
        (output) => output.type === "common",
      );
      const commonOutput = shaderOutputs[commonBufferIdx]?.code || "";

      const lineCnts = new Map<ShaderOutputName, number>();
      for (let i = 0; i < shaderOutputs.length; i++) {
        const output = shaderOutputs[i];
        if (output.type === "common") {
          continue;
        }
        const res = compileShader(commonOutput, output.code);
        lineCnts.set(output.name, res.data!.headerLineCnt);
        if (res.error) {
          anyError = true;
          programOrErrStrs.set(output.name, res.message!);
        } else {
          const program = res.data!.program;
          programOrErrStrs.set(output.name, program);
        }
      }

      if (!anyError) {
        const bufferOutputs = getBufferOutputsWithNames();
        for (const { name, output } of bufferOutputs) {
          if (output === null) continue;
          if (output.program) {
            gl.deleteProgram(output.program);
          }
          const program = programOrErrStrs.get(name) as WebGLProgram;
          output.uniformLocs = new FragShaderUniforms(program, gl);
          output.program = program;
        }
        validPipelines = true;
      } else {
        console.error("error occurred during shader compilation");
      }
      const errMsgs = new Map<ShaderOutputName, ErrMsg[] | null>();
      const commonBufferErrs: ErrMsg[] = [];
      let commonBufferErrProcessed = false;
      for (const [name, progOrErrStr] of programOrErrStrs) {
        if (typeof progOrErrStr === "string") {
          errMsgs.set(
            name,
            getErrorMessages(
              progOrErrStr as string,
              lineCnts.get(name)!,
              !commonBufferErrProcessed,
              commonBufferErrs,
            ),
          );
          commonBufferErrProcessed = true;
        }
      }
      errMsgs.set("Common", commonBufferErrs);

      return {
        error: anyError,
        errMsgs: errMsgs,
      };
    },

    setShaderDirty(name: BufferName) {
      if (!state.outputs[name]) {
        throw new Error("Invalid state: shader output is null");
      }
      state.outputs[name].dirty = true;
    },
    // TODO: initialize should return shader compile errors
    initialize: async (params: IRendererInitPararms) => {
      if (initialized) return;
      canvas = params.canvas;
      if (!canvas) {
        return;
      }

      canvas.onmousedown = (ev: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseState.mouseOriginX = Math.floor(
          ((ev.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
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
      };

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
      if (checkGLError(gl)) {
        throw new Error("GL error");
      }
      util = webgl2Utils(gl);
      if (!enableExtensions()) {
        return;
      }

      const { shaderOutputs } = params;
      for (const out of shaderOutputs) {
        if (out.shader_inputs === null) {
          out.shader_inputs = [];
        }
      }

      //get the common output if exists
      let commonOutput: ShaderOutput | null = null;
      for (let i = 0; i < shaderOutputs.length; i++) {
        if (shaderOutputs[i].type === "common") {
          commonOutput = shaderOutputs[i];
          break;
        }
      }

      const compileTasks: {
        code: string;
        name: BufferName;
      }[] = [];

      for (let i = 0; i < shaderOutputs.length; i++) {
        const output = shaderOutputs[i];
        if (output.type === "common" || output.name === "Common") {
          continue;
        }
        compileTasks.push({
          code: output.code,
          name: output.name,
        });
      }
      if (checkGLError(gl)) {
        throw new Error("GL error");
      }

      // TODO: parallelize shader compilation
      for (const task of compileTasks) {
        const res = compileShader(commonOutput?.code || "", task.code);
        if (res.error) {
          console.error("error compiling shader", res.message);
          return;
        }

        let doubleBuffer = false;
        const output = shaderOutputs.find(
          (output: ShaderOutputFull) => output.name === task.name,
        );
        if (!output) {
          throw new Error("invalid state");
        }
        for (const input of output.shader_inputs || []) {
          if (
            "name" in input.properties &&
            input.properties.name === task.name
          ) {
            doubleBuffer = true;
            break;
          }
        }
        if (checkGLError(gl)) {
          throw new Error("GL error");
        }

        const pass = new RenderPass(
          gl,
          res.data!.program,
          canvas.width,
          canvas.height,
          doubleBuffer,
        );
        if (checkGLError(gl)) {
          throw new Error("GL error");
        }
        state.outputs[task.name] = pass;
      }

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
            imageLoadPromises.push(
              addImageIChannel(
                input.url!,
                output.name,
                inputIdx,
                input.properties as TextureProps,
              ),
            );
          } else {
            if ("name" in input.properties) {
              addBufferIChannel(output.name, input.properties.name, inputIdx);
            } else {
              throw new Error("incorrect properties type");
            }
          }
        }
      }

      try {
        await Promise.all(imageLoadPromises);
      } catch (e) {
        console.error("error loading images", e);
        return;
      }

      {
        const res = util.createShaderProgram(
          vertexCode,
          singleTextureFragmentCode,
        );
        if (res.error) {
          console.error("error creating shader program", res.message);
          return;
        }
        singleTextureShader = new Shader(gl, res.data!);
      }
      validPipelines = true;
      initialized = true;
    },

    onResize,
    render,
    startRecording,
    stopRecording,
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
