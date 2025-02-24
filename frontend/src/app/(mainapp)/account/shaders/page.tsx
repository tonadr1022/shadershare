"use client";
import { getUserShaders } from "@/api/shader-api";
import { useQuery } from "@tanstack/react-query";
import React, { Suspense, useCallback } from "react";
import ShaderTable from "../_components/ShaderTable";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMe } from "@/hooks/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import PaginationButtons from "@/components/PaginationButtons";
import ShaderPreviewCards from "@/components/ShaderPreviewCards";

type Props = {
  userID: string;
};

const ProfileShaders = ({ userID }: Props) => {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const view = searchParams.get("view") || "table";
  const perPage = 100;

  const { data, isPending, isError } = useQuery({
    queryKey: ["shaders", { isUserShaders: true }, page],
    queryFn: () => getUserShaders(userID, (page - 1) * perPage, perPage),
  });
  const router = useRouter();
  const onPageButtonClick = useCallback(
    (page: number) => {
      router.push(`/account/shaders?page=${page}`);
    },
    [router],
  );

  if (isPending) return <Spinner />;
  if (isError) return <p>Error loading shaders.</p>;

  return (
    <div className="w-fit flex flex-col gap-2">
      <Tabs
        value={view}
        onValueChange={(val) =>
          router.push(`/account/shaders?page=${page}&view=${val}`)
        }
      >
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          {data && (
            <ShaderTable
              initialPaginationState={{
                pageIndex: page - 1,
                pageSize: perPage,
              }}
              onPaginationChange={(val) => {
                console.log(val);
              }}
              data={data.shaders}
            />
          )}
        </TabsContent>
        <TabsContent value="browse">
          <div className="p-4 flex flex-col items-center gap-4">
            {isPending ? (
              <Spinner />
            ) : isError ? (
              <p>Error loading shaders.</p>
            ) : null}
            <div className="flex items-center gap-2">
              <p>Results: ({data ? data.total : 0}):</p>
              <PaginationButtons
                onClick={onPageButtonClick}
                perPage={perPage}
                page={page}
                totalDataLength={data?.total || 0}
              />
            </div>
            {data && <ShaderPreviewCards data={data} />}
          </div>
        </TabsContent>
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
      <ProfileShaders userID={user.id} />
    </Suspense>
  );
};

export default ProfileShadersPage;
