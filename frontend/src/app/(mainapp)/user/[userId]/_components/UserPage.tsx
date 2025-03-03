"use client";
import { getUser } from "@/api/shader-api";
import ShaderBrowser from "@/components/ShaderBrowser";
import LocalSettingsProvider from "@/context/LocalSettingsContext";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const UserPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
  });
  const router = useRouter();

  const isError = userQuery.isError;
  if (isError) router.push("/not-found");

  const user = userQuery.data;

  return (
    <div className="p-4 flex flex-col gap-12">
      <div className="flex gap-2">
        <div className="w-32 h-32">
          {userQuery.isPending ? (
            <div className="w-full h-full bg-secondary animate-pulse"></div>
          ) : (
            <div className="w-full h-full">
              <Image
                alt="avatar"
                width={256}
                height={256}
                src={user?.avatar_url || "/profile.jpg"}
              />
            </div>
          )}
        </div>
        {!user ? (
          <></>
        ) : (
          <div>
            <h4>{user?.username}</h4>
          </div>
        )}
      </div>
      <LocalSettingsProvider>
        <ShaderBrowser
          hideTestShaders
          urlPath={`/user/${userId}`}
          show={{ usernames: false }}
          userID={userId}
        />
      </LocalSettingsProvider>
    </div>
  );
};

export default UserPage;
