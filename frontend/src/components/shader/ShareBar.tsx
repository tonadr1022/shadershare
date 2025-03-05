import React, { useCallback } from "react";
import { GitFork, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRendererCtx } from "@/context/RendererContext";
import { useCreateShader } from "@/hooks/hooks";
import {
  AccessLevel,
  ShaderDataWithUser,
  ShaderUpdateCreatePayload,
} from "@/types/shader";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getPlaylists } from "@/api/shader-api";
import { getPreviewImgFile2 } from "@/app/(mainapp)/view/components/renderer/Renderer";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
type Props = {
  shaderData?: ShaderDataWithUser;
  userID?: string;
};
const ShareBar = ({ userID, shaderData }: Props) => {
  const { data: userPlaylists, isPending: playlistsPending } = useQuery({
    queryKey: ["playlists", userID],
    queryFn: () => (!userID ? [] : getPlaylists(userID)),
    enabled: !!userID,
  });

  const createShaderMut = useCreateShader();
  const { renderer } = useRendererCtx();
  const handleFork = useCallback(async () => {
    if (renderer === null || !userID || !shaderData) {
      return;
    }

    const baseTitle = !shaderData.parent_id
      ? shaderData.title
      : shaderData.title?.trim().replace(/^Fork (.+?) \d+$/, "$1") || "";
    const title = `Fork ${baseTitle} ${Math.floor(Math.random() * 1000)}`;

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
    <div className="flex gap-2">
      {userID ? (
        <Button size="icon" variant="secondary" onClick={handleFork}>
          <GitFork />
        </Button>
      ) : (
        <></>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger className="transition-none" asChild>
          <Button size="icon" variant="secondary" onClick={handleFork}>
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="transition-none mr-4 ">
          {userPlaylists ? (
            userPlaylists.map((playlist) => (
              <DropdownMenuItem key={playlist.id} className="cursor-pointer">
                {playlist.title}
              </DropdownMenuItem>
            ))
          ) : playlistsPending ? (
            <Spinner />
          ) : (
            <p>error.</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShareBar;
