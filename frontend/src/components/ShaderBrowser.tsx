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
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

type Props = {
  show: { usernames: boolean };
  urlPath: string;
};

const perPages = [12, 25, 50];

const ShaderBrowser = ({ show = { usernames: false } }: Props) => {
  const getUrl = (page: number, perPage: number, autoPlay: string) => {
    return `/browse?page=${page}&perpage=${perPage}&autoplay=${autoPlay}`;
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const autoPlay = searchParams.get("autoplay") || "true";
  const perPage = parseInt(searchParams.get("perpage") || "12");
  if (!perPages.includes(perPage)) {
    router.replace(getUrl(1, perPages[0], autoPlay));
  }
  if (autoPlay === "true" && perPage !== 12) {
    router.push(getUrl(1, 12, autoPlay));
  }

  const {
    data: data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["shaders", { isUserShaders: false }, autoPlay, page, perPage],
    queryFn: () =>
      getShadersWithUsernames(
        autoPlay === "true",
        (page - 1) * perPage,
        perPage,
      ),
  });

  const onPageButtonClick = useCallback(
    (page: number) => {
      router.push(getUrl(page, perPage, autoPlay));
    },
    [autoPlay, perPage, router],
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
              showPageSizeSelect={autoPlay !== "true"}
              onPerPageChange={(newPage: number, newPerPage: number) => {
                router.replace(getUrl(newPage, newPerPage, autoPlay));
              }}
              pageSizes={[12, 25, 50]}
              perPage={perPage}
              onPageChange={onPageButtonClick}
              page={page}
              totalDataLength={data.total}
            />
            <div className="flex items-center gap-2 cursor-pointer">
              <Label htmlFor="autoplay-checkbox">Autoplay</Label>
              <Checkbox
                id="autoplay-checkbox"
                checked={autoPlay === "true"}
                onCheckedChange={(checked) => {
                  let c = false;
                  if (checked.valueOf()) {
                    c = true;
                  }
                  router.replace(
                    getUrl(page, c ? 12 : perPage, c ? "true" : "false"),
                  );
                }}
              />
            </div>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="self-center">
              <AddTestShaders />
            </div>
          )}
          <ShaderPreviewCards
            autoPlay={autoPlay === "true"}
            show={show}
            data={data.shaders}
          />
          <div className="flex items-center gap-2">
            <p>Results: ({data.total}):</p>
            <PaginationButtons
              onPerPageChange={(newPage: number, newPerPage: number) => {
                router.push(getUrl(newPage, newPerPage, autoPlay));
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
