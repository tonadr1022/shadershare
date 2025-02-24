"use client";
import ShaderRenderer from "@/app/(mainapp)/view/components/renderer/ShaderRenderer";
import { MultiBufferEditor } from "@/app/(mainapp)/view/components/editor/Editor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import DownloadPreviewImageDialog from "@/app/(mainapp)/view/components/editor/DownloadPreviewImgDialog";
import EditShaderMetadata from "@/app/(mainapp)/view/components/editor/EditShaderMetadata";
import { RendererProvider } from "@/context/RendererContext";
import { ShaderData } from "@/types/shader";
import ShaderMetadata from "@/app/(mainapp)/view/components/editor/ShaderMetadata";
import LocalSettingsProvider from "@/context/LocalSettingsContext";
import Image from "next/image";

type Props = {
  shaderData?: ShaderData;
  editable: boolean;
};
const ShaderEditor = ({ shaderData, editable }: Props) => {
  return (
    <RendererProvider initialShaderData={shaderData}>
      <ResizablePanelGroup direction="horizontal" className="gap-2">
        <ResizablePanel
          className="flex flex-col w-full h-full gap-2"
          defaultSize={50}
          minSize={20}
          collapsible
          collapsedSize={20}
        >
          <ShaderRenderer keepAspectRatio={true} />
          {editable ? (
            <EditShaderMetadata initialData={shaderData} />
          ) : (
            <ShaderMetadata shaderData={shaderData!} />
          )}

          <div className="self-center">
            <DownloadPreviewImageDialog />

            <Image
              width={320}
              height={180}
              alt="preview"
              src={shaderData?.shader.preview_img_url || ""}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={50}
          collapsedSize={10}
          minSize={10}
          collapsible
          className=""
        >
          <LocalSettingsProvider>
            <MultiBufferEditor />
          </LocalSettingsProvider>
        </ResizablePanel>
      </ResizablePanelGroup>
    </RendererProvider>
  );
};

export default ShaderEditor;
