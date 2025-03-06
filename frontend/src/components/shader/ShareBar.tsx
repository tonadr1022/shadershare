import React, { useCallback, useState } from "react";
import { Code, GitFork, ListPlus } from "lucide-react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addShadersToPlaylist, getPlaylists } from "@/api/shader-api";
import { getPreviewImgFile2 } from "@/app/(mainapp)/view/components/renderer/Renderer";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import NewPlaylistDialog from "./NewPlaylistDialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import EmbedShaderText from "@/app/(mainapp)/view/components/renderer/EmbedShaderText";
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
  const [addPlaylistDialogOpen, setAddPlaylistDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const queryClient = useQueryClient();
  const addToPlaylistMut = useMutation({
    mutationFn: addShadersToPlaylist,
    onSuccess: (_res, vars) => {
      toast.success(`Added ${shaderData?.title} to playlist`);
      queryClient.invalidateQueries({
        queryKey: ["playlist", vars.playlistID],
      });
    },
  });

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="secondary">
            <Code />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-4">
          <h6>Embed Shader</h6>
          <EmbedShaderText
            link={`https://www.shader-share.com/embed/shader/${shaderData?.id}`}
          />
        </PopoverContent>
      </Popover>
      {userID ? (
        <Button size="icon" variant="secondary" onClick={handleFork}>
          <GitFork />
        </Button>
      ) : (
        <></>
      )}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger className="transition-none" asChild>
          <Button size="icon" variant="secondary">
            <ListPlus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="transition-none mr-4 ">
          {userPlaylists ? (
            userPlaylists.map((playlist) => (
              <DropdownMenuItem
                onClick={() => {
                  if (shaderData?.id) {
                    addToPlaylistMut.mutate({
                      playlistID: playlist.id,
                      shaderIDs: [shaderData.id],
                    });
                  }
                }}
                key={playlist.id}
                className="cursor-pointer"
              >
                {playlist.title}
              </DropdownMenuItem>
            ))
          ) : playlistsPending ? (
            <Spinner />
          ) : (
            <p>error.</p>
          )}

          <DropdownMenuItem
            onSelect={() => {
              setAddPlaylistDialogOpen(true);
            }}
            asChild
          >
            <Button className="w-full" variant="ghost">
              New Playlist
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewPlaylistDialog
        open={addPlaylistDialogOpen}
        onOpenChange={() => {
          setDropdownOpen(true);
          setAddPlaylistDialogOpen(false);
        }}
      />
    </div>
  );
};

export default ShareBar;
