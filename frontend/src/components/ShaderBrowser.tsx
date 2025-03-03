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
import { useLocalSettings } from "@/context/LocalSettingsContext";

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
    (page: number, perPage: number, query: string | null) => {
      let res = `${urlPath}?page=${page}&perpage=${perPage}`;
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
  const { localSettings, setLocalSettings } = useLocalSettings();
  const autoPlay = localSettings.general.autoplayShaders;
  const perPage = parseInt(searchParams.get("perpage") || "12");
  const query = searchParams.get("query");
  if (!shaderPerPages.includes(perPage)) {
    router.replace(getUrl(1, shaderPerPages[0], query));
  }
  if (autoPlay && perPage !== 12) {
    router.push(getUrl(1, 12, query));
  }

  const { data: data, isError } = useQuery({
    queryKey: ["shaders", userID, autoPlay, page, perPage, query],
    queryFn: () =>
      getShadersWithUsernamesImpl(
        autoPlay,
        userID,
        (page - 1) * perPage,
        perPage,
        query,
      ),
  });

  const onPageButtonClick = useCallback(
    (page: number) => {
      router.push(getUrl(page, perPage, query));
    },
    [getUrl, perPage, query, router],
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
              showPageSizeSelect={!autoPlay}
              onPerPageChange={(newPage: number, newPerPage: number) => {
                router.replace(getUrl(newPage, newPerPage, query));
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
                checked={autoPlay}
                onCheckedChange={(checked) => {
                  let autoplay = false;
                  if (checked.valueOf()) {
                    autoplay = true;
                  }
                  setLocalSettings({
                    ...localSettings,
                    general: {
                      ...localSettings.general,
                      autoplayShaders: autoplay,
                    },
                  });
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
            autoPlay={autoPlay}
            show={show}
            data={data?.shaders}
          />
          {data ? (
            <div className="flex items-center gap-2">
              <p>Results: ({data?.total || 0}):</p>
              <PaginationButtons
                onPerPageChange={(newPage: number, newPerPage: number) => {
                  router.push(getUrl(newPage, newPerPage, query));
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
