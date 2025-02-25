"use client";
import ShaderRenderer from "@/app/(mainapp)/view/components/renderer/ShaderRenderer";
import React, { useState } from "react";
import { RendererProvider } from "@/context/RendererContext";
import { useQuery } from "@tanstack/react-query";
import { getShaderWithUsername } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";
import { useParams } from "next/navigation";

const ShaderRendererEmbed = () => {
  const params = useParams();
  const { slug: shaderId } = params;
  const [errMsg, setErrMsg] = useState("");
  const { data, isPending, isError } = useQuery({
    queryFn: () =>
      getShaderWithUsername((shaderId as string | undefined) || "", true),
    retry: (failureCount, error) => {
      if (error.message.includes("404")) {
        setErrMsg("Shader not found D:");
        return false;
      }
      if (failureCount >= 3) {
        setErrMsg("Failed to load shader D:");
      }
      return failureCount < 3;
    },
    queryKey: ["shaders", shaderId],
  });
  if (!shaderId) return <p>No shader found</p>;
  return (
    <div className="w-screen h-screen flex  justify-center items-center align-middle">
      {isError ? (
        <p>{errMsg}</p>
      ) : isPending ? (
        <Spinner />
      ) : !data ? (
        <p>{errMsg}</p>
      ) : (
        <RendererProvider username={data.username} initialShaderData={data}>
          <ShaderRenderer keepAspectRatio={false} isEmbedded hoverOnlyPlay />
        </RendererProvider>
      )}
    </div>
  );
};

export default ShaderRendererEmbed;
