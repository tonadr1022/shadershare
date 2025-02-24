import ImportFromShadertoy from "@/components/ImportFromShadertoy";
import React from "react";

const ImportExportPage = () => {
  return (
    <div className="flex flex-col">
      <h3>Shadertoy Import</h3>
      <p>
        To import shaders from Shadertoy, go to your{" "}
        <a
          target="_blank"
          className="hover:underline text-blue-500"
          href="https://www.shadertoy.com/profile/?show=shaders"
        >
          profile
        </a>{" "}
        and export either individual shaders or all shaders to JSON.
      </p>
      <ImportFromShadertoy />
    </div>
  );
};

export default ImportExportPage;
