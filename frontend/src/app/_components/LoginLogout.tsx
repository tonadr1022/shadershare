"use client";
import { useGetMe } from "@/hooks/hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const LoginLogout = ({ className }: { className?: string }) => {
  const { data: user } = useGetMe();
  return (
    <Link
      className={cn(className)}
      href={user ? "/logout" : "/login"}
      prefetch={false}
    >
      {user ? "Logout" : "Login"}
    </Link>
  );
};

export default LoginLogout;
