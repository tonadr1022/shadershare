"use client";
import ShaderRenderer from "../renderer/ShaderRenderer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MultiBufferEditor } from "./Editor";
import { createRenderer } from "../renderer/Renderer";
import { Button } from "@/components/ui/button";
import { IRenderer, ShaderData } from "@/types/shader";
import { MultipassExample } from "@/rendering/example-shaders";

const initialShader: ShaderData = MultipassExample;

// const initialShader: ShaderData = {
//   title: "",
//   description: "",
//   render_passes: [
//     { pass_idx: 0, code: initialFragmentShaderText },
//     { pass_idx: 1, code: "nothing here" },
//   ],
// };
const ShaderEditor = () => {
  const shaderRendererRef = useRef<HTMLDivElement | null>(null);
  const [renderer, setRenderer] = useState<IRenderer | null>(null);
  const [rendererHeight, setRendererHeight] = useState<number>(0);
  const saveShader = () => {
    console.log("save shader");
  };
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
    <div className="grid grid-cols-2 w-full min-h-[calc(100vh-80px)] gap-4 p-4">
      <div className="flex flex-col w-full h-full">
        <div
          ref={shaderRendererRef}
          style={{
            height: `${rendererHeight}px`, // Use dynamically calculated height
          }}
          className=" w-full  bg-background p-0"
        >
          <ShaderRenderer renderer={renderer} initialData={initialShader} />
        </div>
        <Button onClick={saveShader}>Save</Button>
      </div>
      <div className="w-full  h-full bg-background">
        {renderer && (
          <MultiBufferEditor
            renderer={renderer}
            initialShaderData={initialShader}
          />
        )}
      </div>
    </div>
  );
};

/*
 *
 <Editor 
   renderer={renderer} 
   initialValue={initialFragmentShaderText}
 /> 
 */
export default ShaderEditor;
