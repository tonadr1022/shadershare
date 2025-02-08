"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShaderData } from "@/types/shader";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { CameraIcon, ArrowLeftToLineIcon, Fullscreen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IRenderer } from "./Renderer";

type Props = {
  initialData: ShaderData;
  renderer: IRenderer | null;
};

const ShaderRenderer = (props: Props) => {
  const { renderer, initialData } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // const [_, setIsFullscreen] = useState<boolean>(false);
  const [oldCS, setOldCS] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const toggleFullscreen = useCallback(() => {
    if (!canvasRef.current) return;
    if (!document.fullscreenElement) {
      setOldCS({
        width: canvasRef.current.width,
        height: canvasRef.current.height,
      });
      canvasRef.current.requestFullscreen();
      const scale = window.devicePixelRatio;
      canvasRef.current.width = Math.floor(window.innerWidth * scale);
      canvasRef.current.height = Math.floor(window.innerHeight * scale);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      canvasRef.current.width = oldCS.width;
      canvasRef.current.height = oldCS.height;
    }
  }, [oldCS]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    if (!renderer) {
      return;
    }

    const render = () => {
      renderer.render();
      requestAnimationFrame(render);
    };

    if (canvasRef.current) {
      renderer.initialize({
        canvas: canvasRef.current,
        renderData: initialData.render_passes,
      });
    }
    render();

    return () => {};
  }, [renderer, initialData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    if (!renderer) {
      return;
    }

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeCanvas = (entries: ResizeObserverEntry[]) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }
      // delay the resize slightly to prevent flickering
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (document.fullscreenElement === null) {
          renderer.onResize(container.offsetWidth, container.offsetHeight);
        } else {
          renderer.onResize(window.innerWidth, window.innerHeight);
        }
      }, 1);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      resizeObserver.disconnect();
    };
  }, [initialData, renderer]);

  const onScreenshot = useCallback(() => {
    if (renderer) {
      renderer.screenshot();
    }
  }, [renderer]);

  const onRestart = useCallback(() => {
    if (renderer) {
      renderer.restart();
    }
  }, [renderer]);
  return (
    <div className="flex flex-col w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full p-0 m-0 bg-white aspect-w-16 aspect-h-9"
      >
        <canvas ref={canvasRef}></canvas>
      </div>
      <div className="w-full h-[40px] flex ">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-none m-0"
                variant="outline"
                onClick={onRestart}
              >
                <ArrowLeftToLineIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Restart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onScreenshot}>
                <CameraIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Screenshot</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={toggleFullscreen}>
                <Fullscreen />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fullscreen</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="bg-blue-500 p-2 border-none">
          {(canvasRef.current && canvasRef.current.width) || 0}x
          {(canvasRef.current && canvasRef.current.height) || 0}
        </div>
      </div>
    </div>
  );
};

export default ShaderRenderer;
