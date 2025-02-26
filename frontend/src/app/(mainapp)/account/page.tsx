"use client";
import { useGetMe } from "@/hooks/hooks";
import React from "react";
import UpdateProfileDialog from "./_components/UpdateProfileDialog";
import { Spinner } from "@/components/ui/spinner";

const Profile = () => {
  const { data: user, isPending, isError } = useGetMe();
  if (isPending) return <Spinner />;
  if (isError) return <p>Error loading profile.</p>;
  return (
    <div className="flex flex-col gap-6">
      {user && (
        <>
          <h2>Profile</h2>
          <h3>Username: {user.username}</h3>
          <h3>Email: {user.email}</h3>
          {<UpdateProfileDialog user={user} />}
        </>
      )}
    </div>
  );
};

export default Profile;
