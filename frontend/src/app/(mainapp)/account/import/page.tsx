import ImportFromShadertoy from "@/components/ImportFromShadertoy";
import React from "react";

const ExternalLink = ({
  children,
  href,
  blank = true,
}: {
  href: string;
  children: React.ReactNode;
  blank?: boolean;
}) => {
  return (
    <a
      className="hover:underline text-blue-500"
      target={blank ? "_blank" : "_self"}
      href={href}
    >
      {children}
    </a>
  );
};

const ImportExportPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <h2>Shadertoy Import</h2>
      <p>
        This app is heavily inspired by{" "}
        <ExternalLink href="https://www.shadertoy.com">Shadertoy</ExternalLink>,
        and to gain access to a vast library of shaders to test against during
        development, I intentionally used the same shader parameters and
        multi-pass architecture, where render passes can access iChannels. Thus,
        Shadertoy imports are possible.
      </p>
      <p>
        To import shaders from Shadertoy, go to your{" "}
        <ExternalLink href="https://www.shadertoy.com/profile/?show=shaders">
          profile
        </ExternalLink>{" "}
        and export either individual shaders or all shaders to JSON.
      </p>
      <div className="w-fit">
        <ImportFromShadertoy />
      </div>
    </div>
  );
};

export default ImportExportPage;
