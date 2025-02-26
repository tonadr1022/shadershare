"use client";
import React from "react";
import { Toaster } from "sonner";
import Navbar from "../../components/navbar/Navbar";
import Footer from "./_components/Footer";
import { useTheme } from "next-themes";

const Layout2 = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <Toaster
        closeButton
        theme={(resolvedTheme as "system" | "dark" | "light") || "system"}
      />
      <div className="min-h-[calc(100vh-3rem)] flex flex-col">
        <Navbar />
        <main className="">{children}</main>
      </div>
      <Footer />
    </>
  );
};

export default Layout2;
