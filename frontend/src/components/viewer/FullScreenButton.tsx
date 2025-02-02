import React, { useEffect, useRef, useState } from "react";

const FullscreenCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Function to resize the canvas to full screen
  const resizeCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  };

  // Draw something on the canvas for demonstration
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    ctx.fillStyle = "black";
    ctx.font = "48px sans-serif";
    ctx.fillText("Canvas in Fullscreen", 100, 100);
  };

  // Handle button click to toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (canvasRef.current?.requestFullscreen) {
        canvasRef.current?.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for the Escape key to exit fullscreen
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === "Escape" && document.fullscreenElement) {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Drawing the canvas when it's ready
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      draw(ctx);
    }

    // Resize canvas when the window is resized
    window.addEventListener("resize", resizeCanvas);

    // Handle Escape key press
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Trigger initial canvas resize
  useEffect(() => {
    resizeCanvas();
  }, []);

  return (
    <div>
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
        {isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
      </button>
      <canvas ref={canvasRef} style={{ backgroundColor: "#f0f0f0" }} />
    </div>
  );
};

export default FullscreenCanvas;
