import React, { useEffect } from "react";

interface Props {
  renderer: { getFps: () => number } | null;
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
        setFps(renderer.getFps().toFixed(2));
      }
    };
    const interval = setInterval(updateFps, 500);
    return () => clearInterval(interval);
  }, [renderer, paused]);

  return <span>{fps ? fps : "000.00"}&nbsp;fps</span>;
};

export default Fps;
