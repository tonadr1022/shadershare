"use client";
import { Spinner } from "@/components/ui/spinner";
import { useGetMeRedirect } from "@/hooks/hooks";
import React from "react";
import ListPlaylists from "./_components/ListPlaylists";
import NewPlaylistDialog from "@/components/shader/NewPlaylistDialog";
import { Button } from "@/components/ui/button";

const UserPlaylistPage = () => {
  const { data: user, isPending, isError } = useGetMeRedirect();
  if (isPending) return <Spinner />;
  if (isError || !user) return <p>Error loading profile.</p>;
  return (
    <div className="flex flex-col gap-4">
      <NewPlaylistDialog>
        <Button variant="default" className="w-fit">
          New Playlist
        </Button>
      </NewPlaylistDialog>
      <ListPlaylists userID={user.id} isUser={false} />
    </div>
  );
};

export default UserPlaylistPage;
