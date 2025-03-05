"use client";
import { getPlaylist } from "@/api/shader-api";
import ShaderPreviewCards from "@/components/ShaderPreviewCards";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const playlistQuery = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => getPlaylist(id),
  });

  const isError = playlistQuery.isError;
  const playlist = playlistQuery.data;
  return (
    <div>
      {playlistQuery.isPending ? (
        <Spinner />
      ) : isError ? (
        <p>Error.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <h1>{playlist?.title}</h1>
          <p>{playlist?.description}</p>
          <ShaderPreviewCards
            show={{ usernames: false }}
            data={playlist?.shaders}
          />
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
