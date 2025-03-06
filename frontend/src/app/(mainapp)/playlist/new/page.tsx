import React from "react";
import EditPlaylist from "../_components/EditPlaylist";
import { initialPlaylistData } from "@/types/shader";

const NewPlaylistPage = () => {
  return (
    <div className="flex flex-col min-h-[50vh] h-full w-full items-center justify-center px-4">
      <EditPlaylist initialData={initialPlaylistData} />
    </div>
  );
};

export default NewPlaylistPage;
