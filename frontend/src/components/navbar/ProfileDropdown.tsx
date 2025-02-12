"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { url } from "@/utils/links";
import Link from "next/link";
import React from "react";
import { ThemeDropdown } from "../ModeToggle";
import { useGetMe, useLogout } from "@/hooks/hooks";

const ProfileDropdown = () => {
  const { data: user } = useGetMe();

  const logout = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="transition-none" asChild>
        <Avatar className="select-none w-8 h-8 transition-none">
          <AvatarImage src={user?.avatar_url || ""}></AvatarImage>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="transition-none mr-4 ">
        <Link href={url.account}>
          <DropdownMenuItem>Account</DropdownMenuItem>
        </Link>
        <Link href={"/account/shaders"}>
          <DropdownMenuItem>My Shaders</DropdownMenuItem>
        </Link>
        <ThemeDropdown />

        {user ? (
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Link href={url.login}>Login</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
