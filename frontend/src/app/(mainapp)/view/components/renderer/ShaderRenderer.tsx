"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CameraIcon,
  ArrowLeftToLineIcon,
  Fullscreen,
  Pause,
  Play,
  Video,
  Ellipsis,
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
import { cn } from "@/lib/utils";
import Link from "next/link";
import EmbedShaderText from "./EmbedShaderText";

type Props = {
  keepAspectRatio: boolean;
  isEmbedded?: boolean;
};
const ShaderRenderer = ({ keepAspectRatio, isEmbedded }: Props) => {
  const isShaderEmbed = isEmbedded || false;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { paused, setPaused, shaderDataRef, renderer } = useRendererCtx();
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);

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

  const [isRecording, setIsRecording] = useState(false);

  const toggleRecord = useCallback(() => {
    setIsRecording((prev) => !prev);
    if (renderer) {
      if (!isRecording) {
        renderer.startRecording();
      } else {
        renderer.stopRecording();
      }
    }
  }, [isRecording, renderer]);
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

    const initializeRenderer = async () => {
      await renderer.initialize({
        canvas: canvas,
        shaderInputs: shaderDataRef.current.shader_inputs,
        shaderOutputs: shaderDataRef.current.shader_outputs,
      });
    };
    initializeRenderer();

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
    <div
      className={cn(
        isShaderEmbed && "relative",
        "flex flex-col w-full h-full group",
      )}
    >
      {keepAspectRatio ? (
        <AspectRatio ratio={16 / 9} className="w-full p-0 m-0 bg-background">
          <canvas ref={canvasRef} className="w-full h-full" />
        </AspectRatio>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}
      {isShaderEmbed && (
        <div
          className={cn(
            optionsDropdownOpen
              ? "opacity-80"
              : "opacity-0 group-hover:opacity-80",
            "w-full  transition-opacity  h-[40px] bg-background absolute inset-0",
          )}
        >
          <div className="px-2 w-full h-[40px] flex items-center">
            <h6 className="text-sm">
              {shaderDataRef.current.shader.title} &nbsp;
            </h6>
            <p className="text-xs">
              by {shaderDataRef.current.username || "uh oh no username D:"}
            </p>
          </div>
        </div>
      )}
      <div
        className={cn(
          isShaderEmbed &&
            (optionsDropdownOpen
              ? "opacity-80"
              : "opacity-0 group-hover:opacity-80"),
          isShaderEmbed &&
            "absolute bottom-0 left-0 w-full transition-opacity bg-background",
        )}
      >
        <div className={cn("w-full flex justify-between")}>
          <div className="flex w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="rounded-none h-full"
                    variant="ghost"
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
                  <Button
                    variant="ghost"
                    className="rounded-none h-full"
                    onClick={onPause}
                  >
                    {paused ? <Play /> : <Pause />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {paused ? "Play" : "Pause"} {!isShaderEmbed && "Alt + p"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-none h-full"
                    onClick={onScreenshot}
                  >
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
                  <Button
                    variant="ghost"
                    onClick={toggleRecord}
                    className="rounded-none h-full"
                  >
                    <Video className={cn(isRecording && "text-red-500")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isRecording ? "Stop Recording" : "Record"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-none h-full"
                    onClick={toggleFullscreen}
                  >
                    <Fullscreen />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fullscreen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div
            className={cn(
              "flex flex-row items-center gap-1",
              canvasDims.width < 500 ? "text-xs" : "text-sm",
            )}
          >
            <div className="text-center font-semibold border-none">
              {canvasDims.width}x{canvasDims.height}
            </div>
            <div className="font-semibold border-none">
              <Fps paused={paused} renderer={renderer} />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu
                    open={optionsDropdownOpen}
                    onOpenChange={setOptionsDropdownOpen}
                  >
                    <DropdownMenuTrigger className="transition-none" asChild>
                      <Button variant="ghost" className="rounded-none h-full">
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="mr-4 ">
                      {isShaderEmbed && (
                        <Link
                          prefetch={false}
                          href={`/view/${shaderDataRef.current.shader.id}`}
                          target="_blank"
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            Go to Shader
                          </DropdownMenuItem>
                        </Link>
                      )}
                      <Link
                        prefetch={false}
                        href={`/embed/shader/${shaderDataRef.current.shader.id}`}
                        target="_blank"
                      >
                        <DropdownMenuItem className="cursor-pointer">
                          Open Embed In New Tab
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setEmbedOpen((prev) => !prev);
                        }}
                      >
                        {embedOpen ? "Close Embed" : "Embed"}
                      </DropdownMenuItem>

                      {embedOpen && (
                        <EmbedShaderText
                          link={`https://www.shader-share.com/embed/shader/${shaderDataRef.current.shader.id}`}
                        />
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  {isRecording ? "Stop Recording" : "Record"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShaderRenderer;
