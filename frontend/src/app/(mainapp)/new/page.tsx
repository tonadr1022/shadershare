import React from "react";
import ShaderEditor from "../view/components/editor/ShaderEditor";
import { RendererProvider } from "@/context/RendererContext";

const NewShaderPage = () => {
  return (
    <div className="p-4">
      <RendererProvider>
        <ShaderEditor />
      </RendererProvider>
    </div>
  );
};

export default NewShaderPage;
