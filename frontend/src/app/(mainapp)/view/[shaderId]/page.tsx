"use client";
import { useQuery } from "@tanstack/react-query";
import ShaderEditor from "../components/editor/ShaderEditor";
import { useParams } from "next/navigation";
import axiosInstance from "@/api/api";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const params = useParams<{ shaderId: string }>();
  const { data, isPending, isError } = useQuery({
    queryFn: async () => {
      const res = await axiosInstance.get(`/shader/${params.shaderId}`);
      return res.data;
    },
    queryKey: ["shader", params.shaderId],
  });

  return (
    <div className="p-4 ">
      {isPending && <Spinner />}
      {isError && <p>Error loading shader</p>}
      {data && <ShaderEditor shaderData={data} />}
    </div>
  );
}
