"use client";
import { useQuery } from "@tanstack/react-query";
import ShaderEditor from "../../../../components/ShaderEditor";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe } from "@/hooks/hooks";
import { getShader } from "@/api/shader-api";

export default function Home() {
  const params = useParams<{ shaderId: string }>();
  const meQuery = useGetMe();
  const dataQuery = useQuery({
    queryFn: async () => {
      return getShader(params.shaderId);
    },
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
}
