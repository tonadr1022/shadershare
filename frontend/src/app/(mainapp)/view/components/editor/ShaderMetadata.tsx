"use client";

import { Button } from "@/components/ui/button";
import { ShaderDataWithUser } from "@/types/shader";
import Link from "next/link";
import React from "react";

type Props = {
  shaderData: ShaderDataWithUser;
};
const ShaderMetadata = ({ shaderData }: Props) => {
  return (
    <div id="shader-metadata">
      <div className="flex justify-between">
        <h4>{shaderData.title}</h4>
        {shaderData.username ? <h6>{shaderData.username}</h6> : <></>}
      </div>
      <p>{shaderData.description}</p>
      {shaderData.tags.length ? (
        <p className="flex gap-2">
          <span>Tags: </span>
          {shaderData.tags.map((tag, i) => (
            <Button
              asChild
              variant="link"
              className="font-semibold tracking-tight m-0 p-0"
              key={i}
            >
              <Link href={`/browse?query=tag=${tag}`}>{tag}</Link>
            </Button>
          ))}
        </p>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ShaderMetadata;
