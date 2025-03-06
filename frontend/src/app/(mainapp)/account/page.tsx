"use client";
import { useGetMeRedirect } from "@/hooks/hooks";
import React from "react";
import UpdateProfileDialog from "./_components/UpdateProfileDialog";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { data: user, isPending, isError } = useGetMeRedirect();
  if (isPending) return <Spinner />;
  if (isError) return <p>Error loading profile.</p>;
  return (
    <div className="flex flex-col gap-6">
      {user && (
        <>
          <h2>Profile</h2>
          <h3>Username: {user.username}</h3>
          <h3>Email: {user.email}</h3>
          <div className="flex gap-4">
            <Button asChild className="w-fit">
              <Link href={`/user/${user.id}`}>View Public Profile</Link>
            </Button>
            {<UpdateProfileDialog user={user} />}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
