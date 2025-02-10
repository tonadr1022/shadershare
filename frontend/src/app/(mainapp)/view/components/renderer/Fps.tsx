import React, { useEffect } from "react";

interface Props {
  renderer: { fps: () => number } | null;
  paused: boolean;
}

const Fps = ({ renderer, paused }: Props) => {
  const [fps, setFps] = React.useState("");

  useEffect(() => {
    if (!renderer) {
      return;
    }
    const updateFps = () => {
      if (!paused) {
        setFps(renderer.fps().toFixed(2));
      }
    };
    const interval = setInterval(updateFps, 500);
    return () => clearInterval(interval);
  }, [renderer, paused]);

  return <>{fps ? fps : "000.00"} fps</>;
};

export default Fps;
