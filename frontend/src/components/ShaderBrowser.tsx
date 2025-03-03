"use client";
import { getShadersWithUsernamesImpl, shaderPerPages } from "@/api/shader-api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import React, { useCallback } from "react";
import ShaderPreviewCards from "./ShaderPreviewCards";
import PaginationButtons from "./PaginationButtons";
import AddTestShaders from "@/app/(mainapp)/view/components/editor/AddTestShaders";
import { useRouter } from "next/navigation";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

type Props = {
  show: { usernames: boolean };
  urlPath: string;
  userID?: string;
  hideTestShaders?: boolean;
};

const ShaderBrowser = ({
  userID,
  urlPath,
  hideTestShaders,
  show = { usernames: false },
}: Props) => {
  const getUrl = useCallback(
    (page: number, perPage: number, autoPlay: string, query: string | null) => {
      let res = `${urlPath}?page=${page}&perpage=${perPage}&autoplay=${autoPlay}`;
      if (query) {
        res += `&query=${query}`;
      }
      return res;
    },
    [urlPath],
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const autoPlay = searchParams.get("autoplay") || "true";
  const perPage = parseInt(searchParams.get("perpage") || "12");
  const query = searchParams.get("query");
  if (!shaderPerPages.includes(perPage)) {
    router.replace(getUrl(1, shaderPerPages[0], autoPlay, query));
  }
  if (autoPlay === "true" && perPage !== 12) {
    router.push(getUrl(1, 12, autoPlay, query));
  }

  const { data: data, isError } = useQuery({
    queryKey: ["shaders", userID, autoPlay, page, perPage, query],
    queryFn: () =>
      getShadersWithUsernamesImpl(
        autoPlay === "true",
        userID,
        (page - 1) * perPage,
        perPage,
        query,
      ),
  });

  const onPageButtonClick = useCallback(
    (page: number) => {
      router.push(getUrl(page, perPage, autoPlay, query));
    },
    [autoPlay, getUrl, perPage, query, router],
  );

  return (
    <div className="flex flex-col w-full gap-4">
      {isError ? (
        <p>Error loading shaders.</p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <p>Results: ({data?.total || 0}):</p>
            <PaginationButtons
              showPageSizeSelect={autoPlay !== "true"}
              onPerPageChange={(newPage: number, newPerPage: number) => {
                router.replace(getUrl(newPage, newPerPage, autoPlay, query));
              }}
              pageSizes={[12, 25, 50]}
              perPage={perPage}
              onPageChange={onPageButtonClick}
              page={page}
              totalDataLength={data?.total || 1}
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
                    getUrl(page, c ? 12 : perPage, c ? "true" : "false", query),
                  );
                }}
              />
            </div>
          </div>
          {!hideTestShaders && process.env.NODE_ENV === "development" && (
            <div className="self-center">
              <AddTestShaders />
            </div>
          )}
          <ShaderPreviewCards
            autoPlay={autoPlay === "true"}
            show={show}
            data={data?.shaders}
          />
          {data ? (
            <div className="flex items-center gap-2">
              <p>Results: ({data?.total || 0}):</p>
              <PaginationButtons
                onPerPageChange={(newPage: number, newPerPage: number) => {
                  router.push(getUrl(newPage, newPerPage, autoPlay, query));
                }}
                perPage={perPage}
                onPageChange={onPageButtonClick}
                page={page}
                totalDataLength={data?.total || 0}
              />
            </div>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};

export default ShaderBrowser;
