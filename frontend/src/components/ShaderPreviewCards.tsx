"use client";

import { ShaderListResp } from "@/types/shader";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  data: ShaderListResp;
  show?: { usernames: boolean };
};

const ShaderPreviewCards = ({ data, show }: Props) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 justify-center gap-4">
      {data.shaders.map((shader) => (
        <div
          className="w-full h-full cursor-pointer"
          onClick={() => router.push(`/view/${shader.id}`)}
          key={shader.id}
        >
          <Image
            alt="preview"
            src={`${shader.preview_img_url}`}
            width={320}
            height={180}
            className="w-full h-auto rounded-md"
          />
          <div className="flex flex-row justify-between">
            <p className="font-bold">{shader.title}</p>
            {(!show || show.usernames) && (
              <p className="text-sm">{shader.username || "no username"}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShaderPreviewCards;
