abstract class Renderer {
  protected canvasEl: HTMLCanvasElement;
  constructor(protected canvas: HTMLCanvasElement) {
    this.canvasEl = canvas;
  }
  abstract drawFragmentShader(): void;
}

class WebGPURenderer extends Renderer {
  private device: GPUDevice | null = null;
  private adapter: GPUAdapter | null = null;
  private context: GPUCanvasContext | null = null;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.setup();
  }

  private async setup(): Promise<void> {
    if (!navigator.gpu) {
      throw Error("WebGPU not supported");
    }
    this.adapter = await navigator.gpu.requestAdapter();
    if (!this.adapter) {
      throw Error("Couldn't request WebGPU adapter");
    }
    this.device = await this.adapter.requestDevice();
    if (!this.device) {
      throw Error("Couldn't request WebGPU device");
    }
    this.context = this.canvasEl.getContext("webgpu");
    if (!this.context) {
      throw Error("Couldn't get Context");
    }
    this.context?.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      alphaMode: "premultiplied",
    });
    const shaders = `struct VertexOut {
    @builtin(position) position: vec4f;
    @location(0) color: vec4f;
}

@vertex 
fn vertex_main(@location(0) position: vec4f, @location(1) color: vec4f) -> VertexOut {
    var output: VertexOut;
    output.position = position;
    output.color = color;
    return output;
}

@fragment 
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f {
    return fragData.color;
}`;
    const shaderModule = this.device.createShaderModule({ code: shaders });
    const vertices = new Float32Array([
      0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1,
      0, 0, 1, 1,
    ]);
    const vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(
      vertexBuffer,
      0,
      vertices,
      0,
      vertices.length,
    );
    const vertexBuffers: GPUVertexBufferLayout[] = [
      {
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: "float32x4",
          },
          {
            shaderLocation: 1,
            offset: 16,
            format: "float32x4",
          },
        ],
        arrayStride: 32,
        stepMode: "vertex",
      },
    ];

    const renderPipeline = this.device.createRenderPipeline({
      vertex: {
        module: shaderModule,
        entryPoint: "vertex_main",
        buffers: vertexBuffers,
      },
      fragment: {},
    });
  }
  drawFragmentShader(): void {}
}

class WebGLRenderer extends Renderer {
  drawFragmentShader(): void {}
}

const createRenderer = (
  canvas: HTMLCanvasElement,
  overrideUseWebGPU: boolean,
): Renderer => {
  return overrideUseWebGPU || navigator.gpu
    ? new WebGPURenderer(canvas)
    : new WebGLRenderer(canvas);
};
