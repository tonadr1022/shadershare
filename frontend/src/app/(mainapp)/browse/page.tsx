"use client";

import ShaderBrowser from "@/components/ShaderBrowser";
import { Suspense } from "react";

const BrowsePage = () => {
  return (
    <Suspense>
      <ShaderBrowser urlPath="/browse" show={{ usernames: true }} />
    </Suspense>
  );
};

export default BrowsePage;
