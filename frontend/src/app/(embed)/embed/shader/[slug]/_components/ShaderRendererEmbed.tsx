"use client";
import ShaderRenderer from "@/app/(mainapp)/view/components/renderer/ShaderRenderer";
import { MultiPassRed } from "@/rendering/example-shaders";
import { ShaderData } from "@/types/shader";
import { createRenderer } from "@/app/(mainapp)/view/components/renderer/Renderer";
import React from "react";

const ShaderRendererEmbed = () => {
  const initialShader: ShaderData = MultiPassRed;
  return (
    <div className="w-screen h-screen">
      <ShaderRenderer initialData={initialShader} renderer={createRenderer()} />
    </div>
  );
};

export default ShaderRendererEmbed;
