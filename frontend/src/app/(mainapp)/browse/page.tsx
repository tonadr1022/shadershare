"use client";
import { getShadersWithUsernames } from "@/api/shader-api";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import AddTestShaders from "../view/components/editor/AddTestShaders";
import { Button } from "@/components/ui/button";

const BrowsePage = () => {
  // get page from url
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const {
    data: data,
    isPending,
    isError,
  } = useQuery({
    // TODO: pagination
    queryKey: ["shaders", { page }],
    queryFn: () => getShadersWithUsernames((page - 1) * 10, 10),
  });
  const router = useRouter();
  const pageNumbers = [];
  if (data) {
    for (let i = 0; i < data?.total / 10 || 0; i++) {
      pageNumbers.push(i + 1);
    }
  }

  // TODO: only show page buttons close to current page
  console.log(data);
  // TODO: pagination, css
  return (
    <div>
      <div className="p-4 flex flex-col items-center gap-4">
        {isPending && <Spinner />}
        {isError && <p>Error loading shaders.</p>}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 justify-center gap-4">
            {data.shaders.map((shader, idx) => (
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => router.push(`/view/${shader.shader.id}`)}
                key={shader.shader.id}
              >
                <Image
                  alt="preview"
                  src={`${shader.shader.preview_img_url}`}
                  width={320}
                  height={180}
                  className="w-full h-auto rounded-md"
                />
                <div className="flex flex-row justify-between">
                  <p className="font-bold">{shader.shader.title}</p>
                  <p className="text-sm">{data.usernames[idx]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-row gap-2">
          <Button
            variant="default"
            disabled={page === 1}
            onClick={() => router.push(`/browse?page=${page - 1}`)}
          >
            Prev
          </Button>
          {pageNumbers.map((num) => (
            <Button
              key={num}
              variant="default"
              disabled={num === page}
              onClick={() => router.push(`/browse?page=${num}`)}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="default"
            disabled={page === pageNumbers.length}
            onClick={() => router.push(`/browse?page=${page + 1}`)}
          >
            Next
          </Button>
        </div>
        <h4>{data ? data.total : 0} shaders</h4>
        <AddTestShaders />
      </div>
    </div>
  );
};

export default BrowsePage;
