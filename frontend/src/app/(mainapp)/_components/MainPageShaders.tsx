"use client";
import { getShadersWithUsernames } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";
import { RendererProvider } from "@/context/RendererContext";
import { ShaderDataWithUser } from "@/types/shader";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import ShaderRenderer from "../view/components/renderer/ShaderRenderer";

type Props = {
  data: ShaderDataWithUser;
  show?: { usernames: boolean };
};
const ShaderRenderPreviewCard = ({ data: shader, show }: Props) => {
  const router = useRouter();
  const handleClick = useCallback(() => {
    router.push(`/view/${shader.shader.id}`);
  }, [router, shader.shader.id]);
  return (
    <div className="w-full h-auto" key={shader.shader.id}>
      <RendererProvider username={shader.username} initialShaderData={shader}>
        <div className="cursor-pointer" onClick={handleClick}>
          <ShaderRenderer
            keepAspectRatio={false}
            hoverOnlyPlay
            hideControls={true}
          />
        </div>
      </RendererProvider>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-2 items-center">
          <p className="font-bold cursor-pointer" onClick={handleClick}>
            {shader.shader.title}
          </p>
          {(!show || show.usernames) && (
            <p className="text-sm">
              by <span className="">{shader.username || "no username"}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const MainPageShaders = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["randomShaders"],
    queryFn: () => getShadersWithUsernames(0, 1),
  });
  if (isError) return <p>Error loading shaders.</p>;
  if (isPending) return <Spinner />;
  if (!data || data.shaders.length === 0) return <p>No shaders found.</p>;

  return (
    <div className="w-full max-w-xl h-full">
      <ShaderRenderPreviewCard data={data.shaders[0]} />
    </div>
  );
};

export default MainPageShaders;
