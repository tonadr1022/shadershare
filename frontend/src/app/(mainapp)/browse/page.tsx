"use client";

import ShaderBrowser from "@/components/ShaderBrowser";

const BrowsePage = () => {
  return <ShaderBrowser urlPath="/browse" show={{ usernames: true }} />;
};

export default BrowsePage;
