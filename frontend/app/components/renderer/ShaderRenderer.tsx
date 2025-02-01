import { useEffect, useRef, useState } from "react";
import { createRenderer } from "./Renderer";

type Props = { shaderId: string };

const ShaderRenderer = ({ shaderId }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [validRenderer, setValidRenderer] = useState(false);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = createRenderer(canvas);
    setValidRenderer(renderer !== null);
    if (!renderer) {
      return;
    }

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeCanvas = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        setCanvasSize({ width: containerWidth, height: containerHeight });
        renderer.onResize(containerWidth, containerHeight);
      }, 10);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    const render = () => {
      renderer.render();
      requestAnimationFrame(render);
    };

    renderer.initialize({
      shaderDatas: [
        {
          vertexCode: `#version 300 es
in vec3 aPos;

void main() {
    gl_Position = vec4(aPos, 1.0);
}`,
          fragmentCode: `#version 300 es
precision mediump float;

out vec4 FragColor;
void main() {
    FragColor = vec4(0.0, 0.0, 1.0, 1.0); // Blue color
}`,
        },
      ],
    });
    render();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col justify-center items-center h-full w-full"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
      />
    </div>
  );
};

export default ShaderRenderer;
