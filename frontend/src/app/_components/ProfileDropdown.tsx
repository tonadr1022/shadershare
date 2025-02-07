"use client";
import { getMe, logoutUser } from "@/api/auth-api";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { url } from "@/utils/links";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { ThemeDropdown } from "./ModeToggle";

const ProfileDropdown = () => {
  const router = useRouter();
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60,
  });
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
        <ThemeDropdown />

        {user ? (
          <DropdownMenuItem
            onClick={async () => {
              try {
                await logoutUser();
              } catch (e) {
                console.error(e);
              }
              router.push(url.login);
            }}
          >
            Logout
          </DropdownMenuItem>
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
