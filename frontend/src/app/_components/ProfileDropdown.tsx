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
import { ThemeDropdown } from "./ModeToggle";
import LogoutDropdownItem from "./LogoutProfileItem";
import { fetchMe } from "@/api/server-api";

const ProfileDropdown = async () => {
  const user = await fetchMe();
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
          <LogoutDropdownItem />
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
