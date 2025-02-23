"use client";
import { getUserShaders } from "@/api/shader-api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import ShaderTable from "../_components/ShaderTable";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShaderBrowser from "@/components/ShaderBrowser";
import ImportFromShadertoy from "@/components/ImportFromShadertoy";

// TODO: table
const ProfileShaders = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["shaders", "profile"],
    queryFn: getUserShaders,
  });

  if (isPending) return <Spinner />;
  if (isError) return <p>Error loading shaders.</p>;

  return (
    <div className="w-fit flex flex-col gap-2">
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          {data && <ShaderTable data={data} />}
        </TabsContent>
        <TabsContent value="browse">
          <ShaderBrowser
            urlPath="/account/shaders"
            show={{ usernames: false }}
          />
        </TabsContent>
      </Tabs>
      <ImportFromShadertoy />
    </div>
  );
};

export default ProfileShaders;
