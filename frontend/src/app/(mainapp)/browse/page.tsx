"use client";

import ShaderBrowser from "@/components/ShaderBrowser";
import { Suspense } from "react";

const BrowsePage = () => {
  return (
    <Suspense>
      <div className="p-4">
        <ShaderBrowser urlPath="/browse" show={{ usernames: true }} />
      </div>
    </Suspense>
  );
};

export default BrowsePage;
