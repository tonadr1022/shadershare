"use client";

import { ShaderDataWithUsernameResponse } from "@/types/shader";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  data: ShaderDataWithUsernameResponse;
  show?: { usernames: boolean };
};

const ShaderPreviewCards = ({ data, show }: Props) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 justify-center gap-4">
      {data.shaders.map((shader, idx) => (
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
            {(!show || show.usernames) && (
              <p className="text-sm">{data.usernames[idx]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShaderPreviewCards;
