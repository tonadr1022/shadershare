"use client";
import { Spinner } from "@/components/ui/spinner";
import { useGetMeRedirect } from "@/hooks/hooks";
import React from "react";
import ListPlaylists from "./_components/ListPlaylists";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const UserPlaylistPage = () => {
  const { data: user, isPending, isError } = useGetMeRedirect();
  if (isPending) return <Spinner />;
  if (isError || !user) return <p>Error loading profile.</p>;
  return (
    <div>
      <Button asChild>
        <Link href="/playlist/new">New Playlist</Link>
      </Button>
      <ListPlaylists userID={user.id} isUser={false} />
    </div>
  );
};

export default UserPlaylistPage;
