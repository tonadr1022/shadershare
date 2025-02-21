"use client";
import { getShadersWithUsernames } from "@/api/shader-api";
import { generatePagination } from "@/lib/utils";
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
const ShaderBrowser = ({ show = { usernames: false }, urlPath }: Props) => {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const {
    data: data,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["shaders", { page }],
    queryFn: () => getShadersWithUsernames((page - 1) * 10, 10),
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
          onClick={onPageButtonClick}
          pageNumbers={generatePagination(
            page,
            Math.ceil((data?.total || 0) / 10),
          )}
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
