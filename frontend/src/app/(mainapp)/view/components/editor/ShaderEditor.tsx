"use client";
import ShaderRenderer from "../renderer/ShaderRenderer";
import { useEffect, useState } from "react";
import { MultiBufferEditor } from "./Editor";
import { createRenderer, IRenderer } from "../renderer/Renderer";
import { Button } from "@/components/ui/button";
import { ShaderData } from "@/types/shader";
import { MultiPassRed } from "@/rendering/example-shaders";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const initialShader: ShaderData = MultiPassRed;

const ShaderEditor = () => {
  const [renderer, setRenderer] = useState<IRenderer | null>(null);
  const saveShader = () => {
    console.log("save shader");
  };
  useEffect(() => {
    setRenderer(createRenderer());
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <div className="flex flex-col w-full h-full">
          <ShaderRenderer renderer={renderer} initialData={initialShader} />
          <Button variant="outline" onClick={saveShader}>
            Save
          </Button>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div className="">
          {renderer ? (
            <MultiBufferEditor
              renderer={renderer}
              initialShaderData={initialShader}
            />
          ) : (
            <Skeleton className="w-full h-full"></Skeleton>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
  // TODO: resizeable shadcn component
  return (
    <div className="grid md:grid-cols-2 grid-cols-1 w-full min-h-[calc(100vh-80px)] gap-4 p-4">
      <div className="flex flex-col w-full h-full">
        <ShaderRenderer renderer={renderer} initialData={initialShader} />
        <Button variant="outline" onClick={saveShader}>
          Save
        </Button>
      </div>
      <div className="">
        {renderer ? (
          <MultiBufferEditor
            renderer={renderer}
            initialShaderData={initialShader}
          />
        ) : (
          <Skeleton className="w-full h-full"></Skeleton>
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
