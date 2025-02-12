"use client";
import ShaderRenderer from "../renderer/ShaderRenderer";
import { MultiBufferEditor } from "./Editor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import DownloadPreviewImageDialog from "./DownloadPreviewImgDialog";
import EditShaderMetadata from "./EditShaderMetadata";
import { RendererProvider } from "@/context/RendererContext";
import { ShaderData } from "@/types/shader";

type Props = {
  shaderData?: ShaderData;
};
const ShaderEditor = ({ shaderData }: Props) => {
  return (
    <RendererProvider initialShaderData={shaderData}>
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
          <MultiBufferEditor />
        </ResizablePanel>
      </ResizablePanelGroup>
    </RendererProvider>
  );
};

export default ShaderEditor;
