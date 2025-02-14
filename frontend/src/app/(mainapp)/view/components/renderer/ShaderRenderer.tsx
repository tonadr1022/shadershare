"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  CameraIcon,
  ArrowLeftToLineIcon,
  Fullscreen,
  Pause,
  Play,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { promptSaveScreenshot } from "./Renderer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Fps from "./Fps";
import { useRendererCtx } from "@/context/RendererContext";

const ShaderRenderer = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { paused, setPaused, shaderDataRef, renderer } = useRendererCtx();

  const onPause = useCallback(() => {
    setPaused((prev) => !prev);
  }, [setPaused]);
  const onScreenshot = useCallback(() => {
    if (canvasRef.current) {
      promptSaveScreenshot(canvasRef.current);
    }
  }, []);

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
    if (!canvas || !renderer) return;

    let animationFrameId: number;

    const render = () => {
      const currRealTime = performance.now() / 1000;

      if (!paused) {
        if (renderer.getWasPaused()) {
          // Adjust last real time so there's no jump
          renderer.setLastRealTime(currRealTime);
          renderer.setWasPaused(false);
        }

        const dt = currRealTime - renderer.getLastRealTime();
        renderer.setShaderTime(renderer.getShaderTime() + dt);

        renderer.render({ checkResize: true, dt: dt });
        renderer.setLastRealTime(currRealTime);
      } else {
        renderer.setWasPaused(true);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    renderer.initialize({
      canvas: canvas,
      shaderInputs: shaderDataRef.current.shader_inputs,
      shaderOutputs: shaderDataRef.current.shader_outputs,
    });
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      // renderer?.shutdown();
    };
  }, [renderer, shaderDataRef, paused]);

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
      if (!entry || !renderer) return;

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
      // renderer.shutdown();
    };
  }, [renderer]);

  return (
    <div className="flex flex-col w-full">
      <AspectRatio ratio={16 / 9} className="w-full p-0 m-0 bg-background">
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
              <Button variant="outline" onClick={onPause}>
                {paused ? <Play /> : <Pause />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{paused ? "Play" : "Pause"} Alt + p</p>
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
        <div className="font-semibold p-2 border-none">
          <Fps paused={paused} renderer={renderer} />
        </div>
      </div>
    </div>
  );
};

export default ShaderRenderer;
