"use client";
import { getShadersWithUsernamesDetailed } from "@/api/shader-api";
import ShaderPreviewCard from "@/components/ShaderPreviewCard";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";

const MainPageShaders = () => {
  const { data, isError } = useQuery({
    queryKey: ["randomShaders"],
    queryFn: () => getShadersWithUsernamesDetailed(0, 1),
  });
  const router = useRouter();
  if (isError) return <p>Error loading shaders.</p>;
  return (
    <div className="w-full max-w-xl h-full">
      <p>Here&apos;s a random shader...</p>
      <ShaderPreviewCard
        autoPlay={true}
        show={{ usernames: true }}
        onClick={() => router.push(`/view/${data?.shaders[0].id}`)}
        shader={data?.shaders[0]}
      />
    </div>
  );
};

export default MainPageShaders;
