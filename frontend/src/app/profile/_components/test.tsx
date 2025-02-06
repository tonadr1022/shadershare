"use client";
import { useGetMe } from "@/hooks/hooks";
import React from "react";

const Test = () => {
  const { data, isPending, isError } = useGetMe();
  return (
    <div>
      <div>{isPending ? "loading" : isError ? "error" : data?.email}</div>
    </div>
  );
};

export default Test;
