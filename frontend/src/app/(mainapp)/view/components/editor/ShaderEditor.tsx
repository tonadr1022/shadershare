"use client";
import ShaderRenderer from "../renderer/ShaderRenderer";
import { useCallback, useEffect } from "react";
import { MultiBufferEditor } from "./Editor";
import { createRenderer, promptSaveScreenshot } from "../renderer/Renderer";
import { Button } from "@/components/ui/button";
import { ShaderData } from "@/types/shader";
import { MultiPassRed } from "@/rendering/example-shaders";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import DownloadPreviewImageDialog from "./DownloadPreviewImgDialog";
import { useRendererCtx } from "@/context/RendererContext";

const initialShader: ShaderData = MultiPassRed;

const promptSavePreviewImage = (
  width: number,
  height: number,
  shaderData: ShaderData,
) => {
  const renderer = createRenderer();
  const canvas = document.createElement("canvas");
  renderer.initialize({
    canvas: canvas,
    renderData: shaderData.render_passes,
  });
  renderer.onResize(width, height);
  renderer.render({ checkResize: false });
  renderer.shutdown();
  promptSaveScreenshot(canvas);
};

const ShaderEditor = () => {
  const { renderer } = useRendererCtx();
  const saveShader = useCallback(() => {
    const renderer = createRenderer();
    const canvas = document.createElement("canvas");
    renderer.initialize({
      canvas: canvas,
      renderData: initialShader.render_passes,
    });
    renderer.onResize(320, 180);
    renderer.render({ checkResize: false });
    renderer.shutdown();
    promptSaveScreenshot(canvas);
  }, []);

  const onGetPreviewImg = useCallback(() => {
    promptSavePreviewImage(320, 180, initialShader);
  }, []);

  useEffect(() => {
    return () => {
      renderer?.shutdown();
    };
  }, [renderer]);

  return (
    <ResizablePanelGroup direction="horizontal" className="gap-2">
      <ResizablePanel
        className="flex flex-col w-full h-full"
        defaultSize={50}
        minSize={20}
        collapsible
        collapsedSize={20}
      >
        <ShaderRenderer renderer={renderer} initialData={initialShader} />
        <Button variant="outline" onClick={saveShader}>
          Save
        </Button>
        <DownloadPreviewImageDialog />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={50}
        collapsedSize={10}
        minSize={10}
        collapsible
        className=""
      >
        {renderer ? (
          <MultiBufferEditor
            renderer={renderer}
            initialShaderData={initialShader}
          />
        ) : (
          <Skeleton className="w-full h-full"></Skeleton>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
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
