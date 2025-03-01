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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Fps from "./Fps";
import { useRendererCtx } from "@/context/RendererContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import EmbedShaderText from "./EmbedShaderText";

type Props = {
  keepAspectRatio: boolean;
  isEmbedded?: boolean;
  hoverOnlyPlay?: boolean;
  hideControls?: boolean;
};
const ShaderRenderer = ({
  hoverOnlyPlay,
  keepAspectRatio,
  isEmbedded,
  hideControls,
}: Props) => {
  const [hideUI, setHideUI] = useState(hideControls);
  const isShaderEmbed = isEmbedded || false;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { paused, setPaused, shaderDataRef, renderer } = useRendererCtx();
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(true);
  const [firstRender, setFirstRender] = useState(2);
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });
  const [overrideHoverPlay, setOverrideHoverPlay] = useState(false);

  const onPause = useCallback(() => {
    setPaused((prev) => !prev);
  }, [setPaused]);

  const onScreenshot = useCallback(async () => {
    renderer?.saveScreenshot((blob) => {
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
    });
  }, [renderer]);

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
    return () => {
      renderer?.shutdown();
    };
  }, [renderer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !renderer) return;

    const onKeyDown = (ev: KeyboardEvent) => {
      ev.preventDefault();
      if (ev.key === "F7") {
        setHideUI((prev) => !prev);
      }
      renderer.setKeyDown(ev.keyCode);
    };
    const onKeyUp = (ev: KeyboardEvent) => {
      ev.preventDefault();
      renderer.setKeyUp(ev.keyCode);
    };
    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    const initializeRenderer = async () => {
      renderer.initialize({
        canvas,
        shaderOutputs: shaderDataRef.current.shader_outputs,
      });
    };

    initializeRenderer();

    return () => {
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("keyup", onKeyUp);
    };
  }, [renderer, shaderDataRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !renderer) return;

    let animationFrameId: number;
    const render = () => {
      const currRealTime = performance.now() / 1000;
      if (renderer.initializing()) {
        // setFirstRender(2);
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const isPaused =
        paused || (!overrideHoverPlay && hoverOnlyPlay && hoverPaused);
      if (renderer.forceRender() || !isPaused || firstRender) {
        if (renderer.getWasPaused()) {
          // Adjust last real time so there's no jump
          renderer.setLastRealTime(currRealTime);
          renderer.setWasPaused(false);
        }

        const dt = currRealTime - renderer.getLastRealTime();
        renderer.setShaderTime(renderer.getShaderTime() + dt);
        const didRender = renderer.render({ checkResize: true, dt: dt });
        if (!didRender || firstRender > 0) {
          renderer.setFrame(0);
          setFirstRender((fr) => Math.max(fr - 1, 0));
        }
        renderer.setLastRealTime(currRealTime);
      } else {
        renderer.setWasPaused(true);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    hoverOnlyPlay,
    hoverPaused,
    renderer,
    shaderDataRef,
    paused,
    firstRender,
    overrideHoverPlay,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !renderer) return;
    const bestAttemptFallback = function () {
      const xres = Math.round(canvas.width);
      const yres = Math.round(canvas.height);
      setCanvasDims({ width: xres, height: yres });
      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        renderer.onResize(xres, yres);
      }
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
        // For now, not rendering at high DPI, too slow
        const box = entry.devicePixelContentBoxSize[0];
        const dpr = window.devicePixelRatio || 1;
        setCanvasDims({
          width: Math.floor(box.inlineSize / dpr),
          height: Math.floor(box.blockSize / dpr),
        });
        if (
          canvas.width !== canvas.clientWidth ||
          canvas.height !== canvas.clientHeight
        ) {
          renderer.onResize(box.inlineSize, box.blockSize);
        }
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
      onMouseEnter={() => setHoverPaused(false)}
      onMouseLeave={() => setHoverPaused(true)}
      className={cn(
        isShaderEmbed && "relative",
        "flex flex-col w-full h-full group",
      )}
    >
      {keepAspectRatio ? (
        <AspectRatio ratio={16 / 9} className="w-full p-0 m-0 bg-background">
          <canvas
            tabIndex={1}
            ref={canvasRef}
            className="w-full bg-black h-full outline-none"
          />
        </AspectRatio>
      ) : (
        <canvas
          tabIndex={1}
          ref={canvasRef}
          className="w-full h-full bg-back outline-none"
        />
      )}
      {!hideUI && isShaderEmbed && (
        <div
          className={cn(
            optionsDropdownOpen
              ? "opacity-80"
              : "opacity-0 group-hover:opacity-80",
            "w-full  transition-opacity  h-[40px] bg-background absolute inset-0",
          )}
        >
          <div className="px-2 w-full h-[40px] flex items-center">
            <h6 className="text-sm">{shaderDataRef.current.title} &nbsp;</h6>
            <p className="text-xs">
              by {shaderDataRef.current.username || "uh oh no username D:"}
            </p>
          </div>
        </div>
      )}
      {!hideUI && (
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
                            href={`/view/${shaderDataRef.current.id}`}
                            target="_blank"
                          >
                            <DropdownMenuItem className="cursor-pointer">
                              Go to Shader
                            </DropdownMenuItem>
                          </Link>
                        )}
                        <Link
                          prefetch={false}
                          href={`/embed/shader/${shaderDataRef.current.id}`}
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
                            link={`https://www.shader-share.com/embed/shader/${shaderDataRef.current.id}`}
                          />
                        )}
                        {hoverOnlyPlay && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setOverrideHoverPlay((prev) => !prev);
                            }}
                          >
                            {overrideHoverPlay ? "Enable" : "Disable"} Hover
                            Play
                          </DropdownMenuItem>
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
      )}
    </div>
  );
};

export default ShaderRenderer;
