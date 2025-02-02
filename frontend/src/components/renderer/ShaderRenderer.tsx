"use client";
import { useEffect, useRef, useState } from "react";
import { createRenderer } from "./Renderer";

type Props = { shaderId: string };

const ShaderRenderer = ({ shaderId }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [oldCS, setOldCS] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const toggleFullscreen = () => {
    if (!canvasRef.current) return;
    if (!document.fullscreenElement) {
      setIsFullscreen(true);
      setOldCS({
        width: canvasRef.current.width || 0,
        height: canvasRef.current.height || 0,
      });
      if (canvasRef.current?.requestFullscreen) {
        canvasRef.current?.requestFullscreen();
        const scale = window.devicePixelRatio;
        canvasRef.current.width = Math.floor(window.innerWidth * scale);
        canvasRef.current.height = Math.floor(window.innerHeight * scale);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      canvasRef.current.width = oldCS.width;
      canvasRef.current.height = oldCS.height;
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = createRenderer(canvas);
    if (!renderer) {
      return;
    }

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeCanvas = () => {
      // delay the resize slightly to prevent flickering
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!isFullscreen) {
          const containerWidth = container.offsetWidth;
          const containerHeight = container.offsetHeight;
          setCanvasSize({ width: containerWidth, height: containerHeight });
          renderer.onResize(containerWidth, containerHeight);
        } else {
          renderer.onResize(window.innerWidth, window.innerHeight);
        }
      }, 0.5);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
    document.addEventListener("keydown", handleEscapeKey);

    const render = () => {
      renderer.render();
      requestAnimationFrame(render);
    };

    renderer.initialize({
      renderData: {
        fragmentCode: `
void imageMain(vec2 fragCoord, vec3 iResolution) {
    vec2 uv = fragCoord / iResolution.xy;
    // uv.x = step(.5,uv.x);
    // uv.y = step(.5,uv.y);
    FragColor = vec4(uv,0.,1.);
}`,
      },
    });
    render();

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      resizeObserver.disconnect();
    };
  }, [isFullscreen]);

  return (
    <>
      <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        go full screen
      </button>
      <div
        ref={containerRef}
        className="h-full w-full p-0 m-0 bg-white flex items-center justify-center"
      >
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default ShaderRenderer;
