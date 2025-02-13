"use client";
import { getShadersWithUsernames } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const BrowsePage = () => {
  const {
    data: data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["shaders"],
    queryFn: () => getShadersWithUsernames(0, 10),
  });
  const router = useRouter();

  // TODO: pagination, css
  return (
    <div>
      <div className="p-4 ">
        {isPending && <Spinner />}
        {isError && <p>Error loading shaders.</p>}

        <div className="grid grid-cols-1 md:grid-cols-4 justify-center gap-4">
          {data &&
            data.shaders.map((shader, idx) => (
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => router.push(`/view/${shader.shader.id}`)}
                key={shader.shader.id}
              >
                <Image
                  alt="preview"
                  src={`${shader.shader.preview_img_url}`}
                  width={320}
                  height={180}
                  className="w-full h-auto rounded-md"
                />
                <div className="flex flex-row justify-between">
                  <p className="font-bold">{shader.shader.title}</p>
                  <p className="text-sm">{data.usernames[idx]}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
