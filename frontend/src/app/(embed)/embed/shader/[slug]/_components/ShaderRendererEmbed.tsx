"use client";
import ShaderRenderer from "@/app/(mainapp)/view/components/renderer/ShaderRenderer";
import React from "react";
import { RendererProvider } from "@/context/RendererContext";
import { useQuery } from "@tanstack/react-query";
import { getShaderWithUsername } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  shaderId: string;
};

const ShaderRendererEmbed = ({ shaderId }: Props) => {
  const [errMsg, setErrMsg] = React.useState("");
  const { data, isPending, isError } = useQuery({
    queryFn: async () => {
      return getShaderWithUsername(shaderId);
    },
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
