"use client";
import { Button } from "@/components/ui/button";
import { ShaderDataWithUser } from "@/types/shader";
import Link from "next/link";
import React from "react";
import ShareBar from "@/components/shader/ShareBar";

type Props = {
  shaderData: ShaderDataWithUser;
  userID?: string;
};
const ShaderMetadata = ({ shaderData, userID }: Props) => {
  return (
    <div id="shader-metadata" className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h6>{shaderData.title}</h6>
        {userID ? <ShareBar shaderData={shaderData} userID={userID} /> : <></>}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            {shaderData.tags.length ? (
              <p className="flex gap-2 items-center text-xs font-semibold">
                Tags:
                {shaderData.tags.map((tag, i) => (
                  <Button
                    asChild
                    variant="link"
                    className="font-semibold tracking-tight m-0 p-0 text-xs h-fit"
                    key={i}
                  >
                    <Link href={`/browse/shaders?query=tag=${tag}`}>{tag}</Link>
                  </Button>
                ))}
              </p>
            ) : (
              <></>
            )}
          </div>

          {shaderData.username ? (
            <h6 className="text-xs">
              by &nbsp;
              <Button
                asChild
                variant="link"
                className="p-0 m-0 font-semibold text-xs h-fit"
              >
                <Link href={`/user/${shaderData.user_id}`}>
                  {shaderData.username}
                </Link>
              </Button>
            </h6>
          ) : (
            <></>
          )}
        </div>
        {shaderData.parent_id && shaderData.parent_title ? (
          <p className="text-xs font-semibold">
            Forked From:{" "}
            <Button
              asChild
              variant="link"
              className="p-0 m-0 font-semibold text-xs h-fit"
            >
              <Link href={`/view/${shaderData.parent_id}`}>
                {shaderData.parent_title}
              </Link>
            </Button>
          </p>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {shaderData.description.split("\n").map((text, i) => (
          <p key={i} className="text-sm">
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ShaderMetadata;
