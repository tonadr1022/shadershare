"use client";
import { url } from "@/utils/links";
import { Button } from "@/components/ui/button";
import { Boxes, Menu } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Link from "next/link";
import ProfileDropdown from "@/components/navbar/ProfileDropdown";
import { useGetMe } from "@/hooks/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "../ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

const navbarItems = [
  { href: url.browseShaders, label: "Browse" },
  { href: url.usershaders, label: "My Shaders" },
  { href: url.new, label: "New" },
];

const ShaderSearch = () => {
  const router = useRouter();
  const [inputQuery, setInputQuery] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/browse/shaders?query=${encodeURIComponent(inputQuery)}`);
      }}
      id="shader-page-query"
      className="flex gap-2 w-fit"
    >
      <Input
        id="shader-query-input"
        value={inputQuery}
        className="bg-secondary"
        onChange={(e) => setInputQuery(e.target.value)}
        placeholder="Search..."
      />
    </form>
  );
};

export default function Navbar() {
  const { data: user, isPending, isError } = useGetMe();

  return (
    <div
      className="bg-primary-foreground sticky top-0 z-50 w-full
      border-b border-border/40   backdrop-blur  px-2"
    >
      <div className="flex h-14 items-center justify-between">
        <div className="items-center gap-8 hidden sm:flex">
          <Link href={"/"} className="px-2 flex items-center gap-2">
            <Boxes />
            {/* TODO: LOGO */}
            <p className="hidden font-bold sm:inline-block">Shader Share</p>
          </Link>
          <ShaderSearch />
          {navbarItems.map((item) => (
            <nav key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                className="rounded-md  transition-colors hover:bg-accent"
              >
                {item.label}
              </Link>{" "}
            </nav>
          ))}
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
              {navbarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </DrawerContent>
          </Drawer>
        </div>
        <div className="flex items-center gap-2">
          <div>
            {user && !isError ? (
              <ProfileDropdown />
            ) : isPending ? (
              <Avatar className="text-background select-none w-8 h-8 transition-none">
                <AvatarFallback></AvatarFallback>
              </Avatar>
            ) : (
              <Link href={url.login}>Login</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
