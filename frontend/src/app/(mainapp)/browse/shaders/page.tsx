"use client";

import ShaderBrowser from "@/components/ShaderBrowser";
import LocalSettingsProvider from "@/context/LocalSettingsContext";
import { Suspense } from "react";

const BrowsePage = () => {
  return (
    <Suspense>
      <div className="p-4">
        <LocalSettingsProvider>
          <ShaderBrowser urlPath="/browse/shaders" show={{ usernames: true }} />
        </LocalSettingsProvider>
      </div>
    </Suspense>
  );
};

export default BrowsePage;
