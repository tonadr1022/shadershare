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

  const pageNumbers = generatePagination(
    page,
    Math.ceil((data?.total || 0) / 10),
  );
  const router = useRouter();
  const onPageButtonClick = useCallback(
    (page: number) => {
      console.log(`${urlPath}?page=${page}`);
      router.push(`${urlPath}?page=${page}`);
    },
    [router, urlPath],
  );

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      {isPending && <Spinner />}
      {isError && <p>Error loading shaders.</p>}
      {data && <ShaderPreviewCards show={show} data={data} />}
      <PaginationButtons
        onClick={onPageButtonClick}
        pageNumbers={pageNumbers}
        page={page}
        totalDataLength={data?.total || 0}
      />
      <h4>{data ? data.total : 0} shaders</h4>
      <AddTestShaders />
    </div>
  );
};

export default ShaderBrowser;
