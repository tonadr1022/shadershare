"use client";
import { getUserShaders } from "@/api/shader-api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import ShaderTable from "../_components/ShaderTable";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// TODO: table
const ProfileShaders = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["shaders", "profile"],
    queryFn: getUserShaders,
  });

  return (
    <div className="w-fit p-4">
      {isPending ? (
        <Spinner />
      ) : isError ? (
        <div>Error loading shaders.</div>
      ) : (
        <div className="">
          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="browse">Browse</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              {data && <ShaderTable data={data} />}
            </TabsContent>
            <TabsContent value="browse">
              <div>browse shaders</div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ProfileShaders;
