"use client";
import React, { Suspense } from "react";
import ShaderEditor from "../../../components/ShaderEditor";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getShadertoyShader } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";

const EditFromShadertoy = ({ shadertoyId }: { shadertoyId: string }) => {
  const {
    data: shadertoy,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["shadertoy", shadertoyId],
    queryFn: () => getShadertoyShader(shadertoyId),
  });

  return isPending ? (
    <Spinner />
  ) : isError || !shadertoy ? (
    <p>Error loading Shadertoy Shader</p>
  ) : (
    <div>
      <h1>shadertoy edit</h1>
      <pre>
        <code>{JSON.stringify(shadertoy, null, 2)}</code>
      </pre>
    </div>
  );
};

const Page = () => {
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

const NewShaderPage = () => {
  return (
    <Suspense>
      <Page />
    </Suspense>
  );
};

export default NewShaderPage;
