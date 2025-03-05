"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import ShaderEditor from "@/components/ShaderEditor";
import { useGetMe } from "@/hooks/hooks";
import { getShaderWithUsername } from "@/api/shader-api";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

const ViewPage = () => {
  const params = useParams<{ shaderId: string }>();
  const dataQuery = useQuery({
    queryFn: () => getShaderWithUsername(params.shaderId, true),
    queryKey: ["shaders", params.shaderId],
  });
  const meQuery = useGetMe();
  const anyLoading = meQuery.isLoading || dataQuery.isLoading;
  return (
    <div className="p-4 ">
      {anyLoading ? (
        <Spinner />
      ) : dataQuery.isError || !dataQuery.data ? (
        <p>Error loading shader</p>
      ) : (
        <ShaderEditor
          userID={meQuery.data?.id}
          editable={dataQuery.data.user_id === meQuery.data?.id}
          shaderData={dataQuery.data}
        />
      )}
    </div>
  );
};

export default ViewPage;
