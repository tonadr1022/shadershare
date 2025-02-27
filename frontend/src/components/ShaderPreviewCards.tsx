"use client";

import {
  isShaderData,
  ShaderData,
  ShaderDataWithUser,
  ShaderWithUser,
} from "@/types/shader";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RendererProvider } from "@/context/RendererContext";
import ShaderRenderer from "@/app/(mainapp)/view/components/renderer/ShaderRenderer";
import { AspectRatio } from "./ui/aspect-ratio";

type Props = {
  data?: (ShaderDataWithUser | ShaderWithUser)[];
  show?: { usernames: boolean };
  autoPlay?: boolean;
};

const ShaderPreviewCards = ({ data, autoPlay, show }: Props) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 justify-center gap-4">
      {data
        ? data.map((shader) => (
            <div
              className="w-full h-full cursor-pointer"
              onClick={() => router.push(`/view/${shader.id}`)}
              key={shader.id}
            >
              {autoPlay && isShaderData(shader) ? (
                <RendererProvider
                  username={shader.username}
                  initialShaderData={shader as ShaderData}
                >
                  <div className="cursor-pointer">
                    <ShaderRenderer
                      keepAspectRatio={false}
                      hoverOnlyPlay
                      hideControls={true}
                    />
                  </div>
                </RendererProvider>
              ) : (
                <Image
                  alt="preview"
                  src={`${shader.preview_img_url}`}
                  width={320}
                  height={180}
                  className="w-full h-auto rounded-md"
                />
              )}
              <div className="flex flex-row justify-between">
                <p className="font-semibold text-xs">{shader.title}</p>
                {(!show || show.usernames) && (
                  <p className="text-xs">{shader.username || "no username"}</p>
                )}
              </div>
            </div>
          ))
        : [...Array(12)].map((_n, i) => (
            <div className="w-full h-full bg-secondary p-2 rounded-md" key={i}>
              <AspectRatio
                ratio={16 / 9}
                className="w-full p-0 m-0 bg-background"
              >
                <div className="w-full h-full bg-secondary-foreground rounded-md animate-pulse"></div>
              </AspectRatio>
              <div className="flex flex-row justify-between mt-1">
                <div className="w-1/3 h-2 bg-secondary-foreground rounded-md animate-pulse"></div>
                <div className="w-1/4 h-2 bg-secondary-foreground rounded-md animate-pulse"></div>
              </div>
            </div>
          ))}
    </div>
  );
};

export default ShaderPreviewCards;
