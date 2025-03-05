import React from "react";
import EditPlaylist from "../_components/EditPlaylist";
import { AccessLevel, ShaderPlaylist } from "@/types/shader";

const initialPlaylistData: ShaderPlaylist = {
  id: "",
  title: "",
  description: "",
  user_id: "",
  tags: [],
  created_at: new Date(),
  updated_at: new Date(),
  username: "",
  access_level: AccessLevel.PRIVATE,
};

const NewPlaylistPage = () => {
  return <EditPlaylist initialData={initialPlaylistData} />;
};

export default NewPlaylistPage;
