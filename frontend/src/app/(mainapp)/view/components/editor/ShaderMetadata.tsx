"use client";

import { Button } from "@/components/ui/button";
import { ShaderDataWithUser } from "@/types/shader";
import Link from "next/link";
import React from "react";

type Props = {
  shaderData: ShaderDataWithUser;
};
const ShaderMetadata = ({ shaderData }: Props) => {
  console.log(shaderData);
  return (
    <div id="shader-metadata" className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h6>{shaderData.title}</h6>
        {shaderData.username ? (
          <h6 className="">
            by &nbsp;
            <Button asChild variant="link" className="p-0 m-0 font-semibold">
              <Link href={`/user/${shaderData.user_id}`}>
                {shaderData.username}
              </Link>
            </Button>
          </h6>
        ) : (
          <></>
        )}
      </div>
      <p className="text-sm">{shaderData.description}</p>

      {shaderData.tags.length ? (
        <p className="flex gap-2 items-center">
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
