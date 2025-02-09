"use client";
import { useGetMe } from "@/hooks/hooks";
import Image from "next/image";
import React from "react";

const Test = () => {
  const { data, isPending, isError } = useGetMe();
  return (
    <div>
      <div>{isPending ? "loading" : isError ? "error" : data?.email}</div>
      {data?.avatar_url && (
        <div>
          <Image
            priority={true}
            src={data.avatar_url}
            width="100"
            height="100"
            alt="Avatar"
          />
        </div>
      )}
      {data?.username && <div>{data.username}</div>}
    </div>
  );
};

export default Test;
