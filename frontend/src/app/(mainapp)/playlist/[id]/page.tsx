import React from "react";
import PlaylistPage from "./_components/PlaylistPage";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <PlaylistPage />;
}
