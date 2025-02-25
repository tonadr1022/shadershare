"use client";
import { getShadersWithUsernames } from "@/api/shader-api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import React, { useCallback } from "react";
import { Spinner } from "./ui/spinner";
import ShaderPreviewCards from "./ShaderPreviewCards";
import PaginationButtons from "./PaginationButtons";
import AddTestShaders from "@/app/(mainapp)/view/components/editor/AddTestShaders";
import { useRouter } from "next/navigation";

type Props = {
  show: { usernames: boolean };
  urlPath: string;
};

const perPages = [10, 25, 50];

const getUrl = (page: number, perPage: number) => {
  return `/browse?page=${page}&perpage=${perPage}`;
};
const ShaderBrowser = ({ show = { usernames: false }, urlPath }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perpage") || "25");
  if (!perPages.includes(perPage)) {
    router.replace(getUrl(0, perPages[0]));
  }

  const {
    data: data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["shaders", { isUserShaders: false }, page],
    queryFn: () =>
      getShadersWithUsernames(false, (page - 1) * perPage, perPage),
  });

  const onPageButtonClick = useCallback(
    (page: number) => {
      router.push(`${urlPath}?page=${page}`);
    },
    [router, urlPath],
  );

  return (
    <div className="p-4 flex flex-col w-full gap-4">
      {isPending ? (
        <Spinner />
      ) : isError || !data ? (
        <p>Error loading shaders.</p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <p>Results: ({data.total}):</p>
            <PaginationButtons
              onPerPageChange={(newPage: number, newPerPage: number) => {
                router.push(getUrl(newPage, newPerPage));
              }}
              perPage={perPage}
              onPageChange={onPageButtonClick}
              page={page}
              totalDataLength={data.total}
            />
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="self-center">
              <AddTestShaders />
            </div>
          )}
          <ShaderPreviewCards show={show} data={data.shaders} />
          <div className="flex items-center gap-2">
            <p>Results: ({data.total}):</p>
            <PaginationButtons
              onPerPageChange={(newPage: number, newPerPage: number) => {
                router.push(getUrl(newPage, newPerPage));
              }}
              perPage={perPage}
              onPageChange={onPageButtonClick}
              page={page}
              totalDataLength={data.total}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ShaderBrowser;
