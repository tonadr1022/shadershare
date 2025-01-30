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

    const initialize = async () => {
      try {
        const webgpuSupported = navigator.gpu!!;
      } catch (error) {
        console.error("Error initializing WebGPU", error);
      }
    };

    initialize();
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
