"use client";
import {
  isShaderData,
  ShaderData,
  ShaderDataWithUser,
  ShaderWithUser,
} from "@/types/shader";
import React, { MouseEventHandler } from "react";
import Image from "next/image";
import { RendererProvider } from "@/context/RendererContext";
import ShaderRenderer from "@/app/(mainapp)/view/components/renderer/ShaderRenderer";
import { Button } from "./ui/button";
import Link from "next/link";
import { AspectRatio } from "./ui/aspect-ratio";

export const ShaderPreviewCardSkeleton = () => {
  return (
    <div className="w-full h-full bg-secondary p-2 rounded-md">
      <AspectRatio ratio={16 / 9} className="w-full p-0 m-0 bg-background">
        <div className="w-full h-full  rounded-md animate-pulse"></div>
      </AspectRatio>
      <div className="flex flex-row justify-between mt-1">
        <div className="w-1/3 h-2 rounded-md animate-pulse"></div>
        <div className="w-1/4 h-2 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
};

const ShaderPreviewCard = ({
  shader,
  onClick,
  autoPlay,
  show,
}: {
  autoPlay?: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
  show?: { usernames: boolean };
  shader?: ShaderDataWithUser | ShaderWithUser | null;
}) => {
  return !shader ? (
    <ShaderPreviewCardSkeleton />
  ) : (
    <div className="w-full h-full ">
      <div className=" w-full cursor-pointer" onClick={onClick}>
        {autoPlay && isShaderData(shader) ? (
          <RendererProvider
            username={shader.username}
            initialShaderData={shader as ShaderData}
          >
            <div className=" w-full h-full  cursor-pointer">
              <ShaderRenderer
                keepAspectRatio={true}
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
      </div>
      <div className="flex flex-row justify-between items-center">
        <p className="font-semibold text-xs">{shader.title}</p>
        {(!show || show.usernames) && (
          <Button
            asChild
            size="sm"
            variant="link"
            className="p-0 m-0 font-semibold text-xs"
          >
            <Link href={`/user/${shader.user_id}`}>
              {shader.username || "no username"}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
export default ShaderPreviewCard;
