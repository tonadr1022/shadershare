"use client";
import { getShadertoyShader } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  shadertoyId: string;
};

const EditFromShadertoy = ({ shadertoyId }: Props) => {
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

export default EditFromShadertoy;
