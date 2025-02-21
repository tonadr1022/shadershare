"use client";
import ShaderRenderer from "@/app/(mainapp)/view/components/renderer/ShaderRenderer";
import React from "react";
import { RendererProvider } from "@/context/RendererContext";
import { useQuery } from "@tanstack/react-query";
import { getShader } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  shaderId: string;
};

const ShaderRendererEmbed = ({ shaderId }: Props) => {
  const { data, isPending, isError } = useQuery({
    queryFn: async () => {
      return getShader(shaderId);
    },
    queryKey: ["shaders", shaderId],
  });
  if (isPending) return <Spinner />;
  if (isError) return <p>Error loading shader. D:</p>;
  if (!data) return <p>No shader found</p>;
  return (
    <div className="w-screen h-screen">
      <RendererProvider initialShaderData={data}>
        <ShaderRenderer keepAspectRatio={false} />
      </RendererProvider>
    </div>
  );
};

export default ShaderRendererEmbed;
