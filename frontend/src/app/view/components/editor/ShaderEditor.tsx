"use client";
import ShaderRenderer from "../renderer/ShaderRenderer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Editor from "./Editor";
import {
  createRenderer,
  initialFragmentShaderText,
} from "../renderer/Renderer";
import { ModeToggle } from "@/app/components/ModeToggle";

type Props = {
  shaderId: string;
};

const ShaderEditor = ({ shaderId }: Props) => {
  const shaderRendererRef = useRef<HTMLDivElement | null>(null);
  const [renderer, setRenderer] = useState<IRenderer | null>(null);
  const [rendererHeight, setRendererHeight] = useState<number>(0);

  useEffect(() => {
    setRenderer(createRenderer());
  }, []);

  // This useLayoutEffect ensures that the height is updated after the DOM is rendered.
  useLayoutEffect(() => {
    const updateHeight = () => {
      if (shaderRendererRef.current) {
        const width = shaderRendererRef.current.offsetWidth;
        setRendererHeight(width / 1.7777777 + 40); // Set height dynamically based on the width
      }
    };

    // Initial height calculation
    updateHeight();

    // Set up the resize event listener to update the height on window resize
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []); // Empty dependency array ensures this effect runs once after the component is mounted

  return (
    <div className="flex flex-col h-screen bg-background">
      <h1 className="text-white text-center py-4">shader - {shaderId}</h1>
      <ModeToggle />
      <div className="flex flex-col lg:flex-row w-full h-full gap-8">
        <div
          ref={shaderRendererRef}
          style={{
            height: `${rendererHeight}px`, // Use dynamically calculated height
          }}
          className=" w-full lg:w-1/2 bg-background p-0"
        >
          <ShaderRenderer
            renderer={renderer}
            initialData={{
              fragmentText: initialFragmentShaderText,
            }}
          />
        </div>
        <div className="w-full lg:w-1/2 bg-background">
          {renderer && (
            <Editor
              renderer={renderer}
              initialValue={initialFragmentShaderText}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShaderEditor;
