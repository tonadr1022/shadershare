import { useEffect, useRef, useState } from "react";
export default function ShaderRenderer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 100, 100);
      }
    }
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}

const WebGPUComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gpuAvailable, setGpuAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check if WebGPU is supported
    if (!navigator.gpu) {
      console.error("WebGPU is not supported in this browser.");
      return;
    }

    const initializeWebGPU = async () => {
      try {
        // Request a GPU adapter
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          console.error("Failed to get GPU adapter.");
          return;
        }

        // Request a GPU device
        const device = await adapter.requestDevice();
        console.log("WebGPU device initialized:", device);

        if (canvasRef.current) {
          // Get the canvas and set up a WebGPU context
          const context = canvasRef.current.getContext("webgpu");
          if (!context) {
            console.error("Failed to get WebGPU context.");
            return;
          }

          // Set up WebGPU rendering pipeline (simplified)
          context.configure({
            device: device,
            format: "bgra8unorm",
            usage:
              GPUTextureUsage.RENDER_ATTACHMENT |
              GPUTextureUsage.COPY_SRC |
              GPUTextureUsage.COPY_DST,
          });

          // Create a simple render pass (you can expand this as needed)
          const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
              {
                view: context.getCurrentTexture().createView(),
                loadOp: "clear",
                storeOp: "store",
                clearValue: [0.0, 1.0, 1.0, 1.0],
              },
            ],
          };

          const commandEncoder = device.createCommandEncoder();
          const passEncoder =
            commandEncoder.beginRenderPass(renderPassDescriptor);
          passEncoder.end();

          // Submit commands
          device.queue.submit([commandEncoder.finish()]);
        }
      } catch (error) {
        console.error("Error initializing WebGPU:", error);
      }
    };

    initializeWebGPU();
    setGpuAvailable(true);
  }, []);

  return (
    <div>
      {gpuAvailable ? (
        <canvas ref={canvasRef} width="800" height="600"></canvas>
      ) : (
        <p>WebGPU is not available in your browser.</p>
      )}
    </div>
  );
};

export { WebGPUComponent };
