"use client";
import React from "react";
import ShaderEditor from "../../../components/ShaderEditor";
import { useSearchParams } from "next/navigation";
import EditFromShadertoy from "./_components/EditFromShadertoy";

const NewShaderPage = () => {
  const searchParams = useSearchParams();
  const shaderToyId = searchParams.get("shadertoyid");
  if (shaderToyId != null) {
  }
  return (
    <div className="p-4">
      {shaderToyId ? (
        <EditFromShadertoy shadertoyId={shaderToyId} />
      ) : (
        <ShaderEditor editable={true} />
      )}
    </div>
  );
};

export default NewShaderPage;
