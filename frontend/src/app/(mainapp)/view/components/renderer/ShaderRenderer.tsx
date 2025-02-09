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
import { AspectRatio } from "@/components/ui/aspect-ratio";

type Props = {
  initialData: ShaderData;
  renderer: IRenderer | null;
};

const ShaderRenderer = (props: Props) => {
  const { renderer, initialData } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onScreenshot = useCallback(() => {
    renderer?.screenshot();
  }, [renderer]);

  const onRestart = useCallback(() => {
    renderer?.restart();
  }, [renderer]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !renderer) return;
    const bestAttemptFallback = function () {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const xres = Math.round(canvas.offsetWidth * devicePixelRatio) | 0;
      const yres = Math.round(canvas.offsetHeight * devicePixelRatio) | 0;
      setCanvasDims({ width: xres, height: yres });
      renderer.onResize(xres, yres);
    };

    // src: Shader toy JS source in network tab :D
    const resizeObserver = new ResizeObserver((entries, observer) => {
      const entry = entries.find((entry) => entry.target === canvas);
      if (!entry) return;
      if (!entry["devicePixelContentBoxSize"]) {
        observer.unobserve(entry.target);
        console.log(
          "WARNING: This browser doesn\'t support ResizeObserver + device-pixel-content-box",
        );
        bestAttemptFallback();
        window.addEventListener("resize", bestAttemptFallback);
      } else {
        const box = entry.devicePixelContentBoxSize[0];

        setCanvasDims({ width: box.inlineSize, height: box.blockSize });
        renderer.onResize(box.inlineSize, box.blockSize);
      }
    });
    try {
      resizeObserver.observe(canvas, { box: "device-pixel-content-box" });
    } catch (e) {
      console.log(
        "WARNING: This browser doesn't support ResizeObserver + device-pixel-content-box",
        e,
      );
      bestAttemptFallback();
      window.addEventListener("resize", bestAttemptFallback);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", bestAttemptFallback);
    };
  }, [initialData, renderer]);

  return (
    <div className="flex flex-col w-full">
      <AspectRatio ratio={16 / 9} className="w-full p-0 m-0 bg-white">
        <canvas ref={canvasRef} className="w-full h-full" />
      </AspectRatio>
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
        <div className="font-semibold p-2 border-none">
          {canvasDims.width}x{canvasDims.height}
        </div>
      </div>
    </div>
  );
};

export default ShaderRenderer;
