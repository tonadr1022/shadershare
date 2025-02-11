"use client";
import ShaderRenderer from "../renderer/ShaderRenderer";
import { useCallback, useEffect, useRef } from "react";
import { MultiBufferEditor } from "./Editor";
import {
  createRenderer,
  getScreenshotObjectURL,
  promptSaveScreenshot,
} from "../renderer/Renderer";
import { Button } from "@/components/ui/button";
import { ShaderData } from "@/types/shader";
import { MultiPassRed } from "@/rendering/example-shaders";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import DownloadPreviewImageDialog from "./DownloadPreviewImgDialog";
import { useRendererCtx } from "@/context/RendererContext";
import EditShaderMetadata from "./EditShaderMetadata";

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
  promptSaveScreenshot(canvas);
  renderer.shutdown();
};

const ShaderEditor = () => {
  const { renderer } = useRendererCtx();

  const shaderDataRef = useRef(initialShader);

  const onGetPreviewImg = useCallback((width: number, height: number) => {
    promptSavePreviewImage(width, height, shaderDataRef.current);
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
        <ShaderRenderer />
        <EditShaderMetadata />
        <DownloadPreviewImageDialog onSave={onGetPreviewImg} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={50}
        collapsedSize={10}
        minSize={10}
        collapsible
        className=""
      >
        <MultiBufferEditor />
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
