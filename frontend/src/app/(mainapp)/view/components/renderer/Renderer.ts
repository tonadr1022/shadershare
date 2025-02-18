import {
  DefaultTextureProps,
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
  ShaderInput,
} from "@/types/shader";
import { createErrorResult, createSuccessResult } from "../util";
import { webgl2Utils, WebGL2Utils } from "./Util";

export const getPreviewImgFile = async (
  shaderData: ShaderData,
): Promise<File | null> => {
  return new Promise(async (resolve) => {
    const renderer = createRenderer();
    const canvas = document.createElement("canvas");
    shaderData.shader_inputs.sort((a, b) => a.idx - b.idx);
    await renderer.initialize({
      canvas: canvas,
      shaderInputs: shaderData.shader_inputs,
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
};

export const defaultBufferFragmentCode = `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    fragColor = vec4(0.0,0.0,1.0,1.0);
}`;
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
const getLineCnt = (text: string) => {
  return text.split(/\r\n|\r|\n/).length;
};
const fragHeaderLineCnt = getLineCnt(fragmentHeader);

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

class Texture {
  filterMode: FilterMode = "nearest";
  wrapMode: TextureWrap = "clamp";
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

class RRenderPass {
  dirty: boolean = true;
  program: WebGLProgram;
  uniformLocs: FragShaderUniforms;
  type: ShaderInputType = "buffer";
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
  // const fragmentHeaderLineCnt = fragmentHeader.split(/\r\n|\r|\n/).length;
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
  const getBufferOutputsWithNames = (): {
    name: BufferName;
    output: RRenderPass | null;
  }[] => {
    return [
      { name: "Buffer A", output: state.outputs["Buffer A"] },
      { name: "Buffer B", output: state.outputs["Buffer B"] },
      { name: "Buffer C", output: state.outputs["Buffer C"] },
      { name: "Buffer D", output: state.outputs["Buffer D"] },
      { name: "Buffer E", output: state.outputs["Buffer E"] },
    ];
  };
  const getBufferOutputs = () => {
    return [
      state.outputs["Buffer A"],
      state.outputs["Buffer B"],
      state.outputs["Buffer C"],
      state.outputs["Buffer D"],
      state.outputs["Buffer E"],
    ];
  };
  const renderInternal = (outFBO: WebGLFramebuffer | null) => {
    const finalImagePass = state.outputs.Image;
    if (!finalImagePass) {
      throw new Error("Invalid state");
    }
    const bufferOutputs = getBufferOutputs();

    for (const output of bufferOutputs) {
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

    gl.useProgram(finalImagePass.program);
    bindUniforms(finalImagePass.uniformLocs);
    gl.bindFramebuffer(gl.FRAMEBUFFER, outFBO);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const uniforms = finalImagePass.uniformLocs;
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
          const output = state.outputs[iChannel.bufferName];
          if (output === null) {
            throw new Error("Invalid state");
          }
          bindTexture(
            uniforms.iChannels[i]!,
            output.renderTarget.getPrevTex(),
            i,
          );
        }
      }
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    for (const output of bufferOutputs) {
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

    console.log(fragmentCode);
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
    // finalImagePass: RRenderPass | null;
    iChannels: (BufferIChannel | Texture | null)[];
    outputs: {
      "Buffer A": RRenderPass | null;
      "Buffer B": RRenderPass | null;
      "Buffer C": RRenderPass | null;
      "Buffer D": RRenderPass | null;
      "Buffer E": RRenderPass | null;
      Image: RRenderPass | null;
    };
    // outputs: (RRenderPass | null)[];
  } = {
    // finalImagePass: null,
    iChannels: [],
    outputs: {
      "Buffer A": null,
      "Buffer B": null,
      "Buffer C": null,
      "Buffer D": null,
      "Buffer E": null,
      Image: null,
    },
  };

  // TODO: 3d textures?
  const addImageIChannel = (
    url: string,
    idx: number,
    props?: TextureProps,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // TODO: wait on rendering until images are loaded fully
      const texture = new Texture();
      texture.create(gl, TextureType.D2);
      const image = new Image();
      image.src = url;
      image.crossOrigin = "";
      image.addEventListener("load", () => {
        try {
          const properties = props || DefaultTextureProps;
          texture.bind(gl);
          if (!props || props.vflip) {
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
          texture.setWrapMode(gl, properties.wrap);
          texture.setFilterMode(gl, properties.filter);
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
      state.iChannels.splice(idx, 0, texture);
    });
  };
  const setTextureData = (idx: number, url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (idx < 0 || idx >= state.iChannels.length) {
        reject(new Error("Invalid pass index, out of range"));
        return;
      }
      const texture = state.iChannels[idx];
      if (texture instanceof Texture) {
        const image = new Image();
        image.src = url;
        image.crossOrigin = "";
        image.addEventListener("load", () => {
          texture.bind(gl);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image,
          );
          // TODO: if mipmap make them
          resolve();
        });

        image.addEventListener("error", (e) => {
          reject(new Error(`Failed to load image from ${url}: ${e.message}`));
        });
      } else {
        reject(new Error("Invalid pass index, out of range"));
        return;
      }
    });
  };

  const removeBufferIChannel = (idx: number) => {
    if (idx < 0 || idx >= state.iChannels.length) {
      throw new Error("Invalid pass index, out of range");
    }

    // TODO: need to delete render pass?
    state.iChannels.splice(idx, 1);
  };

  const removeImageIChannel = (idx: number) => {
    if (idx < 0 || idx >= state.iChannels.length) {
      throw new Error("Invalid pass index, out of range");
    }
    const channel = state.iChannels[idx];
    if (!(channel instanceof Texture)) {
      throw new Error("Invalid channel type");
    }
    channel.destroy(gl);
    state.iChannels.splice(idx, 1);
  };
  const removeIChannel = (input: ShaderInput) => {
    if (input.type === "buffer") {
      removeBufferIChannel(input.idx);
    } else if (input.type === "texture") {
      removeImageIChannel(input.idx);
    } else {
      throw new Error("Invalid input type");
    }
  };

  const addBufferIChannel = (name: BufferName, idx: number) => {
    state.iChannels.splice(idx, 0, new BufferIChannel(name));
  };

  const resizeBuffers = () => {
    // for each buffer, need to make new textures, copy the old data over
    for (const iChannel of state.iChannels) {
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
  return {
    setTextureWrap: (idx: number, mode: TextureWrap) => {
      if (idx < 0 || idx >= state.iChannels.length) {
        throw new Error("Invalid pass index, out of range");
      }
      const iChannel = state.iChannels[idx];
      if (iChannel instanceof Texture) {
        iChannel.bind(gl);
        iChannel.setWrapMode(gl, mode);
      }
    },
    setTextureFilter: (idx: number, mode: FilterMode) => {
      if (idx < 0 || idx >= state.iChannels.length) {
        throw new Error("Invalid pass index, out of range");
      }
      const iChannel = state.iChannels[idx];
      if (iChannel instanceof Texture) {
        iChannel.bind(gl);
        iChannel.setFilterMode(gl, mode);
      }
    },
    setTextureData,

    addImageIChannel,
    addBufferIChannel,
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
      wasPaused = true;
      for (const iChannel of state.iChannels) {
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

      const imageLoadPromises: Promise<void>[] = [];
      for (let i = 0; i < shaderInputs.length; i++) {
        const input = shaderInputs[i];
        if (input.type === "texture") {
          imageLoadPromises.push(
            addImageIChannel(input.url!, i, input.properties),
          );
        } else {
          addBufferIChannel(input.name as BufferName, i);
        }
      }

      try {
        await Promise.all(imageLoadPromises);
      } catch (e) {
        console.error("error loading images", e);
        return;
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

      // TODO: parallelize shader compilation
      for (const task of compileTasks) {
        // TODO: common buffer
        console.log({ taskcode: task.code, commonOutput: commonOutput?.code });
        const res = compileShader(commonOutput?.code || "", task.code);
        if (res.error) {
          console.error("error compiling shader", res.message);
          return;
        }

        let doubleBuffer = false;
        for (const ichannel of state.iChannels) {
          if (ichannel instanceof BufferIChannel) {
            if (ichannel.bufferName === task.name) {
              doubleBuffer = true;
              break;
            }
          }
        }

        const pass = new RRenderPass(
          gl,
          res.data!.program,
          canvas.width,
          canvas.height,
          doubleBuffer,
        );
        state.outputs[task.name] = pass;
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
