"use client";

import { Button } from "@/components/ui/button";
import { useRendererCtx } from "@/context/RendererContext";
import { useCreateShader } from "@/hooks/hooks";
import {
  AccessLevel,
  ShaderDataWithUser,
  ShaderUpdateCreatePayload,
} from "@/types/shader";
import { GitFork } from "lucide-react";
import Link from "next/link";
import React, { useCallback } from "react";
import { getPreviewImgFile2 } from "../renderer/Renderer";
import { toast } from "sonner";

type Props = {
  shaderData: ShaderDataWithUser;
  userID?: string;
};
const ShaderMetadata = ({ shaderData, userID }: Props) => {
  const createShaderMut = useCreateShader();
  const { renderer } = useRendererCtx();
  const handleFork = useCallback(async () => {
    if (renderer === null || !userID) {
      return;
    }
    let title = "";
    if (shaderData.forked_from) {
      const lastSpace = shaderData.title.trim().lastIndexOf(" ");
      title = shaderData.title.slice(lastSpace + 1);
    } else {
      title = `Fork ${shaderData.title} ${Math.floor(Math.random() * 1000)}`;
    }
    const shader: ShaderUpdateCreatePayload = {
      flags: shaderData.flags,
      description: shaderData.description,
      forked_from: shaderData.id,
      shader_outputs: shaderData.shader_outputs,
      tags: shaderData.tags,
      access_level: AccessLevel.PRIVATE,
      title,
      user_id: userID,
    };

    const previewFile = await getPreviewImgFile2(renderer);
    if (previewFile === null) {
      toast.error("Failed to generate preview image");
      return;
    }

    createShaderMut.mutate({ shader, previewFile });
  }, [createShaderMut, renderer, shaderData, userID]);
  return (
    <div id="shader-metadata" className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h6>{shaderData.title}</h6>
        {userID ? (
          <Button size="icon" variant="secondary" onClick={handleFork}>
            <GitFork />
          </Button>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            {shaderData.tags.length ? (
              <p className="flex gap-2 items-center text-xs font-semibold">
                Tags:
                {shaderData.tags.map((tag, i) => (
                  <Button
                    asChild
                    variant="link"
                    className="font-semibold tracking-tight m-0 p-0 text-xs h-fit"
                    key={i}
                  >
                    <Link href={`/browse?query=tag=${tag}`}>{tag}</Link>
                  </Button>
                ))}
              </p>
            ) : (
              <></>
            )}
          </div>

          {shaderData.username ? (
            <h6 className="text-xs">
              by &nbsp;
              <Button
                asChild
                variant="link"
                className="p-0 m-0 font-semibold text-xs h-fit"
              >
                <Link href={`/user/${shaderData.user_id}`}>
                  {shaderData.username}
                </Link>
              </Button>
            </h6>
          ) : (
            <></>
          )}
        </div>
        {shaderData.parent_id && shaderData.parent_title ? (
          <p className="text-xs font-semibold">
            Forked From:{" "}
            <Button
              asChild
              variant="link"
              className="p-0 m-0 font-semibold text-xs h-fit"
            >
              <Link href={`/view/${shaderData.parent_id}`}>
                {shaderData.parent_title}
              </Link>
            </Button>
          </p>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {shaderData.description.split("\n").map((text, i) => (
          <p key={i} className="text-sm">
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ShaderMetadata;
