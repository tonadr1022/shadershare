"use client";
import { getShadersWithUsernames, getUserShaders } from "@/api/shader-api";
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
  userID?: string;
};

const ShaderBrowser = ({
  show = { usernames: false },
  urlPath,
  userID,
}: Props) => {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 10;

  const {
    data: data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["shaders", { isUserShaders: userID !== undefined }, page],
    queryFn: () =>
      userID !== undefined
        ? getUserShaders(userID, (page - 1) * perPage, perPage)
        : getShadersWithUsernames(false, (page - 1) * perPage, perPage),
  });

  const router = useRouter();
  const onPageButtonClick = useCallback(
    (page: number) => {
      router.push(`${urlPath}?page=${page}`);
    },
    [router, urlPath],
  );

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      {isPending ? <Spinner /> : isError ? <p>Error loading shaders.</p> : null}
      <div className="flex items-center gap-2">
        <p>Results: ({data ? data.total : 0}):</p>
        <PaginationButtons
          perPage={perPage}
          onClick={onPageButtonClick}
          page={page}
          totalDataLength={data?.total || 0}
        />
      </div>
      {process.env.NODE_ENV === "development" && <AddTestShaders />}
      {data && <ShaderPreviewCards show={show} data={data} />}
    </div>
  );
};

export default ShaderBrowser;
