import ExternalLink from "@/components/ExternalLink";
import ImportFromShadertoy from "@/components/ImportFromShadertoy";
import React from "react";

const ImportExportPage = () => {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h2>Shadertoy Import</h2>
      <div className="flex flex-col gap-2">
        <p>
          This app is heavily inspired by{" "}
          <ExternalLink href="https://www.shadertoy.com">
            Shadertoy
          </ExternalLink>
          , and to gain access to a vast library of shaders to test against
          during development, I intentionally used the same shader parameters
          and multi-pass architecture, where render passes can access iChannels.
          Thus, Shadertoy imports are possible.
        </p>
        <p>
          Shaders that use cubemaps, sound, VR, 3D-textures, video, keyboard,
          webcam, or microphone are not supported.
        </p>
        <p>
          To import shaders from Shadertoy, enter the ID of an API accessible
          shader, or go to your{" "}
          <ExternalLink href="https://www.shadertoy.com/profile/?show=shaders">
            profile
          </ExternalLink>{" "}
          and export either individual shaders or all shaders to JSON. Drop
          files below.
        </p>
      </div>
      <div className="w-fit">
        <ImportFromShadertoy />
      </div>
    </div>
  );
};

export default ImportExportPage;
