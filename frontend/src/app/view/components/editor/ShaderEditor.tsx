"use client";
import ShaderRenderer from "../renderer/ShaderRenderer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Editor, { MultiBufferEditor } from "./Editor";
import {
  createRenderer,
  initialFragmentShaderText,
} from "../renderer/Renderer";
import { Button } from "@/components/ui/button";
import { ShaderData } from "@/types/shader";

const initialShader: ShaderData = {
  title: "",
  description: "",
  render_passes: [
    { pass_idx: 0, code: initialFragmentShaderText },
    { pass_idx: 1, code: "nothing here" },
  ],
};
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
    <div className="h-full flex flex-col bg-background p-4">
      <h1 className="">shader - </h1>
      <div className="flex flex-col lg:flex-row w-full h-full gap-4">
        <div className="flex flex-col w-full h-full lg:w-1/2">
          <div
            ref={shaderRendererRef}
            style={{
              height: `${rendererHeight}px`, // Use dynamically calculated height
            }}
            className=" w-full  bg-background p-0"
          >
            <ShaderRenderer
              renderer={renderer}
              initialData={{
                fragmentText: initialFragmentShaderText,
              }}
            />
          </div>
          <Button onClick={saveShader}>Save</Button>
        </div>
        <div className="w-full h-full lg:w-1/2 bg-background">
          {renderer && <MultiBufferEditor initialShaderData={initialShader} />}
        </div>
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
