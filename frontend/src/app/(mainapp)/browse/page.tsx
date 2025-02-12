"use client";
import { getShaders } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";

const BrowsePage = () => {
  const {
    data: shaders,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["shaders"],
    queryFn: () => getShaders(0, 10),
  });
  const router = useRouter();

  // TODO: pagination, css
  return (
    <div>
      <div className="p-4 ">
        {isPending && <Spinner />}
        {isError && <p>Error loading shaders.</p>}
        {shaders &&
          shaders.map((shader) => (
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/view/${shader.shader.id}`)}
              key={shader.shader.id}
            >
              <h2>{shader.shader.title}</h2>
            </div>
          ))}
      </div>
    </div>
  );
};

export default BrowsePage;
