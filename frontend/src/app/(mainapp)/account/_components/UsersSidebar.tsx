"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Settings, User, GalleryHorizontal } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { url } from "@/utils/links";

const menuItems = [
  { href: url.account, label: "Profile", icon: User },
  { href: url.settings, label: "Settings", icon: Settings },
  { href: "/account/shaders", label: "Shaders", icon: GalleryHorizontal },
];

export function UsersSidebar() {
  const segment = useSelectedLayoutSegment();

  return (
    <Sidebar
      collapsible="none"
      variant="inset"
      className="h-full w-48  p-4 pt-8"
    >
      <SidebarContent className="h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu title="User menu">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    disabled={
                      segment ===
                      (item.href === "/account"
                        ? null
                        : item.href.split("/").pop())
                    }
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center transition-colors ${
                        segment ===
                        (item.href === "/account"
                          ? null
                          : item.href.split("/").pop())
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
