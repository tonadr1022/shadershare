"use client";
import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import ShaderEditor from "@/components/ShaderEditor";
import { useGetMe } from "@/hooks/hooks";
import { getShader } from "@/api/shader-api";
import { useParams } from "next/navigation";

const ViewPage = () => {
  const meQuery = useGetMe();
  const params = useParams<{ shaderId: string }>();
  const dataQuery = useQuery({
    queryFn: () => getShader(params.shaderId),
    queryKey: ["shaders", params.shaderId],
  });
  const anyError = meQuery.isError || dataQuery.isError;
  const anyLoading = meQuery.isLoading || dataQuery.isLoading;
  return (
    <div className="p-4 ">
      {anyLoading && <Spinner />}
      {anyError && <p>Error loading shader</p>}
      {dataQuery.data && (
        <ShaderEditor editable={!meQuery.isError} shaderData={dataQuery.data} />
      )}
    </div>
  );
};

export default ViewPage;
