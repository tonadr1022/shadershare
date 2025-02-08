"use client";
import { url } from "@/utils/links";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { FaHome } from "react-icons/fa";
import Link from "next/link";
import { useGetMe } from "@/hooks/hooks";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar3() {
  const { data: user, error } = useGetMe();
  if (error) {
    console.log(error);
  }
  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white  sticky top-0 z-50 w-full 
      border-b border-border/40   backdrop-blur  px-2"
    >
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="items-center gap-8 hidden sm:flex">
          <Link href={"/"} className="px-2 flex items-center gap-2">
            <FaHome />
            {/* TODO: LOGO */}
            <p className="hidden font-bold sm:inline-block">Shader Share</p>
          </Link>
          <nav>
            <ul className="flex items-center">
              <li>
                <Link href={url.browse}>Browse</Link>
              </li>
            </ul>
          </nav>
          <nav>
            <ul className="flex items-center">
              <li>
                <Link href={url.new}>New</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="sm:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button size={"icon"} variant={"ghost"}>
                <Menu className="w-4 h-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="py-6 transition-none">
              <DrawerHeader>
                <DrawerTitle className="hidden">title</DrawerTitle>
                <DrawerDescription>desc</DrawerDescription>Shader Share
              </DrawerHeader>
              <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                Components
              </h4>
              <Link
                href={url.browse}
                className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-muted-foreground"
              >
                Browse
              </Link>
              <span className="group hover:cursor-not-allowed flex gap-2 w-full items-center rounded-md border border-transparent px-2 py-1 text-muted-foreground ">
                <p>Upload Area</p>
              </span>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="flex items-center gap-2">
          <div>
            {user ? <ProfileDropdown /> : <Link href={url.login}>Login</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
