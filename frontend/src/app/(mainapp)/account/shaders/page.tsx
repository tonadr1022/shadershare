"use client";
import { getUserShaders } from "@/api/shader-api";
import { useQuery } from "@tanstack/react-query";
import React, { Suspense, useCallback } from "react";
import ShaderTable from "../_components/ShaderTable";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assembleParams, useGetMe, useSortParams } from "@/hooks/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PaginationButtons from "@/components/PaginationButtons";

const perPages = [10, 25, 50];

const getUrl = (
  page: number,
  perPage: number,
  view: string,
  sort: string | null,
  desc: boolean,
) => {
  return `/account/shaders?view=${view}&${assembleParams(page, perPage, sort, desc)}`;
};

const ProfileShaders = () => {
  const { page, perPage, desc, sort } = useSortParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "table";
  if (!perPages.includes(perPage)) {
    router.replace(getUrl(0, perPages[0], view, sort, desc));
  }

  const { data, isPending, isError } = useQuery({
    queryKey: ["shaders", { isUserShaders: true }, page, perPage, sort, desc],
    queryFn: () =>
      getUserShaders((page - 1) * perPage, perPage, false, sort, desc),
  });

  const onPageButtonClick = useCallback(
    (page: number) => {
      router.push(getUrl(page, perPage, view, sort, desc));
    },
    [desc, perPage, router, sort, view],
  );
  const onValueChangeClick = useCallback(
    (val: string) => router.push(getUrl(page, perPage, val, sort, desc)),
    [desc, page, perPage, router, sort],
  );

  return (
    <div className="w-full flex flex-col gap-6">
      <h2>Shaders</h2>
      <Tabs value={view} onValueChange={onValueChangeClick}>
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="card">Card</TabsTrigger>
        </TabsList>
        {isPending ? (
          <div className="flex items-center justify-center w-full h-full">
            <Spinner className="self-center" />
          </div>
        ) : isError || !data ? (
          <div className="flex items-center justify-center w-full h-full">
            <p>Error loading shaders.</p>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <p>Results: ({data.total}):</p>
              <PaginationButtons
                onPerPageChange={(newPage: number, newPerPage: number) => {
                  router.push(getUrl(newPage, newPerPage, view, sort, desc));
                }}
                onPageChange={onPageButtonClick}
                perPage={perPage}
                page={page}
                totalDataLength={data.total}
              />
            </div>
            <TabsContent value="table">
              <div className="rounded-md border">
                <ShaderTable data={data.shaders} />
              </div>
            </TabsContent>
            <TabsContent value="card">
              <div className=" w-full grid grid-cols-1 md:grid-cols-4 justify-center gap-4">
                {data.shaders.map((shader) => (
                  <div
                    className="w-full h-full cursor-pointer"
                    onClick={() => router.push(`/view/${shader.id}`)}
                    key={shader.id}
                  >
                    <Image
                      alt="preview"
                      src={`${shader.preview_img_url}`}
                      width={320}
                      height={180}
                      className="w-full h-auto rounded-md"
                    />
                    <div className="flex flex-row justify-between">
                      <p className="text-xs">{shader.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  );
};
const ProfileShadersPage = () => {
  const router = useRouter();
  const { data: user, isPending: userPending, isError: userError } = useGetMe();
  if (userError) {
    router.push("/login");
    return <Spinner />;
  }
  if (userPending || !user) return <Spinner />;
  return (
    <Suspense>
      <ProfileShaders />
    </Suspense>
  );
};

export default ProfileShadersPage;
