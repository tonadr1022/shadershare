import { getPlaylists } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

type Props = {
  userID: string;
  isUser: boolean;
};
const ListPlaylists = ({ userID }: Props) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["playlists", userID],
    queryFn: () => getPlaylists(userID),
  });

  return (
    <div>
      {isPending ? (
        <Spinner />
      ) : isError || !data ? (
        <p>Error loading playlists.</p>
      ) : (
        data.map((playlist) => (
          <div key={playlist.id}>
            <div className="flex gap-4">
              <Link href={`/playlist/${playlist.id}`}>
                <p>{playlist.title}</p>
              </Link>
              <p>{new Date(playlist.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListPlaylists;
