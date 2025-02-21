"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import React, { useCallback, useEffect } from "react";

type Props = {
  link: string;
};
const EmbedShaderText = ({ link }: Props) => {
  const [canCopy, setCanCopy] = React.useState(false);
  useEffect(() => {
    if (typeof navigator.clipboard !== "undefined") {
      navigator.permissions
        .query({ name: "clipboard-write" as PermissionName })
        .then((permissionStatus) => {
          setCanCopy(permissionStatus.state === "granted");
        })
        .catch((error) => {
          console.error("Clipboard permission check failed", error);
          setCanCopy(false);
        });
    }
  }, []);

  const [embedCode, setEmbedCode] = React.useState(`<iframe
  title="Shadershare Player"
  allowfullscreen
  allow="clipboard-write; web-share"
  width="640"
  height="360"
  style="border: none"
  src="${link}"
/>`);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(embedCode);
  }, [embedCode]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEmbedCode(e.target.value);
    },
    [],
  );
  return (
    <div className="relative">
      <Textarea
        onChange={handleChange}
        rows={9}
        className="max-w-xs"
        value={embedCode}
      />
      {canCopy && (
        <Button
          variant="ghost"
          className="absolute right-0 top-0"
          onClick={handleCopy}
        >
          <Copy />
        </Button>
      )}
    </div>
  );
};

export default EmbedShaderText;
