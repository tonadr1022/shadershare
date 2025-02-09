"use client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/hooks";
import React from "react";

const LogoutDropdownItem = () => {
  const logout = useLogout();
  return <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>;
};

export default LogoutDropdownItem;
