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
  function generatePagination(currentPage, totalPages) {
    const pagination = [];

    pagination.push(1);

    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (end - start < 4) {
      if (start === 2) {
        end = Math.min(totalPages - 1, start + 4);
      } else if (end === totalPages - 1) {
        start = Math.max(2, end - 4);
      }
    }

    if (start > 2) {
      pagination.push(-1);
    }

    for (let i = start; i <= end; i++) {
      pagination.push(i);
    }

    if (end < totalPages - 1) {
      pagination.push(-2);
    }

    if (totalPages > 1) {
      pagination.push(totalPages);
    }

    return pagination;
  }

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
  const pageNumbers = generatePagination(
    page,
    Math.ceil((data?.total || 0) / 10),
  );
  // show prev always
  // show page 1 always
  // show at most 5 middle pages
  // show last page  always
  // show next always

  // const lastPage = Math.ceil(data?.total / 10) || 0;
  // if (data) {
  //   const firstPage = Math.max(1, page - 2);
  //   for (let i = firstPage; i < Math.min(lastPage - 1, page + 2); i++) {
  //     console.log(i);
  //     pageNumbers.push(i + 1);
  //   }
  // }

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
          {pageNumbers.map((num) => {
            if (num < 0) {
              return (
                <p key={num} className="text-center w-6">
                  {" "}
                  ...{" "}
                </p>
              );
            }
            return (
              <Button
                key={num}
                variant="default"
                disabled={num === page}
                onClick={() => router.push(`/browse?page=${num}`)}
              >
                {num}
              </Button>
            );
          })}
          <Button
            variant="default"
            disabled={page === Math.ceil((data?.total || 0) / 10)}
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
