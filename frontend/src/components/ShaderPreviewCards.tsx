"use client";

import { ShaderDataWithUser, ShaderWithUser } from "@/types/shader";
import React from "react";
import { useRouter } from "next/navigation";
import ShaderPreviewCard, {
  ShaderPreviewCardSkeleton,
} from "./ShaderPreviewCard";

type Props = {
  data?: (ShaderDataWithUser | ShaderWithUser)[];
  show?: { usernames: boolean };
  autoPlay?: boolean;
};

const ShaderPreviewCards = ({ data, autoPlay, show }: Props) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 justify-center gap-4">
      {data
        ? data.map((shader) => (
            <ShaderPreviewCard
              autoPlay={autoPlay}
              show={show}
              key={shader.id}
              onClick={() => router.push(`/view/${shader.id}`)}
              shader={shader}
            />
          ))
        : [...Array(12)].map((_n, i) => <ShaderPreviewCardSkeleton key={i} />)}
    </div>
  );
};

export default ShaderPreviewCards;
